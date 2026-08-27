import { Hono } from "hono";
import auth from "../middleware/auth.js";

const router = new Hono();

router.get("/", auth, async (c) => {
  try {
    const limit = Math.min(Number(c.req.query("limit") || 100), 500);
    const action = c.req.query("action") ? String(c.req.query("action")).trim() : null;

    let query = `
      SELECT 
        a.id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.details,
        a.created_at,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role,
        u.department AS user_dept
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
    `;

    const params = [];
    if (action) {
      query += " WHERE a.action = ?";
      params.push(action);
    }

    query += " ORDER BY a.id DESC LIMIT ?";
    params.push(limit);

    const logs = (await c.env.DB.prepare(query).bind(...params).all()).results;

    const parsedLogs = logs.map(l => {
      let detailsObj = {};
      try {
        detailsObj = l.details ? JSON.parse(l.details) : {};
      } catch {
        detailsObj = { raw: l.details };
      }
      return {
        ...l,
        details: detailsObj
      };
    });

    return c.json({
      success: true,
      count: parsedLogs.length,
      audit_logs: parsedLogs
    });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

export default router;


