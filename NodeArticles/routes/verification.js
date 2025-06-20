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

// ------------------- FORGOT PASSWORD -------------------
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  // Step 1: Check if email exists
  db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error." });
    if (results.length === 0)
      return res.status(404).json({ error: "Email not found." });

    // Step 2: Generate token and expiration
    const token = crypto.randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Step 3: Save token in DB
    db.query(
      `INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)`,
      [email, token, expires_at],
      (err2) => {
        if (err2) return res.status(500).json({ error: "DB error." });

        // Step 4: Send reset email
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        const mailOptions = {
          from: "eventyproservice@gmail.com",
          to: email,
          subject: "Reset your password",
          html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error)
            return res.status(500).json({ error: "Failed to send email." });
          res.json({ message: "Password reset email sent." });
        });
      }
    );
  });
});

// ------------------- RESET PASSWORD -------------------
router.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Step 1: Validate token
  db.query(
    `SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()`,
    [token],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error." });
      if (results.length === 0)
        return res.status(400).json({ error: "Invalid or expired token." });

      const email = results[0].email;

      // Step 2: Hash new password
      bcrypt.hash(password, 10, (err2, hash) => {
        if (err2) return res.status(500).json({ error: "Hashing failed." });

        // Step 3: Update password
        db.query(
          `UPDATE users SET password = ? WHERE email = ?`,
          [hash, email],
          (err3) => {
            if (err3)
              return res.status(500).json({ error: "Password update failed." });

            // Step 4: Delete used token
            db.query(`DELETE FROM password_resets WHERE token = ?`, [token]);

            res.json({ message: "Password has been reset successfully." });
          }
        );
      });
    }
  );
});

// ------------------- EMAIL VERIFICATION CODE -------------------
router.post("/confirm-verification", (req, res) => {
  const { code } = req.body;
  const pendingUser = req.session.pendingUser;

  if (!pendingUser)
    return res.status(400).json({ error: "No pending registration found." });

  if (Date.now() > pendingUser.expiresAt) {
    req.session.pendingUser = null;
    return res.status(400).json({ error: "Verification code expired." });
  }

  if (pendingUser.code !== code) {
    return res.status(400).json({ error: "Invalid verification code." });
  }

  // Create user in DB
  const insertQuery = `
    INSERT INTO users (first_name, last_name, user_name, password, gender, city, email, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, true)
  `;

  const values = [
    pendingUser.first_name,
    pendingUser.last_name,
    pendingUser.user_name,
    pendingUser.password,
    pendingUser.gender,
    pendingUser.city,
    pendingUser.email,
  ];

  db.query(insertQuery, values, (err) => {
    if (err) return res.status(500).json({ error: "User creation failed." });

    // Destroy session completely
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy failed:", destroyErr);
        return res.status(500).json({ error: "Session cleanup failed." });
      }

      res.json({ message: "User registered and verified successfully." });
    });
  });
});

// Export the router
module.exports = router;
