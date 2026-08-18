import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontsDir = path.resolve(__dirname, "../docs/fonts");
const outPath = path.resolve(__dirname, "../docs/SSP_Brand_Guidelines.pdf");

const C = {
  cream: "#f7f4ef",
  creamAlt: "#ede9e1",
  creamSurface: "#fffcf7",
  ink: "#0d0c0b",
  inkMuted: "#5c5750",
  inkSoft: "#8a8378",
  bg: "#0f0e0d",
  surface: "#181614",
  surface2: "#201e1b",
  line: "#2a2724",
  textPrimary: "#f0ebe3",
  textSecondary: "#a89e91",
  textTertiary: "#6b6158",
  accent: "#e8432d",
  accentHover: "#d63520",
  green: "#22c55e",
  blue: "#3b82f6",
  amber: "#f59e0b",
  white: "#ffffff",
};

const PAGE_W = 612; // 8.5in
const PAGE_H = 792; // 11in
const M = 48;

const doc = new PDFDocument({
  size: [PAGE_W, PAGE_H],
  margin: 0,
  info: {
    Title: "SSP Deal Flow — Brand Design Guidelines",
    Author: "Southern Specialty Properties",
    Subject: "Brand Design Guidelines",
    Keywords: "SSP, brand, design system, guidelines",
  },
});

doc.pipe(fs.createWriteStream(outPath));

doc.registerFont("Bebas", path.join(fontsDir, "BebasNeue-Regular.ttf"));
doc.registerFont("Sans", path.join(fontsDir, "DMSans-Regular.ttf"));
doc.registerFont("SansMed", path.join(fontsDir, "DMSans-Medium.ttf"));
doc.registerFont("SansSemi", path.join(fontsDir, "DMSans-SemiBold.ttf"));
doc.registerFont("SansBold", path.join(fontsDir, "DMSans-Bold.ttf"));
doc.registerFont("Mono", path.join(fontsDir, "DMMono-Regular.ttf"));
doc.registerFont("MonoMed", path.join(fontsDir, "DMMono-Medium.ttf"));
doc.registerFont("Serif", path.join(fontsDir, "InstrumentSerif-Regular.ttf"));
doc.registerFont("SerifItalic", path.join(fontsDir, "InstrumentSerif-Italic.ttf"));

let pageNum = 0;

function drawLogo(x, y, opts = {}) {
  const size = opts.size || 14;
  const color = opts.color || C.ink;
  const bracketSize = size * 1.2;
  doc.font("Bebas").fontSize(bracketSize).fillColor(C.accent).text("[", x, y, { continued: false, lineBreak: false });
  const bracketW = doc.widthOfString("[");
  doc.font("Bebas").fontSize(size).fillColor(color).text("SSP DEAL FLOW", x + bracketW, y + (bracketSize - size) * 0.35, { lineBreak: false });
  const wordW = doc.widthOfString("SSP DEAL FLOW");
  doc.font("Bebas").fontSize(bracketSize).fillColor(C.accent).text("]", x + bracketW + wordW, y, { lineBreak: false });
}

function pageHeader(sectionLabel) {
  drawLogo(M, 28, { size: 13, color: C.ink });
  doc.font("Mono").fontSize(8).fillColor(C.inkSoft)
    .text(sectionLabel, M, 34, { width: PAGE_W - M * 2, align: "right" });
  doc.moveTo(M, 54).lineTo(PAGE_W - M, 54).strokeColor("#e5e0d8").lineWidth(1).stroke();
}

function pageHeaderDark(sectionLabel) {
  drawLogo(M, 28, { size: 13, color: C.textPrimary });
  doc.font("Mono").fontSize(8).fillColor(C.textTertiary)
    .text(sectionLabel, M, 34, { width: PAGE_W - M * 2, align: "right" });
  doc.moveTo(M, 54).lineTo(PAGE_W - M, 54).strokeColor(C.line).lineWidth(1).stroke();
}

function pageFooter(num) {
  doc.moveTo(M, PAGE_H - 36).lineTo(PAGE_W - M, PAGE_H - 36).strokeColor("#e5e0d8").lineWidth(1).stroke();
  doc.font("Mono").fontSize(7).fillColor(C.inkSoft)
    .text("SSP DEAL FLOW BRAND GUIDELINES", M, PAGE_H - 28);
  doc.font("Mono").fontSize(7).fillColor(C.inkSoft)
    .text(String(num).padStart(2, "0"), M, PAGE_H - 28, { width: PAGE_W - M * 2, align: "right" });
}

function pageFooterDark(num) {
  doc.moveTo(M, PAGE_H - 36).lineTo(PAGE_W - M, PAGE_H - 36).strokeColor(C.line).lineWidth(1).stroke();
  doc.font("Mono").fontSize(7).fillColor(C.textTertiary)
    .text("SSP DEAL FLOW BRAND GUIDELINES", M, PAGE_H - 28);
  doc.font("Mono").fontSize(7).fillColor(C.textTertiary)
    .text(String(num).padStart(2, "0"), M, PAGE_W - M * 2 > 0 ? M : M, PAGE_H - 28, { width: PAGE_W - M * 2, align: "right" });
}

function eyebrow(text, y, color = C.accent) {
  doc.font("SansSemi").fontSize(9).fillColor(color)
    .text(text.toUpperCase(), M, y, { characterSpacing: 1.2 });
}

