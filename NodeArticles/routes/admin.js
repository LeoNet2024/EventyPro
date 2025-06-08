const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getConnection();

// Middleware: הגנה – רק למשתמשים שהם אדמין
router.use((req, res, next) => {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
});

// 1. שליפת כל המשתמשים
router.get("/users", (req, res) => {
  const query =
    "SELECT user_id, first_name, last_name, email, user_name, blocked FROM users";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

// 2. חסימת / שחרור משתמש
router.patch("/users/:id/block", (req, res) => {
  const { blocked } = req.body;
  const userId = req.params.id;
  const query = "UPDATE users SET blocked = ? WHERE user_id = ?";
  db.query(query, [blocked ? 1 : 0, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "User updated" });
  });
});

// 3. מחיקת משתמש
router.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  const query = "DELETE FROM users WHERE user_id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "User deleted" });
  });
});

// Get all events
router.get("/events", (req, res) => {
  const query =
    "SELECT e.*, COUNT(ep.user_id) AS actual_participants FROM events e LEFT JOIN event_participants ep ON e.event_id = ep.event_id GROUP BY e.event_id ORDER BY e.event_id";

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// שליחת הודעה חדשה
router.post("/contact", (req, res) => {
  const userId = req.session.user?.user_id;
  const { subject, message } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const query = `
    INSERT INTO admin_messages (user_id, subject, message)
    VALUES (?, ?, ?)
  `;
  db.query(query, [userId, subject, message], (err, result) => {
    if (err) {
      console.error("Error inserting message:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Message sent" });
  });
});

// שליפת כל ההודעות של המשתמש הנוכחי
router.get("/contact", (req, res) => {
  const userId = req.session.user?.user_id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const query = `
    SELECT message_id, subject, message, reply, answered, created_at
    FROM admin_messages
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// קבלת כל ההודעות שלא נענו
router.get("/adminMessages", (req, res) => {
  const query = `
    SELECT 
    m.message_id, m.user_id, m.subject, m.message, m.created_at,u.user_name
    FROM admin_messages m
    JOIN users u ON m.user_id = u.user_id
    WHERE m.answered = 0
    ORDER BY m.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({ error: "Database error." });
    }
    res.json(results);
  });
});

// תגובה להודעה
router.post("/adminMessages/:id/reply", (req, res) => {
  const { reply } = req.body;
  const messageId = req.params.id;

  const query = `
    UPDATE admin_messages
    SET reply = ?, answered = 1
    WHERE message_id = ?
  `;

  db.query(query, [reply, messageId], (err, result) => {
    if (err) {
      console.error("Error updating message:", err);
      return res.status(500).json({ error: "Database error." });
    }

    res.json({ message: "Reply sent successfully." });
  });
});

// Delete event
router.delete("/events/:id", (req, res) => {
  const eventId = req.params.id;
  const query = "DELETE FROM events WHERE event_id = ?";
  db.query(query, [eventId], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Event deleted" });
  });
});

module.exports = router;
