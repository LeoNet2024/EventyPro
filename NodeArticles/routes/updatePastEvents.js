const express = require("express");
const router = express.Router();

// Import custom DB connection singleton
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const updateSql = `
      UPDATE events
    SET status = 'past'
    WHERE status = 'scheduled'
      AND (
        start_date < CURDATE()
        OR (start_date = CURDATE() AND start_time <= CURTIME())
      )
  `;

  db.query(updateSql, (err, result) => {
    if (err) {
      console.error("Error updating past events:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
    res.json({ success: true, message: "Past events updated successfully" });
  });
});

module.exports = router;
