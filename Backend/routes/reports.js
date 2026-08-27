import { Hono } from "hono";
import auth from "../middleware/auth.js";
require('dotenv').config();

const router = new Hono();

router.post("/generate-tender", auth, async (c) => {
  try {
    const { poolData } = (await c.req.json().catch(() => ({})));
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) return c.json({ success: false, message: "Mistral API key not configured" }, 500);

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

    return c.json({ success: true, report_html: content });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

export default router;


