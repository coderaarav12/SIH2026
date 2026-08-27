const rateLimit = require("express-rate-limit");
const db = require("../db/init");

// 1. Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests from this IP. Please try again after 15 minutes."
  }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Upload rate limit exceeded. Please wait a few minutes before submitting additional bulk files."
  }
});

const generalApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests to the National Material Intelligence API. Please slow down."
  }
});

// 2. Role-Based Access Control (RBAC)
function requireRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required for this operation" });
    }

    const userRole = String(req.user.role || "").toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => String(r).toLowerCase());

    if (!normalizedAllowed.includes(userRole) && userRole !== "admin") {
      // Log unauthorized attempt to audit logs
      try {
        db.prepare(`
          INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
          VALUES (?, 'SECURITY_UNAUTHORIZED_ROLE_ACCESS', 'rbac', 0, ?)
        `).run(req.user.id, JSON.stringify({
          attempted_role_required: allowedRoles,
          user_role: req.user.role,
          route: req.originalUrl,
          method: req.method
        }));
      } catch {}

      return res.status(403).json({
        success: false,
        message: `Forbidden: This operation requires one of [${allowedRoles.join(", ")}] permissions. Your current role is '${req.user.role}'.`
      });
    }

    next();
  };
}

// 3. Input Sanitization Middleware
function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === "object") {
    for (const [key, val] of Object.entries(req.body)) {
      if (typeof val === "string") {
        // Strip potential script injections while preserving industrial symbols (e.g., #, &, ", ', %, ×, mm, inch)
        req.body[key] = val
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .trim();
      }
    }
  }
  next();
}

module.exports = {
  authLimiter,
  uploadLimiter,
  generalApiLimiter,
  requireRoles,
  sanitizeInput
};
