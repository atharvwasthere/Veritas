import PptxGenJS from "pptxgenjs";

import type { AuditReport, Category, RiskRating } from "@/types/audit";
import { CATEGORIES, CATEGORY_LABEL } from "@/types/audit";

// ── Tokens (hex without #) ─────────────────────────────────────────
const INK = "111111";
const WHITE = "FFFFFF";
const SAGE = "F3EFEB";
const STONE = "E9EAEB";
const GRAY = "615E5B";
const CONCRETE = "D8D3CC";
const BLACK = "000000";
const ORANGE = "FF9900";

const RISK_DOT: Record<RiskRating, string> = {
  green: "22C55E",
  amber: "FF9900",
  red: "EF4444",
};

const FONT = "Geist";
const MONO = "JetBrains Mono";

// 10" × 5.625" — PowerPoint default 16:9
const SLIDE_W = 10;
const SLIDE_H = 5.625;
const PAD = 0.5;

export async function exportAuditDeck(report: AuditReport): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "VERITAS_16x9", width: SLIDE_W, height: SLIDE_H });
  pptx.layout = "VERITAS_16x9";
  pptx.theme = { headFontFace: FONT, bodyFontFace: FONT };

  buildCoverSlide(pptx, report);
  buildScoresSlide(pptx, report);
  buildDiscrepancySlides(pptx, report);
  buildSwotSlide(pptx, report);
  buildPestleSlide(pptx, report);

  await pptx.writeFile({ fileName: `Veritas_${slug(report.company_name)}.pptx` });
}

function slug(s: string): string {
  return s.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "report";
}

// ── Slide 1 — Cover ───────────────────────────────────────────────
function buildCoverSlide(pptx: PptxGenJS, r: AuditReport) {
  const s = pptx.addSlide();
  s.background = { color: BLACK };

  // Top bar
  s.addText(
    [
      { text: "VERITAS", options: { bold: true } },
      { text: "  ·  AUDIT REPORT", options: {} },
    ],
    {
      x: PAD, y: 0.3, w: 6, h: 0.3,
      fontFace: MONO, fontSize: 10, color: WHITE, charSpacing: 4,
    }
  );
  // V mark top right
  s.addText("V", {
    x: SLIDE_W - PAD - 0.3, y: 0.25, w: 0.3, h: 0.4,
    fontFace: MONO, fontSize: 22, bold: true, color: WHITE, align: "right",
  });

  // Hero — company name
  s.addText(r.company_name, {
    x: PAD, y: 1.6, w: SLIDE_W - 2 * PAD, h: 1.0,
    fontFace: FONT, fontSize: 52, bold: true, color: WHITE,
  });
  s.addText(r.url, {
    x: PAD, y: 2.55, w: SLIDE_W - 2 * PAD, h: 0.3,
    fontFace: MONO, fontSize: 12, color: GRAY,
  });

  // Risk
  s.addText("OVERALL RISK", {
    x: PAD, y: 3.3, w: 4, h: 0.25,
    fontFace: MONO, fontSize: 10, color: GRAY, charSpacing: 4,
  });
  // Dot
  s.addShape(pptx.ShapeType.ellipse, {
    x: PAD, y: 3.62, w: 0.18, h: 0.18,
    fill: { color: RISK_DOT[r.overall_risk] },
    line: { color: RISK_DOT[r.overall_risk] },
  });
  s.addText(r.overall_risk.toUpperCase(), {
    x: PAD + 0.3, y: 3.55, w: 4, h: 0.35,
    fontFace: MONO, fontSize: 20, color: WHITE, bold: true, charSpacing: 4,
  });

  // One-line summary (italic, capped)
  const summary = (r.overall_summary || "").slice(0, 200);
  s.addText(summary, {
    x: PAD, y: 4.1, w: SLIDE_W - 2 * PAD, h: 0.6,
    fontFace: FONT, fontSize: 13, color: GRAY, italic: true,
  });

  // Bottom rule + footer
  s.addShape(pptx.ShapeType.rect, {
    x: PAD, y: SLIDE_H - 0.55, w: SLIDE_W - 2 * PAD, h: 0.005,
    fill: { color: WHITE, transparency: 90 },
    line: { color: WHITE, transparency: 90 },
  });
  s.addText(`Powered by Anakin · ${formatDate(new Date())}`, {
    x: PAD, y: SLIDE_H - 0.45, w: SLIDE_W - 2 * PAD, h: 0.3,
    fontFace: MONO, fontSize: 9, color: GRAY, charSpacing: 3,
  });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).toUpperCase();
}

