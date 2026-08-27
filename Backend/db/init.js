const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbDir = __dirname;
const dbPath = path.join(dbDir, "material_intelligence.db");

fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'reviewer',
      department TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_code TEXT UNIQUE,
      material_name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      category TEXT,
      source TEXT,
      grade TEXT,
      size TEXT,
      unit TEXT,
      material_type TEXT,
      technical_specs TEXT,
      hsn_code TEXT,
      compliance_standard TEXT,
      last_purchase_price_inr REAL,
      manufacturer_guidelines TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS match_candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      input_text TEXT NOT NULL,
      material_id INTEGER,
      score REAL NOT NULL,
      decision TEXT NOT NULL DEFAULT 'pending',
      reasons TEXT,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(material_id) REFERENCES materials(id),
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS review_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER NOT NULL,
      reviewer_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(candidate_id) REFERENCES match_candidates(id),
      FOREIGN KEY(reviewer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS source_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_code TEXT NOT NULL,
      source_name TEXT,
      canonical_material_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(canonical_material_id) REFERENCES materials(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(material_code);
    CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(material_name);
    CREATE INDEX IF NOT EXISTS idx_candidates_status ON match_candidates(decision);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
  `);

  try {
    db.exec("ALTER TABLE users ADD COLUMN department TEXT;");
  } catch {}

  seedUsers();
  seedMaterials();
  seedInitialMappings();
  console.log("Database initialized successfully with CPSE material intelligence schema and data.");
}

function seedUsers() {
  const usersToSeed = [
    { name: "Central Ministry Admin", email: "admin@cpse.gov.in", pass: process.env.ADMIN_PASS || "changeme123", role: "admin", dept: "Ministry of Petroleum & Natural Gas" },
    { name: "CPCL Senior Reviewer", email: "reviewer@cpcl.co.in", pass: process.env.REVIEWER_PASS || "changeme123", role: "reviewer", dept: "CPCL Chennai Refinery" },
    { name: "IOCL Procurement Officer", email: "store.officer@iocl.co.in", pass: process.env.OFFICER_PASS || "changeme123", role: "officer", dept: "IOCL Northern Pipeline" }
  ];

  const stmt = db.prepare("SELECT id FROM users WHERE email = ?");
  const insert = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, department)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const u of usersToSeed) {
    const existing = stmt.get(u.email.toLowerCase());
    if (!existing) {
      const hash = bcrypt.hashSync(u.pass, 10);
      insert.run(u.name, u.email.toLowerCase(), hash, u.role, u.dept);
    }
  }
}

function seedMaterials() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM materials").get().count;
  if (count >= 20) return;

  const normalize = require("../services/normalizer");

  const seed = [
    ["MAT-2001", "Stainless Steel Hex Bolt M10 x 50 SS304", "Fastener", "CPCL-ERP", "304", "M10 x 50", "mm", "Stainless Steel"],
    ["MAT-2002", "SS Hex Bolt 10mm x 50mm Grade 304", "Fastener", "ONGC-SAP", "304", "M10 x 50", "mm", "Stainless Steel"],
    ["MAT-2003", "Hex Nut Stainless Steel M10 SS304", "Fastener", "IOCL-STORE", "304", "M10", "mm", "Stainless Steel"],
    ["MAT-2004", "Carbon Steel Seamless Pipe 2 inch SCH40 ASTM A106", "Pipe", "CPCL-ERP", "ASTM A106", "2 inch", "inch", "Carbon Steel"],
    ["MAT-2005", "Carbon Steel Pipe 50.8 mm Schedule 40 Seamless", "Pipe", "GAIL-ERP", "ASTM A106", "50.8 mm", "mm", "Carbon Steel"],
    ["MAT-2006", "High Tensile Hex Bolt M12 x 60 Grade 8.8", "Fastener", "BHEL-MM", "8.8", "M12 x 60", "mm", "Carbon Steel"],
    ["MAT-2007", "Hex Bolt M12 x 60mm Gr 8.8 Galvanized", "Fastener", "NTPC-ERP", "8.8", "M12 x 60", "mm", "Carbon Steel"],
    ["MAT-2008", "Ball Valve 2 inch Class 150 Flanged SS316", "Valve", "CPCL-ERP", "316", "2 inch", "inch", "Stainless Steel"],
    ["MAT-2009", "Stainless Steel Ball Valve 50mm Flanged 150# Grade 316", "Valve", "IOCL-STORE", "316", "50 mm", "mm", "Stainless Steel"],
    ["MAT-2010", "Spiral Wound Gasket 4 inch Class 300 SS304 Graphite Filler", "Gasket", "ONGC-SAP", "304", "4 inch", "inch", "Stainless Steel"],
    ["MAT-2011", "Deep Groove Ball Bearing 6205 2RS Chrome Steel", "Bearing", "BHEL-MM", "Chrome Steel", "25x52x15", "mm", "Carbon Steel"],
    ["MAT-2012", "Weld Neck Flange 3 inch Class 150 Carbon Steel A105", "Flange", "SAIL-CATALOG", "ASTM A105", "3 inch", "inch", "Carbon Steel"],
    ["MAT-2013", "Globe Valve 3 inch Class 300 Flanged Cast Steel WCB", "Valve", "CPCL-ERP", "WCB", "3 inch", "inch", "Carbon Steel"],
    ["MAT-2014", "Gate Valve 4 inch Class 150 OS&Y Rising Stem A216 WCB", "Valve", "IOCL-STORE", "WCB", "4 inch", "inch", "Carbon Steel"],
    ["MAT-2015", "Blind Flange 6 inch Class 300 Raised Face ASTM A105", "Flange", "GAIL-ERP", "ASTM A105", "6 inch", "inch", "Carbon Steel"],
    ["MAT-2016", "Slip On Flange 2 inch Class 150 Forged Steel A105", "Flange", "ONGC-SAP", "ASTM A105", "2 inch", "inch", "Carbon Steel"],
    ["MAT-2017", "Stud Bolt M16 x 100 with 2 Heavy Hex Nuts ASTM A193 B7", "Fastener", "CPCL-ERP", "B7", "M16 x 100", "mm", "Alloy Steel"],
    ["MAT-2018", "Stud Bolt 5/8 inch x 4 inch B7 with 2H Nuts High Temp", "Fastener", "IOCL-STORE", "B7", "5/8 x 4 inch", "inch", "Alloy Steel"],
    ["MAT-2019", "Seamless Stainless Steel Pipe 1 inch SCH10 SS316L", "Pipe", "CPCL-ERP", "316L", "1 inch", "inch", "Stainless Steel"],
    ["MAT-2020", "SS Pipe 25.4 mm Schedule 10 Stainless Steel 316L", "Pipe", "ONGC-SAP", "316L", "25.4 mm", "mm", "Stainless Steel"],
    ["MAT-2021", "Centrifugal Pump Impeller SS316 Enclosed 250mm", "Mechanical", "CPCL-ERP", "316", "250 mm", "mm", "Stainless Steel"],
    ["MAT-2022", "Mechanical Seal Cartridge Type 50mm Plan 53A Dual", "Mechanical", "IOCL-STORE", "Silicon Carbide", "50 mm", "mm", "Mechanical"],
    ["MAT-2023", "Spherical Roller Bearing 22218 EK C3 SKF Standard", "Bearing", "BHEL-MM", "Chrome Steel", "90x160x40", "mm", "Bearing"],
    ["MAT-2024", "Tapered Roller Bearing 32210 J2/Q High Load", "Bearing", "NTPC-ERP", "Chrome Steel", "50x90x24.75", "mm", "Bearing"],
    ["MAT-2025", "Armoured Power Cable 3.5C x 95 sq mm XLPE Copper 1.1kV", "Electrical", "CPCL-ERP", "XLPE Copper", "95 sq mm", "meter", "Electrical"],
    ["MAT-2026", "Pressure Transmitter 4-20mA HART 0-100 Bar Ex-d Flameproof", "Electrical", "GAIL-ERP", "SS316 Diaphragm", "0-100 Bar", "nos", "Electrical"]
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO materials
    (material_code, material_name, normalized_name, category, source, grade, size, unit, material_type, technical_specs, hsn_code, compliance_standard, last_purchase_price_inr, manufacturer_guidelines)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const row of seed) {
      stmt.run(row[0], row[1], normalize(row[1]), row[2], row[3], row[4], row[5], row[6], row[7], 
        "Tensile Strength: 700MPa, Yield Strength: 450MPa", "73181500", "IS 1367 / ISO 898-1", 1250.50, "Do not use above 400C. Must be stress relieved."
      );
    }
  });
  tx();
}

function seedInitialMappings() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM source_mappings").get().count;
  if (count >= 5) return;

  const mappings = [
    ["ONGC-FAST-9021", "SS Hex Bolt 10x50 Gr304", 1],
    ["IOCL-BOLT-4412", "Bolt SS 304 M10X50 Hex", 1],
    ["GAIL-PIPE-1102", "CS Pipe 2 in Sch 40 Seamless", 4],
    ["BHEL-VLV-3301", "Ball Valve 50mm 150# SS316", 8],
    ["NTPC-FLG-7712", "Weld Neck Flange 3 in 150# CS", 12],
    ["CPCL-STUD-5501", "Stud Bolt 5/8x4 in ASTM A193 B7", 17]
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO source_mappings (source_code, source_name, canonical_material_id)
    VALUES (?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const m of mappings) {
      try {
        stmt.run(m[0], m[1], m[2]);
      } catch {}
    }
  });
  tx();
}

module.exports = db;
module.exports.initDb = initDb;