function sectionTitle(lines, y) {
  // lines: array of {text, italic?}
  let yy = y;
  for (const line of lines) {
    if (line.italic) {
      doc.font("SerifItalic").fontSize(34).fillColor(C.accent).text(line.text, M, yy);
    } else {
      doc.font("SansBold").fontSize(34).fillColor(C.ink).text(line.text, M, yy);
    }
    yy += 38;
  }
  return yy;
}

function lede(text, y) {
  doc.font("Sans").fontSize(11).fillColor(C.inkMuted).text(text, M, y, {
    width: PAGE_W - M * 2 - 40,
    lineGap: 3,
  });
  return doc.y + 16;
}

function roundedRect(x, y, w, h, r, fill, stroke) {
  doc.save();
  doc.roundedRect(x, y, w, h, r);
  if (fill) doc.fillColor(fill).fill();
  if (stroke) {
    doc.roundedRect(x, y, w, h, r).strokeColor(stroke).lineWidth(1).stroke();
  }
  doc.restore();
}

function swatch(x, y, w, h, hex, name, use) {
  roundedRect(x, y, w, h, 10, C.white, "#e5e0d8");
  doc.save();
  doc.roundedRect(x, y, w, 56, 10).clip();
  doc.rect(x, y, w, 56).fillColor(hex).fill();
  // cover bottom of clip radius
  doc.rect(x, y + 46, w, 10).fillColor(hex).fill();
  doc.restore();
  doc.rect(x, y + 56, w, 1).fillColor("#e5e0d8").fill();
  doc.font("SansSemi").fontSize(9).fillColor(C.ink).text(name, x + 10, y + 64, { width: w - 20 });
  doc.font("Mono").fontSize(8).fillColor(C.inkSoft).text(hex.toUpperCase(), x + 10, y + 78, { width: w - 20 });
  doc.font("Sans").fontSize(8).fillColor(C.inkSoft).text(use, x + 10, y + 92, { width: w - 20 });
}

function newCreamPage() {
  if (pageNum > 0) doc.addPage();
  pageNum++;
  doc.rect(0, 0, PAGE_W, PAGE_H).fillColor(C.cream).fill();
}

function newDarkPage() {
  doc.addPage();
  pageNum++;
  doc.rect(0, 0, PAGE_W, PAGE_H).fillColor(C.bg).fill();
}

// ═══════════════════════════════════════════════════
// COVER
// ═══════════════════════════════════════════════════
{
  pageNum = 1;
  doc.rect(0, 0, PAGE_W, PAGE_H).fillColor(C.bg).fill();

  // subtle grid
  doc.save();
  doc.strokeColor("#1c1a18").lineWidth(0.5);
  for (let x = 0; x < PAGE_W; x += 36) {
    doc.moveTo(x, 0).lineTo(x, PAGE_H * 0.55).stroke();
  }
  for (let y = 0; y < PAGE_H * 0.55; y += 36) {
    doc.moveTo(0, y).lineTo(PAGE_W, y).stroke();
  }
  doc.restore();

  doc.rect(M, 52, 40, 3).fillColor(C.accent).fill();
  drawLogo(M, 72, { size: 22, color: C.textPrimary });

  doc.font("Mono").fontSize(8).fillColor(C.textTertiary)
    .text("BRAND GUIDELINES  ·  2026", PAGE_W - M - 160, 78, { width: 160, align: "right" });

  doc.font("SansBold").fontSize(52).fillColor(C.textPrimary)
    .text("Brand design", M, 220, { width: PAGE_W - M * 2 });
  doc.font("SerifItalic").fontSize(52).fillColor(C.accent)
    .text("guidelines", M, 275, { width: PAGE_W - M * 2 });

  doc.font("Sans").fontSize(12).fillColor(C.textSecondary)
    .text(
      "Visual identity, color, typography, and UI patterns for SSP Deal Flow — a real estate JV investment platform for accredited investors. A division of Southern Specialty Properties.",
      M,
      360,
      { width: 360, lineGap: 4 }
    );

  doc.moveTo(M, PAGE_H - 70).lineTo(PAGE_W - M, PAGE_H - 70).strokeColor(C.line).lineWidth(1).stroke();
  doc.font("Mono").fontSize(8).fillColor(C.textTertiary)
    .text("CONFIDENTIAL  ·  INTERNAL USE", M, PAGE_H - 52);
  doc.font("Sans").fontSize(10).fillColor(C.textSecondary)
    .text("Version 1.0  ·  July 2026", M, PAGE_H - 52, { width: PAGE_W - M * 2, align: "right" });
}

// ═══════════════════════════════════════════════════
// TOC
// ═══════════════════════════════════════════════════
{
  newCreamPage();
  pageHeader("CONTENTS");
  eyebrow("Overview", 72);
  let y = sectionTitle([{ text: "What's" }, { text: "inside", italic: true }], 90);
  y = lede("Use this document to keep every screen, deck, and asset on-brand. When in doubt: cream for marketing, dark luxury for investor tools, accent red for emphasis only.", y + 8);

  const toc = [
    ["01", "Brand identity & voice", "03"],
    ["02", "Logo & lockups", "04"],
    ["03", "Color system", "05"],
    ["04", "Typography", "07"],
    ["05", "Layout, radius & motion", "08"],
    ["06", "Components & patterns", "09"],
    ["07", "Status, copy & do / don't", "10"],
  ];

  y += 10;
  for (const [num, title, pg] of toc) {
    doc.moveTo(M, y + 22).lineTo(PAGE_W - M, y + 22).strokeColor("#e5e0d8").lineWidth(1).stroke();
    doc.font("Mono").fontSize(10).fillColor(C.accent).text(num, M, y);
    doc.font("SansMed").fontSize(13).fillColor(C.ink).text(title, M + 36, y - 1);
    doc.font("Mono").fontSize(10).fillColor(C.inkSoft).text(pg, M, y, { width: PAGE_W - M * 2, align: "right" });
    y += 36;
  }

  pageFooter(2);
}

