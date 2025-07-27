const express = require("express");
const multer = require("multer");
const mysql = require("mysql2"); // ✅ Only once!
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.static("uploads")); // Serve uploaded files

// Make sure upload folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ✅ MySQL setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // Change this if needed
  password: "",       // Fill this if you set a password
  database: "birthday_invite"
});

// ✅ Connect to MySQL only once
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// ✅ Upload route — no message
app.post("/upload", upload.single("file"), (req, res) => {
  if (!db || db.state === "disconnected") {
    return res.status(500).send("❌ Database connection lost");
  }

  const fileName = req.file.filename;

  const sql = "INSERT INTO uploads (filename) VALUES (?)";
  db.query(sql, [fileName], (err) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).send("Database error");
    }
    res.send("✅ Upload successful");
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
