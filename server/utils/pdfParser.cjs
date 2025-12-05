const pdfParseLib = require('pdf-parse');
const { PDFParse } = pdfParseLib;

async function parsePDF(dataBuffer) {
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  return {
    text: result.text || '',
    numpages: result.pages?.length || 0,
    info: result.info || {}
  };
}

module.exports = { parsePDF };
