const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

const EXPORTS_DIR = path.join(__dirname, '../../exports');

if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

class ExportService {
  /**
   * Generates formatted PDF export with Nexora AI header & footer
   */
  async generatePDF(title, contentBlocks, filenamePrefix = 'NexoraAI_Report') {
    return new Promise((resolve, reject) => {
      const fileName = `${filenamePrefix}_${Date.now()}.pdf`;
      const filePath = path.join(EXPORTS_DIR, fileName);
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header Banner
      doc
        .fontSize(22)
        .fillColor('#4338CA') // Indigo
        .text('NEXORA AI', { align: 'left' })
        .fontSize(10)
        .fillColor('#64748B')
        .text('Turn Documents Into Knowledge. | https://nexora.ai', { align: 'left' })
        .moveDown(0.5);

      // Horizontal separator line
      doc
        .strokeColor('#E2E8F0')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(1);

      // Report Title & Metadata
      doc
        .fontSize(18)
        .fillColor('#0F172A')
        .text(title, { bold: true })
        .moveDown(0.3)
        .fontSize(9)
        .fillColor('#64748B')
        .text(`Generated on: ${new Date().toLocaleString()} | Source-grounded by Nexora Neural Engine`)
        .moveDown(1);

      // Content Blocks
      contentBlocks.forEach(block => {
        if (block.heading) {
          doc
            .fontSize(14)
            .fillColor('#1E293B')
            .text(block.heading, { underline: false })
            .moveDown(0.3);
        }

        if (block.text) {
          doc
            .fontSize(10)
            .fillColor('#334155')
            .lineGap(3)
            .text(block.text, { align: 'justify' })
            .moveDown(0.8);
        }

        if (block.list && Array.isArray(block.list)) {
          block.list.forEach(item => {
            doc
              .fontSize(10)
              .fillColor('#334155')
              .text(`• ${item}`, { indent: 15 })
              .moveDown(0.2);
          });
          doc.moveDown(0.6);
        }
      });

      // Footer
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor('#94A3B8')
          .text(
            `Nexora AI — Page ${i + 1} of ${range.count} | Confidential & Private`,
            50,
            doc.page.height - 40,
            { align: 'center', width: 495 }
          );
      }

      doc.end();

      stream.on('finish', () => resolve({ filePath, fileName }));
      stream.on('error', err => reject(err));
    });
  }

  /**
   * Generates formatted Word (.docx) document
   */
  async generateDOCX(title, contentBlocks, filenamePrefix = 'NexoraAI_Doc') {
    const fileName = `${filenamePrefix}_${Date.now()}.docx`;
    const filePath = path.join(EXPORTS_DIR, fileName);

    const docChildren = [
      new Paragraph({
        text: 'NEXORA AI',
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Report: ${title}\nGenerated on: ${new Date().toLocaleString()}\nBrand: Nexora AI — Turn Documents Into Knowledge.\n`,
            italics: true,
            color: '64748B'
          })
        ]
      })
    ];

    contentBlocks.forEach(block => {
      if (block.heading) {
        docChildren.push(
          new Paragraph({
            text: block.heading,
            heading: HeadingLevel.HEADING_2
          })
        );
      }
      if (block.text) {
        docChildren.push(
          new Paragraph({
            text: block.text
          })
        );
      }
      if (block.list && Array.isArray(block.list)) {
        block.list.forEach(item => {
          docChildren.push(
            new Paragraph({
              text: `• ${item}`
            })
          );
        });
      }
    });

    const doc = new Document({
      sections: [{ properties: {}, children: docChildren }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
    return { filePath, fileName };
  }

  /**
   * Generates Excel (.xlsx) file
   */
  async generateXLSX(dataArray, sheetName = 'NexoraData', filenamePrefix = 'NexoraAI_Data') {
    const fileName = `${filenamePrefix}_${Date.now()}.xlsx`;
    const filePath = path.join(EXPORTS_DIR, fileName);

    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, filePath);
    return { filePath, fileName };
  }

  /**
   * Generates Markdown / Text / HTML / JSON export
   */
  async generateTextFormat(content, format = 'md', filenamePrefix = 'NexoraAI') {
    const fileName = `${filenamePrefix}_${Date.now()}.${format}`;
    const filePath = path.join(EXPORTS_DIR, fileName);

    let textPayload = '';
    if (typeof content === 'string') {
      textPayload = content;
    } else if (format === 'json') {
      textPayload = JSON.stringify(content, null, 2);
    } else {
      textPayload = JSON.stringify(content, null, 2);
    }

    fs.writeFileSync(filePath, textPayload, 'utf-8');
    return { filePath, fileName };
  }
}

module.exports = new ExportService();