// ═══════════════════════════════════════════════════
// 01 IDENTITY
// ═══════════════════════════════════════════════════
{
  newCreamPage();
  pageHeader("SECTION 01");
  eyebrow("Brand identity", 72);
  let y = sectionTitle([{ text: "Confident. Premium." }, { text: "Numbers-forward.", italic: true }], 90);
  y = lede("SSP Deal Flow is a JV investment platform for accredited investors. The brand feels like a luxury real estate brochure on marketing pages, and a private investor dashboard on deal surfaces.", y + 4);

  const cardW = (PAGE_W - M * 2 - 14) / 2;
  roundedRect(M, y, cardW, 130, 12, C.white, "#e5e0d8");
  roundedRect(M + cardW + 14, y, cardW, 130, 12, C.white, "#e5e0d8");

  doc.font("SansSemi").fontSize(9).fillColor(C.ink).text("VOICE", M + 16, y + 16, { characterSpacing: 0.8 });
  doc.font("Sans").fontSize(10).fillColor(C.inkMuted)
    .text("Short. Declarative. Transparent. Lead with numbers, not hype. Avoid buzzwords, emojis, and salesy superlatives.", M + 16, y + 34, { width: cardW - 32, lineGap: 2 });
  doc.font("SerifItalic").fontSize(11).fillColor(C.ink)
    .text("“Vetted off-market acquisitions. 50/50 profit split at sale.”", M + 16, y + 90, { width: cardW - 32 });

  doc.font("SansSemi").fontSize(9).fillColor(C.ink).text("VISUAL MOOD", M + cardW + 30, y + 16, { characterSpacing: 0.8 });
  doc.font("Sans").fontSize(10).fillColor(C.inkMuted)
    .text("Two coexisting aesthetics — never mixed on the same surface:", M + cardW + 30, y + 34, { width: cardW - 32, lineGap: 2 });
  doc.font("SansSemi").fontSize(10).fillColor(C.ink)
    .text("Cream / editorial", M + cardW + 30, y + 72);
  doc.font("Sans").fontSize(9).fillColor(C.inkSoft)
    .text("Home, Track Record, How It Works", M + cardW + 30, y + 86);
  doc.font("SansSemi").fontSize(10).fillColor(C.ink)
    .text("Dark luxury", M + cardW + 30, y + 104);
  doc.font("Sans").fontSize(9).fillColor(C.inkSoft)
    .text("Property Detail, Invest, Qualify", M + cardW + 30, y + 118);

  y += 150;
  const panelW = cardW;
  const panelH = 200;
  roundedRect(M, y, panelW, panelH, 14, C.cream, "#e5e0d8");
  roundedRect(M + panelW + 14, y, panelW, panelH, 14, C.bg);

  doc.font("SansSemi").fontSize(8).fillColor(C.accent).text("CREAM / EDITORIAL", M + 18, y + 18, { characterSpacing: 1 });
  doc.font("SansBold").fontSize(22).fillColor(C.ink).text("Real estate", M + 18, y + 42);
  doc.font("SerifItalic").fontSize(22).fillColor(C.accent).text("built for", M + 18, y + 68);
  doc.font("SansBold").fontSize(22).fillColor(C.ink).text("investors", M + 18, y + 94);
  doc.font("Sans").fontSize(10).fillColor(C.inkMuted)
    .text("Warm off-white, ink type, accent red for emphasis. Brochure energy.", M + 18, y + 140, { width: panelW - 36, lineGap: 2 });

  doc.font("SansSemi").fontSize(8).fillColor(C.accent).text("DARK LUXURY", M + panelW + 32, y + 18, { characterSpacing: 1 });
  doc.font("SansBold").fontSize(22).fillColor(C.textPrimary).text("Deal terms", M + panelW + 32, y + 42);
  doc.font("SerifItalic").fontSize(22).fillColor(C.accent).text("that hold up", M + panelW + 32, y + 68);
  doc.font("Sans").fontSize(10).fillColor(C.textSecondary)
    .text("Near-black, cream type, red CTAs. Private investor dashboard.", M + panelW + 32, y + 140, { width: panelW - 36, lineGap: 2 });

  pageFooter(3);
}

