// Import modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// Getting most 5 most popular events
router.get("/hotEvents", (req, res) => {
  const query = `SELECT *
    from events
    INNER JOIN
        (SELECT event_participants.event_id,count(event_participants.user_id) as 'participant_count'
        from event_participants
        GROUP by event_id
        ORDER BY participant_count DESC
        LIMIT 5) as subTable
    ON events.event_id = subTable.event_id;`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send("Cannot get most popluar events");
    return res.json(results);
  });
});
module.exports = router;
