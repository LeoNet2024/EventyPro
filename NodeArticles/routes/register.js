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

// ------------------- MAIL TRANSPORTER -------------------
// Setup nodemailer transporter using Gmail service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "eventyproservice@gmail.com", // Replace with environment variable in production
    pass: "yjbe leep ezrw thtf", // App password
  },
});

// ------------------- USER REGISTRATION -------------------

// Send verification code and validate new user creation
router.post("/request-verification", (req, res) => {
  const { first_name, last_name, user_name, password, gender, city, email } =
    req.body;

  // Step 1: Check if email already exists in users
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error." });
    if (results.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Step 2: Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: "Hashing failed." });

      // Step 3: Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Step 4: Save in session (instead of DB)
      req.session.pendingUser = {
        first_name,
        last_name,
        user_name,
        password: hashedPassword,
        gender,
        city,
        email,
        code,
        expiresAt,
      };

      // Step 5: Send email with code
      const mailOptions = {
        from: "eventyproservice@gmail.com",
        to: email,
        subject: "Verify your account",
        html: `<p>Your verification code is: <b>${code}</b></p>`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          return res.status(500).json({ error: "Email sending failed." });
        }

        res.json({ message: "Verification code sent to your email." });
      });
    });
  });
});

// ------------------- GET CITIES -------------------
router.get("/cities", (req, res) => {
  db.query("SELECT name_heb FROM yeshuvim", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch cities." });
    res.json(results);
  });
});

// Export the router
module.exports = router;