// ═══════════════════════════════════════════════════
// 02 LOGO
// ═══════════════════════════════════════════════════
{
  newCreamPage();
  pageHeader("SECTION 02");
  eyebrow("Logo", 72);
  let y = sectionTitle([{ text: "Wordmark &" }, { text: "lockups", italic: true }], 90);
  y = lede("The logo is set in Bebas Neue, all caps, with tracking 0.08em. Brackets are accent red and slightly larger than the wordmark.", y + 4);

  doc.font("SansSemi").fontSize(8).fillColor(C.inkSoft).text("ON CREAM", M, y, { characterSpacing: 1 });
  doc.font("SansSemi").fontSize(8).fillColor(C.inkSoft).text("ON DARK", M + (PAGE_W - M * 2) / 2 + 7, y, { characterSpacing: 1 });
  y += 14;

  const lockW = (PAGE_W - M * 2 - 14) / 2;
  roundedRect(M, y, lockW, 100, 12, C.cream, "#e5e0d8");
  roundedRect(M + lockW + 14, y, lockW, 100, 12, C.bg);
  drawLogo(M + 40, y + 38, { size: 22, color: C.ink });
  drawLogo(M + lockW + 54, y + 38, { size: 22, color: C.textPrimary });

  y += 120;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("CONSTRUCTION", M, y, { characterSpacing: 0.6 });
  y += 16;

  const colW = lockW;
  roundedRect(M, y, colW, 160, 12, C.white, "#e5e0d8");
  roundedRect(M + colW + 14, y, colW, 160, 12, C.white, "#e5e0d8");

  doc.font("SansSemi").fontSize(9).fillColor(C.green).text("DO", M + 16, y + 14, { characterSpacing: 1 });
  const dos = [
    "Use Bebas Neue only for the logo",
    "Keep brackets in accent red #E8432D",
    "Wordmark: ink on cream, cream on dark",
    "Nav size ~22px word / 28px brackets",
  ];
  dos.forEach((t, i) => {
    doc.circle(M + 20, y + 42 + i * 28, 2.5).fillColor(C.accent).fill();
    doc.font("Sans").fontSize(10).fillColor(C.inkMuted).text(t, M + 30, y + 35 + i * 28, { width: colW - 46 });
  });

  doc.font("SansSemi").fontSize(9).fillColor(C.accent).text("DON'T", M + colW + 30, y + 14, { characterSpacing: 1 });
  const donts = [
    "Stretch, outline, or add drop shadows",
    "Recolor brackets to black or white",
    "Set the wordmark in sentence case",
    "Place on busy photos without a panel",
  ];
  donts.forEach((t, i) => {
    doc.circle(M + colW + 34, y + 42 + i * 28, 2.5).fillColor(C.accent).fill();
    doc.font("Sans").fontSize(10).fillColor(C.inkMuted).text(t, M + colW + 44, y + 35 + i * 28, { width: colW - 46 });
  });

  y += 180;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("INCORRECT TREATMENTS", M, y, { characterSpacing: 0.6 });
  y += 14;
  roundedRect(M, y, lockW, 80, 12, C.creamAlt, "#e5e0d8");
  roundedRect(M + lockW + 14, y, lockW, 80, 12, C.bg);
  doc.font("Serif").fontSize(18).fillColor(C.inkSoft).text("Ssp Deal Flow", M + 36, y + 30);
  doc.font("Bebas").fontSize(20).fillColor(C.accent).text("[SSP DEAL FLOW]", M + lockW + 50, y + 30);
  // DON'T badges
  roundedRect(M + lockW - 58, y + 8, 48, 16, 4, "#fde8e4");
  doc.font("Mono").fontSize(7).fillColor(C.accent).text("DON'T", M + lockW - 50, y + 12);
  roundedRect(M + lockW * 2 + 14 - 58, y + 8, 48, 16, 4, "#3a1f1a");
  doc.font("Mono").fontSize(7).fillColor(C.accent).text("DON'T", M + lockW * 2 + 14 - 50, y + 12);

  pageFooter(4);
}

// ═══════════════════════════════════════════════════
// 03 COLOR CREAM
// ═══════════════════════════════════════════════════
{
  newCreamPage();
  pageHeader("SECTION 03");
  eyebrow("Color system", 72);
  let y = sectionTitle([{ text: "Cream" }, { text: "palette", italic: true }], 90);
  y = lede("Primary marketing surfaces. Prefer CSS variables from client/src/index.css over raw hex in product UI.", y + 4);

  const swW = (PAGE_W - M * 2 - 30) / 4;
  const swatches1 = [
    [C.cream, "Cream Base", "Primary page background"],
    [C.creamAlt, "Cream Alt", "Secondary sections"],
    [C.creamSurface, "Cream Surface", "Elevated cards"],
    [C.ink, "Cream Ink", "Primary text / CTAs"],
  ];
  swatches1.forEach(([hex, name, use], i) => {
    swatch(M + i * (swW + 10), y, swW, 118, hex, name, use);
  });

  y += 140;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("BRAND & SEMANTIC ACCENTS", M, y, { characterSpacing: 0.6 });
  y += 14;
  const swatches2 = [
    [C.accent, "Accent Red", "CTAs, brackets, hot moments"],
    [C.green, "Success Green", "Profit, live, available"],
    [C.blue, "Equity Blue", "Committed, projections"],
    [C.amber, "Amber", "Sold, cash deal, warnings"],
  ];
  swatches2.forEach(([hex, name, use], i) => {
    swatch(M + i * (swW + 10), y, swW, 118, hex, name, use);
  });

  y += 140;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("USAGE RULES", M, y, { characterSpacing: 0.6 });
  y += 16;
  const rules = [
    "Accent red is for emphasis only — never long body copy",
    "Muted ink on cream: rgba(13,12,11,0.62) body · 0.42 tertiary",
    "Hover for accent: #D63520 · soft fill: rgba(232,67,45,0.08–0.12)",
  ];
  rules.forEach((r, i) => {
    doc.circle(M + 4, y + 5 + i * 22, 2.5).fillColor(C.accent).fill();
    doc.font("Sans").fontSize(11).fillColor(C.inkMuted).text(r, M + 16, y + i * 22, { width: PAGE_W - M * 2 - 16 });
  });

  pageFooter(5);
}