// ── Slide 2 — Six categories grid ─────────────────────────────────
function buildScoresSlide(pptx: PptxGenJS, r: AuditReport) {
  const s = pptx.addSlide();
  s.background = { color: WHITE };

  s.addText("Six audit categories", {
    x: PAD, y: PAD - 0.05, w: SLIDE_W - 2 * PAD, h: 0.5,
    fontFace: FONT, fontSize: 22, color: INK,
    fontWeight: 500 as unknown as undefined, bold: false,
  });

  const cols = 3;
  const rows = 2;
  const gap = 0.2;
  const gridY = 1.1;
  const gridH = SLIDE_H - gridY - PAD;
  const gridW = SLIDE_W - 2 * PAD;
  const cardW = (gridW - gap * (cols - 1)) / cols;
  const cardH = (gridH - gap * (rows - 1)) / rows;

  CATEGORIES.forEach((cat, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = PAD + col * (cardW + gap);
    const y = gridY + row * (cardH + gap);
    drawScoreCard(pptx, s, cat, r.scores[cat], { x, y, w: cardW, h: cardH });
  });
}

interface Box { x: number; y: number; w: number; h: number }

function drawScoreCard(
  pptx: PptxGenJS,
  s: PptxGenJS.Slide,
  cat: Category,
  score: { score: number; justification: string },
  box: Box
) {
  s.addShape(pptx.ShapeType.roundRect, {
    x: box.x, y: box.y, w: box.w, h: box.h,
    fill: { color: SAGE }, line: { color: SAGE }, rectRadius: 0.12,
  });

  const innerX = box.x + 0.3;
  const innerW = box.w - 0.6;

  s.addText(catLabelCaps(cat), {
    x: innerX, y: box.y + 0.25, w: innerW, h: 0.25,
    fontFace: MONO, fontSize: 9, bold: true, color: GRAY, charSpacing: 4,
  });

  s.addText(`${score.score}/10`, {
    x: innerX, y: box.y + 0.55, w: innerW, h: 0.6,
    fontFace: MONO, fontSize: 32, bold: true, color: scoreColor(score.score),
  });

  // Score bar
  const barY = box.y + 1.25;
  s.addShape(pptx.ShapeType.rect, {
    x: innerX, y: barY, w: innerW, h: 0.04,
    fill: { color: STONE }, line: { color: STONE },
  });
  const fillW = Math.max(0, Math.min(10, score.score)) / 10 * innerW;
  if (fillW > 0) {
    s.addShape(pptx.ShapeType.rect, {
      x: innerX, y: barY, w: fillW, h: 0.04,
      fill: { color: INK }, line: { color: INK },
    });
  }

  // Reason — clip aggressively so it never overflows the card
  const reason = clip(score.justification, 140);
  s.addText(reason, {
    x: innerX, y: barY + 0.16, w: innerW,
    h: box.y + box.h - (barY + 0.2),
    fontFace: FONT, fontSize: 9, color: GRAY, valign: "top",
  });
}

function catLabelCaps(cat: Category): string {
  return CATEGORY_LABEL[cat].toUpperCase();
}

function scoreColor(n: number): string {
  if (n <= 3) return "EF4444";
  if (n <= 6) return "F59E0B";
  return INK;
}

