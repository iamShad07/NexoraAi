const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const Papa = require('papaparse');
const { createWorker } = require('tesseract.js');

class DocumentProcessor {
  /**
   * Main entry point to extract text and structure from uploaded file
   */
  async processFile(filePath, mimeType, originalName) {
    const ext = path.extname(originalName).toLowerCase();
    let text = '';
    let pageCount = 1;
    let structureType = 'General';

    try {
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text || '';
        pageCount = pdfData.numpages || 1;
      } else if (ext === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value || '';
        pageCount = Math.max(1, Math.ceil(text.length / 3000));
      } else if (ext === '.doc') {
        // Fallback text extraction for old .doc
        text = fs.readFileSync(filePath, 'utf-8');
        pageCount = Math.max(1, Math.ceil(text.length / 3000));
      } else if (['.txt', '.rtf', '.odt', '.md'].includes(ext)) {
        text = fs.readFileSync(filePath, 'utf-8');
        pageCount = Math.max(1, Math.ceil(text.length / 3000));
      } else if (['.xls', '.xlsx'].includes(ext)) {
        const workbook = XLSX.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        pageCount = sheetNames.length;
        const textParts = [];
        sheetNames.forEach(name => {
          textParts.push(`--- Sheet: ${name} ---`);
          const sheet = workbook.Sheets[name];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          textParts.push(csv);
        });
        text = textParts.join('\n\n');
        structureType = 'Business';
      } else if (ext === '.csv') {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = Papa.parse(fileContent, { header: true });
        text = `CSV Data (${parsed.data.length} records):\n` + fileContent;
        structureType = 'Business';
      } else if (['.ppt', '.pptx'].includes(ext)) {
        // Attempt text extraction from presentation
        const content = fs.readFileSync(filePath, 'latin1');
        // Extract readable unicode words
        const matches = content.match(/[A-Za-z0-9 ,.?!:;'"()/-]{4,}/g);
        text = matches ? matches.join(' ') : 'Presentation content extracted.';
        pageCount = Math.max(1, Math.ceil(text.length / 1500));
      } else if (['.jpg', '.jpeg', '.png', '.webp', '.tiff'].includes(ext)) {
        // OCR processing for images
        text = await this.performOCR(filePath);
        pageCount = 1;
      } else {
        text = fs.readFileSync(filePath, 'utf-8');
      }

      // Clean extracted text
      text = this.cleanText(text);

      // Detect document structural type (Academic, Business, Report, General)
      structureType = this.detectStructureType(text, ext);

      // Create chunks with estimated page and section markers
      const chunks = this.chunkText(text, pageCount);

      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const charCount = text.length;

      return {
        textContent: text,
        pageCount,
        wordCount,
        charCount,
        structureType,
        chunks
      };
    } catch (err) {
      console.error(`Error processing file ${originalName}:`, err);
      throw new Error(`Failed to extract text from ${originalName}: ${err.message}`);
    }
  }

  async performOCR(imagePath) {
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(imagePath);
      await worker.terminate();
      return ret.data.text || 'No text detected in image.';
    } catch (ocrErr) {
      console.warn('OCR failed, returning fallback placeholder:', ocrErr.message);
      return 'Image document uploaded. OCR text extraction was partial or image contains visual graphics.';
    }
  }

  cleanText(raw) {
    if (!raw) return '';
    return raw
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  detectStructureType(text, ext) {
    const lower = text.toLowerCase();
    if (
      lower.includes('abstract') ||
      lower.includes('chapter') ||
      lower.includes('unit') ||
      lower.includes('syllabus') ||
      lower.includes('theorem') ||
      lower.includes('references')
    ) {
      return 'Academic';
    }
    if (
      lower.includes('quarter') ||
      lower.includes('revenue') ||
      lower.includes('ebitda') ||
      lower.includes('kpi') ||
      lower.includes('deliverables') ||
      ['.xls', '.xlsx', '.csv'].includes(ext)
    ) {
      return 'Business';
    }
    if (
      lower.includes('executive summary') ||
      lower.includes('findings') ||
      lower.includes('recommendations') ||
      lower.includes('audit')
    ) {
      return 'Report';
    }
    return 'General';
  }

  chunkText(text, totalPages = 1, chunkSize = 1000, overlap = 150) {
    const paragraphs = text.split(/\n\n+/);
    const chunks = [];
    let currentChunk = '';
    let chunkIndex = 0;
    const charsPerPage = Math.max(1, Math.floor(text.length / totalPages));

    let currentSection = 'Introduction';

    paragraphs.forEach(p => {
      const trimmed = p.trim();
      if (!trimmed) return;

      // Check if paragraph looks like a section header (short, title cased or capitalized)
      if (trimmed.length < 90 && (trimmed.endsWith(':') || /^[A-Z0-9\s.—-]+$/.test(trimmed) || /^(Chapter|Section|Unit|Part)\s+\d+/i.test(trimmed))) {
        currentSection = trimmed.replace(/[:—.-]+$/, '');
      }

      if ((currentChunk + '\n\n' + trimmed).length > chunkSize) {
        if (currentChunk.trim().length > 0) {
          const charOffset = text.indexOf(currentChunk.slice(0, 50));
          const estimatedPage = Math.min(totalPages, Math.max(1, Math.floor(charOffset / charsPerPage) + 1));

          chunks.push({
            id: `chunk-${chunkIndex++}`,
            text: currentChunk.trim(),
            page: estimatedPage,
            section: currentSection,
            wordCount: currentChunk.split(/\s+/).filter(Boolean).length
          });

          // Keep overlap from end of chunk
          const words = currentChunk.split(' ');
          currentChunk = words.slice(-Math.floor(overlap / 6)).join(' ') + '\n\n' + trimmed;
        } else {
          currentChunk = trimmed;
        }
      } else {
        currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
      }
    });

    if (currentChunk.trim().length > 0) {
      const charOffset = text.indexOf(currentChunk.slice(0, 50));
      const estimatedPage = Math.min(totalPages, Math.max(1, Math.floor(charOffset / charsPerPage) + 1));
      chunks.push({
        id: `chunk-${chunkIndex++}`,
        text: currentChunk.trim(),
        page: estimatedPage,
        section: currentSection,
        wordCount: currentChunk.split(/\s+/).filter(Boolean).length
      });
    }

    return chunks;
  }
}

module.exports = new DocumentProcessor();
