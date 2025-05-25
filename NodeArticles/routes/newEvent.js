const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// create new event
// have 2 query, one to create event and after event created fill event_created
router.post("/", (req, res) => {
  const query = `INSERT INTO events(event_name,category,start_date,end_date,start_time,is_private,participant_amount,city) VALUES(?,?,?,?,?,?,?,?)`;

  values = [
    req.body.eventName,
    req.body.category,
    req.body.startDate,
    req.body.endDate,
    req.body.startTime,
    req.body.type === "private" ? 1 : 0,
    parseInt(req.body.participantAmount),
    req.body.city,
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    // After event created, event_id reachable
    const event_id = results.insertId;

    // QUERY TO FILL CREATED_EVENRS TABLE
    const eventCreated = `INSERT into created_events (user_id, event_id) VALUES(?,?)`;
    db.query(eventCreated, [req.body.user_id, event_id], (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.json(results);
    });
  });
});

module.exports = router;
