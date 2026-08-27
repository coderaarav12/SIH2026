const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/init");
const auth = require("../middleware/auth");

const router = express.Router();

function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "syncmasters-demo-secret",
    { expiresIn: "12h" }
  );
}

// In-memory OTP store for email verification
const otpStore = new Map();

router.post("/register", (req, res) => {
  try {
    const { name, email, password, role = "reviewer", department = "Materials & Stores" } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered in CPSE portal" });
    }

    const validRoles = ["admin", "reviewer", "officer"];
    const userRole = validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : "reviewer";

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, department)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), cleanEmail, hash, userRole, department);

    const user = db.prepare(`
      SELECT id, name, email, role, department, created_at FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "CPSE Portal Registration Successful",
      user,
      token: sign(user)
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);

    if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
      return res.status(401).json({ success: false, message: "Invalid official credentials or password" });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "CPSE Operations",
      created_at: user.created_at
    };

    res.json({
      success: true,
      message: "Authentication successful",
      token: sign(user),
      user: safeUser
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Gmail / Email OTP Request
router.post("/send-otp", (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const cleanEmail = String(email).trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(cleanEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  console.log(`[AUTH-OTP] Generated OTP for ${cleanEmail}: ${otp}`);

  res.json({
    success: true,
    message: `Security OTP sent to ${cleanEmail}`,
    dev_hint_otp: otp
  });
});

// Verify OTP & Instant Login
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();
  const record = otpStore.get(cleanEmail);

  if (!record || record.otp !== String(otp).trim() || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
  }

  otpStore.delete(cleanEmail);

  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);
  if (!user) {
    // Auto-create verified Gmail user
    const hash = bcrypt.hashSync("GoogleAuth@2026", 10);
    const nameFromEmail = cleanEmail.split("@")[0].replace(/[._]/g, " ").toUpperCase();
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, department)
      VALUES (?, ?, ?, ?, ?)
    `).run(nameFromEmail, cleanEmail, hash, "reviewer", "Gmail Verified Access");

    user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    created_at: user.created_at
  };

  res.json({
    success: true,
    message: "Email OTP verification successful",
    token: sign(user),
    user: safeUser
  });
});

router.get("/me", auth, (req, res) => {
  res.json({ success: true, user: req.user });
});


router.post("/verify-site-key", (req, res) => {
  const { key } = req.body;
  const validKey = String(process.env.SITE_ACCESS_KEY || "SIH2026-WIN").trim();
  console.log("RECEIVED KEY:", key, "VALID KEY:", validKey);
  if (key === validKey) {
    res.json({ success: true, message: "Access granted" });
  } else {
    res.status(401).json({ success: false, message: "Invalid security key" });
  }
});

module.exports = router;