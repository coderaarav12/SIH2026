import { Hono } from "hono";
import auth from "../middleware/auth.js";

const router = new Hono();

router.post("/:candidateId", auth, async (c) => {
  const candidateId = Number(c.req.param("candidateId"));
  const body = await c.req.json().catch(() => ({}));
  const action = String(body?.action || "").toLowerCase();
  const comment = String(body?.comment || "");
  const sourceCode = String(body?.source_code || `REQ-${candidateId}-${Date.now().toString().slice(-4)}`);

  if (!["approve", "reject"].includes(action)) {
    return c.json({ success: false, message: "action must be approve or reject" }, 400);
  }

  const candidate = await c.env.DB.prepare("SELECT * FROM match_candidates WHERE id = ?").bind(candidateId).first();
  if (!candidate) {
    return c.json({ success: false, message: "Match candidate not found" }, 404);
  }

  const decision = action === "approve" ? "approved" : "rejected";
  const user = c.get("user");

  // D1 doesn't support transactions in Workers — run sequentially
  await c.env.DB.prepare("UPDATE match_candidates SET decision = ? WHERE id = ?").bind(decision, candidateId).run();

  await c.env.DB.prepare(
    "INSERT INTO review_actions (candidate_id, reviewer_id, action, comment) VALUES (?, ?, ?, ?)"
  ).bind(candidateId, user.id, action, comment).run();

  await c.env.DB.prepare(
    "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)"
  ).bind(user.id, `REVIEW_${action.toUpperCase()}`, "match_candidate", candidateId, JSON.stringify({ comment })).run();

  if (action === "approve" && candidate.material_id) {
    await c.env.DB.prepare(`
      INSERT INTO source_mappings (source_code, source_name, canonical_material_id)
      SELECT ?, ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM source_mappings WHERE source_code = ? AND canonical_material_id = ?
      )
    `).bind(sourceCode, candidate.input_text, candidate.material_id, sourceCode, candidate.material_id).run();
  }

  return c.json({
    success: true,
    message: `Candidate ${action}d successfully`,
    candidate_id: candidateId,
    decision
  });
});

router.get("/", auth, async (c) => {
  const rows = (await c.env.DB.prepare(`
    SELECT
      ra.*,
      u.name AS reviewer_name,
      mc.input_text,
      mc.score,
      m.material_code,
      m.material_name
    FROM review_actions ra
    JOIN users u ON u.id = ra.reviewer_id
    JOIN match_candidates mc ON mc.id = ra.candidate_id
    LEFT JOIN materials m ON m.id = mc.material_id
    ORDER BY ra.id DESC
    LIMIT 100
  `).all()).results;

  return c.json({ success: true, count: rows.length, reviews: rows });
});

export default router;
