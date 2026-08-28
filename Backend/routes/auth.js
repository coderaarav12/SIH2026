import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = new Hono();

function sign(user, env) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    env.JWT_SECRET || "syncmasters-demo-secret",
    { expiresIn: "12h" }
  );
}

// In-memory OTP store for email verification
const otpStore = new Map();

router.post("/register", async (c) => {
  try {
    const { name, email, password, role = "reviewer", department = "Materials & Stores" } = (await c.req.json().catch(() => ({}))) || {};

    if (!name || !email || !password) {
      return c.json({ success: false, message: "Name, email and password are required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ success: false, message: "Password must be at least 6 characters" }, 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const exists = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(cleanEmail).first();
    if (exists) {
      return c.json({ success: false, message: "Email already registered in CPSE portal" }, 409);
    }

    const validRoles = ["admin", "reviewer", "officer"];
    const userRole = validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : "reviewer";

    const hash = bcrypt.hashSync(password, 10);
    const result = await c.env.DB.prepare(`
      INSERT INTO users (name, email, password_hash, role, department)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), cleanEmail, hash, userRole, department);

    const user = await c.env.DB.prepare(`
      SELECT id, name, email, role, department, created_at FROM users WHERE id = ?
    `).bind(result.lastInsertRowid).first();

    return c.json({
      success: true,
      message: "CPSE Portal Registration Successful",
      user,
      token: sign(user, c.env)
    }, 201);
  } catch (e) {
    return c.json({ success: false, message: e.message }, 500);
  }
});

router.post("/login", async (c) => {
  try {
    const { email, password } = (await c.req.json().catch(() => ({}))) || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    const user = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(cleanEmail).first();

    if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
      return c.json({ success: false, message: "Invalid official credentials or password" }, 401);
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "CPSE Operations",
      created_at: user.created_at
    };

    return c.json({
      success: true,
      message: "Authentication successful",
      token: sign(user, c.env),
      user: safeUser
    });
  } catch (e) {
    return c.json({ success: false, message: e.message }, 500);
  }
});

// Gmail / Email OTP Request
router.post("/send-otp", async (c) => {
  const { email } = (await c.req.json().catch(() => ({}))) || {};
  if (!email) return c.json({ success: false, message: "Email is required" }, 400);

  const cleanEmail = String(email).trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(cleanEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  console.log(`[AUTH-OTP] Generated OTP for ${cleanEmail}: ${otp}`);

  return c.json({
    success: true,
    message: `Security OTP sent to ${cleanEmail}`,
    dev_hint_otp: otp
  });
});

// Verify OTP & Instant Login
router.post("/verify-otp", async (c) => {
  const { email, otp } = (await c.req.json().catch(() => ({}))) || {};
  const cleanEmail = String(email || "").trim().toLowerCase();
  const record = otpStore.get(cleanEmail);

  if (!record || record.otp !== String(otp).trim() || Date.now() > record.expiresAt) {
    return c.json({ success: false, message: "Invalid or expired OTP code" }, 400);
  }

  otpStore.delete(cleanEmail);

  let user = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(cleanEmail).first();
  if (!user) {
    // Auto-create verified Gmail user
    const hash = bcrypt.hashSync("GoogleAuth@2026", 10);
    const nameFromEmail = cleanEmail.split("@")[0].replace(/[._]/g, " ").toUpperCase();
    const result = await c.env.DB.prepare(`
      INSERT INTO users (name, email, password_hash, role, department)
      VALUES (?, ?, ?, ?, ?)
    `).bind(nameFromEmail, cleanEmail, hash, "reviewer", "Gmail Verified Access").run();

    user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(result.lastInsertRowid).first();
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    created_at: user.created_at
  };

  return c.json({
    success: true,
    message: "Email OTP verification successful",
    token: sign(user, c.env),
    user: safeUser
  });
});

router.get("/me", auth, async (c) => {
  return c.json({ success: true, user: c.get("user") });
});


router.post("/verify-site-key", async (c) => {
  const { key } = (await c.req.json().catch(() => ({})));
  const validKey = String(c.env.SITE_ACCESS_KEY || "SIH2026-WIN").trim();
  console.log("RECEIVED KEY:", key, "VALID KEY:", validKey);
  if (key === validKey) {
    return c.json({ success: true, message: "Access granted" });
  } else {
    return c.json({ success: false, message: "Invalid security key" }, 401);
  }
});

export default router;

