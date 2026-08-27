const normalize = require("./normalizer");

function extractAttributes(text = "") {
  const raw = String(text);
  const normalized = normalize(raw);

  let gradeMatch =
    normalized.match(/\bgrade\s*([a-z0-9.]+)/i) ||
    normalized.match(/\bss\s*([0-9]{3,4})\b/i) ||
    normalized.match(/\b(304|316|316l|304l|8\.8|10\.9|12\.9|a106|a105|a182|a234|a333|a350|a53)\b/i);

  let grade = gradeMatch ? gradeMatch[1].toUpperCase() : "";
  if (grade === "SS304" || grade === "SS316") grade = grade.replace("SS", "");

  let size = "";
  const metricFastener = normalized.match(/\b(\d+)\s*mm\s*x\s*(\d+)\s*mm\b/i);
  if (metricFastener) {
    size = `M${metricFastener[1]} x ${metricFastener[2]}`;
  } else {
    const sizePatterns = [
      /\b(m\d+(?:\s*x\s*\d+(?:\.\d+)?)?)\b/i,
      /\b(\d+(?:\/\d+)?(?:\.\d+)?\s*inch)\b/i,
      /\b(\d+(?:\.\d+)?\s*mm)\b/i,
      /\b(\d{4}(?:\s*2rs)?)\b/i
    ];
    for (const p of sizePatterns) {
      const m = normalized.match(p);
      if (m) {
        size = m[1];
        break;
      }
    }
  }

  const unit =
    /\bmm\b/i.test(normalized) ? "mm" :
    /\binch\b/i.test(normalized) ? "inch" :
    /\b(mtr|meter)\b/i.test(normalized) ? "meter" :
    /\b(nos|pc|piece)\b/i.test(normalized) ? "nos" :
    "";

  let category = "Other";
  if (/\bvalve|ball valve|gate valve|globe valve|check valve|butterfly valve\b/i.test(normalized)) category = "Valve";
  else if (/\bflange|weld neck|blind flange|slip on\b/i.test(normalized)) category = "Flange";
  else if (/\bgasket|spiral wound|ring joint\b/i.test(normalized)) category = "Gasket";
  else if (/\bbolt|nut|screw|washer|fastener|stud\b/i.test(normalized)) category = "Fastener";
  else if (/\bpipe|tube|tubing|nipple|elbow|tee|reducer\b/i.test(normalized)) category = "Pipe";
  else if (/\bbearing|ball bearing|roller bearing\b/i.test(normalized)) category = "Bearing";
  else if (/\bcable|wire|switch|relay|transformer|motor|fuse\b/i.test(normalized)) category = "Electrical";
  else if (/\bpump|impeller|seal|coupling\b/i.test(normalized)) category = "Mechanical";

  let material_type = "Standard Material";
  if (/stainless steel|ss304|ss316|ss 304|ss 316/i.test(normalized)) material_type = "Stainless Steel";
  else if (/carbon steel|cs pipe|a106|a105/i.test(normalized)) material_type = "Carbon Steel";
  else if (/mild steel|ms /i.test(normalized)) material_type = "Mild Steel";
  else if (/alloy steel/i.test(normalized)) material_type = "Alloy Steel";
  else if (/brass|bronze/i.test(normalized)) material_type = "Copper Alloy";

  return {
    grade,
    size,
    unit,
    category,
    material_type
  };
}

module.exports = { extractAttributes };