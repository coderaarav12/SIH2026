import { Hono } from "hono";
import auth from "../middleware/auth.js";
import normalize from "../services/normalizer.js";
import { extractAttributes } from "../services/attributes.js";

const router = new Hono();

async function log(db, userId, action, entityType, entityId, details = {}) {
  await db.prepare(
    "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)"
  ).bind(userId, action, entityType, entityId || null, JSON.stringify(details)).run();
}

router.get("/", auth, async (c) => {
  const limit = Math.min(Number(c.req.query("limit") || 100), 500);
  const materials = (await c.env.DB.prepare(
    "SELECT * FROM materials ORDER BY id DESC LIMIT ?"
  ).bind(limit).all()).results;
  return c.json({ success: true, count: materials.length, materials });
});

router.get("/search", auth, async (c) => {
  const q = String(c.req.query("q") || "").trim();
  if (!q) return c.json({ success: false, message: "Search query q is required" }, 400);

  const like = `%${q}%`;
  const nq = normalize(q);

  const materials = (await c.env.DB.prepare(`
    SELECT * FROM materials
    WHERE material_name LIKE ?
       OR normalized_name LIKE ?
       OR material_code LIKE ?
       OR category LIKE ?
       OR grade LIKE ?
       OR size LIKE ?
    ORDER BY id DESC
    LIMIT 50
  `).bind(like, `%${nq}%`, like, like, like, like).all()).results;

  return c.json({ success: true, query: q, count: materials.length, materials });
});

router.get("/:id", auth, async (c) => {
  const material = await c.env.DB.prepare("SELECT * FROM materials WHERE id = ?").bind(c.req.param("id")).first();
  if (!material) return c.json({ success: false, message: "Material not found" }, 404);
  return c.json({ success: true, material });
});

router.post("/", auth, async (c) => {
  try {
    const body = (await c.req.json().catch(() => ({}))) || {};
    if (!body.material_name) {
      return c.json({ success: false, message: "material_name is required" }, 400);
    }

    const attrs = extractAttributes(body.material_name);
    const normalized = normalize(body.normalized_name || body.material_name);

    const result = await c.env.DB.prepare(`
      INSERT INTO materials
      (material_code, material_name, normalized_name, category, source, grade, size, unit, material_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.material_code || null,
      body.material_name,
      normalized,
      body.category || attrs.category || null,
      body.source || "manual",
      body.grade || attrs.grade || null,
      body.size || attrs.size || null,
      body.unit || attrs.unit || null,
      body.material_type || attrs.material_type || null
    ).run();

    const material = await c.env.DB.prepare("SELECT * FROM materials WHERE id = ?").bind(result.meta.last_row_id).first();
    await log(c.env.DB, c.get("user").id, "CREATE", "material", material.id, { material_code: material.material_code });
    return c.json({ success: true, message: "Material created successfully", material }, 201);
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) {
      return c.json({ success: false, message: "Material code already exists" }, 409);
    }
    return c.json({ success: false, message: e.message }, 500);
  }
});

router.put("/:id", auth, async (c) => {
  const old = await c.env.DB.prepare("SELECT * FROM materials WHERE id = ?").bind(c.req.param("id")).first();
  if (!old) return c.json({ success: false, message: "Material not found" }, 404);

  const body = (await c.req.json().catch(() => ({}))) || {};
  const name = body.material_name || old.material_name;
  const attrs = extractAttributes(name);

  await c.env.DB.prepare(`
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
  `).bind(
    body.material_code ?? old.material_code,
    name,
    normalize(body.normalized_name || name),
    body.category ?? old.category ?? attrs.category,
    body.source ?? old.source,
    body.grade ?? old.grade ?? attrs.grade,
    body.size ?? old.size ?? attrs.size,
    body.unit ?? old.unit ?? attrs.unit,
    body.material_type ?? old.material_type ?? attrs.material_type,
    c.req.param("id")
  ).run();

  const material = await c.env.DB.prepare("SELECT * FROM materials WHERE id = ?").bind(c.req.param("id")).first();
  await log(c.env.DB, c.get("user").id, "UPDATE", "material", material.id, {});
  return c.json({ success: true, message: "Material updated successfully", material });
});

router.delete("/:id", auth, async (c) => {
  const material = await c.env.DB.prepare("SELECT * FROM materials WHERE id = ?").bind(c.req.param("id")).first();
  if (!material) return c.json({ success: false, message: "Material not found" }, 404);

  await c.env.DB.prepare("DELETE FROM materials WHERE id = ?").bind(c.req.param("id")).run();
  await log(c.env.DB, c.get("user").id, "DELETE", "material", Number(c.req.param("id")), { material_code: material.material_code });
  return c.json({ success: true, message: "Material deleted successfully" });
});

// Bulk CSV upload — Cloudflare Workers version: parse CSV text from request body
router.post("/upload", auth, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const csvText = body.csv_text;
    const rows = body.rows; // Alternatively accept pre-parsed rows from frontend

    let parsedRows = [];

    if (rows && Array.isArray(rows)) {
      parsedRows = rows;
    } else if (csvText) {
      // Simple CSV parser (no external dependency needed in Workers)
      const lines = csvText.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
      parsedRows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] || ""]));
      });
    } else {
      return c.json({ success: false, message: "Provide csv_text (raw CSV string) or rows (parsed JSON array)" }, 400);
    }

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (const [index, row] of parsedRows.entries()) {
      const code = String(row.material_code || row.code || row["Material Code"] || "").trim();
      const name = String(row.material_name || row.name || row.description || row["Material Name"] || row["Description"] || "").trim();

      if (!name) {
        skipped++;
        errors.push({ row: index + 2, reason: "missing material_name" });
        continue;
      }

      const attrs = extractAttributes(name);
      try {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO materials
          (material_code, material_name, normalized_name, category, source, grade, size, unit, material_type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          code || null,
          name,
          normalize(name),
          String(row.category || row.Category || attrs.category || "Other"),
          String(row.source || row.Source || "uploaded"),
          String(row.grade || row.Grade || attrs.grade || ""),
          String(row.size || row.Size || attrs.size || ""),
          String(row.unit || row.Unit || attrs.unit || ""),
          String(row.material_type || row.Material_Type || attrs.material_type || "")
        ).run();
        inserted++;
      } catch (e) {
        skipped++;
        errors.push({ row: index + 2, reason: String(e.message).includes("UNIQUE") ? "duplicate material_code" : e.message });
      }
    }

    await log(c.env.DB, c.get("user").id, "UPLOAD", "materials", null, {
      total_rows: parsedRows.length, inserted, skipped
    });

    return c.json({
      success: true,
      message: "File processed successfully",
      total_rows: parsedRows.length,
      inserted,
      skipped,
      preview: parsedRows.slice(0, 10),
      errors: errors.slice(0, 20)
    });
  } catch (e) {
    return c.json({ success: false, message: `Could not process file: ${e.message}` }, 400);
  }
});

router.post("/ocr-extract", auth, async (c) => {
  try {
    const { filename = "", hint = "" } = (await c.req.json().catch(() => ({}))) || {};
    const { simulateOcr } = await import("../services/ocrSimulator.js");
    const ocrResult = simulateOcr(filename, hint);
    await log(c.env.DB, c.get("user").id, "OCR_SCAN", "label", null, { tag: ocrResult.tag, extracted: ocrResult.extracted_material_name });
    return c.json(ocrResult);
  } catch (e) {
    return c.json({ success: false, message: e.message }, 500);
  }
});

export default router;

