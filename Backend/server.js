import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

import authRoutes from "./routes/auth.js";
import materialRoutes from "./routes/materials.js";
import matchingRoutes from "./routes/matching.js";
import reviewRoutes from "./routes/reviews.js";
import analyticsRoutes from "./routes/analytics.js";
import auditRoutes from "./routes/audit.js";
import mappingsRoutes from "./routes/mappings.js";
import ocrRoutes from "./routes/ocr.js";
import procurementRoutes from "./routes/procurement.js";
import reportsRoutes from "./routes/reports.js";

const app = new Hono();

// Security Headers
app.use("*", secureHeaders());

// CORS Configuration
app.use("*", cors({
  origin: "*", // Adjust for production
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.get("/", (c) => {
  return c.json({
    success: true,
    project: "SyncMasters",
    problemStatement: "SIH26099",
    platform: "Material Intelligence - AI-Driven CPSE Material Harmonization",
    security: "Cloudflare Workers / D1",
    message: "Material Intelligence Backend is running on Edge"
  });
});

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    status: "healthy",
    message: "Material Intelligence Backend is running",
    project: "SIH26099",
    team: "SyncMasters",
    timestamp: new Date().toISOString()
  });
});

app.route("/api/auth", authRoutes);
app.route("/api/materials", materialRoutes);
app.route("/api/matching", matchingRoutes);
app.route("/api/reviews", reviewRoutes);
app.route("/api/analytics", analyticsRoutes);
app.route("/api/audit-logs", auditRoutes);
app.route("/api/mappings", mappingsRoutes);
app.route("/api/ocr", ocrRoutes);
app.route("/api/procurement", procurementRoutes);
app.route("/api/reports", reportsRoutes);

app.notFound((c) => {
  return c.json({ success: false, message: "Endpoint not found" }, 404);
});

app.onError((err, c) => {
  console.error("[SECURITY-LOG] Error:", err.message);
  return c.json({
    success: false,
    message: err.message || "An internal error occurred."
  }, 500);
});

export default app;
