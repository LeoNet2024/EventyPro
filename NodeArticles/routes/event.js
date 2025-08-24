// Import modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// middleware: נדרש משתמש מחובר
function requireLogin(req, res, next) {
  if (!req.session?.user?.user_id) return res.status(401).json({ error: "יש להתחבר" });
  next();
}

// middleware: לבדוק בעלות על אירוע
function requireEventOwner(req, res, next) {
  const eventId = Number(req.params.eventId);
  const userId = req.session.user.user_id;

  db.query("SELECT created_by FROM events WHERE event_id=? LIMIT 1", [eventId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!rows.length) return res.status(404).json({ error: "אירוע לא נמצא" });
    if (rows[0].created_by !== userId) return res.status(403).json({ error: "גישה רק ליוצר האירוע" });
    next();
  });
}

// ------------------- GET PARTICIPANTS BY EVENT ID -------------------
router.get("/:id/participants", (req, res) => {
  const id = req.params.id;

  // Join event_participants with users for full user data
  const query = `
    SELECT *
    FROM event_participants
    JOIN users ON event_participants.user_id = users.user_id
    WHERE event_participants.event_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ------------------- GET CURRENT PARTICIPANT COUNT -------------------
router.get("/:id/currentParticipants", (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT COUNT(*) as count
    FROM event_participants
    WHERE event_participants.event_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ------------------- GET EVENT DETAILS -------------------
router.get("/:id", (req, res) => {
  const id = req.params.id;

  // Join event with default image based on category
  const query = `
    SELECT * 
    FROM events
    NATURAL JOIN default_images
    WHERE event_id = ?
    LIMIT 1
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// ------------------- JOIN EVENT -------------------
router.post("/:id/joinEvent", (req, res) => {
  const { user_id, event_id } = req.body;

  const query = `INSERT INTO event_participants (user_id, event_id) VALUES (?, ?)`;

  db.query(query, [user_id, event_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Joined successfully", insertedId: results.insertId });
  });
});

// ------------------- ADD COMMENT TO EVENT -------------------
router.post("/:id/addComment", (req, res) => {
  const { text, event_id, user_id } = req.body;

  const query = `
    INSERT INTO event_comments (event_id, comment_content, user_id)
    VALUES (?, ?, ?)
  `;

  db.query(query, [event_id, text, user_id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Comment successfully uploaded");
  });
});

// ------------------- GET EVENT COMMENTS -------------------
router.get("/:id/comments", (req, res) => {
  const eventId = req.params.id;

  const query = `
    SELECT *
    FROM event_comments
    INNER JOIN users ON event_comments.user_id = users.user_id
    WHERE event_comments.event_id = ?
  `;

  db.query(query, [eventId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ------------------- SEND FRIEND REQUEST -------------------
router.post("/sendFriendRequest", (req, res) => {
  const { sender_id, receiver_id } = req.body;

  // Prevent user from sending request to self
  if (sender_id === receiver_id) {
    return res.status(400).send("Cannot send a friend request to yourself");
  }

  // Check if friend request already exists
  const alreadySentReq = `
    SELECT * FROM friend_requests 
    WHERE sender_id = ? AND receiver_id = ?
  `;

  db.query(alreadySentReq, [sender_id, receiver_id], (err, results) => {
    if (err)
      return res.status(500).send("Error checking existing friend request");

    if (results.length > 0) {
      return res.status(403).send("Friend request already sent");
    }

    // Insert new friend request
    const insertQuery = `
      INSERT INTO friend_requests (sender_id, receiver_id) 
      VALUES (?, ?)
    `;

    db.query(insertQuery, [sender_id, receiver_id], (err) => {
      if (err) return res.status(500).send("Error sending friend request");
      res.send("Friend request has been sent");
    });
  });
});

// Handle with delete event
router.post("/deleteEvent", (req, res) => {
  const { event_id, user_id } = req.body;

  // Finding if the user created the event
  const query = `SELECT created_by 
                FROM events 
                WHERE  event_id = ? and created_by = ?;`;

  db.query(query, [event_id, user_id], (err, results) => {
    if (err) return res.status(500).send("Error -  to manage event");
    if (results.length === 0) res.json(null);
    // Deleting the events from all tables
    const deleteQuery = `DELETE FROM events WHERE event_id = ?`;

    db.query(deleteQuery, [event_id], (err, results) => {
      if (err) return res.status(500).send("Error -  to delete event");
      res.json(results);
    });
  });
});


// POST /api/events/:eventId/join-or-request
router.post("/:eventId/join-or-request", requireLogin, (req, res) => {
  const eventId = Number(req.params.eventId);
  const userId = req.session.user.user_id;
  const requestNote = (req.body?.note || "").trim();

  // נביא את האירוע כדי להבין אם הוא פרטי ומה הקיבולת
  const sqlEvent = "SELECT is_private, participant_amount FROM events WHERE event_id=? LIMIT 1";
  db.query(sqlEvent, [eventId], (e1, r1) => {
    if (e1) return res.status(500).json({ error: "DB error" });
    if (!r1.length) return res.status(404).json({ error: "אירוע לא נמצא" });

    const isPrivate = !!r1[0].is_private;
    const capacity = r1[0].participant_amount;

    // נספור רק מאושרים לצורך קיבולת
    const sqlCount = "SELECT COUNT(*) AS cnt FROM event_participants WHERE event_id=? AND status='approved'";
    db.query(sqlCount, [eventId], (e2, r2) => {
      if (e2) return res.status(500).json({ error: "DB error" });

      const approvedCount = r2[0].cnt;
      const status = isPrivate ? "pending" : "approved";

      // אם האירוע ציבורי וגם מלא – נחסום הצטרפות
      if (!isPrivate && approvedCount >= capacity) {
        return res.status(400).json({ error: "האירוע מלא" });
      }

      // ננסה להוסיף/לעדכן שורה; אם קיימת בקשה קודמת – נטפל בהתאם
      const insert =
        "INSERT INTO event_participants (user_id, event_id, status, request_note) VALUES (?,?,?,?) " +
        "ON DUPLICATE KEY UPDATE status=VALUES(status), request_note=VALUES(request_note), reviewed_by=NULL, reviewed_at=NULL";
      db.query(insert, [userId, eventId, status, requestNote || null], (e3) => {
        if (e3) {
          if (e3.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "כבר ביקשת/הצטרפת לאירוע" });
          return res.status(500).json({ error: "DB error" });
        }
        if (isPrivate) return res.json({ message: "הבקשה נשלחה וממתינה לאישור היוצר", status: "pending" });
        return res.json({ message: "הצטרפת לאירוע בהצלחה", status: "approved" });
      });
    });
  });
});

// For event creator - accepting users to private event
router.get("/:eventId/requests", requireLogin, requireEventOwner, (req, res) => {
  const eventId = Number(req.params.eventId);
  const sql = `
    SELECT ep.user_id, u.first_name, u.last_name, u.email, ep.request_note, ep.join_date
    FROM event_participants ep
    JOIN users u ON u.user_id = ep.user_id
    WHERE ep.event_id=? AND ep.status='pending'
    ORDER BY ep.join_date ASC
  `;
  db.query(sql, [eventId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// Accepting a user to the private event
router.post("/:eventId/requests/:userId/approve", requireLogin, requireEventOwner, (req, res) => {
  const eventId = Number(req.params.eventId);
  const targetUserId = Number(req.params.userId);
  const reviewer = req.session.user.user_id;

  const sqlCapacity = `
    SELECT e.participant_amount, 
           (SELECT COUNT(*) FROM event_participants WHERE event_id=e.event_id AND status='approved') AS approved_cnt
    FROM events e
    WHERE e.event_id=? LIMIT 1
  `;
  db.query(sqlCapacity, [eventId], (e1, r1) => {
    if (e1) return res.status(500).json({ error: "DB error" });
    if (!r1.length) return res.status(404).json({ error: "אירוע לא נמצא" });

    if (r1[0].approved_cnt >= r1[0].participant_amount)
      return res.status(400).json({ error: "האירוע מלא" });

    const sql =
      "UPDATE event_participants SET status='approved', reviewed_by=?, reviewed_at=NOW() WHERE event_id=? AND user_id=? AND status='pending'";
    db.query(sql, [reviewer, eventId, targetUserId], (e2, result) => {
      if (e2) return res.status(500).json({ error: "DB error" });
      if (!result.affectedRows) return res.status(404).json({ error: "בקשה לא נמצאה/כבר טופלה" });
      res.json({ message: "הבקשה אושרה" });
    });
  });
});

// Rejecting a user
router.post("/events/:eventId/requests/:userId/reject", requireLogin, requireEventOwner, (req, res) => {
  const eventId = Number(req.params.eventId);
  const targetUserId = Number(req.params.userId);
  const reviewer = req.session.user.user_id;

  const sql =
    "UPDATE event_participants SET status='rejected', reviewed_by=?, reviewed_at=NOW() WHERE event_id=? AND user_id=? AND status IN ('pending','approved')";
  db.query(sql, [reviewer, eventId, targetUserId], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!result.affectedRows) return res.status(404).json({ error: "בקשה לא נמצאה/כבר טופלה" });
    res.json({ message: "הבקשה נדחתה / המשתתף הוסר" });
  });
});



// Export router
module.exports = router;
