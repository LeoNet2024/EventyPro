const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();
const bcrypt = require("bcrypt");

// Getting all user events
router.post("/", (req, res) => {
  const { user_id } = req.body;

  const query = `SELECT events.event_id, events.category, events.event_name, default_images.src
      FROM events
      INNER JOIN event_participants
      ON events.event_id = event_participants.event_id AND user_id = ?
	    INNER JOIN default_images
	    ON events.category = default_images.category`;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.log("Error to read user events");
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Handle with changing password
router.put("/editProfile/editPassword", (req, res) => {
  //Data from FrontEnd
  const { old_password, new_password, user_id } = req.body;

  //getting the current password from SQL
  const checkPasswordQuery = `SELECT password FROM users WHERE user_id = ?`;

  // check if user exists
  db.query(checkPasswordQuery, [user_id], (err, results) => {
    if (err) return res.status(500).send("Database error");
    if (results.length === 0) return res.status(404).send("User not found");

    const currentHashedPassword = results[0].password;

    // compate between the passwords
    bcrypt.compare(old_password, currentHashedPassword, (err, isMatch) => {
      if (err) return res.status(500).send("Error comparing passwords");
      if (!isMatch) return res.status(401).send("Wrong current password");

      // Hash the new password
      bcrypt.hash(new_password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send("Error hashing password");

        // update the new hash password
        const updateQuery = `UPDATE users SET password = ? WHERE user_id = ?`;
        db.query(updateQuery, [hashedPassword, user_id], (err, results) => {
          if (err) return res.status(500).send("Failed to update password");

          return res.status(200).send("Password updated successfully");
        });
      });
    });
  });
});

// this routs update user details
router.put("/editProfile", (req, res) => {
  const query = `UPDATE users set first_name = (?), last_name=(?), user_name=(?) , email = (?) where user_id = (?)`;

  // import from front end
  const { first_name, last_name, user_name, email, user_id } = req.body;

  // Data to send
  const values = [first_name, last_name, user_name, email, user_id];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send("user updated succefully");
  });
});

// ________________for user stats__________________________

// Return the number of events that specific user created
router.post("/userStats/createdEvents", (req, res) => {
  const { user_id } = req.body;

  const query = `SELECT COUNT(*) as "count"
                FROM created_events
                WHERE created_events.user_id = ?`;

  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).send("Get created events error");
    res.send(results[0]);
  });
});

// Return the number of events that user joined them

router.post("/userStats/joinedEvents", (req, res) => {
  const { user_id } = req.body;

  const query = `SELECT COUNT(*) as 'join events'
                FROM event_participants
                WHERE event_participants.user_id = 7;`;

  db.query(query, [user_id], (err, results) => {
    if (err) return res.send(500).send("Can't get the number of joined events");

    return res.send(results[0]);
  });
});

// Return the last comment from events_comments
router.post("/userStats/lastComment", (req, res) => {
  const { user_id } = req.body;

  const query = `SELECT comment_content,MAX(comment_time) as "maxTime"
                fROM event_comments as sub
                WHERE sub.user_id = ?`;

  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).send("last message is invalid");

    res.send(results[0]);
  });
});

module.exports = router;