// ═══════════════════════════════════════════════════
// 03 COLOR DARK
// ═══════════════════════════════════════════════════
{
  newDarkPage();
  pageHeaderDark("SECTION 03  ·  CONT.");
  eyebrow("Color system", 72);
  doc.font("SansBold").fontSize(34).fillColor(C.textPrimary).text("Dark", M, 90);
  doc.font("SerifItalic").fontSize(34).fillColor(C.accent).text("luxury", M, 128);

  doc.font("Sans").fontSize(11).fillColor(C.textSecondary)
    .text("Investor-facing detail surfaces. Near-black foundation, warm cream type, red primary actions. Footer is always dark under both palettes.", M, 180, { width: PAGE_W - M * 2 - 40, lineGap: 3 });

  let y = 230;
  const swW = (PAGE_W - M * 2 - 30) / 4;
  const darkSwatches = [
    [C.bg, "Background", "#0F0E0D", "App canvas"],
    [C.surface, "Surface", "#181614", "Cards & panels"],
    [C.surface2, "Surface 2", "#201E1B", "Inset / hover"],
    [C.line, "Line", "#2A2724", "Borders"],
  ];
  darkSwatches.forEach(([hex, name, code, use], i) => {
    const x = M + i * (swW + 10);
    roundedRect(x, y, swW, 110, 10, C.surface, C.line);
    doc.rect(x, y, swW, 50).fillColor(hex).fill();
    // top rounded look
    doc.font("SansSemi").fontSize(9).fillColor(C.textPrimary).text(name, x + 10, y + 58, { width: swW - 20 });
    doc.font("Mono").fontSize(8).fillColor(C.textTertiary).text(code, x + 10, y + 72, { width: swW - 20 });
    doc.font("Sans").fontSize(8).fillColor(C.textTertiary).text(use, x + 10, y + 86, { width: swW - 20 });
  });

  y = 360;
  doc.font("SansSemi").fontSize(10).fillColor(C.textPrimary).text("TYPE ON DARK", M, y, { characterSpacing: 0.6 });
  y += 18;

  const typeRows = [
    [C.textPrimary, "--text-primary", "#F0EBE3", "Headings"],
    [C.textSecondary, "--text-secondary", "#A89E91", "Body"],
    [C.textTertiary, "--text-tertiary", "#6B6158", "Labels, hints"],
    [C.accent, "--accent", "#E8432D", "Primary CTA"],
  ];
  typeRows.forEach(([chip, token, hex, use], i) => {
    const yy = y + i * 28;
    doc.roundedRect(M, yy, 12, 12, 3).fillColor(chip).fill();
    doc.font("Mono").fontSize(9).fillColor(C.textPrimary).text(token, M + 22, yy + 1);
    doc.font("Mono").fontSize(9).fillColor(C.textSecondary).text(hex, M + 180, yy + 1);
    doc.font("Sans").fontSize(9).fillColor(C.textSecondary).text(use, M + 280, yy + 1);
    doc.moveTo(M, yy + 22).lineTo(PAGE_W - M, yy + 22).strokeColor(C.line).lineWidth(0.5).stroke();
  });

  y = 520;
  roundedRect(M, y, PAGE_W - M * 2, 140, 14, C.surface, C.line);
  // pill
  roundedRect(M + 20, y + 18, 140, 22, 11, "rgba(232,67,45,0.12)");
  // pdfkit doesn't do rgba fills well — use solid-ish
  doc.roundedRect(M + 20, y + 18, 140, 22, 11).fillColor("#3a221e").fill();
  doc.circle(M + 32, y + 29, 3).fillColor(C.accent).fill();
  doc.font("Mono").fontSize(8).fillColor(C.accent).text("OPEN FOR FUNDING", M + 42, y + 24, { characterSpacing: 0.8 });

  doc.font("MonoMed").fontSize(28).fillColor(C.textPrimary).text("$275,744", M + 20, y + 52);
  doc.font("SansSemi").fontSize(8).fillColor(C.textTertiary).text("INVESTOR CAPITAL", M + 20, y + 88, { characterSpacing: 1 });

  roundedRect(M + 20, y + 106, 170, 22, 8, C.accent);
  doc.font("SansSemi").fontSize(10).fillColor(C.white).text("I'm In · Contact Me →", M + 34, y + 112);

  pageFooterDark(6);
}

