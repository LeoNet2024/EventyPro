// Import modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// Getting most 5 most popular events
router.get("/hotEvents", (req, res) => {
  const query = `SELECT events.event_id
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

// Getting all categories from DB
router.get("/getAllCategories", (req, res) => {
  const query = `SELECT default_images.category from default_images`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send("Cannot get all event categories");
    return res.status(results);
  });
});

//Getting all events by category
router.post("/getEventByCategory", (req, res) => {
  const { category } = req.body;
  const query = "SELECT * from events where events.category = ?";

  db.query(query, [category], (err, results) => {
    if (err) return res.status(500).send("Cannot get events by category");
    return res.json(results);
  });
});
module.exports = router;
