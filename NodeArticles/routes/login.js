// Import core modules
const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Import custom DB connection singleton
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

// Create router instance
const router = express.Router();

// ------------------- USER LOGIN -------------------
router.post("/", (req, res) => {
  const { email, password } = req.body;

  // Step 1: Find user by email
  db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error." });

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = results[0];

    // Step 2: Check if user is blocked
    if (user.blocked) {
      return res.status(403).json({ error: "User is blocked." });
    }

    // Step 3: Compare passwords
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err)
        return res.status(500).json({ error: "Password comparison error." });

      if (!isMatch)
        return res.status(401).json({ error: "Invalid credentials." });

      // Step 4: Save user in session
      req.session.user = {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_name: user.user_name,
        city: user.city,
        gender: user.gender,
        email: user.email,
        src: user.src,
        is_admin: user.is_admin,
        blocked: user.blocked,
        registration_date: user.registration_date,
      };

      res
        .status(200)
        .json({ message: "Login successful.", user: req.session.user });
    });
  });
});

// ------------------- GET USER FROM SESSION -------------------
router.get("/session", (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ error: "Not logged in." });
  }
});

// Export the router
module.exports = router;
