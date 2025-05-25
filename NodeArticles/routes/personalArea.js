const express = require('express');
const dbSingleton = require('../dbSingleton');
const router = express.Router();
const db = dbSingleton.getConnection();

// Getting all user events
router.post('/', (req, res) => {
  const { user_id } = req.body;

  const query = `SELECT events.event_id, events.category, events.event_name
      FROM events
      INNER JOIN event_participants
      ON events.event_id = event_participants.event_id AND user_id = (?)`;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.log('Error to read user events');
      return res.status(500).send(err);
    }
    res.json(results);
  });
});
module.exports = router;
