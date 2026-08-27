import { Hono } from "hono";
import auth from "../middleware/auth.js";

const router = new Hono();

router.get("/", auth, async (c) => {
  try {
    const rows = (await c.env.DB.prepare(`
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
    `).all()).results;

    return c.json({
      success: true,
      count: rows.length,
      mappings: rows
    });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

export default router;


