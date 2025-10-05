// Import modules
const express = require("express");
const dbSingleton = require("../dbSingleton");
const router = express.Router();
const db = dbSingleton.getConnection();

// ------------------- GET USER FRIEND LIST -------------------
router.post("/listOfFriends", (req, res) => {
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
// ------------------- Send  private message -------------------

router.post("/sendMessage", (req, res) => {
  const { sender_id, reciever_id, message } = req.body;

  const query = `INSERT INTO private_messages(sender_id,reciever_id,message) VALUES(?,?,?)`;

  db.query(query, [sender_id, reciever_id, message], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
// ------------------- get chat content -------------------

router.post("/getChatContent", (req, res) => {
  const { user_id, reciever_id } = req.body;

  const query = `SELECT *
                FROM private_messages
                WHERE sender_id = ? and reciever_id = ? or sender_id = ? and reciever_id = ? ;`;

  db.query(
    query,
    [user_id, reciever_id, reciever_id, user_id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// Export router
module.exports = router;