function clip(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

// ── Slide 3 — Discrepancies (paginate, max 3 per slide) ───────────
function buildDiscrepancySlides(pptx: PptxGenJS, r: AuditReport) {
  const items = r.discrepancies || [];
  if (items.length === 0) {
    const s = newLightSlide(pptx);
    titleAndSub(s, "Top discrepancies found", "Cross-verified across public sources");
    s.addShape(pptx.ShapeType.ellipse, {
      x: SLIDE_W / 2 - 0.18, y: SLIDE_H / 2 - 0.4, w: 0.36, h: 0.36,
      fill: { color: INK }, line: { color: INK },
    });
    s.addText("✓", {
      x: SLIDE_W / 2 - 0.18, y: SLIDE_H / 2 - 0.4, w: 0.36, h: 0.36,
      fontFace: FONT, fontSize: 16, bold: true, color: WHITE,
      align: "center", valign: "middle",
    });
    s.addText("No material discrepancies surfaced across verified sources.", {
      x: PAD, y: SLIDE_H / 2 + 0.05, w: SLIDE_W - 2 * PAD, h: 0.4,
      fontFace: FONT, fontSize: 14, italic: true, color: GRAY, align: "center",
    });
    return;
  }

  const PER_SLIDE = 3;
  for (let i = 0; i < items.length; i += PER_SLIDE) {
    const page = items.slice(i, i + PER_SLIDE);
    const s = newLightSlide(pptx);
    const isFirst = i === 0;
    titleAndSub(
      s,
      isFirst ? "Top discrepancies found" : "Top discrepancies (cont.)",
      `Cross-verified across public sources · ${items.length} surfaced`
    );

    const startY = 1.3;
    const cardH = 1.2;
    const gap = 0.18;
    page.forEach((d, idx) => {
      drawDiscrepancyCard(pptx, s, d, {
        x: PAD, y: startY + idx * (cardH + gap), w: SLIDE_W - 2 * PAD, h: cardH,
      });
    });
  }
}

function drawDiscrepancyCard(
  pptx: PptxGenJS,
  s: PptxGenJS.Slide,
  d: AuditReport["discrepancies"][number],
  box: Box
) {
  s.addShape(pptx.ShapeType.roundRect, {
    x: box.x, y: box.y, w: box.w, h: box.h,
    fill: { color: WHITE }, line: { color: STONE, width: 0.5 },
    rectRadius: 0.08,
  });
  // Orange left accent
  s.addShape(pptx.ShapeType.rect, {
    x: box.x, y: box.y + 0.05, w: 0.04, h: box.h - 0.1,
    fill: { color: ORANGE }, line: { color: ORANGE },
  });

  const innerX = box.x + 0.25;
  const innerW = box.w - 0.5;

  s.addText("CLAIM", {
    x: innerX, y: box.y + 0.1, w: innerW, h: 0.2,
    fontFace: MONO, fontSize: 8, bold: true, color: GRAY, charSpacing: 4,
  });
  s.addText(clip(d.claim, 130), {
    x: innerX, y: box.y + 0.28, w: innerW * 0.78, h: 0.32,
    fontFace: FONT, fontSize: 11, bold: true, color: INK, valign: "top",
  });
  s.addText("EVIDENCE", {
    x: innerX, y: box.y + 0.62, w: innerW * 0.78, h: 0.2,
    fontFace: MONO, fontSize: 8, bold: true, color: GRAY, charSpacing: 4,
  });
  s.addText(clip(d.evidence, 170), {
    x: innerX, y: box.y + 0.8, w: innerW * 0.78, h: 0.36,
    fontFace: FONT, fontSize: 10, color: GRAY, valign: "top",
  });

  // Severity pill (right)
  const pillW = 0.9;
  s.addShape(pptx.ShapeType.roundRect, {
    x: box.x + box.w - pillW - 0.25, y: box.y + box.h - 0.42, w: pillW, h: 0.26,
    fill: { color: STONE }, line: { color: STONE }, rectRadius: 0.13,
  });
  s.addText(d.severity.toUpperCase(), {
    x: box.x + box.w - pillW - 0.25, y: box.y + box.h - 0.42, w: pillW, h: 0.26,
    fontFace: MONO, fontSize: 9, bold: true, color: GRAY, charSpacing: 4,
    align: "center", valign: "middle",
  });
}

// ── Slide 4 — SWOT 2×2 ────────────────────────────────────────────
function buildSwotSlide(pptx: PptxGenJS, r: AuditReport) {
  const s = newLightSlide(pptx);
  titleAndSub(s, "SWOT analysis");

  const swot = r.frameworks?.swot || {};
  const cells: Array<{
    letter: string; label: string;
    items: string[]; fill: string;
  }> = [
    { letter: "S", label: "STRENGTHS",      items: swot.strengths || [],    fill: SAGE },
    { letter: "W", label: "WEAKNESSES",     items: swot.weaknesses || [],   fill: WHITE },
    { letter: "O", label: "OPPORTUNITIES",  items: swot.opportunities || [], fill: WHITE },
    { letter: "T", label: "THREATS",        items: swot.threats || [],      fill: SAGE },
  ];

  const gridY = 1.1;
  const gridH = SLIDE_H - gridY - PAD;
  const gridW = SLIDE_W - 2 * PAD;
  const cellW = gridW / 2;
  const cellH = gridH / 2;

  cells.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = PAD + col * cellW;
    const y = gridY + row * cellH;
    s.addShape(pptx.ShapeType.rect, {
      x, y, w: cellW, h: cellH,
      fill: { color: c.fill }, line: { color: STONE, width: 0.5 },
    });
    // Letter
    s.addText(c.letter, {
      x: x + 0.25, y: y + 0.2, w: 0.4, h: 0.45,
      fontFace: MONO, fontSize: 20, bold: true, color: INK,
    });
    // Label
    s.addText(c.label, {
      x: x + 0.7, y: y + 0.32, w: cellW - 0.9, h: 0.25,
      fontFace: MONO, fontSize: 9, bold: true, color: GRAY, charSpacing: 4,
    });
    // Bullets (em dash, max 4) — tighter clip + smaller font for fit.
    const bullets = (c.items || []).slice(0, 4).map((t) => `—  ${clip(t, 75)}`).join("\n");
    s.addText(bullets || "—  (none)", {
      x: x + 0.3, y: y + 0.8, w: cellW - 0.6, h: cellH - 0.95,
      fontFace: FONT, fontSize: 10, color: INK, paraSpaceAfter: 3, valign: "top",
    });
  });
}

