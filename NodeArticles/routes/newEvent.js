// Import core modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// middleware: נדרש משתמש מחובר
function requireLogin(req, res, next) {
  if (!req.session?.user?.user_id)
    return res.status(401).json({ error: "יש להתחבר" });
  next();
}

// middleware: לבדוק בעלות על אירוע
function requireEventOwner(req, res, next) {
  const eventId = Number(req.params.eventId);
  const userId = req.session.user.user_id;

  db.query(
    "SELECT created_by FROM events WHERE event_id=? LIMIT 1",
    [eventId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!rows.length) return res.status(404).json({ error: "NOT FOUND" });
      if (rows[0].created_by !== userId)
        return res.status(403).json({ error: "גישה רק ליוצר האירוע" });
      next();
    }
  );
}

// ------------------- CREATE NEW EVENT -------------------
router.post("/", requireLogin, (req, res) => {
  // Data from frontend
  const {
    eventName,
    category,
    startDate,
    endDate,
    startTime,
    type,
    participantAmount,
    city,
    user_id,
    description,
  } = req.body;

  // list of values to insert
  const values = [
    eventName,
    category,
    startDate,
    endDate,
    startTime,
    type === "private" ? 1 : 0,
    parseInt(participantAmount),
    city,
    user_id,
    description,
  ];

  // Prevent duplicated events
  const preventDupEvents = `
    SELECT * 
    FROM events 
    WHERE event_name = ? AND category = ? AND city = ? AND start_date = ?
  `;

  // execute the query
  db.query(
    preventDupEvents,
    [eventName, category, city, startDate],
    (err, results) => {
      if (err) {
        return res.status(500).send("Error while checking for existing events");
      }

      // Dupliacte event
      if (results.length > 0) {
        return res
          .status(409)
          .send("Event creation failed: a similar event already exists");
      }

      // query to insert values into tables
      const query = `
      INSERT INTO events(event_name, category, start_date, end_date, start_time, is_private, participant_amount, city,created_by, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      // Execute the query
      db.query(query, values, (err, results) => {
        if (err) {
          return res
            .status(500)
            .send("Error while inserting event into database");
        }

        const event_id = results.insertId;

        // Add creator as an approved participant
        // אם מוגדר יוניק על (event_id, user_id) זה בטוח מפני כפילויות
        const insertCreatorSql = `
          INSERT INTO event_participants (user_id, event_id, status, reviewed_by, reviewed_at)
          VALUES (?, ?, 'approved', ?, NOW())
          ON DUPLICATE KEY UPDATE
            status = 'approved',
            reviewed_by = VALUES(reviewed_by),
            reviewed_at = NOW()
        `;

        db.query(insertCreatorSql, [user_id, event_id, user_id], (e2) => {
          if (e2) {
            // לא מפילים את יצירת האירוע אם הכנסה לרשימת משתתפים נכשלה
            // אבל כן מחזירים הודעה אינפורמטיבית
            console.error("Failed to add creator as participant:", e2);
            return res.status(201).json({
              message:
                "Event created, but failed to add creator as participant",
              eventId: event_id,
            });
          }

          res.status(201).json({
            message: "Event created successfully",
            eventId: event_id,
          });
        });
      });
    }
  );
});

// Handle to get categories rows from DB
router.get("/getCategories", (req, res) => {
  const query = "SELECT category FROM default_images ORDER BY category ASC;";

  db.query(query, (err, results) => {
    if (err) return res.status(500).send("Cannot get categories");
    return res.json(results);
  });
});

// Export router
module.exports = router;
