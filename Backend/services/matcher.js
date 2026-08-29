import normalize, { normalizeDimension } from "./normalizer.js";
import { extractAttributes } from "./attributes.js";

function tokens(text) {
  return new Set(
    normalize(text)
      .split(/\s+/)
      .filter(t => t.length > 1)
  );
}

function jaccard(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return 0;

  let intersection = 0;
  for (const x of A) if (B.has(x)) intersection++;

  return intersection / (A.size + B.size - intersection);
}

function containment(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return 0;

  let common = 0;
  for (const x of A) if (B.has(x)) common++;

  return common / Math.min(A.size, B.size);
}

function levenshteinSimilarity(s1, s2) {
  const a = s1.toLowerCase().trim();
  const b = s2.toLowerCase().trim();
  if (a === b) return 1.0;
  if (!a.length || !b.length) return 0.0;

  const track = Array(b.length + 1).fill(null).map(() =>
    Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  const dist = track[b.length][a.length];
  return Math.max(0, 1 - (dist / Math.max(a.length, b.length)));
}

function compare(input, material) {
  const a = extractAttributes(input);
  const b = {
    grade: material.grade || "",
    size: material.size || "",
    unit: material.unit || "",
    category: material.category || "",
    material_type: material.material_type || ""
  };

  const normInput = normalize(input);
  const normTarget = normalize(material.material_name);

  const jacc = jaccard(input, material.material_name);
  const cont = containment(input, material.material_name);
  const lev = levenshteinSimilarity(normInput, normTarget);

  const semantic = Math.round(Math.max(jacc, cont, lev * 0.9) * 100);
  const reasons = [];
  let score = Math.min(35, Math.round(semantic * 0.35));

  const specDiff = [
    { name: "Grade", inputVal: a.grade || "N/A", masterVal: b.grade || "N/A", matched: false, points: 0 },
    { name: "Size / Dimension", inputVal: a.size || "N/A", masterVal: b.size || "N/A", matched: false, points: 0 },
    { name: "Category", inputVal: a.category || "N/A", masterVal: b.category || "N/A", matched: false, points: 0 },
    { name: "Material Type", inputVal: a.material_type || "N/A", masterVal: b.material_type || "N/A", matched: false, points: 0 },
    { name: "Unit", inputVal: a.unit || "N/A", masterVal: b.unit || "N/A", matched: false, points: 0 }
  ];

  if (a.grade && b.grade && a.grade.toLowerCase() === b.grade.toLowerCase()) {
    score += 25;
    reasons.push("same grade (" + a.grade + ")");
    specDiff[0].matched = true;
    specDiff[0].points = 25;
  }

  if (a.size && b.size) {
    const na = normalizeDimension(a.size);
    const nb = normalizeDimension(b.size);
    if (na === nb || na.replace(/ /g, "") === nb.replace(/ /g, "")) {
      score += 25;
      reasons.push("same dimension (" + a.size + " ≈ " + b.size + ")");
      specDiff[1].matched = true;
      specDiff[1].points = 25;
    }
  }

  if (a.category && b.category && a.category.toLowerCase() === b.category.toLowerCase() && a.category !== "Other") {
    score += 10;
    reasons.push("same category (" + a.category + ")");
    specDiff[2].matched = true;
    specDiff[2].points = 10;
  }

  if (a.material_type && b.material_type &&
      a.material_type.toLowerCase() === b.material_type.toLowerCase() &&
      a.material_type !== "Standard Material") {
    score += 10;
    reasons.push("same material type (" + a.material_type + ")");
    specDiff[3].matched = true;
    specDiff[3].points = 10;
  }

  if (a.unit && b.unit && a.unit === b.unit) {
    score += 5;
    reasons.push("same unit (" + a.unit + ")");
    specDiff[4].matched = true;
    specDiff[4].points = 5;
  }

  if (!reasons.length) reasons.push("similar normalized description");

  const confidence = Math.min(100, score);
  const decision = confidence >= 80 ? "auto_suggest" : confidence >= 60 ? "review" : "new_candidate";

  return {
    confidence,
    decision,
    semantic_similarity: semantic,
    reasons,
    input_attributes: a,
    spec_diff: specDiff
  };
}

function rankMatches(input, materials, limit = 3) {
  return materials
    .map(material => ({ material, ...compare(input, material) }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

module.exports = { compare, rankMatches };