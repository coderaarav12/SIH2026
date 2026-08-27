const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync");

const db = require("../db/init");
const auth = require("../middleware/auth");
const normalize = require("../services/normalizer");
const { extractAttributes } = require("../services/attributes");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }
});

function log(userId, action, entityType, entityId, details = {}) {
  db.prepare(`
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, action, entityType, entityId || null, JSON.stringify(details));
}

router.get("/", auth, (req, res) => {
  const limit = Math.min(Number(req.query.limit || 100), 500);
  const materials = db.prepare(`
    SELECT * FROM materials ORDER BY id DESC LIMIT ?
  `).all(limit);

  res.json({ success: true, count: materials.length, materials });
});

router.get("/search", auth, (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ success: false, message: "Search query q is required" });

  const like = `%${q}%`;
  const nq = normalize(q);

  const materials = db.prepare(`
    SELECT * FROM materials
    WHERE material_name LIKE ?
       OR normalized_name LIKE ?
       OR material_code LIKE ?
       OR category LIKE ?
       OR grade LIKE ?
       OR size LIKE ?
    ORDER BY id DESC
    LIMIT 50
  `).all(like, `%${nq}%`, like, like, like, like);

  res.json({ success: true, query: q, count: materials.length, materials });
});

router.get("/:id", auth, (req, res) => {
  const material = db.prepare("SELECT * FROM materials WHERE id = ?").get(req.params.id);
  if (!material) return res.status(404).json({ success: false, message: "Material not found" });
  res.json({ success: true, material });
});

router.post("/", auth, (req, res) => {
  try {
    const body = req.body || {};
    if (!body.material_name) {
      return res.status(400).json({ success: false, message: "material_name is required" });
    }

    const attrs = extractAttributes(body.material_name);
    const normalized = normalize(body.normalized_name || body.material_name);

    const result = db.prepare(`
      INSERT INTO materials
      (material_code, material_name, normalized_name, category, source, grade, size, unit, material_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.material_code || null,
      body.material_name,
      normalized,
      body.category || attrs.category || null,
      body.source || "manual",
      body.grade || attrs.grade || null,
      body.size || attrs.size || null,
      body.unit || attrs.unit || null,
      body.material_type || attrs.material_type || null
    );

    const material = db.prepare("SELECT * FROM materials WHERE id = ?").get(result.lastInsertRowid);
    log(req.user.id, "CREATE", "material", material.id, { material_code: material.material_code });

    res.status(201).json({ success: true, message: "Material created successfully", material });
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) {
      return res.status(409).json({ success: false, message: "Material code already exists" });
    }
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/:id", auth, (req, res) => {
  const old = db.prepare("SELECT * FROM materials WHERE id = ?").get(req.params.id);
  if (!old) return res.status(404).json({ success: false, message: "Material not found" });

  const body = req.body || {};
  const name = body.material_name || old.material_name;
  const attrs = extractAttributes(name);

  db.prepare(`
    UPDATE materials SET
      material_code = ?,
      material_name = ?,
      normalized_name = ?,
      category = ?,
      source = ?,
      grade = ?,
      size = ?,
      unit = ?,
      material_type = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    body.material_code ?? old.material_code,
    name,
    normalize(body.normalized_name || name),
    body.category ?? old.category ?? attrs.category,
    body.source ?? old.source,
    body.grade ?? old.grade ?? attrs.grade,
    body.size ?? old.size ?? attrs.size,
    body.unit ?? old.unit ?? attrs.unit,
    body.material_type ?? old.material_type ?? attrs.material_type,
    req.params.id
  );

  const material = db.prepare("SELECT * FROM materials WHERE id = ?").get(req.params.id);
  log(req.user.id, "UPDATE", "material", material.id, {});
  res.json({ success: true, message: "Material updated successfully", material });
});

router.delete("/:id", auth, (req, res) => {
  const material = db.prepare("SELECT * FROM materials WHERE id = ?").get(req.params.id);
  if (!material) return res.status(404).json({ success: false, message: "Material not found" });

  db.prepare("DELETE FROM materials WHERE id = ?").run(req.params.id);
  log(req.user.id, "DELETE", "material", Number(req.params.id), { material_code: material.material_code });

  res.json({ success: true, message: "Material deleted successfully" });
});

router.post("/upload", auth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Upload a CSV or Excel file using field name 'file'" });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    let rows = [];

    if (ext === ".csv") {
      const content = fs.readFileSync(req.file.path, "utf8");
      rows = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });
    } else if (ext === ".xlsx" || ext === ".xls") {
      const workbook = XLSX.readFile(req.file.path);
      const first = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(first, { defval: "" });
    } else {
      return res.status(400).json({ success: false, message: "Only CSV, XLSX and XLS files are supported" });
    }

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    const stmt = db.prepare(`
      INSERT INTO materials
      (material_code, material_name, normalized_name, category, source, grade, size, unit, material_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      rows.forEach((row, index) => {
        const code = String(row.material_code || row.code || row["Material Code"] || "").trim();
        const name = String(row.material_name || row.name || row.description || row["Material Name"] || row["Description"] || "").trim();

        if (!name) {
          skipped++;
          errors.push({ row: index + 2, reason: "missing material_name" });
          return;
        }

        const attrs = extractAttributes(name);

        try {
          stmt.run(
            code || null,
            name,
            normalize(name),
            String(row.category || row.Category || attrs.category || "Other"),
            String(row.source || row.Source || "uploaded"),
            String(row.grade || row.Grade || attrs.grade || ""),
            String(row.size || row.Size || attrs.size || ""),
            String(row.unit || row.Unit || attrs.unit || ""),
            String(row.material_type || row.Material_Type || attrs.material_type || "")
          );
          inserted++;
        } catch (e) {
          skipped++;
          errors.push({
            row: index + 2,
            reason: String(e.message).includes("UNIQUE") ? "duplicate material_code" : e.message
          });
        }
      });
    });

    tx();

    log(req.user.id, "UPLOAD", "materials", null, {
      file: req.file.originalname,
      total_rows: rows.length,
      inserted,
      skipped
    });

    res.json({
      success: true,
      message: "File processed successfully",
      file: req.file.originalname,
      total_rows: rows.length,
      inserted,
      skipped,
      errors: errors.slice(0, 20)
    });
  } catch (e) {
    res.status(400).json({ success: false, message: `Could not process file: ${e.message}` });
  } finally {
    try { fs.unlinkSync(req.file.path); } catch {}
  }
});

// Physical Label & Specification Sheet OCR Simulator Endpoint
router.post("/ocr-extract", auth, (req, res) => {
  try {
    const { filename = "", hint = "" } = req.body || {};
    const { simulateOcr } = require("../services/ocrSimulator");
    const ocrResult = simulateOcr(filename, hint);

    log(req.user.id, "OCR_SCAN", "label", null, {
      tag: ocrResult.tag,
      extracted: ocrResult.extracted_material_name
    });

    res.json(ocrResult);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;