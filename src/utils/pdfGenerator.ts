/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';

export interface ActivityPage {
  id: string;
  title: string;
  category: string;
  dataUrl: string; // Decoupled snapshot data URL
  instructions?: string;
  answerKey?: string;
}

export interface ActivityBookMeta {
  title: string;
  subtitle: string;
  childName?: string;
  theme: string;
  pageSize: 'a4' | 'letter' | 'a5';
  orientation: 'portrait' | 'landscape';
}

/**
 * Compiles a high-DPI, print-ready PDF book with cover page and individual worksheets.
 * Enforces letterboxing and aspect-ratio preservation so illustrations are never distorted.
 */
export async function exportActivityBookPDF(
  meta: ActivityBookMeta,
  pages: ActivityPage[]
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: meta.orientation,
    unit: 'mm',
    format: meta.pageSize,
  });

  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();

  // 1. COVER PAGE
  pdf.setFillColor(255, 253, 249);
  pdf.rect(0, 0, pw, ph, 'F');

  // Decorative border frames
  pdf.setDrawColor(108, 92, 231); // #6C5CE7
  pdf.setLineWidth(2);
  pdf.roundedRect(10, 10, pw - 20, ph - 20, 6, 6, 'S');

  pdf.setDrawColor(253, 121, 168); // #FD79A8
  pdf.setLineWidth(0.8);
  pdf.roundedRect(13, 13, pw - 26, ph - 26, 4, 4, 'S');

  // Brand Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setTextColor(45, 55, 72);
  pdf.text('COLORCRAFT AI', pw / 2, 42, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(113, 128, 150);
  pdf.text('Create, Learn, Color & Play!', pw / 2, 50, { align: 'center' });

  // Main Book Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(108, 92, 231);
  pdf.text(meta.title.toUpperCase(), pw / 2, 88, { align: 'center', maxWidth: pw - 40 });

  if (meta.subtitle) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(14);
    pdf.setTextColor(74, 85, 104);
    pdf.text(meta.subtitle, pw / 2, 100, { align: 'center', maxWidth: pw - 50 });
  }

  // Personalization Badge Card
  if (meta.childName && meta.childName.trim().length > 0) {
    const cardWidth = Math.min(120, pw - 60);
    const cardX = (pw - cardWidth) / 2;
    pdf.setFillColor(243, 240, 255);
    pdf.roundedRect(cardX, 125, cardWidth, 24, 4, 4, 'F');
    pdf.setDrawColor(108, 92, 231);
    pdf.roundedRect(cardX, 125, cardWidth, 24, 4, 4, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(108, 92, 231);
    pdf.text('SPECIALLY CREATED FOR', pw / 2, 133, { align: 'center' });

    pdf.setFontSize(15);
    pdf.setTextColor(45, 55, 72);
    pdf.text(meta.childName.trim(), pw / 2, 143, { align: 'center' });
  }

  // Cover Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(160, 174, 192);
  pdf.text(`Theme: ${meta.theme} • Contains ${pages.length} Custom Activities`, pw / 2, ph - 20, { align: 'center' });

  // 2. SUBSEQUENT WORKSHEET PAGES
  for (let i = 0; i < pages.length; i++) {
    pdf.addPage();
    const page = pages[i];

    // Page Border
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, pw - 20, ph - 20);

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(45, 55, 72);
    pdf.text(page.title, 16, 21);

    // Category
    pdf.setFontSize(9.5);
    pdf.setTextColor(108, 92, 231);
    pdf.text(`Activity #${i + 1} | ${page.category}`, pw - 16, 21, { align: 'right' });

    // Instructions
    if (page.instructions) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(page.instructions, 16, 27, { maxWidth: pw - 32 });
    }

    // Embed Image with Aspect Ratio Preservation (Letterboxing)
    const maxRenderW = pw - 32;
    const maxRenderH = ph - 48;
    const renderStartX = 16;
    const renderStartY = 31;

    try {
      const imgProps = pdf.getImageProperties(page.dataUrl);
      const aspect = imgProps.width / imgProps.height;

      let targetW = maxRenderW;
      let targetH = targetW / aspect;

      if (targetH > maxRenderH) {
        targetH = maxRenderH;
        targetW = targetH * aspect;
      }

      const offsetX = renderStartX + (maxRenderW - targetW) / 2;
      const offsetY = renderStartY + (maxRenderH - targetH) / 2;

      pdf.addImage(page.dataUrl, 'PNG', offsetX, offsetY, targetW, targetH, undefined, 'FAST');
    } catch {
      // Fallback in case of invalid data URL
      pdf.addImage(page.dataUrl, 'PNG', renderStartX, renderStartY, maxRenderW, maxRenderH, undefined, 'FAST');
    }

    // Page Footer
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(160, 174, 192);
    pdf.text('ColorCraft AI • www.colorcraft.ai', 16, ph - 13);
    pdf.text(`Page ${i + 1} of ${pages.length}`, pw - 16, ph - 13, { align: 'right' });
  }

  return pdf.output('blob');
}
