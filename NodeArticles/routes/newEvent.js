// Import core modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// ------------------- CREATE NEW EVENT -------------------
router.post("/", (req, res) => {
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
      INSERT INTO events(event_name, category, start_date, end_date, start_time, is_private, participant_amount, city,created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

      // Execute the query
      db.query(query, values, (err, results) => {
        if (err) {
          return res
            .status(500)
            .send("Error while inserting event into database");
        }

        const event_id = results.insertId;

        res.status(201).json({
          message: "Event created successfully",
          eventId: event_id,
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
