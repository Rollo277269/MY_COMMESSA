import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PdqTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface PdqSection {
  number: string;
  title: string;
  content: string;
  tables?: PdqTable[];
}

export interface PdqData {
  sections: PdqSection[];
}

interface PdqPdfOptions {
  data: PdqData;
  commessaLabel: string;
  oggettoLavori?: string;
  committente?: string;
  impresa?: string;
  revision: number;
  logoSrc?: string;
}

function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export async function generatePdqPdf(opts: PdqPdfOptions): Promise<Blob> {
  const { data, commessaLabel, oggettoLavori, committente, impresa, revision, logoSrc } = opts;
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // Brand colors
  const navy: [number, number, number] = [15, 32, 65];
  const steel: [number, number, number] = [55, 80, 120];
  const accent: [number, number, number] = [0, 120, 180];
  const darkText: [number, number, number] = [30, 30, 30];
  const grayText: [number, number, number] = [100, 100, 100];
  const lightBg: [number, number, number] = [240, 243, 248];

  let logoDataUrl: string | null = null;
  if (logoSrc) {
    try { logoDataUrl = await loadImageAsDataUrl(logoSrc); } catch {}
  }

  const dateStr = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  // ═══════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════

  // Full navy background
  doc.setFillColor(...navy);
  doc.rect(0, 0, pw, ph, "F");

  // Accent stripe at top
  doc.setFillColor(...accent);
  doc.rect(0, 0, pw, 4, "F");

  // Logo top-right
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", pw - 50, 15, 32, 25); } catch {}
  }

  // Document type label
  doc.setTextColor(0, 180, 220);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("SISTEMA DI GESTIONE INTEGRATO", 20, 45);

  // Horizontal rule
  doc.setDrawColor(0, 180, 220);
  doc.setLineWidth(0.8);
  doc.line(20, 50, pw - 20, 50);

  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("PIANO", 20, 80);
  doc.text("DI QUALITÀ", 20, 96);

  // Revision badge
  doc.setFillColor(...accent);
  doc.roundedRect(20, 108, 50, 12, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`REVISIONE ${String(revision).padStart(2, "0")}`, 25, 116);

  // Date next to badge
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 195, 220);
  doc.text(dateStr, 76, 116);

  // Commessa info box
  const boxY = 145;
  doc.setFillColor(25, 45, 85);
  doc.roundedRect(20, boxY, pw - 40, 70, 3, 3, "F");

  // Left border accent on box
  doc.setFillColor(...accent);
  doc.rect(20, boxY, 3, 70, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 150, 190);

  const infoItems = [
    { label: "COMMESSA", value: commessaLabel || "—" },
    { label: "OGGETTO DEI LAVORI", value: oggettoLavori || "—" },
    { label: "COMMITTENTE", value: committente || "—" },
    { label: "IMPRESA ESECUTRICE", value: impresa || "—" },
  ];

  let iy = boxY + 14;
  for (const item of infoItems) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 150, 190);
    doc.text(item.label, 30, iy);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    const valueLines = doc.splitTextToSize(item.value, pw - 70);
    doc.text(valueLines[0] || "—", 30, iy + 6);
    iy += 16;
  }

  // Certifications footer
  const certY = ph - 50;
  doc.setDrawColor(40, 60, 100);
  doc.setLineWidth(0.3);
  doc.line(20, certY, pw - 20, certY);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 130, 170);
  const certs = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 39001", "ISO 37001", "SA 8000"];
  const certSpacing = (pw - 40) / certs.length;
  certs.forEach((cert, i) => {
    doc.text(cert, 20 + i * certSpacing, certY + 10);
  });

  // Confidentiality notice
  doc.setFontSize(6);
  doc.setTextColor(70, 90, 130);
  doc.text("Documento riservato — Uso interno del Sistema di Gestione Integrato", pw / 2, ph - 12, { align: "center" });

  // ═══════════════════════════════════════
  // INDEX PAGE
  // ═══════════════════════════════════════
  doc.addPage();
  let y = 20;

  // Header bar
  doc.setFillColor(...navy);
  doc.rect(0, 0, pw, 28, "F");
  doc.setFillColor(...accent);
  doc.rect(0, 28, pw, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INDICE", 14, 18);

  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", pw - 30, 6, 16, 12); } catch {}
  }

  y = 38;

  doc.setTextColor(...darkText);
  for (const section of data.sections) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navy);
    doc.text(`${section.number}.`, 14, y);
    doc.text(section.title, 24, y);

    // Dotted line to page indicator
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([1, 1], 0);
    const titleW = doc.getTextWidth(section.title) + 26;
    doc.line(titleW, y - 0.5, pw - 20, y - 0.5);
    doc.setLineDashPattern([], 0);

    y += 7;
  }

  // ═══════════════════════════════════════
  // CONTENT PAGES
  // ═══════════════════════════════════════

  function addPageHeader() {
    doc.setFillColor(...navy);
    doc.rect(0, 0, pw, 16, "F");
    doc.setFillColor(...accent);
    doc.rect(0, 16, pw, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`Piano di Qualità — ${commessaLabel} — Rev. ${String(revision).padStart(2, "0")}`, 14, 10);
    if (logoDataUrl) {
      try { doc.addImage(logoDataUrl, "PNG", pw - 26, 3, 12, 9); } catch {}
    }
  }

  function checkPage(need: number) {
    if (y + need > ph - 22) {
      doc.addPage();
      addPageHeader();
      y = 24;
    }
  }

  for (const section of data.sections) {
    doc.addPage();
    addPageHeader();
    y = 24;

    // Section title bar
    doc.setFillColor(...lightBg);
    doc.rect(14, y, pw - 28, 10, "F");
    doc.setFillColor(...accent);
    doc.rect(14, y, 3, 10, "F");

    doc.setTextColor(...navy);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${section.number}. ${section.title}`, 21, y + 7);
    y += 16;

    // Content text
    if (section.content) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...darkText);
      const lines = doc.splitTextToSize(section.content, pw - 28);
      for (const line of lines) {
        checkPage(5);
        doc.text(line, 14, y);
        y += 4;
      }
      y += 4;
    }

    // Tables
    if (section.tables) {
      for (const table of section.tables) {
        checkPage(18);
        if (table.title) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...steel);
          doc.text(table.title, 14, y);
          y += 6;
        }

        if (table.headers?.length && table.rows?.length) {
          autoTable(doc, {
            startY: y,
            head: [table.headers],
            body: table.rows,
            theme: "grid",
            headStyles: {
              fillColor: navy,
              textColor: [255, 255, 255],
              fontSize: 7,
              cellPadding: 2.5,
              fontStyle: "bold",
            },
            bodyStyles: {
              fontSize: 7,
              cellPadding: 2,
              textColor: darkText,
            },
            alternateRowStyles: {
              fillColor: [245, 248, 252],
            },
            styles: {
              lineColor: [200, 210, 225],
              lineWidth: 0.3,
            },
            margin: { left: 14, right: 14 },
          });
          y = (doc as any).lastAutoTable.finalY + 8;
        }
      }
    }
  }

  // ═══════════════════════════════════════
  // FOOTER on all pages (skip cover)
  // ═══════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    // Bottom line
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.5);
    doc.line(14, ph - 14, pw - 14, ph - 14);
    // Footer text
    doc.setFontSize(6.5);
    doc.setTextColor(...grayText);
    doc.text(`Piano di Qualità — Commessa ${commessaLabel} — Rev. ${String(revision).padStart(2, "0")}`, 14, ph - 9);
    doc.text(`Pagina ${i - 1} di ${totalPages - 1}`, pw - 14, ph - 9, { align: "right" });
  }

  return doc.output("blob");
}
