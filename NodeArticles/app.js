const express = require("express");
const session = require("express-session");
const cors = require("cors");

const homeRoute = require("./routes/home");
const newEventRoute = require("./routes/newEvent");
const eventRoute = require("./routes/event");
const loginRoute = require("./routes/login");
const personalAreaRoute = require("./routes/personalArea");

const app = express();
const port = 8801;

app.use(
  cors({
    origin: "http://localhost:3000", // כתובת אפליקציית React
    credentials: true, // כדי לאפשר שליחת cookies
  })
);

app.use(express.json());

app.use(
  session({
    secret: "leoneo", // סוד אקראי – לא לפרסום
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true רק ב־HTTPS
      httpOnly: true,
    },
  })
);

app.use("/home", homeRoute); // Home Page
app.use("/newEvent", newEventRoute); // New Event
app.use("/event", eventRoute); // Events
app.use("/login", loginRoute); // כולל /register, /session, /logout
app.use("/personal-area", personalAreaRoute); // Personal area path

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

// ✅ הפעלת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
