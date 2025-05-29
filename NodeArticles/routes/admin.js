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
  const query = "SELECT * FROM events";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
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
