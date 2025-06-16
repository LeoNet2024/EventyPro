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
router.post("/", (req, res) => {
  const { first_name, last_name, user_name, password, gender, city, email } =
    req.body;

  // Step 1: Check if email already exists in DB
  const checkEmailQuery = `SELECT email FROM users WHERE email = ?`;
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error." });

    if (results.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Step 2: Generate salt & hash password
    bcrypt.genSalt(10, (err, salt) => {
      if (err)
        return res.status(500).json({ error: "Salt generation failed." });

      bcrypt.hash(password, salt, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: "Hashing failed." });

        // Step 3: Insert new user into DB
        const insertQuery = `
          INSERT INTO users (first_name, last_name, user_name, password, gender, city, email, is_verified)
          VALUES (?, ?, ?, ?, ?, ?, ?, false)
        `;
        const values = [
          first_name,
          last_name,
          user_name,
          hashedPassword,
          gender,
          city,
          email,
        ];

        db.query(insertQuery, values, (err, result) => {
          if (err)
            return res.status(500).json({ error: "User creation failed." });

          const userId = result.insertId; // Get new user's ID

          // Step 4: Generate verification code
          const verificationCode = Math.floor(
            100000 + Math.random() * 900000
          ).toString();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

          // Step 5: Save verification code in DB
          const codeQuery = `INSERT INTO email_verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)`;
          db.query(codeQuery, [userId, verificationCode, expiresAt], (err2) => {
            if (err2)
              return res.status(500).json({ error: "Saving code failed." });

            // Step 6: Send email with code
            const mailOptions = {
              from: "eventyproservice@gmail.com",
              to: email,
              subject: "Verify your account",
              html: `<p>Your verification code is: <b>${verificationCode}</b></p>`,
            };

            transporter.sendMail(mailOptions, (error) => {
              if (error)
                return res.status(500).json({ error: "Email sending failed." });

              res.status(201).json({
                message: "User registered. Verification code sent.",
                user_id: userId,
              });
            });
          });
        });
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
