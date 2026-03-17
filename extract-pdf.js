const fs = require('fs');
const pdfjsLib = require('pdfjs-dist');

const pdfPath = './10953504_PID.pdf';

async function extractPDFText() {
  try {
    const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
    const pdfDocument = await loadingTask.promise;
    
    console.log('=== PDF CONTENT ===\n');
    console.log(`Total pages: ${pdfDocument.numPages}\n`);
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
    }
    
    console.log(fullText);
  } catch (error) {
    console.error('Error:', error);
  }
}

extractPDFText();
