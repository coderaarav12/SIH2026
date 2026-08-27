import rateLimit from "express-rate-limit";

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
    if (!c.get("user")) {
      return c.json({ success: false, message: "Authentication required for this operation" }, 401);
    }

    const userRole = String(c.get("user").role || "").toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => String(r).toLowerCase());

    if (!normalizedAllowed.includes(userRole) && userRole !== "admin") {
      // Log unauthorized attempt to audit logs
      try {
        await c.env.DB.prepare(`
          INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
          VALUES (?, 'SECURITY_UNAUTHORIZED_ROLE_ACCESS', 'rbac', 0, ?)
        `).bind(c.get("user").id, JSON.stringify({
          attempted_role_required: allowedRoles,
          user_role: c.get("user").role,
          route: req.originalUrl,
          method: req.method
        }).run());
      } catch {}

      return c.json({
        success: false,
        message: `Forbidden: This operation requires one of [${allowedRoles.join(", ")}] permissions. Your current role is '${c.get("user").role}'.`
      }, 403);
    }

    next();
  };
}

// 3. Input Sanitization Middleware
function sanitizeInput(req, res, next) {
  if ((await c.req.json().catch(() => ({}))) && typeof (await c.req.json().catch(() => ({}))) === "object") {
    for (const [key, val] of Object.entries((await c.req.json().catch(() => ({}))))) {
      if (typeof val === "string") {
        // Strip potential script injections while preserving industrial symbols (e.g., #, &, ", ', %, ×, mm, inch)
        (await c.req.json().catch(() => ({})))[key] = val
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


