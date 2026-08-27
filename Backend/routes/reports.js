const express = require("express");
const auth = require("../middleware/auth");
const db = require("../db/init");
require('dotenv').config();

const router = express.Router();

router.post("/generate-tender", auth, async (req, res) => {
  try {
    const { poolData } = req.body;
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) return res.status(500).json({ success: false, message: "Mistral API key not configured" });

    const prompt = `You are an expert Government Procurement Officer for the Government of India. 
Write a highly detailed, formal, 4-section Tender Document (RFP) for the following pooled material demand.
Material: ${poolData.canonical_name}
Category: ${poolData.category}
Total Quantity: ${poolData.total_quantity} ${poolData.unit}
Participating CPSEs: ${poolData.participating_cpses.map(c => c.cpse).join(', ')}
Estimated Value: INR ${poolData.estimated_value_inr}

Format the output strictly in clean HTML (using <h3>, <p>, <ul>, <li>, <strong>, etc.) so it can be directly rendered in a web portal. Do not include markdown tags like \`\`\`html. Make it look professional and authoritative. Add some simulated boilerplate government compliance clauses.`;

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });

    if (!response.ok) throw new Error("Failed to generate report with AI");
    const aiData = await response.json();
    let content = aiData.choices[0].message.content;
    
    if (content.startsWith("```html")) content = content.substring(7);
    if (content.endsWith("```")) content = content.substring(0, content.length - 3);

    res.json({ success: true, report_html: content });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