// ═══════════════════════════════════════════════════
// 04 TYPOGRAPHY
// ═══════════════════════════════════════════════════
{
  newCreamPage();
  pageHeader("SECTION 04");
  eyebrow("Typography", 72);
  let y = sectionTitle([{ text: "Four families." }, { text: "One system.", italic: true }], 90);
  y = lede("DM Sans for UI. Instrument Serif italic for editorial accent words. DM Mono for every number. Bebas Neue for the logo only.", y + 4);

  const typeSpecs = [
    {
      label: "DM Sans",
      role: "UI / Body",
      sample: () => doc.font("SansBold").fontSize(24).fillColor(C.ink).text("The quick brown fox jumps", M + 110, null),
      note: "Default for headlines, body, buttons, and navigation.",
    },
    {
      label: "Instrument Serif",
      role: "Editorial",
      sample: () => doc.font("SerifItalic").fontSize(26).fillColor(C.accent).text("built for · deals · Every number.", M + 110, null),
      note: "One italic accent word inside hero headlines. Signature pattern.",
    },
    {
      label: "DM Mono",
      role: "Numbers",
      sample: () => doc.font("MonoMed").fontSize(22).fillColor(C.ink).text("$6.1M  ·  15.3%  ·  94d  ·  119", M + 110, null),
      note: "Prices, ROI, ticker labels, micro-labels. Never sans for figures.",
    },
    {
      label: "Bebas Neue",
      role: "Logo only",
      sample: () => {
        const yy = doc.y;
        drawLogo(M + 110, yy, { size: 24, color: C.ink });
        doc.y = yy + 30;
      },
      note: "Do not use Bebas Neue for UI copy or section titles.",
    },
  ];

  typeSpecs.forEach((spec) => {
    doc.moveTo(M, y).lineTo(PAGE_W - M, y).strokeColor("#e5e0d8").lineWidth(1).stroke();
    y += 12;
    doc.font("SansSemi").fontSize(11).fillColor(C.ink).text(spec.label, M, y);
    doc.font("Mono").fontSize(7).fillColor(C.inkSoft).text(spec.role.toUpperCase(), M, y + 16, { characterSpacing: 0.6 });
    doc.y = y;
    spec.sample();
    const after = Math.max(doc.y, y + 28);
    doc.font("Sans").fontSize(9).fillColor(C.inkSoft).text(spec.note, M + 110, after + 2, { width: PAGE_W - M * 2 - 110 });
    y = after + 28;
  });

  y += 8;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("SCALE (MOBILE-FIRST)", M, y, { characterSpacing: 0.6 });
  y += 16;

  const scale = [
    ["Display hero", "clamp(52px, 6vw, 76px)", "Bold · tracking -0.03em · leading 0.88"],
    ["Section title", "clamp(36px, 4vw, 50px)", "Bold · tracking -0.025em"],
    ["Body", "15–16px", "Leading 1.75"],
    ["Micro / eyebrow", "10–11px", "Semibold · tracking 0.10–0.14em · uppercase"],
  ];

  doc.font("Mono").fontSize(7).fillColor(C.inkSoft);
  doc.text("ROLE", M, y, { characterSpacing: 0.6 });
  doc.text("SIZE", M + 120, y, { characterSpacing: 0.6 });
  doc.text("NOTES", M + 300, y, { characterSpacing: 0.6 });
  y += 14;
  doc.moveTo(M, y).lineTo(PAGE_W - M, y).strokeColor("#e5e0d8").lineWidth(1).stroke();
  y += 8;
  scale.forEach(([role, size, notes]) => {
    doc.font("Mono").fontSize(9).fillColor(C.ink).text(role, M, y);
    doc.font("Mono").fontSize(8).fillColor(C.inkMuted).text(size, M + 120, y + 1);
    doc.font("Sans").fontSize(9).fillColor(C.inkMuted).text(notes, M + 300, y);
    y += 22;
  });

  pageFooter(7);
}

// ═══════════════════════════════════════════════════
// 05 LAYOUT
// ═══════════════════════════════════════════════════
{
  newCreamPage();
  pageHeader("SECTION 05");
  eyebrow("Layout & motion", 72);
  let y = sectionTitle([{ text: "Space, radius," }, { text: "presence", italic: true }], 90);
  y = lede("Generous containers, soft large radii on cards, restrained motion that lifts hierarchy — never noise.", y + 4);

  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("CONTAINERS", M, y, { characterSpacing: 0.6 });
  y += 12;
  roundedRect(M, y, PAGE_W - M * 2, 78, 12, C.white, "#e5e0d8");
  doc.font("Sans").fontSize(10).fillColor(C.ink).text("Marketing:  max-w-[1360px]  ·  px-6 sm:px-10 lg:px-14", M + 16, y + 14);
  doc.font("Sans").fontSize(10).fillColor(C.ink).text("Property gallery:  max-w-[1280px]", M + 16, y + 34);
  doc.font("Sans").fontSize(10).fillColor(C.ink).text("App content:  container mx-auto px-4 sm:px-8", M + 16, y + 54);

  y += 100;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("RADIUS SCALE", M, y, { characterSpacing: 0.6 });
  y += 14;
  const radii = [
    [8, "8px", "sm"],
    [12, "12px", "md"],
    [16, "16px", "lg"],
    [20, "20px", "cards"],
    [24, "24px", "xl"],
  ];
  let rx = M;
  radii.forEach(([r, label, role]) => {
    const s = 40 + r;
    roundedRect(rx, y + (70 - s), s, s, r, C.white, "#e5e0d8");
    doc.font("Mono").fontSize(7).fillColor(C.inkSoft).text(label, rx, y + 78, { width: s, align: "center" });
    doc.font("Sans").fontSize(8).fillColor(C.inkMuted).text(role, rx, y + 90, { width: s, align: "center" });
    rx += s + 18;
  });

  y += 120;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("SHADOWS", M, y, { characterSpacing: 0.6 });
  y += 14;
  const shW = (PAGE_W - M * 2 - 28) / 3;
  // rest
  doc.save();
  doc.roundedRect(M + 2, y + 2, shW, 70, 12).fillColor("#00000008").fill();
  roundedRect(M, y, shW, 70, 12, C.white, "#e5e0d8");
  doc.font("SansSemi").fontSize(9).fillColor(C.ink).text("REST", M + 14, y + 18);
  doc.font("Sans").fontSize(9).fillColor(C.inkMuted).text("0 2px 8px · 4%", M + 14, y + 36);
  doc.restore();

  doc.save();
  doc.roundedRect(M + shW + 16, y + 4, shW, 70, 12).fillColor("#00000018").fill();
  roundedRect(M + shW + 14, y, shW, 70, 12, C.white, "#e5e0d8");
  doc.font("SansSemi").fontSize(9).fillColor(C.ink).text("HOVER LIFT", M + shW + 28, y + 18);
  doc.font("Sans").fontSize(9).fillColor(C.inkMuted).text("0 20px 48px · 10%", M + shW + 28, y + 36);
  doc.restore();

  roundedRect(M + (shW + 14) * 2, y, shW, 70, 12, C.accent);
  doc.font("SansSemi").fontSize(9).fillColor(C.white).text("CTA GLOW", M + (shW + 14) * 2 + 14, y + 18);
  doc.font("Sans").fontSize(9).fillColor("#ffffffbf").text("Red shadow · 30%", M + (shW + 14) * 2 + 14, y + 36);

  y += 100;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("MOTION", M, y, { characterSpacing: 0.6 });
  y += 14;
  const motions = [
    ["fade-up", "Card / list entrance with stagger"],
    ["ken-burns", "Slow hero photo zoom"],
    ["Buttons", "hover:-translate-y-px / -0.5 on primary"],
    ["Cards", "hover:-translate-y-1 + image scale 1.03–1.04"],
  ];
  motions.forEach(([name, desc], i) => {
    doc.circle(M + 4, y + 5 + i * 22, 2.5).fillColor(C.accent).fill();
    doc.font("SansSemi").fontSize(10).fillColor(C.ink).text(name, M + 16, y + i * 22);
    doc.font("Sans").fontSize(10).fillColor(C.inkMuted).text(desc, M + 100, y + i * 22);
  });

  pageFooter(8);
}

