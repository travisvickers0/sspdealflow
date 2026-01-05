import { readFileSync, createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const markdownFile = join(rootDir, 'docs', 'SSP_Investor_Partnership_Overview.md');
const outputDir = join(rootDir, 'client', 'public', 'assets');
const outputFile = join(outputDir, 'SSP_Investor_Partnership_Overview.pdf');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Read markdown content
const markdownContent = readFileSync(markdownFile, 'utf-8');

// Parse markdown to get tokens
const tokens = marked.lexer(markdownContent);

// Create PDF document
const doc = new PDFDocument({
  size: 'LETTER',
  margins: {
    top: 72,    // 1 inch
    bottom: 72,
    left: 54,   // 0.75 inch
    right: 54,
  },
  info: {
    Title: 'SSP Investor Partnership Overview',
    Author: 'Southern Specialty Properties LLC',
    Subject: 'Investor Partnership Overview',
  },
});

// Pipe PDF to file
doc.pipe(createWriteStream(outputFile));

// Primary color (HSL 350 75% 55% = RGB(216, 70, 111))
const primaryColor = '#d8466f';
const textColor = '#1a1a1a';
const textColorSecondary = '#4a4a4a';
const textColorMuted = '#6a6a6a';
const borderColor = '#e5e5e5';

// Helper to extract plain text from tokens (handles inline formatting)
function extractText(token: any): string {
  if (typeof token === 'string') return token;
  if (token.tokens) {
    return token.tokens.map(extractText).join('');
  }
  if (token.text) return token.text;
  if (token.raw) return token.raw.replace(/\*\*/g, '').replace(/\*/g, '');
  return '';
}

// Helper to render inline tokens (handles bold/italic)
function renderInlineTokens(tokens: any[]): string {
  return tokens.map((token: any) => {
    if (token.type === 'strong') {
      return extractText(token);
    } else if (token.type === 'text') {
      return token.text || '';
    } else if (token.type === 'em') {
      return extractText(token);
    }
    return extractText(token);
  }).join('');
}

// Helper to add text with formatting
function addText(text: string, options: { size?: number; color?: string; bold?: boolean; italic?: boolean; spacing?: number } = {}) {
  const { size = 11, color = textColorSecondary, bold = false, italic = false, spacing = 6 } = options;
  doc.fontSize(size);
  doc.fillColor(color);
  if (bold) doc.font('Helvetica-Bold');
  else if (italic) doc.font('Helvetica-Oblique');
  else doc.font('Helvetica');
  
  doc.text(text, {
    continued: false,
    lineGap: spacing,
    align: 'left',
  });
}

// Process markdown tokens
let firstH2AfterH1 = false;
let expectSubtitle = false;

for (const token of tokens) {
  if (token.type === 'heading') {
    const level = token.depth || 1;
    const text = extractText(token);
    
    if (level === 1) {
      doc.moveDown(0.5);
      addText(text, { size: 24, color: textColor, bold: true, spacing: 8 });
      expectSubtitle = true;
      firstH2AfterH1 = true;
    } else if (level === 2) {
      doc.moveDown(1);
      // First h2 after h1 should be styled as subtitle
      if (expectSubtitle && firstH2AfterH1) {
        addText(text, { size: 12, color: textColorMuted, bold: false, spacing: 6 });
        firstH2AfterH1 = false;
        expectSubtitle = false;
      } else {
        addText(text.toUpperCase(), { size: 14, color: primaryColor, bold: true, spacing: 8 });
      }
    } else if (level === 3) {
      doc.moveDown(0.5);
      addText(text, { size: 12, color: textColor, bold: true, spacing: 6 });
    }
  } else if (token.type === 'paragraph') {
    const text = extractText(token);
    // Check if entire paragraph is italic (starts and ends with *)
    const rawText = token.raw || '';
    if (rawText.startsWith('*') && rawText.endsWith('*') && rawText.match(/^\*[^*]+\*$/)) {
      addText(text, { size: 11, color: textColorMuted, italic: true, spacing: 6 });
    } else {
      addText(text, { size: 11, color: textColorSecondary, spacing: 6 });
    }
    doc.moveDown(0.5);
  } else if (token.type === 'list') {
    doc.moveDown(0.3);
    for (const item of token.items || []) {
      const text = extractText(item);
      addText(`• ${text}`, { size: 11, color: textColorSecondary, spacing: 4 });
    }
    doc.moveDown(0.5);
  } else if (token.type === 'hr') {
    doc.moveDown(0.5);
    doc.strokeColor(borderColor);
    doc.moveTo(54, doc.y)
      .lineTo(558, doc.y)
      .stroke();
    doc.moveDown(0.5);
  }
}

// Finalize PDF
doc.end();

console.log(`✅ PDF generated successfully: ${outputFile}`);
