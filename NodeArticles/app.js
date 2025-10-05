// Engineers: Leon Gitelman and Neo Zino

// Import core modules
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import route modules
const homeRoute = require("./routes/home");
const newEventRoute = require("./routes/newEvent");
const eventRoute = require("./routes/event");
const loginRoute = require("./routes/login");
const personalAreaRoute = require("./routes/personalArea");
const adminRoute = require("./routes/admin");
const registerRoute = require("./routes/register");
const verificationRoute = require("./routes/verification");
const filterEvents = require("./routes/filterEvents");
const homePageStat = require("./routes/homePageStat");
const updatePastEventsRoute = require("./routes/updatePastEvents");
const chatWithFriends = require("./routes/chatWithFriends");

const app = express();
const port = 8801;

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ------------------- FILE UPLOAD -------------------

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
]);

const ALLOWED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});

function imageFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
    return cb(new Error("רק קבצי תמונה מותרים."), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // עד 5MB
});
app.use("/uploads", express.static(uploadsDir));

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
app.use("/filterEvents", filterEvents); // Filter events
app.use("/homePageStat", homePageStat); // Home page statistics
app.use("/updatePastEvents", updatePastEventsRoute); // Updating past events
app.use("/chatWithFriends", chatWithFriends);

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

// ------------------- UPLOAD FILE -------------------
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "לא הועלה קובץ או שהקובץ לא תמונה." });
  }

  res.json({
    message: "הקובץ הועלה בהצלחה!",
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename, // ← מוסיפים
      path: req.file.path, // ← אופציונלי
      url: `/uploads/${req.file.filename}`, // לשימוש ב־IMG
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });
});

// ------------------- START SERVER -------------------
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
