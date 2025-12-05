const pdfParse = require('pdf-parse');

async function parsePDF(dataBuffer) {
  const data = await pdfParse(dataBuffer);
  return {
    text: data.text,
    numpages: data.numpages,
    info: data.info
  };
}

module.exports = { parsePDF };
