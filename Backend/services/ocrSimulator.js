import { extractAttributes } from "./attributes.js";
import normalize from "./normalizer.js";

const sampleLabels = [
  {
    tag: "SAMPLE-VALVE-01",
    raw_ocr: "CPCL REFINERY INWARD STORES\nTAG: CPCL-V-8819\nBALL VALVE 2 INCH 150# FLANGED\nMATL: ASTM A351 CF8M / SS316\nHEAT NO: HT-99201A | LOT: 2026-B4",
    detected_name: "Ball Valve 2 inch Class 150 Flanged SS316",
    confidence_ocr: 96.4
  },
  {
    tag: "SAMPLE-BOLT-02",
    raw_ocr: "ONGC OFFSHORE ASSET - MEHSANA\nITEM: HEX HEAD BOLT M10 X 50 MM\nGRADE: SS 304 / A2-70\nBATCH: ONGC-B-4402\nINSP STAMP: QA-PASS",
    detected_name: "Stainless Steel Hex Bolt M10 x 50 SS304",
    confidence_ocr: 98.1
  },
  {
    tag: "SAMPLE-PIPE-03",
    raw_ocr: "GAIL COMPRESSOR STATION HAZIRA\nSEAMLESS CS PIPE 50.8 MM SCH 40\nSPEC: ASTM A106 GRADE B\nLENGTH: 6.0 MTR | COATING: 3LPE",
    detected_name: "Carbon Steel Pipe 50.8 mm Schedule 40 Seamless",
    confidence_ocr: 94.8
  },
  {
    tag: "SAMPLE-GASKET-04",
    raw_ocr: "IOCL REFINERY MATHURA\nSPIRAL WOUND GASKET 4 INCH 300#\nFILLER: EXPANDED GRAPHITE / SS304\nASME B16.20 PASS",
    detected_name: "Spiral Wound Gasket 4 inch Class 300 SS304 Graphite Filler",
    confidence_ocr: 97.2
  }
];

function simulateOcr(filename = "", hintText = "") {
  let sample = sampleLabels[0];
  const combined = (filename + " " + hintText).toLowerCase();

  if (combined.includes("bolt") || combined.includes("fastener") || combined.includes("m10") || combined.includes("hex")) {
    sample = sampleLabels[1];
  } else if (combined.includes("pipe") || combined.includes("sch") || combined.includes("50.8") || combined.includes("cs")) {
    sample = sampleLabels[2];
  } else if (combined.includes("gasket") || combined.includes("flange") || combined.includes("gsk") || combined.includes("spiral")) {
    sample = sampleLabels[3];
  }

  const attrs = extractAttributes(sample.detected_name);
  return {
    success: true,
    tag: sample.tag,
    raw_ocr: sample.raw_ocr,
    extracted_material_name: sample.detected_name,
    normalized_name: normalize(sample.detected_name),
    ocr_confidence: sample.confidence_ocr,
    attributes: attrs,
    verified_at: new Date().toISOString()
  };
}

export { simulateOcr, sampleLabels };
