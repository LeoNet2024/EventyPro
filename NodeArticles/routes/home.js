// Import modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// ------------------- GET EVENTS WITH DEFAULT IMAGES -------------------
router.get("/", (req, res) => {
  // This query joins events with their default image by category
  const query = `
    SELECT * 
    FROM default_images
    NATURAL JOIN events
    WHERE events.category = default_images.category AND events.start_date > NOW();
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err); // Send DB error
      return;
    }

    res.json(results); // Return joined results (event + image)
  });
});

router.get("/getEventsPositions", (req, res) => {
  // this query return the events posion from events, yeshuvim, cities_coordinates
  const query = `SELECT 
    e.event_id,
    e.event_name,
    e.category,
    e.start_date,
    e.city,
    cc.longitude,
    cc.latitude
    FROM events AS e
    JOIN yeshuvim AS y
    ON e.city = y.name_heb
    JOIN cities_coordinates AS cc
    ON cc.MGLSDE_LOC = y.name_heb
    WHERE e.start_date > NOW()
    ORDER BY e.city ASC; `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Export router
module.exports = router;
