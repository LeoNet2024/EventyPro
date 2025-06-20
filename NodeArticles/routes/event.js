// Import modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// ------------------- GET PARTICIPANTS BY EVENT ID -------------------
router.get("/:id/participants", (req, res) => {
  const id = req.params.id;

  // Join event_participants with users for full user data
  const query = `
    SELECT *
    FROM event_participants
    JOIN users ON event_participants.user_id = users.user_id
    WHERE event_participants.event_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ------------------- GET CURRENT PARTICIPANT COUNT -------------------
router.get("/:id/currentParticipants", (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT COUNT(*) as count
    FROM event_participants
    WHERE event_participants.event_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ------------------- GET EVENT DETAILS -------------------
router.get("/:id", (req, res) => {
  const id = req.params.id;

  // Join event with default image based on category
  const query = `
    SELECT * 
    FROM events
    NATURAL JOIN default_images
    WHERE event_id = ?
    LIMIT 1
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// ------------------- JOIN EVENT -------------------
router.post("/:id/joinEvent", (req, res) => {
  const { user_id, event_id } = req.body;

  const query = `INSERT INTO event_participants (user_id, event_id) VALUES (?, ?)`;

  db.query(query, [user_id, event_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Joined successfully", insertedId: results.insertId });
  });
});

// ------------------- ADD COMMENT TO EVENT -------------------
router.post("/:id/addComment", (req, res) => {
  const { text, event_id, user_id } = req.body;

  const query = `
    INSERT INTO event_comments (event_id, comment_content, user_id)
    VALUES (?, ?, ?)
  `;

  db.query(query, [event_id, text, user_id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Comment successfully uploaded");
  });
});

// ------------------- GET EVENT COMMENTS -------------------
router.get("/:id/comments", (req, res) => {
  const eventId = req.params.id;

  const query = `
    SELECT *
    FROM event_comments
    INNER JOIN users ON event_comments.user_id = users.user_id
    WHERE event_comments.event_id = ?
  `;

  db.query(query, [eventId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ------------------- SEND FRIEND REQUEST -------------------
router.post("/sendFriendRequest", (req, res) => {
  const { sender_id, receiver_id } = req.body;

  // Prevent user from sending request to self
  if (sender_id === receiver_id) {
    return res.status(400).send("Cannot send a friend request to yourself");
  }

  // Check if friend request already exists
  const alreadySentReq = `
    SELECT * FROM friend_requests 
    WHERE sender_id = ? AND receiver_id = ?
  `;

  db.query(alreadySentReq, [sender_id, receiver_id], (err, results) => {
    if (err)
      return res.status(500).send("Error checking existing friend request");

    if (results.length > 0) {
      return res.status(403).send("Friend request already sent");
    }

    // Insert new friend request
    const insertQuery = `
      INSERT INTO friend_requests (sender_id, receiver_id) 
      VALUES (?, ?)
    `;

    db.query(insertQuery, [sender_id, receiver_id], (err) => {
      if (err) return res.status(500).send("Error sending friend request");
      res.send("Friend request has been sent");
    });
  });
});

// Handle with delete event
router.post("/deleteEvent", (req, res) => {
  const { event_id, user_id } = req.body;

  // Finding if the user created the event
  const query = `SELECT created_by 
                FROM events 
                WHERE  event_id = ? and created_by = ?;`;

  db.query(query, [event_id, user_id], (err, results) => {
    if (err) return res.status(500).send("Error -  to manage event");
    if (results.length === 0) res.json(null);
    // Deleting the events from all tables
    const deleteQuery = `DELETE FROM events WHERE event_id = ?`;

    db.query(deleteQuery, [event_id], (err, results) => {
      if (err) return res.status(500).send("Error -  to delete event");
      res.json(results);
    });
  });
});

// Export router
module.exports = router;