// ═══════════════════════════════════════════════════
// 06 COMPONENTS
// ═══════════════════════════════════════════════════
{
  newCreamPage();
  pageHeader("SECTION 06");
  eyebrow("Components", 72);
  let y = sectionTitle([{ text: "Patterns that" }, { text: "repeat", italic: true }], 90);
  y = lede("Reuse these building blocks. New surfaces should compose from existing tokens — not invent new colors or fonts.", y + 4);

  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("BUTTONS", M, y, { characterSpacing: 0.6 });
  y += 12;
  roundedRect(M, y, PAGE_W - M * 2, 100, 12, C.white, "#e5e0d8");

  // buttons
  roundedRect(M + 16, y + 18, 150, 34, 10, C.ink);
  doc.font("SansSemi").fontSize(11).fillColor(C.white).text("Explore Properties →", M + 28, y + 28);

  roundedRect(M + 178, y + 18, 110, 34, 10, C.white, "#e5e0d8");
  doc.font("SansMed").fontSize(11).fillColor(C.inkMuted).text("How It Works", M + 192, y + 28);

  roundedRect(M + 302, y + 18, 90, 34, 17, C.white, "#ddd8d0");
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("View All →", M + 316, y + 28);

  roundedRect(M + 16, y + 62, 170, 24, 8, C.accent);
  doc.font("SansSemi").fontSize(10).fillColor(C.white).text("I'm In · Contact Me →", M + 32, y + 68);

  y += 120;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("ACCENT PILL & STATS", M, y, { characterSpacing: 0.6 });
  y += 12;

  const half = (PAGE_W - M * 2 - 14) / 2;
  roundedRect(M, y, half, 120, 12, C.white, "#e5e0d8");
  roundedRect(M + half + 14, y, half, 120, 12, C.white, "#e5e0d8");

  doc.roundedRect(M + 18, y + 28, 190, 24, 12).fillColor("#fdecea").fill();
  doc.circle(M + 32, y + 40, 3).fillColor(C.accent).fill();
  doc.font("Mono").fontSize(8).fillColor(C.accent).text("ACCREDITED INVESTORS ONLY", M + 42, y + 35, { characterSpacing: 0.6 });
  doc.font("Sans").fontSize(10).fillColor(C.inkMuted)
    .text("Eyebrow with live dot. Mono micro-label, red tint fill.", M + 18, y + 70, { width: half - 36, lineGap: 2 });

  // stats
  roundedRect(M + half + 28, y + 20, (half - 50) / 2, 80, 10, C.cream, "#e5e0d8");
  doc.font("MonoMed").fontSize(22).fillColor(C.ink).text("119", M + half + 40, y + 34);
  doc.font("SansSemi").fontSize(7).fillColor(C.inkSoft).text("DEALS CLOSED", M + half + 40, y + 68, { characterSpacing: 0.8 });

  const redX = M + half + 28 + (half - 50) / 2 + 10;
  roundedRect(redX, y + 20, (half - 50) / 2, 80, 10, C.accent);
  doc.font("MonoMed").fontSize(20).fillColor(C.white).text("$6.1M", redX + 12, y + 34);
  doc.font("SansSemi").fontSize(7).fillColor("#ffffff88").text("TOTAL EQUITY", redX + 12, y + 68, { characterSpacing: 0.8 });

  y += 140;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("ICONOGRAPHY", M, y, { characterSpacing: 0.6 });
  y += 12;
  roundedRect(M, y, PAGE_W - M * 2, 70, 12, C.white, "#e5e0d8");
  doc.font("Sans").fontSize(11).fillColor(C.inkMuted)
    .text("Library: lucide-react · stroke only, never fill. Sizes: 12px meta · 14px button trailing · 16px leading · 20px nav. Color follows currentColor.", M + 16, y + 22, { width: PAGE_W - M * 2 - 32, lineGap: 3 });

  pageFooter(9);
}

