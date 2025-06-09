const express = require('express');
const dbSingleton = require('../dbSingleton');
const router = express.Router();
const db = dbSingleton.getConnection();

// GET participants by event id
router.get('/:id/participants', (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT *
    FROM event_participants
    JOIN users ON event_participants.user_id = users.user_id
    WHERE event_participants.event_id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

router.get('/:id/currentParticipants', (req, res) => {
  const id = req.params.id;

  const query = `SELECT COUNT(*) as count
                FROM event_participants
                WHERE event_participants.event_id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// GET event details
router.get('/:id', (req, res) => {
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
router.post('/:id/joinEvent', (req, res) => {
  const { user_id, event_id } = req.body;

  const query = `INSERT INTO event_participants (user_id, event_id) VALUES (?, ?)`;

  db.query(query, [user_id, event_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Joined successfully', insertedId: results.insertId });
  });
});

// Handling  new comment
router.post('/:id/addComment', (req, res) => {
  // text and event id from frontEnd
  const { text, event_id, user_id } = req.body;

  const query = `INSERT INTO event_comments (event_id , comment_content, user_id	) VALUES (? , ?, ?) `;

  db.query(query, [event_id, text, user_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send('Comment successfully uploaded');
  });
});

// ב־routes/event.js או איפה שאתה שם את זה
router.get('/:id/comments', (req, res) => {
  const eventId = req.params.id;

  const query = `
    SELECT *
    FROM event_comments
    INNER JOIN users
    ON event_comments.event_id = (?) AND event_comments.user_id = users.user_id
  `;

  db.query(query, [eventId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

module.exports = router;
