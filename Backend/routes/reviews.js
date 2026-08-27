const express = require("express");
const db = require("../db/init");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/:candidateId", auth, (req, res) => {
  const candidateId = Number(req.params.candidateId);
  const action = String(req.body?.action || "").toLowerCase();
  const comment = String(req.body?.comment || "");

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ success: false, message: "action must be approve or reject" });
  }

  const candidate = db.prepare("SELECT * FROM match_candidates WHERE id = ?").get(candidateId);
  if (!candidate) {
    return res.status(404).json({ success: false, message: "Match candidate not found" });
  }

  const decision = action === "approve" ? "approved" : "rejected";

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE match_candidates SET decision = ? WHERE id = ?
    `).run(decision, candidateId);

    db.prepare(`
      INSERT INTO review_actions (candidate_id, reviewer_id, action, comment)
      VALUES (?, ?, ?, ?)
    `).run(candidateId, req.user.id, action, comment);

    db.prepare(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      `REVIEW_${action.toUpperCase()}`,
      "match_candidate",
      candidateId,
      JSON.stringify({ comment })
    );

    if (action === "approve" && candidate.material_id) {
      const sourceCode = String(req.body?.source_code || `REQ-${candidateId}-${Date.now().toString().slice(-4)}`);
      db.prepare(`
        INSERT INTO source_mappings (source_code, source_name, canonical_material_id)
        SELECT ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM source_mappings
          WHERE source_code = ? AND canonical_material_id = ?
        )
      `).run(
        sourceCode,
        candidate.input_text,
        candidate.material_id,
        sourceCode,
        candidate.material_id
      );
    }
  });

  tx();

  res.json({
    success: true,
    message: `Candidate ${action}d successfully`,
    candidate_id: candidateId,
    decision
  });
});

router.get("/", auth, (req, res) => {
  const rows = db.prepare(`
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
  `).all();

  res.json({ success: true, count: rows.length, reviews: rows });
});

module.exports = router;