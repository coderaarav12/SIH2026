const express = require("express");
const db = require("../db/init");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/demand-pools", auth, (req, res) => {
  try {
    const materials = db.prepare("SELECT * FROM materials ORDER BY id ASC LIMIT 10").all();

    // Simulated demand aggregation across CPSEs based on real material catalog
    const pools = [
      {
        id: "POOL-2026-01",
        canonical_material_code: "MAT-2004",
        canonical_name: "Carbon Steel Seamless Pipe 2 inch SCH40 ASTM A106",
        category: "Pipe",
        unit: "Meters",
        standard_unit_price: 1850,
        pooled_unit_price: 1480,
        bulk_discount_pct: 20.0,
        total_demand: 12500,
        estimated_savings_inr: 4625000,
        participating_cpses: [
          { cpse: "CPCL Chennai", quantity: 3500, status: "Requisition Approved" },
          { cpse: "ONGC Mumbai Offshore", quantity: 5000, status: "Tender Ready" },
          { cpse: "IOCL Mathura Refinery", quantity: 4000, status: "Awaiting Pool Finalization" }
        ]
      },
      {
        id: "POOL-2026-02",
        canonical_material_code: "MAT-2001",
        canonical_name: "Stainless Steel Hex Bolt M10 x 50 SS304",
        category: "Fastener",
        unit: "Nos",
        standard_unit_price: 45,
        pooled_unit_price: 36,
        bulk_discount_pct: 20.0,
        total_demand: 85000,
        estimated_savings_inr: 765000,
        participating_cpses: [
          { cpse: "CPCL Manali", quantity: 25000, status: "Requisition Approved" },
          { cpse: "IOCL Panipat", quantity: 35000, status: "Tender Ready" },
          { cpse: "GAIL Pata Plant", quantity: 25000, status: "Joined Demand Pool" }
        ]
      },
      {
        id: "POOL-2026-03",
        canonical_material_code: "MAT-2008",
        canonical_name: "Ball Valve 2 inch Class 150 Flanged SS316",
        category: "Valve",
        unit: "Nos",
        standard_unit_price: 18500,
        pooled_unit_price: 15200,
        bulk_discount_pct: 17.8,
        total_demand: 450,
        estimated_savings_inr: 1485000,
        participating_cpses: [
          { cpse: "CPCL Chennai", quantity: 120, status: "Requisition Approved" },
          { cpse: "ONGC Hazira", quantity: 180, status: "Tender Ready" },
          { cpse: "BHEL Trichy", quantity: 150, status: "Joined Demand Pool" }
        ]
      },
      {
        id: "POOL-2026-04",
        canonical_material_code: "MAT-2010",
        canonical_name: "Spiral Wound Gasket 4 inch Class 300 SS304 Graphite Filler",
        category: "Gasket",
        unit: "Nos",
        standard_unit_price: 1200,
        pooled_unit_price: 980,
        bulk_discount_pct: 18.3,
        total_demand: 2800,
        estimated_savings_inr: 616000,
        participating_cpses: [
          { cpse: "IOCL Gujarat", quantity: 1200, status: "Tender Ready" },
          { cpse: "CPCL Nagapattinam", quantity: 600, status: "Requisition Approved" },
          { cpse: "GAIL Vijaipur", quantity: 1000, status: "Joined Demand Pool" }
        ]
      }
    ];

    const totalSavings = pools.reduce((acc, p) => acc + p.estimated_savings_inr, 0);

    res.json({
      success: true,
      total_pools: pools.length,
      cumulative_pooled_savings_inr: totalSavings,
      pools
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
