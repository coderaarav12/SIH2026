INSERT OR IGNORE INTO users (name, email, password_hash, role, department) VALUES
('Central Ministry Admin', 'admin@cpse.gov.in', '$2b$10$EFeHyq3eWC6BNspultDoEugTNUVev614qVPWUjJuoS2JQwzy0eL26', 'admin', 'Ministry of Petroleum & Natural Gas'),
('CPCL Senior Reviewer', 'reviewer@cpcl.co.in', '$2b$10$EFeHyq3eWC6BNspultDoEugTNUVev614qVPWUjJuoS2JQwzy0eL26', 'reviewer', 'CPCL Chennai Refinery'),
('IOCL Procurement Officer', 'store.officer@iocl.co.in', '$2b$10$EFeHyq3eWC6BNspultDoEugTNUVev614qVPWUjJuoS2JQwzy0eL26', 'officer', 'IOCL Northern Pipeline');
-- Seed default users (run after schema.sql)
-- Passwords are bcrypt hashed: 'changeme123' = the hash below (generated locally)
-- Replace these hashes with your own or use the /api/auth/register endpoint

INSERT OR IGNORE INTO materials (material_code, material_name, normalized_name, category, source, grade, size, unit, material_type, technical_specs, hsn_code, compliance_standard, last_purchase_price_inr) VALUES
('MAT-2001','Stainless Steel Hex Bolt M10 x 50 SS304','stainless steel hex bolt m10 x 50 ss304','Fastener','CPCL-ERP','304','M10 x 50','mm','Stainless Steel','Tensile Strength: 700MPa','73181500','IS 1367',1250.50),
('MAT-2002','SS Hex Bolt 10mm x 50mm Grade 304','ss hex bolt 10mm x 50mm grade 304','Fastener','ONGC-SAP','304','M10 x 50','mm','Stainless Steel','Tensile Strength: 700MPa','73181500','IS 1367',1100.00),
('MAT-2003','Hex Nut Stainless Steel M10 SS304','hex nut stainless steel m10 ss304','Fastener','IOCL-STORE','304','M10','mm','Stainless Steel','Grade A','73181600','IS 1367',120.00),
('MAT-2004','Carbon Steel Seamless Pipe 2 inch SCH40 ASTM A106','carbon steel seamless pipe 2 inch sch40 astm a106','Pipe','CPCL-ERP','ASTM A106','2 inch','inch','Carbon Steel','Schedule 40','73043910','ASTM A106',4500.00),
('MAT-2005','Carbon Steel Pipe 50.8 mm Schedule 40 Seamless','carbon steel pipe 50 8 mm schedule 40 seamless','Pipe','GAIL-ERP','ASTM A106','50.8 mm','mm','Carbon Steel','Schedule 40','73043910','ASTM A106',4200.00);

INSERT OR IGNORE INTO source_mappings (source_code, source_name, canonical_material_id) VALUES
('ONGC-FAST-9021','SS Hex Bolt 10x50 Gr304',1),
('IOCL-BOLT-4412','Bolt SS 304 M10X50 Hex',1),
('GAIL-PIPE-1102','CS Pipe 2 in Sch 40 Seamless',4);

