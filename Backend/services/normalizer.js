const synonyms = {
  ss: "stainless steel",
  sst: "stainless steel",
  cs: "carbon steel",
  ms: "mild steel",
  as: "alloy steel",
  ci: "cast iron",
  gi: "galvanized iron",
  gr: "grade",
  sch: "schedule",
  dia: "diameter",
  od: "outer diameter",
  id: "inner diameter",
  hexagon: "hex",
  nut: "nut",
  bolts: "bolt",
  screws: "screw",
  vlv: "valve",
  flg: "flange",
  gsk: "gasket",
  brg: "bearing",
  smls: "seamless",
  seam: "seamless",
  "150#": "class 150",
  "300#": "class 300",
  "600#": "class 600",
  cl150: "class 150",
  cl300: "class 300"
};

const dimensionMap = {
  "1/2 inch": "12.7 mm",
  "1/2 in": "12.7 mm",
  "3/4 inch": "19.05 mm",
  "3/4 in": "19.05 mm",
  "1 inch": "25.4 mm",
  "1 in": "25.4 mm",
  "1.5 inch": "38.1 mm",
  "1-1/2 inch": "38.1 mm",
  "2 inch": "50.8 mm",
  "2 in": "50.8 mm",
  "3 inch": "76.2 mm",
  "3 in": "76.2 mm",
  "4 inch": "101.6 mm",
  "4 in": "101.6 mm",
  "6 inch": "152.4 mm",
  "6 in": "152.4 mm",
  "8 inch": "203.2 mm",
  "8 in": "203.2 mm"
};

function normalize(text = "") {
  let s = String(text).toLowerCase().trim();

  s = s.replace(/×/g, "x");
  s = s.replace(/(\d+(?:\.\d+)?)\s*mm\b/g, "$1 mm");
  s = s.replace(/(\d+(?:\.\d+)?)\s*in(?:ch|ches)?\b/g, "$1 inch");
  s = s.replace(/\bgr\.\s*([a-z0-9.]+)\b/g, "grade $1");
  s = s.replace(/\bgr\s+([a-z0-9.]+)\b/g, "grade $1");
  s = s.replace(/\bsch\.\s*(\d+)\b/g, "schedule $1");
  s = s.replace(/\bsch\s+(\d+)\b/g, "schedule $1");
  s = s.replace(/\bcl\.\s*(\d+)\b/g, "class $1");
  s = s.replace(/\bcl\s+(\d+)\b/g, "class $1");

  for (const [key, value] of Object.entries(synonyms)) {
    s = s.replace(new RegExp(`\\b${key}\\b`, "g"), value);
  }

  return s
    .replace(/[(),;:/\\|#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDimension(dim = "") {
  let d = normalize(dim);
  for (const [inch, mm] of Object.entries(dimensionMap)) {
    if (d === inch || d === normalize(inch)) return mm;
  }
  return d;
}

export default normalize;
export { normalizeDimension };