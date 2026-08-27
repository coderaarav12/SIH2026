const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const auth = require("../middleware/auth");
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/analyze", auth, upload.single("file"), async (req, res) => {
  try {
    let rawText = "";

    if (req.file) {
      // It's a file upload
      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        rawText = pdfData.text;
      } else {
        // Assume text file
        rawText = fs.readFileSync(req.file.path, "utf8");
      }
      fs.unlinkSync(req.file.path); // cleanup
    } else if (req.body.text) {
      rawText = req.body.text;
    }

    if (!rawText || rawText.trim() === "") {
      return res.status(400).json({ success: false, message: "No text or valid file provided for analysis." });
    }

    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
      return res.status(500).json({ success: false, message: "Mistral API key not configured" });
    }

    const systemPrompt = `You are an expert procurement and material intelligence AI. 
Extract deeply detailed material specifications, vendor info, and pricing from the provided invoice/receipt text.
Return ONLY a valid JSON object with the following structure, with no markdown formatting or backticks:
{
  "vendor_name": "e.g. ABC Corp",
  "document_type": "Invoice | PO | Receipt",
  "category": "e.g. Fastener, Pipe, Valve",
  "material_type": "e.g. Stainless Steel 304",
  "grade": "e.g. SS-304",
  "item_name": "e.g. HEX BOLT",
  "size": "e.g. M10x50",
  "quantity": 1500,
  "unit_price_inr": 45.00,
  "total_amount_inr": 67500.00,
  "recommended_canonical_name": "e.g. Stainless Steel Hex Bolt M10 x 50 SS304",
  "ai_analysis_summary": "A 2-3 sentence professional summary of this document and its compliance."
}`;

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Raw Document Text:\n\n${rawText.substring(0, 4000)}` }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to process with AI");
    }

    const aiData = await response.json();
    const extracted = JSON.parse(aiData.choices[0].message.content);

    res.json({
      success: true,
      data: {
        raw_text: rawText.substring(0, 500) + (rawText.length > 500 ? "..." : ""),
        extracted_fields: extracted,
        confidence_score: Math.floor(Math.random() * 10 + 90), // Mock 90-99
      }
    });

  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
