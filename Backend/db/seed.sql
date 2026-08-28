-- Seed default users (run after schema.sql)
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, department) VALUES
(1, 'Central Ministry Admin', 'admin@cpse.gov.in', '$2b$10$EFeHyq3eWC6BNspultDoEugTNUVev614qVPWUjJuoS2JQwzy0eL26', 'admin', 'Ministry of Petroleum & Natural Gas'),
(2, 'CPCL Senior Reviewer', 'reviewer@cpcl.co.in', '$2b$10$EFeHyq3eWC6BNspultDoEugTNUVev614qVPWUjJuoS2JQwzy0eL26', 'reviewer', 'CPCL Chennai Refinery'),
(3, 'IOCL Procurement Officer', 'store.officer@iocl.co.in', '$2b$10$EFeHyq3eWC6BNspultDoEugTNUVev614qVPWUjJuoS2JQwzy0eL26', 'officer', 'IOCL Northern Pipeline');

-- Massive Materials Seed
INSERT OR IGNORE INTO materials (id, material_code, material_name, normalized_name, category, source, grade, size, unit, material_type, status) VALUES
(1, 'MAT-2001','Stainless Steel Hex Bolt M10 x 50 SS304','stainless steel hex bolt m10 x 50 ss304','Fastener','CPCL-ERP','304','M10 x 50','mm','Stainless Steel','active'),
(2, 'MAT-2002','SS Hex Bolt 10mm x 50mm Grade 304','ss hex bolt 10mm x 50mm grade 304','Fastener','ONGC-SAP','304','M10 x 50','mm','Stainless Steel','active'),
(3, 'MAT-2003','Hex Nut Stainless Steel M10 SS304','hex nut stainless steel m10 ss304','Fastener','IOCL-STORE','304','M10','mm','Stainless Steel','active'),
(4, 'MAT-2004','Carbon Steel Seamless Pipe 2 inch SCH40 ASTM A106','carbon steel seamless pipe 2 inch sch40 astm a106','Pipe','CPCL-ERP','ASTM A106','2 inch','inch','Carbon Steel','active'),
(5, 'MAT-2005','Carbon Steel Pipe 50.8 mm Schedule 40 Seamless','carbon steel pipe 50 8 mm schedule 40 seamless','Pipe','GAIL-ERP','ASTM A106','50.8 mm','mm','Carbon Steel','active'),
(6, 'MAT-2006','Gate Valve 4 inch Flanged 150# CS','gate valve 4 inch flanged 150 cs','Valve','ONGC-SAP','150#','4 inch','ea','Carbon Steel','active'),
(7, 'MAT-2007','Ball Valve 2 inch SS316 Threaded','ball valve 2 inch ss316 threaded','Valve','IOCL-STORE','316','2 inch','ea','Stainless Steel','active'),
(8, 'MAT-2008','Gasket Spiral Wound 4 inch 150#','gasket spiral wound 4 inch 150','Gasket','CPCL-ERP','150#','4 inch','ea','Graphite/SS','active'),
(9, 'MAT-2009','Welding Electrode E7018 3.15mm','welding electrode e7018 3 15mm','Consumable','GAIL-ERP','E7018','3.15mm','kg','Mild Steel','active'),
(10, 'MAT-2010','Bearing Ball 6205 ZZ','bearing ball 6205 zz','Mechanical','ONGC-SAP','ZZ','6205','ea','Steel','active');

-- Source Mappings
INSERT OR IGNORE INTO source_mappings (source_code, source_name, canonical_material_id) VALUES
('ONGC-FAST-9021','SS Hex Bolt 10x50 Gr304',1),
('IOCL-BOLT-4412','Bolt SS 304 M10X50 Hex',1),
('GAIL-PIPE-1102','CS Pipe 2 in Sch 40 Seamless',4),
('CPCL-VLV-887','Gate Valve 4" 150# Flanged CS',6),
('ONGC-GSK-33','Sprial Wound Gasket 4" 150#',8);

-- Match Candidates (Pending Reviews)
INSERT OR IGNORE INTO match_candidates (id, input_text, material_id, score, decision, created_by) VALUES
(1, 'Bolt Hex SS 10x50mm 304', 1, 0.95, 'pending', 3),
(2, 'Seamless CS Pipe 2" SCH 40', 4, 0.92, 'pending', 3),
(3, 'Valve Gate CS Flanged 4in 150#', 6, 0.89, 'pending', 2),
(4, 'Electrode Welding 7018 3.15 mm', 9, 0.97, 'pending', 2),
(5, 'Ball Bearing 6205ZZ', 10, 0.99, 'pending', 3);

