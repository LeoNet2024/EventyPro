// Import core modules
const express = require("express");
const session = require("express-session");
const cors = require("cors");

// Import route modules
const homeRoute = require("./routes/home");
const newEventRoute = require("./routes/newEvent");
const eventRoute = require("./routes/event");
const loginRoute = require("./routes/login");
const personalAreaRoute = require("./routes/personalArea");
const adminRoute = require("./routes/admin");
const registerRoute = require("./routes/register");
const verificationRoute = require("./routes/verification");

const app = express();
const port = 8801;

// ------------------- CORS CONFIGURATION -------------------
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from React frontend
    credentials: true, // Allow sending cookies across domains
  })
);

// ------------------- JSON BODY PARSER -------------------
app.use(express.json());

// ------------------- SESSION CONFIGURATION -------------------
app.use(
  session({
    secret: "leoneo", // Secret key for signing session cookies (should use env var in prod)
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      secure: false, // Set to true only with HTTPS
      maxAge: 1000 * 60 * 60 * 24, // Session valid for 1 day
    },
  })
);

// ------------------- ROUTES -------------------
app.use("/home", homeRoute); // Home page
app.use("/newEvent", newEventRoute); // Create new events
app.use("/event", eventRoute); // Event-specific routes
app.use("/login", loginRoute); // Auth: login, logout
app.use("/personal-area", personalAreaRoute); // User profile area
app.use("/admin", adminRoute); // Admin dashboard
app.use("/register", registerRoute); // Register user
app.use("/verification", verificationRoute); // Verification with email

// ------------------- GLOBAL ERROR HANDLER -------------------
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

// ------------------- LOGOUT -------------------
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully." });
  });
});

// ------------------- SESSION CHECK ROUTE -------------------
// Check session on page refresh to keep user logged in
app.get("/check-auth", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.json({ user: null });
  }
});

// ------------------- START SERVER -------------------
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
