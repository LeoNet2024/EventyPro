// Import modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// return the num of events group by category
router.get("/eventsByCategory", (req, res) => {
  const query = `SELECT events.category,events.start_date, count(*) as "Total"
                FROM events
                GROUP BY events.category
                HAVING start_date > NOW();`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    return res.json(results);
  });
});

// return most 3 active users
router.get("/mostActiveUsers", (req, res) => {
  const query = `select sub1.user_name, count(*) as 'num_of_events'
	from
    (SELECT users.user_name
    FROM event_participants
    INNER JOIN users ON users.user_id = event_participants.user_id) as sub1
    GROUP BY sub1.user_name
    ORDER BY 'num_of_events' DESC
    limit 3`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Export router
module.exports = router;
