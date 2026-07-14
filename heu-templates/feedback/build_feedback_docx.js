/*
 * Branded Word feedback builder — HAIR EXPERT UNIVERSITY · MBA.
 * Usage: node build_feedback_docx_brand.js <input.json> <output.docx> [logo.png]
 * Palette + fonts from the official brandbook. `docx` (npm) is preinstalled.
 */
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ImageRun
} = require('docx');
const fs = require('fs');
const path = require('path');

const [, , inPath, outPath, logoArg] = process.argv;
const logoPath = logoArg || path.join(__dirname, 'assets', 'logo-mba.png');
if (!inPath || !outPath) { console.error("usage: node build_feedback_docx.js <input.json> <output.docx> [logo.png]"); process.exit(1); }
const D = JSON.parse(fs.readFileSync(inPath, 'utf8'));

// ---- Brand palette (брендбук HAIR EXPERT UNIVERSITY MBA) ----
const NAVY = "222A36", ACCENT = "254371", GREY = "818A99", LIGHT = "EDF1F6", KEY = "E6ECF4", INK = "13161A";
const SERIF = "Cormorant", SANS = "Raleway";

function t(text, o = {}) { return new TextRun({ text, size: o.size ?? 22, bold: o.bold, italics: o.italics, color: o.color, font: o.font }); }
function h(text, o = {}) {
  return new Paragraph({ spacing: { before: o.before ?? 300, after: 120 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 30, font: SERIF })] });
}
function p(runs, o = {}) {
  const children = Array.isArray(runs) ? runs : [t(runs)];
  return new Paragraph({ spacing: { after: o.after ?? 120, line: 288 }, alignment: o.align, children });
}
function bullet(item) {
  const runs = [];
  if (item[0]) runs.push(t(item[0], { bold: true, color: ACCENT }));
  if (item[1]) runs.push(t(item[1]));
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 90, line: 288 }, children: runs });
}
// Callout for the single most important weakness — shaded box, accent left border (no red, on-brand)
function callout(item) {
  const runs = [];
  if (item[0]) runs.push(t(item[0], { bold: true, color: NAVY }));
  if (item[1]) runs.push(t(item[1]));
  return new Paragraph({
    spacing: { before: 40, after: 140, line: 288 },
    shading: { type: ShadingType.CLEAR, fill: KEY, color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: ACCENT, space: 10 } },
    children: runs,
  });
}

const children = [];

// ---- Logo + kicker header ----
try {
  children.push(new Paragraph({ spacing: { after: 40 }, children: [
    new ImageRun({ data: fs.readFileSync(logoPath), transformation: { width: 150, height: 73 } })
  ]}));
} catch (e) { /* logo optional */ }
children.push(new Paragraph({
  spacing: { after: 30 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 6 } },
  children: [t((D.course || "HAIR EXPERT UNIVERSITY · MBA").toUpperCase(), { bold: true, color: GREY, size: 18, font: SANS })],
}));

// ---- Title ----
children.push(new Paragraph({ spacing: { before: 160, after: 30 },
  children: [t(D.title || "Обратная связь по домашнему заданию", { bold: true, color: NAVY, size: 40, font: SERIF })] }));
if (D.subtitle) children.push(p([t(D.subtitle, { color: GREY, size: 20, bold: true })], { after: 180 }));

// ---- Score plaque ----
if (D.total_score != null) {
  children.push(new Paragraph({
    spacing: { after: 240 },
    shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: ACCENT, space: 10 } },
    children: [
      t("Итоговая оценка:  ", { bold: true, size: 26, color: NAVY }),
      t(`${D.total_score} из ${D.max_score ?? 110} баллов`, { bold: true, size: 26, color: ACCENT }),
      D.score_note ? t(`   (${D.score_note})`, { size: 22, color: GREY }) : t(""),
    ],
  }));
}

