const db = require('better-sqlite3')('db/material_intelligence.db');

db.exec(`
  INSERT INTO match_candidates (input_text, material_id, score, decision, reasons, created_by) VALUES 
  ('SS Hex Bolt M10x50 304', 1, 98.5, 'auto_suggest', 'Exact match on grade (304), size (M10x50) and material (Stainless Steel).', 2),
  ('Carbon Steel Pipe Sch40 2"', 4, 95.2, 'review', 'High semantic similarity but requires verification of ASTM grade standard.', 3),
  ('Ball Valve 2 inch SS316 Flanged', 8, 99.1, 'approved', 'Perfect match on all critical attributes including connection type.', 2),
  ('Chrome Steel Bearing 6205', 11, 88.0, 'rejected', 'Match failed on suffix requirements (2RS missing in input).', 2);

  INSERT INTO review_actions (candidate_id, reviewer_id, action, comment) VALUES 
  (3, 2, 'APPROVE', 'Verified with vendor catalog. Match is correct.'),
  (4, 2, 'REJECT', 'Missing seal specification (2RS). Cannot approve.');

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES 
  (1, 'USER_LOGIN', 'AUTH', 1, 'Central Ministry Admin logged in.'),
  (2, 'REVIEW_APPROVE', 'MATCH_CANDIDATE', 3, 'Approved mapping for Ball Valve 2 inch SS316 Flanged.'),
  (2, 'REVIEW_REJECT', 'MATCH_CANDIDATE', 4, 'Rejected mapping for Chrome Steel Bearing 6205.');
`);

console.log("Seeded database successfully.");
