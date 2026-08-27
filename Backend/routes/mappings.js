const express = require("express");
const db = require("../db/init");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        sm.id,
        sm.source_code,
        sm.source_name,
        sm.canonical_material_id,
        sm.created_at,
        m.material_code AS canonical_code,
        m.material_name AS canonical_name,
        m.category AS canonical_category,
        m.grade AS canonical_grade,
        m.size AS canonical_size,
        m.source AS canonical_source
      FROM source_mappings sm
      LEFT JOIN materials m ON m.id = sm.canonical_material_id
      ORDER BY sm.id DESC
    `).all();

    res.json({
      success: true,
      count: rows.length,
      mappings: rows
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
