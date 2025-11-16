// Import modules
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getConnection();

// ------------------- SEND NEW ADMIN MESSAGE -------------------
router.post("/contact", (req, res) => {
  const userId = req.session.user?.user_id;
  const { subject, message } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const query = `
    INSERT INTO admin_messages (user_id, subject, message)
    VALUES (?, ?, ?)
  `;

  db.query(query, [userId, subject, message], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Message sent" });
  });
});

// ------------------- GET ALL MESSAGES BY CURRENT USER -------------------
router.get("/contact", (req, res) => {
  console.log("in get contact");
  const userId = req.session.user?.user_id;

  console.log("session:", req.session);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const query = `
    SELECT message_id, subject, message, reply, answered, created_at
    FROM admin_messages
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ------------------- ADMIN AUTHENTICATION MIDDLEWARE -------------------
// Only allow access if user is admin
router.use((req, res, next) => {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
});

// ------------------- ADMIN DASHBBOARD SUMMARY -------------------
router.get("/summary", (req, res) => {
  // 10 users 
  const usersSql = `
      SELECT user_id, first_name, last_name, email,
           user_name, blocked, registration_date
      FROM users
      ORDER BY registration_date DESC
      LIMIT 10
  `;

  db.query(usersSql, [], (err, users) => {
    if (err) return res.status(500).json({ error: "Database error" });

    // 10 events 
    const eventsSql = `
      SELECT 
      e.event_id,
      e.event_name,
      e.category,
      e.start_date,
      e.start_time,
      e.is_private,
      e.participant_amount,
      e.city,
      e.created_by,
      e.created_date,
      COUNT(ep.user_id) AS actual_participants
    FROM events e
    LEFT JOIN event_participants ep 
      ON e.event_id = ep.event_id
    GROUP BY e.event_id
    ORDER BY e.created_date DESC
    LIMIT 10;

    `;

    db.query(eventsSql, [], (err, events) => {
      if (err) return res.status(500).json({ error: "Database error" });

      const msgsSql = `
        SELECT m.message_id, m.user_id, m.subject, m.message,
               m.created_at, m.answered, u.user_name
        FROM admin_messages m
        JOIN users u ON m.user_id = u.user_id
        ORDER BY m.created_at DESC
        LIMIT 10
      `;

      db.query(msgsSql, [], (err, messages) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json({ users, events, messages });
      });
    });
  });
});

// routes/admin.js
router.get("/top-active-users", (req, res) => {
  const sql = `
    SELECT 
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      COUNT(ep.event_id) AS events_attended
    FROM users AS u
    JOIN event_participants AS ep
      ON ep.user_id = u.user_id
    GROUP BY u.user_id, u.first_name, u.last_name, u.email
    ORDER BY events_attended DESC, u.last_name ASC, u.first_name ASC
    LIMIT 10
  `;
  db.query(sql, (err, rows) => {
    if (err)
      return res.status(500).json({ error: "DB error", detail: err.message });
    res.json(rows);
  });
});

// routes/admin.js
router.get("/top-event-creators", (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const sql = `
    SELECT 
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      COUNT(e.event_id) AS events_created
    FROM users AS u
    JOIN events AS e
      ON e.created_by = u.user_id
    GROUP BY u.user_id, u.first_name, u.last_name, u.email
    ORDER BY events_created DESC, u.last_name ASC, u.first_name ASC
    LIMIT ?
  `;

  db.query(sql, [limit], (err, rows) => {
    if (err)
      return res.status(500).json({ error: "DB error", detail: err.message });
    res.json(rows);
  });
});

// routes/admin.js
router.get("/top-event-cities", (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const sql = `
    SELECT
      e.city,
      COUNT(*) AS events_count
    FROM events AS e
    GROUP BY e.city
    ORDER BY events_count DESC, e.city ASC
    LIMIT ?
  `;

  db.query(sql, [limit], (err, rows) => {
    if (err)
      return res.status(500).json({ error: "DB error", detail: err.message });
    res.json(rows);
  });
});

// ------------------- GET ALL USERS -------------------
router.get("/users", (req, res) => {
  const query = `SELECT user_id, first_name, last_name, email, user_name, blocked FROM users`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

// ------------------- BLOCK / UNBLOCK USER -------------------
router.patch("/users/:id/block", (req, res) => {
  const { blocked } = req.body;
  const userId = req.params.id;

  const query = `UPDATE users SET blocked = ? WHERE user_id = ?`;
  db.query(query, [blocked ? 1 : 0, userId], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "User updated" });
  });
});

// ------------------- DELETE USER -------------------
router.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  const query = `DELETE FROM users WHERE user_id = ?`;

  db.query(query, [userId], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "User deleted" });
  });
});

// ------------------- GET ALL EVENTS (WITH PARTICIPANT COUNT) -------------------
router.get("/events", (req, res) => {
  const query = `
    SELECT e.*, COUNT(ep.user_id) AS actual_participants
    FROM events e
    LEFT JOIN event_participants ep ON e.event_id = ep.event_id
    GROUP BY e.event_id
    ORDER BY e.event_id
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ------------------- GET ALL UNANSWERED MESSAGES -------------------
router.get("/adminMessages", (req, res) => {
  const query = `
    SELECT m.message_id, m.user_id, m.subject, m.message, m.created_at, u.user_name
    FROM admin_messages m
    JOIN users u ON m.user_id = u.user_id
    WHERE m.answered = 0
    ORDER BY m.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error." });
    res.json(results);
  });
});

// ------------------- ADMIN REPLY TO MESSAGE -------------------
router.post("/adminMessages/:id/reply", (req, res) => {
  const { reply } = req.body;
  const messageId = req.params.id;

  const query = `
    UPDATE admin_messages
    SET reply = ?, answered = 1
    WHERE message_id = ?
  `;

  db.query(query, [reply, messageId], (err) => {
    if (err) return res.status(500).json({ error: "Database error." });
    res.json({ message: "Reply sent successfully." });
  });
});

// ------------------- DELETE EVENT -------------------
router.delete("/events/:id", (req, res) => {
  const eventId = req.params.id;
  const query = `DELETE FROM events WHERE event_id = ?`;

  db.query(query, [eventId], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Event deleted" });
  });
});

// Export router
module.exports = router;
