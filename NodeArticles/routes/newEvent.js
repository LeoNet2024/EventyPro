// Import core modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// ------------------- CREATE NEW EVENT -------------------
router.post("/", (req, res) => {
  // Step 1: Prepare query to insert new event
  const query = `
    INSERT INTO events(event_name, category, start_date, end_date, start_time, is_private, participant_amount, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    req.body.eventName, // Event title
    req.body.category, // Category (e.g., sports, culture)
    req.body.startDate, // Start date (YYYY-MM-DD)
    req.body.endDate, // End date (YYYY-MM-DD)
    req.body.startTime, // Time (HH:MM)
    req.body.type === "private" ? 1 : 0, // Private = 1, Public = 0
    parseInt(req.body.participantAmount), // Max number of participants
    req.body.city, // Event location
  ];

  // Step 2: Execute insert query into events table
  db.query(query, values, (err, results) => {
    if (err) {
      res.status(500).send(err); // DB error when creating event
      return;
    }

    const event_id = results.insertId; // Get newly created event ID

    // Step 3: Log the creator of the event (user_id + event_id)
    const eventCreated = `INSERT INTO created_events (user_id, event_id) VALUES (?, ?)`;
    db.query(eventCreated, [req.body.user_id, event_id], (err2, results2) => {
      if (err2) {
        res.status(500).send(err2); // DB error when linking creator
        return;
      }

      // Event successfully created and linked to user
      res.json(results2);
    });
  });
});

// Export router
module.exports = router;
