const express = require("express");
const db = require("../db/init");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const action = req.query.action ? String(req.query.action).trim() : null;

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

    const logs = db.prepare(query).all(...params);

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

    res.json({
      success: true,
      count: parsedLogs.length,
      audit_logs: parsedLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