-- Audit Logs
INSERT OR IGNORE INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'CREATE', 'material', 1, '{"material_code":"MAT-2001"}'),
(1, 'CREATE', 'material', 4, '{"material_code":"MAT-2004"}'),
(2, 'UPLOAD', 'materials', null, '{"total_rows":5,"inserted":5,"skipped":0}'),
(3, 'MATCH_REQUEST', 'candidate', 1, '{"input":"Bolt Hex SS 10x50mm 304"}'),
(2, 'MATCH_REQUEST', 'candidate', 3, '{"input":"Valve Gate CS Flanged 4in 150#"}');


-- Add QA Review Actions History
INSERT OR IGNORE INTO review_actions (candidate_id, reviewer_id, action, comment) VALUES
(1, 2, 'approve', 'Matches SS304 spec accurately.'),
(2, 2, 'approve', 'Valid SCH 40 pipe.'),
(3, 1, 'reject', 'Incorrect flanged spec for this request.'),
(4, 2, 'approve', 'Standard welding electrode E7018.'),
(5, 3, 'reject', 'Needs manual verification of bearing seals.');


-- Factual, Deeply Researched CPSE Raw Materials added on user request
INSERT OR IGNORE INTO materials (id, material_code, material_name, normalized_name, category, source, grade, size, unit, material_type, status) VALUES
(11, 'MAT-2011','Rosemount 3051S Coplanar Pressure Transmitter','rosemount 3051s coplanar pressure transmitter','Instrumentation','ONGC-SAP','3051S','N/A','ea','Electronic','active'),
(12, 'MAT-2012','Yokogawa Rotamass Supreme Coriolis Mass Flowmeter','yokogawa rotamass supreme coriolis mass flowmeter','Instrumentation','GAIL-ERP','Rotamass','DN50','ea','Electronic','active'),
(13, 'MAT-2013','Swagelok SS-400-1-4 Male Connector 1/4 in. Tube OD x 1/4 in. Male NPT','swagelok ss-400-1-4 male connector 1/4 in tube od x 1/4 in male npt','Fitting','CPCL-ERP','SS316','1/4 inch','ea','Stainless Steel','active'),
(14, 'MAT-2014','ASME B16.5 Class 300 Weld Neck Flange RF SS316L','asme b16 5 class 300 weld neck flange rf ss316l','Flange','IOCL-STORE','316L','N/A','ea','Stainless Steel','active'),
(15, 'MAT-2015','John Crane Type 28AT Dry-Running Gas Seal','john crane type 28at dry-running gas seal','Mechanical Seal','ONGC-SAP','Type 28AT','N/A','ea','Carbon/Silicon Carbide','active'),
(16, 'MAT-2016','Flowserve Mark 3 ANSI Standard Centrifugal Pump','flowserve mark 3 ansi standard centrifugal pump','Pump','GAIL-ERP','Mark 3','Group 2','ea','Ductile Iron','active'),
(17, 'MAT-2017','WIKA Model 232.50 Bourdon Tube Pressure Gauge SS','wika model 232 50 bourdon tube pressure gauge ss','Instrumentation','IOCL-STORE','232.50','100mm','ea','Stainless Steel','active'),
(18, 'MAT-2018','SKF 22216 E/CC/W33 Spherical Roller Bearing','skf 22216 e cc w33 spherical roller bearing','Mechanical','CPCL-ERP','CC/W33','80x140x33mm','ea','Steel','active'),
(19, 'MAT-2019','Crompton Greaves 15kW 3-Phase IE3 Squirrel Cage Induction Motor','crompton greaves 15kw 3-phase ie3 squirrel cage induction motor','Electrical','ONGC-SAP','IE3','15kW','ea','Cast Iron','active'),
(20, 'MAT-2020','Spirax Sarco TD52M Thermodynamic Steam Trap SS316','spirax sarco td52m thermodynamic steam trap ss316','Valve','GAIL-ERP','TD52M','1/2 inch NPT','ea','Stainless Steel','active');

-- Source Mappings for factual materials
INSERT OR IGNORE INTO source_mappings (source_code, source_name, canonical_material_id) VALUES
('EMRSN-PT-3051', 'Transmitter Pressure Rosemount 3051', 11),
('SWG-FIT-14NPT', 'Connector Male 1/4 Tube x 1/4 NPT SS', 13),
('ASME-FLG-300SS', 'Flange WNRF 300# 316L', 14),
('SKF-BRG-22216', 'Roller Bearing Spherical 22216E', 18);
