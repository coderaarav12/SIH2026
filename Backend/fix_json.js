const db = require('better-sqlite3')('db/material_intelligence.db');
db.exec(`
  UPDATE match_candidates SET reasons = '["Exact match on grade (304)", "Size match (M10x50)"]' WHERE id = 1;
  UPDATE match_candidates SET reasons = '["High semantic similarity", "Requires verification of ASTM grade"]' WHERE id = 2;
  UPDATE match_candidates SET reasons = '["Perfect match on all critical attributes"]' WHERE id = 3;
  UPDATE match_candidates SET reasons = '["Match failed on suffix requirements (2RS missing)"]' WHERE id = 4;
`);
console.log('Fixed JSON formatting for reasons column');
