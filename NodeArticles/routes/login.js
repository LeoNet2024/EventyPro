const express = require('express');
const bcrypt = require('bcrypt');
const dbSingleton = require('../dbSingleton');
const router = express.Router();
const db = dbSingleton.getConnection();

// REGISTER
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
      if (err) {
        console.error('Salt error:', err);
        return res.status(500).json({ error: 'Salt generation failed.' });
      }

      bcrypt.hash(password, salt, (err, hashedPassword) => {
        if (err) {
          console.error('Hash error:', err);
          return res.status(500).json({ error: 'Password hashing failed.' });
        }

        const insertQuery = `
          INSERT INTO users (first_name, last_name, user_name, password, gender, city, email)
          VALUES (?, ?, ?, ?, ?, ?, ?)
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

          res.status(201).json({ message: 'User registered successfully.' });
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
      return res.status(401).json({ error: 'Email not found.' });
    }

    const user = results[0];

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

module.exports = router;
