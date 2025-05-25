const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// GET participants by event id
router.get("/:id/participants", (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT users.user_name
    FROM event_participants
    JOIN users ON event_participants.user_id = users.user_id
    WHERE event_participants.event_id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// GET event details
router.get("/:id", (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT * 
    FROM events
    NATURAL JOIN default_images
    WHERE event_id = ? LIMIT 1`;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// POST join event
router.post("/:id/joinEvent", (req, res) => {
  const { user_id, event_id } = req.body;

  console.log(req.body);
  const query = `INSERT INTO event_participants (user_id, event_id) VALUES (?, ?)`;

  db.query(query, [user_id, event_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Joined successfully", insertedId: results.insertId });
  });
});

// Handling  new comment
router.post("/:id/addComment", (req, res) => {
  // text and event id from frontEnd
  const { text, event_id } = req.body;

  const query = `INSERT INTO event_comments (event_id , comment_content	) VALUES (? , ?) `;

  db.query(query, [event_id, text], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Comment successfully uploaded" });
  });
});

module.exports = router;
