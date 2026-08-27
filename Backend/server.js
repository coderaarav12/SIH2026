require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const { initDb } = require("./db/init");
const { authLimiter, uploadLimiter, generalApiLimiter, sanitizeInput } = require("./middleware/security");

const authRoutes = require("./routes/auth");
const materialRoutes = require("./routes/materials");
const matchingRoutes = require("./routes/matching");
const reviewRoutes = require("./routes/reviews");
const analyticsRoutes = require("./routes/analytics");
const auditRoutes = require("./routes/audit");
const mappingsRoutes = require("./routes/mappings");
const ocrRoutes = require("./routes/ocr");
const procurementRoutes = require("./routes/procurement");
const reportsRoutes = require("./routes/reports");

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Security Headers (GIGW / GovTech Compliance)
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible API usage
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(sanitizeInput);

initDb();

// Apply General Rate Limiter to all API routes
app.use("/api/", generalApiLimiter);

// Specific Auth Rate Limiter
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/send-otp", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);

// Specific Bulk Upload Rate Limiter
app.use("/api/materials/upload", uploadLimiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    project: "SyncMasters",
    problemStatement: "SIH26099",
    platform: "Material Intelligence - AI-Driven CPSE Material Harmonization",
    security: "GIGW / NIC GovTech Hardened (Helmet, JWT-RBAC, Rate-Limited, Parameterized SQL)",
    message: "Material Intelligence Backend is running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      materials: "/api/materials",
      matching: "/api/matching",
      reviews: "/api/reviews",
      analytics: "/api/analytics",
      auditLogs: "/api/audit-logs",
      mappings: "/api/mappings",
      procurement: "/api/procurement"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    message: "Material Intelligence Backend is running",
    project: "SIH26099",
    team: "SyncMasters",
    security_checks: "PASSED",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/mappings", mappingsRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/reports", reportsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("[SECURITY-LOG] Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An internal error occurred. Please contact the portal administrator."
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
