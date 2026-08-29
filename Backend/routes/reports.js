import { Hono } from "hono";
import auth from "../middleware/auth.js";

const router = new Hono();

router.post("/generate-tender", auth, async (c) => {
  try {
    const { poolData } = (await c.req.json().catch(() => ({})));
    const mistralApiKey = "29Vdjk5uoW5d9Xeie7S962ZS3Rg83XxE"; // Hardcoded for SIH
    
    let content = "";

    // If API Key is present, try calling Mistral AI
    if (mistralApiKey) {
      const prompt = `You are an expert Government Procurement Officer for the Government of India. 
Write a highly detailed, formal, 4-section Tender Document (RFP) for the following pooled material demand.
Material: ${poolData.canonical_name}
Category: ${poolData.category}
Total Quantity: ${poolData.total_quantity} ${poolData.unit}
Participating CPSEs: ${poolData.participating_cpses.map(cpse => cpse.cpse).join(', ')}
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

      if (response.ok) {
        const aiData = await response.json();
        content = aiData.choices[0].message.content;
        if (content.startsWith("```html")) content = content.substring(7);
        if (content.endsWith("```")) content = content.substring(0, content.length - 3);
      }
    }

    // Fallback if no API key or if API failed
    if (!content) {
      const cpses = poolData?.participating_cpses?.map(cpse => cpse.cpse).join(', ') || 'Various CPSEs';
      const quantity = `${poolData?.total_quantity || 0} ${poolData?.unit || 'Units'}`;
      const estValue = poolData?.estimated_value_inr || 'TBD';

      content = `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="text-align: center; color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 10px;">NOTICE INVITING TENDER (NIT)</h2>
          <h4 style="text-align: center; margin-top: -5px;">GOVERNMENT OF INDIA - JOINT CPSE PROCUREMENT INITIATIVE</h4>
          
          <h3 style="color: #047857;">1. Introduction</h3>
          <p>On behalf of the participating Central Public Sector Enterprises (<strong>${cpses}</strong>), e-tenders are invited from eligible manufacturers and suppliers for the procurement of <strong>${poolData?.canonical_name || 'Industrial Materials'}</strong>.</p>
          
          <h3 style="color: #047857;">2. Tender Details</h3>
          <ul>
            <li><strong>Material Name:</strong> ${poolData?.canonical_name || 'N/A'}</li>
            <li><strong>Category:</strong> ${poolData?.category || 'N/A'}</li>
            <li><strong>Pooled Quantity:</strong> ${quantity}</li>
            <li><strong>Estimated Cumulative Value:</strong> INR ${estValue}</li>
            <li><strong>Tender Type:</strong> Open e-Tender (Domestic Competitive Bidding)</li>
          </ul>

          <h3 style="color: #047857;">3. Eligibility Criteria</h3>
          <p>Bidders must be registered with at least one participating CPSE (Vendor Code required) or possess a valid MSME/NSIC certification. The bidder must have supplied similar materials of at least 30% of the pooled quantity in the last 3 financial years.</p>

          <h3 style="color: #047857;">4. Terms & Conditions</h3>
          <p>All supplied materials must adhere strictly to the <strong>IS/ASTM</strong> standards specified in the consolidated Master Catalog. Delivery schedules will be split across the respective CPSE locations as per the purchase order annexures. Payment terms are 100% within 30 days of receipt and acceptance of material.</p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #1E3A8A;">
            <em>This is a standardized system-generated RFP via the Material Intelligence Portal (SyncMasters).</em>
          </div>
        </div>
      `;
    }

    return c.json({ success: true, report_html: content });
  } catch (err) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

export default router;


