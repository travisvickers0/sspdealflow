const pdfParseLib = require('pdf-parse');
const pdfParse = pdfParseLib.PDFParse || pdfParseLib.default || pdfParseLib;

async function parsePDF(dataBuffer) {
  const data = await pdfParse(dataBuffer);
  return {
    text: data.text,
    numpages: data.numpages,
    info: data.info
  };
}

module.exports = { parsePDF };
