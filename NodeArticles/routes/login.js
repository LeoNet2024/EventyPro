const express = require('express');
const bcrypt = require('bcrypt');
const dbSingleton = require('../dbSingleton');
const router = express.Router();
const db = dbSingleton.getConnection();

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'leongitelman2015@gmail.com',
    pass: 'vvyc fcmj rwis vliu',
  },
});

// REGISTER עם שליחת קוד
router.post('/register', (req, res) => {
  const { first_name, last_name, user_name, password, gender, city, email } =
    req.body;

  const checkEmailQuery = `SELECT email FROM users WHERE email = ?`;
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking existing email:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (err)
        return res.status(500).json({ error: 'Salt generation failed.' });

      bcrypt.hash(password, salt, (err, hashedPassword) => {
        if (err)
          return res.status(500).json({ error: 'Password hashing failed.' });

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
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ error: 'User creation failed.' });
          }

          const userId = result.insertId;

          // שלב 2: יצירת קוד אימות
          const verificationCode = Math.floor(
            100000 + Math.random() * 900000,
          ).toString();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 דקות

          const codeQuery = `
            INSERT INTO email_verification_codes (user_id, code, expires_at)
            VALUES (?, ?, ?)
          `;

          db.query(codeQuery, [userId, verificationCode, expiresAt], err2 => {
            if (err2) {
              console.error('Failed to save code:', err2);
              return res
                .status(500)
                .json({ error: 'Failed to save verification code.' });
            }

            // שליחת מייל עם הקוד
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: 'Verify your account',
              html: `<p>Your verification code is: <b>${verificationCode}</b></p>`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error('Mail send error:', error);
                return res
                  .status(500)
                  .json({ error: 'Failed to send verification email.' });
              }

              // הרשמה + שליחת קוד הסתיימו בהצלחה
              res.status(201).json({
                message: 'User registered. Verification code sent to email.',
                user_id: userId,
              });
            });
          });
        });
      });
    });
  });
});

// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = results[0];

    if (user.blocked) {
      return res.status(403).json({ error: 'This user is blocked' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Compare error:', err);
        return res.status(500).json({ error: 'Authentication error.' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      // Save user in session
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

      res.status(200).json({
        message: 'Login successful.',
        user: req.session.user,
      });
    });
  });
});

// GET cities
router.get('/cities', (req, res) => {
  const query = 'SELECT name_heb FROM yeshuvim';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error getting cities:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    res.json(results);
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed.' });
    }

    res.clearCookie('connect.sid'); // שם ה-cookie של express-session
    res.status(200).json({ message: 'Logged out successfully.' });
  });
});

// GET user from session
router.get('/session', (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// Forgot password path
router.post('/users/forgot-password', (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  // Check user exists
  db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error.' });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Email not found.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 1000 * 60 * 30); // 30 דקות תוקף

    // Save token in DB
    const insertQuery = `INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)`;
    db.query(insertQuery, [email, token, expires_at], err2 => {
      if (err2) return res.status(500).json({ error: 'DB error.' });

      // Send email
      const resetLink = `http://localhost:3000/reset-password/${token}`;

      const mailOptions = {
        from: 'leongitelman2015@gmail.com',
        to: email,
        subject: 'Reset your password',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Mail error:', error);
          return res.status(500).json({ error: 'Email failed.' });
        }
        res.json({ message: 'Password reset email sent.' });
      });
    });
  });
});

router.post('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // שלב 1: חיפוש הטוקן בטבלת password_resets (ולוודא שהוא בתוקף)
  const query = `SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()`;
  db.query(query, [token], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    const email = results[0].email;

    // שלב 2: הצפנת סיסמה חדשה
    bcrypt.hash(password, 10, (err2, hash) => {
      if (err2) {
        console.error('Hash error:', err2);
        return res.status(500).json({ error: 'Password encryption failed.' });
      }

      // שלב 3: עדכון סיסמה למשתמש
      const updateQuery = `UPDATE users SET password = ? WHERE email = ?`;
      db.query(updateQuery, [hash, email], err3 => {
        if (err3) {
          console.error('Password update error:', err3);
          return res.status(500).json({ error: 'Failed to update password.' });
        }

        // שלב 4: מחיקת הטוקן לאחר שימוש (one-time only)
        db.query(`DELETE FROM password_resets WHERE token = ?`, [token]);

        res.json({ message: 'Password has been reset successfully.' });
      });
    });
  });
});

router.post('/verify-code', (req, res) => {
  const { user_id, code } = req.body;

  const query = `
    SELECT * FROM email_verification_codes 
    WHERE user_id = ? AND code = ? AND expires_at > NOW()
  `;
  db.query(query, [user_id, code], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // עדכון המשתמש
    db.query(
      `UPDATE users SET is_verified = 1 WHERE user_id = ?`,
      [user_id],
      err2 => {
        if (err2)
          return res.status(500).json({ error: 'Failed to verify user' });

        // מחיקת הקוד אחרי שימוש
        db.query(`DELETE FROM email_verification_codes WHERE user_id = ?`, [
          user_id,
        ]);

        res.json({ message: 'Email verified successfully' });
      },
    );
  });
});

module.exports = router;
