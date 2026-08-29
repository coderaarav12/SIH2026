import { Hono } from "hono";
import auth from "../middleware/auth.js";
import { simulateOcr } from "../services/ocrSimulator.js";

const router = new Hono();

router.post("/analyze", auth, async (c) => {
  try {
    const body = await c.req.parseBody().catch(() => ({}));
    const file = body['file'];
    
    if (!file) {
      return c.json({ success: false, message: "No file uploaded." }, 400);
    }
    
    const filename = file.name || "unknown.pdf";
    const sim = simulateOcr(filename);
    
    // Convert simulator format to what Dashboard expects
    const extracted = {
      vendor_name: filename.split("_")[0] || "Unknown CPSE",
      document_type: filename.toLowerCase().includes("po") ? "PO" : "Invoice/Receipt",
      category: sim.attributes.category || "Unknown",
      material_type: sim.attributes.material_type || "Unknown",
      grade: sim.attributes.grade || "Unknown",
      item_name: sim.extracted_material_name,
      size: sim.attributes.size || "Unknown"
    };

    return c.json({
      success: true,
      data: {
        raw_text: sim.raw_ocr,
        extracted_fields: extracted,
        confidence_score: sim.ocr_confidence,
        recommended_canonical_name: sim.normalized_name
      }
    });

  } catch (err) {
    console.error("OCR Error:", err);
    return c.json({ success: false, message: err.message }, 500);
  }
});

export default router;