// ═══════════════════════════════════════════════════
// 07 STATUS & COPY
// ═══════════════════════════════════════════════════
{
  newCreamPage();
  pageHeader("SECTION 07");
  eyebrow("Status & copy", 72);
  let y = sectionTitle([{ text: "Clarity over" }, { text: "hype", italic: true }], 90);
  y = lede("Status colors and formatting conventions keep deal state scannable. Marketing copy stays short and declarative.", y + 4);

  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("DEAL STATUS", M, y, { characterSpacing: 0.6 });
  y += 12;

  const statuses = [
    [C.green, "AVAILABLE", "Open for funding"],
    [C.blue, "COMMITTED", "Capital reserved"],
    [C.blue, "FUNDED", "+ grayscale photo"],
    [C.amber, "SOLD", "Completed deal"],
    [C.amber, "CASH DEAL", "No JV structure"],
  ];
  const stW = (PAGE_W - M * 2 - 32) / 5;
  statuses.forEach(([color, label, desc], i) => {
    const x = M + i * (stW + 8);
    roundedRect(x, y, stW, 78, 10, C.white, "#e5e0d8");
    doc.circle(x + stW / 2, y + 20, 5).fillColor(color).fill();
    doc.font("Mono").fontSize(7).fillColor(C.ink).text(label, x + 4, y + 36, { width: stW - 8, align: "center", characterSpacing: 0.4 });
    doc.font("Sans").fontSize(8).fillColor(C.inkSoft).text(desc, x + 4, y + 52, { width: stW - 8, align: "center" });
  });

  y += 100;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("NUMBER FORMATTING", M, y, { characterSpacing: 0.6 });
  y += 12;
  const numW = (PAGE_W - M * 2 - 20) / 3;
  const nums = [
    ["$275,744", "Full currency"],
    ["$84k  ·  $6.4M", "Compact ≥1k / ≥1M"],
    ["15.3%  ·  94d", "ROI & days held"],
  ];
  nums.forEach(([val, label], i) => {
    const x = M + i * (numW + 10);
    roundedRect(x, y, numW, 60, 10, C.white, "#e5e0d8");
    doc.font("MonoMed").fontSize(13).fillColor(C.ink).text(val, x + 12, y + 14, { width: numW - 24 });
    doc.font("Sans").fontSize(9).fillColor(C.inkSoft).text(label, x + 12, y + 38);
  });

  y += 80;
  doc.font("SansSemi").fontSize(10).fillColor(C.ink).text("VOICE — DO / DON'T", M, y, { characterSpacing: 0.6 });
  y += 12;

  const voices = [
    [true, "Vetted off-market acquisitions across the Southeast. 50/50 profit split at sale."],
    [false, "🚀 Unlock insane returns with our revolutionary deal pipeline!!!"],
    [true, "You fund the purchase. SSP handles rehab & management."],
    [false, "Passive income dreams made easy for everyone."],
  ];
  const vW = (PAGE_W - M * 2 - 12) / 2;
  voices.forEach(([isDo, text], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (vW + 12);
    const yy = y + row * 78;
    if (isDo) {
      roundedRect(x, yy, vW, 68, 10, C.white, "#e5e0d8");
      doc.font("Mono").fontSize(7).fillColor(C.green).text("DO SAY", x + 14, yy + 12, { characterSpacing: 0.8 });
      doc.font("Sans").fontSize(10).fillColor(C.ink).text(text, x + 14, yy + 28, { width: vW - 28, lineGap: 2 });
    } else {
      roundedRect(x, yy, vW, 68, 10, "#fdf0ed", "#f5cfc7");
      doc.font("Mono").fontSize(7).fillColor(C.accent).text("DON'T SAY", x + 14, yy + 12, { characterSpacing: 0.8 });
      doc.font("Sans").fontSize(10).fillColor(C.inkMuted).text(text, x + 14, yy + 28, { width: vW - 28, lineGap: 2 });
    }
  });

  pageFooter(10);
}

// ═══════════════════════════════════════════════════
// BACK COVER
// ═══════════════════════════════════════════════════
{
  newDarkPage();
  doc.rect(M, 80, 40, 3).fillColor(C.accent).fill();
  drawLogo(M, 100, { size: 20, color: C.textPrimary });

  doc.font("SansBold").fontSize(40).fillColor(C.textPrimary).text("Stay on tokens.", M, 220, { width: PAGE_W - M * 2 });
  doc.font("SerifItalic").fontSize(40).fillColor(C.accent).text("Stay on brand.", M, 270, { width: PAGE_W - M * 2 });

  doc.font("Sans").fontSize(12).fillColor(C.textSecondary)
    .text(
      "Every new surface should be expressible with the tokens in this guide. If a design needs a new color or font, push back — extend the system, don't break it.",
      M,
      350,
      { width: 380, lineGap: 4 }
    );

  doc.moveTo(M, PAGE_H - 70).lineTo(PAGE_W - M, PAGE_H - 70).strokeColor(C.line).lineWidth(1).stroke();
  doc.font("Mono").fontSize(8).fillColor(C.textTertiary)
    .text("DESIGN_SYSTEM.MD  ·  SOURCE OF TRUTH", M, PAGE_H - 52);
  doc.font("Sans").fontSize(10).fillColor(C.textSecondary)
    .text("Southern Specialty Properties", M, PAGE_H - 52, { width: PAGE_W - M * 2, align: "right" });
}

doc.end();

await new Promise((resolve, reject) => {
  doc.on("end", resolve);
  doc.on("error", reject);
});

const stats = fs.statSync(outPath);
console.log(`Wrote ${outPath} (${(stats.size / 1024).toFixed(1)} KB, ${pageNum} pages)`);
