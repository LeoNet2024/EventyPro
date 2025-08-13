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
    WHERE events.status = 'scheduled' AND events.category = default_images.category
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
  const query = `SELECT event_name, name_heb, longitude,latitude
    from
      (SELECT yeshuvim.name_heb, cities_coordinates.longitude, cities_coordinates.latitude
      FROM yeshuvim
      INNER JOIN cities_coordinates ON cities_coordinates.MGLSDE_LOC=yeshuvim.name_heb) as sub
    INNER JOIN events on events.city=sub.name_heb;`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Export router
module.exports = router;