// ---- Greeting ----
if (D.greeting) {
  const lead = D.student_name ? `${D.student_name}, здравствуйте! ` : "";
  children.push(p([t(lead, { bold: true }), t(D.greeting)]));
}

// ---- Context ----
if (D.context) { children.push(h("Важный контекст")); children.push(p(D.context)); }

// ---- Scoring table ----
if (Array.isArray(D.criteria) && D.criteria.length) {
  children.push(h("Оценка по критериям"));
  const W = [6000, 1600, 1600];
  const cell = (text, o = {}) => new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.shade ? { type: ShadingType.CLEAR, fill: o.shade, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({ alignment: o.align ?? AlignmentType.LEFT, children: [new TextRun({ text, bold: o.bold, size: 22, color: o.color, font: SANS })] })],
  });
  const rows = [new TableRow({ tableHeader: true, children: [
    cell("Критерий", { bold: true, color: "FFFFFF", shade: NAVY, w: W[0] }),
    cell("Максимум", { bold: true, color: "FFFFFF", shade: NAVY, align: AlignmentType.CENTER, w: W[1] }),
    cell("Балл", { bold: true, color: "FFFFFF", shade: NAVY, align: AlignmentType.CENTER, w: W[2] }),
  ]})];
  D.criteria.forEach((c, i) => {
    const shade = i % 2 === 0 ? "FFFFFF" : LIGHT;
    rows.push(new TableRow({ children: [
      cell(String(c.name), { w: W[0], shade }),
      cell(String(c.max), { align: AlignmentType.CENTER, w: W[1], shade }),
      cell(String(c.score), { align: AlignmentType.CENTER, w: W[2], shade, bold: true, color: ACCENT }),
    ]}));
  });
  if (D.total_row) rows.push(new TableRow({ children: [
    cell("ИТОГО", { bold: true, w: W[0], shade: NAVY, color: "FFFFFF" }),
    cell(String(D.total_row.max), { bold: true, align: AlignmentType.CENTER, w: W[1], shade: NAVY, color: "FFFFFF" }),
    cell(String(D.total_row.score), { bold: true, align: AlignmentType.CENTER, w: W[2], shade: NAVY, color: "FFFFFF" }),
  ]}));
  children.push(new Table({ columnWidths: W, width: { size: W[0] + W[1] + W[2], type: WidthType.DXA }, rows }));
  children.push(p("", { after: 120 }));
}

// ---- Good ----
if (Array.isArray(D.good) && D.good.length) {
  children.push(h("Что у вас получилось хорошо"));
  D.good.forEach(item => children.push(bullet(item)));
}

// ---- Improve (first item = boxed callout, rest = bullets) ----
if (Array.isArray(D.improve) && D.improve.length) {
  children.push(h("Над чем предлагаю поработать"));
  D.improve.forEach((item, i) => children.push(i === 0 ? callout(item) : bullet(item)));
}

// ---- Bonus ----
if (D.bonus) { children.push(h("За что я добавила бонусные баллы")); children.push(p(D.bonus)); }

// ---- Recommendation ----
if (D.recommendation) {
  children.push(h("Моя итоговая рекомендация"));
  const rec = Array.isArray(D.recommendation) ? D.recommendation : [null, D.recommendation];
  children.push(new Paragraph({
    spacing: { after: 120, line: 288 },
    shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: ACCENT, space: 10 } },
    children: [rec[0] ? t(rec[0], { bold: true, color: ACCENT }) : t(""), t(rec[1] ?? "")],
  }));
}

const doc = new Document({
  creator: D.course || "HAIR EXPERT UNIVERSITY MBA",
  title: D.title || "Обратная связь",
  styles: { default: { document: { run: { font: SANS, size: 22, color: "23262B" } } } },
  sections: [{ properties: { page: { margin: { top: 900, bottom: 1000, left: 1100, right: 1100 } } }, children }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(outPath, b); console.log("written", outPath, b.length); });
