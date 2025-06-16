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
    WHERE events.category = default_images.category
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err); // Send DB error
      return;
    }

    res.json(results); // Return joined results (event + image)
  });
});

// Export router
module.exports = router;