// ── Slide 5 — PESTLE table ────────────────────────────────────────
function buildPestleSlide(pptx: PptxGenJS, r: AuditReport) {
  const s = newLightSlide(pptx);
  titleAndSub(s, "PESTLE risk analysis");

  const order: Array<keyof AuditReport["frameworks"]["pestle"]> = [
    "political", "economic", "social", "technological", "legal", "environmental",
  ];
  const pestle = r.frameworks?.pestle || ({} as Record<string, string[]>);

  const colSplit = PAD + 1.5;
  const headerY = 1.15;
  // Header row
  s.addText("FACTOR", {
    x: PAD, y: headerY, w: 1.4, h: 0.25,
    fontFace: MONO, fontSize: 9, bold: true, color: GRAY, charSpacing: 4,
  });
  s.addText("ANALYSIS", {
    x: colSplit, y: headerY, w: SLIDE_W - colSplit - PAD, h: 0.25,
    fontFace: MONO, fontSize: 9, bold: true, color: GRAY, charSpacing: 4,
  });
  s.addShape(pptx.ShapeType.rect, {
    x: PAD, y: headerY + 0.3, w: SLIDE_W - 2 * PAD, h: 0.005,
    fill: { color: STONE }, line: { color: STONE },
  });

  // Distribute remaining height across 6 rows, capped so text never overflows.
  const tableTop = headerY + 0.45;
  const tableBottom = SLIDE_H - PAD;
  const rowH = (tableBottom - tableTop) / order.length;
  let y = tableTop;
  order.forEach((factor) => {
    const items = (pestle[factor] || []) as string[];
    // Take only the first 2 items per factor; clip each tightly.
    const text = items.length
      ? items.slice(0, 2).map((t) => clip(t, 140)).join("  ·  ")
      : "—";
    const isHigh = items.some((t) => /high risk|critical|severe|red flag/i.test(t));
    s.addText(factor.toUpperCase(), {
      x: PAD, y, w: 1.4, h: rowH - 0.1,
      fontFace: MONO, fontSize: 10, bold: true,
      color: isHigh ? "EF4444" : INK, charSpacing: 3, valign: "top",
    });
    s.addText(text, {
      x: colSplit, y, w: SLIDE_W - colSplit - PAD, h: rowH - 0.1,
      fontFace: FONT, fontSize: 10, color: GRAY, valign: "top",
    });
    y += rowH;
    s.addShape(pptx.ShapeType.rect, {
      x: PAD, y: y - 0.04, w: SLIDE_W - 2 * PAD, h: 0.005,
      fill: { color: STONE }, line: { color: STONE },
    });
  });
}

// ── shared helpers ────────────────────────────────────────────────
function newLightSlide(pptx: PptxGenJS): PptxGenJS.Slide {
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  return s;
}

function titleAndSub(s: PptxGenJS.Slide, title: string, sub?: string) {
  s.addText(title, {
    x: PAD, y: PAD - 0.05, w: SLIDE_W - 2 * PAD, h: 0.45,
    fontFace: FONT, fontSize: 22, color: INK,
  });
  if (sub) {
    s.addText(sub, {
      x: PAD, y: PAD + 0.4, w: SLIDE_W - 2 * PAD, h: 0.3,
      fontFace: FONT, fontSize: 12, color: GRAY,
    });
  }
}

// Suppress unused (CONCRETE reserved for future ghost-border styling).
void CONCRETE;
