const express = require('express');
const dbSingleton = require('../dbSingleton');
const router = express.Router();
const db = dbSingleton.getConnection();

router.post('/', (req, res) => {
  const query = `insert into events(event_name,category,start_date,end_date,start_time,is_private,participant_amount,city) values(?,?,?,?,?,?,?,?)`;

  values = [
    req.body.eventName || '',
    req.body.category || '',
    req.body.startDate || '0000-00-00',
    req.body.endDate || '0000-00-00',
    req.body.startTime || '0000-00-00',
    req.body.type === 'private' ? 1 : 0,
    parseInt(req.body.participantAmount) || 0,
    req.body.city || '',
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

module.exports = router;
