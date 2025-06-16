// Import modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();
const bcrypt = require("bcrypt");

// ------------------- GET USER EVENTS -------------------
router.post("/", (req, res) => {
  const { user_id } = req.body;

  // Fetch all events joined by the user
  const query = `
    SELECT events.event_id, events.category, events.event_name, default_images.src
    FROM events
    INNER JOIN event_participants ON events.event_id = event_participants.event_id AND user_id = ?
    INNER JOIN default_images ON events.category = default_images.category
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.log("Error fetching user events");
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// ------------------- CHANGE USER PASSWORD -------------------
router.put("/editProfile/editPassword", (req, res) => {
  const { old_password, new_password, user_id } = req.body;

  // Step 1: Fetch current hashed password from DB
  const checkPasswordQuery = `SELECT password FROM users WHERE user_id = ?`;
  db.query(checkPasswordQuery, [user_id], (err, results) => {
    if (err) return res.status(500).send("Database error");
    if (results.length === 0) return res.status(404).send("User not found");

    const currentHashedPassword = results[0].password;

    // Step 2: Compare provided password with current one
    bcrypt.compare(old_password, currentHashedPassword, (err, isMatch) => {
      if (err) return res.status(500).send("Error comparing passwords");
      if (!isMatch) return res.status(401).send("Wrong current password");

      // Step 3: Hash new password
      bcrypt.hash(new_password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send("Error hashing password");

        // Step 4: Update password in DB
        const updateQuery = `UPDATE users SET password = ? WHERE user_id = ?`;
        db.query(updateQuery, [hashedPassword, user_id], (err) => {
          if (err) return res.status(500).send("Failed to update password");
          return res.status(200).send("Password updated successfully");
        });
      });
    });
  });
});

// ------------------- UPDATE USER PROFILE -------------------
router.put("/editProfile", (req, res) => {
  const { first_name, last_name, user_name, user_id } = req.body;

  // Update user fields
  const query = `UPDATE users SET first_name = ?, last_name = ?, user_name = ? WHERE user_id = ?`;
  const values = [first_name, last_name, user_name, user_id];

  db.query(query, values, (err) => {
    if (err) return res.status(500).send(err);

    // Return updated user
    const getQuery = `SELECT * FROM users WHERE user_id = ?`;
    db.query(getQuery, [user_id], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results[0]);
    });
  });
});

// ------------------- GET FRIEND REQUESTS -------------------
router.post("/FriendRequests", (req, res) => {
  const { user_id } = req.body;

  const query = `
    SELECT users.user_name, users.user_id, friend_requests.request_id
    FROM users
    INNER JOIN friend_requests ON users.user_id = friend_requests.sender_id
    WHERE friend_requests.receiver_id = ? AND friend_requests.status = 'pending'
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).send("Cannot fetch friend requests");
    res.json(results);
  });
});

// ------------------- RESPOND TO FRIEND REQUEST -------------------
router.put("/FriendRequests/responeToRequest", (req, res) => {
  const { user_respone, request_id } = req.body;

  // Set status based on user response
  const status = user_respone === "confirm" ? "accepted" : "ignored";
  const query = `UPDATE friend_requests SET status = ? WHERE request_id = ?`;

  db.query(query, [status, request_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Request not found" });

    res.json({ message: `Friend request ${status}` });
  });
});

// ------------------- GET USER FRIEND LIST -------------------
router.post("/myFriends", (req, res) => {
  const { user_id } = req.body;

  const query = `
    SELECT *
    FROM friend_requests AS f
    INNER JOIN users 
    ON (
      (users.user_id = f.sender_id AND f.receiver_id = ?)
      OR (users.user_id = f.receiver_id AND f.sender_id = ?)
    )
    WHERE f.status = 'accepted'
  `;

  db.query(query, [user_id, user_id], (err, results) => {
    if (err) return res.status(500).send("Failed to get friends list");
    res.json(results);
  });
});

// ------------------- USER STATISTICS -------------------

// Get number of events user created
router.post("/userStats/createdEvents", (req, res) => {
  const { user_id } = req.body;

  const query = `SELECT COUNT(*) AS count FROM created_events WHERE user_id = ?`;
  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).send("Failed to fetch created events");
    res.send(results[0]);
  });
});

// Get number of events user joined
router.post("/userStats/joinedEvents", (req, res) => {
  const { user_id } = req.body;

  const query = `SELECT COUNT(*) AS joined FROM event_participants WHERE user_id = ?`;
  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).send("Failed to fetch joined events");
    res.send(results[0]);
  });
});

// Get last comment user posted
router.post("/userStats/lastComment", (req, res) => {
  const { user_id } = req.body;

  const query = `
    SELECT comment_content, MAX(comment_time) AS maxTime
    FROM event_comments
    WHERE user_id = ?
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).send("Failed to fetch last comment");
    res.send(results[0]);
  });
});

// Export router
module.exports = router;
