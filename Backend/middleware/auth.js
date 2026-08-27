const jwt = require("jsonwebtoken");
const db = require("../db/init");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authorization token required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "syncmasters-demo-secret");
    const user = db.prepare(`
      SELECT id, name, email, role, created_at FROM users WHERE id = ?
    `).get(payload.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

module.exports = auth;