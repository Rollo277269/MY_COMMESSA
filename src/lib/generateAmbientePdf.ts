import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

// Standard CER codes for construction/demolition waste
export const CER_TABLE: { codice: string; descrizione: string; pericoloso: boolean }[] = [
  { codice: "17 01 01", descrizione: "Cemento", pericoloso: false },
  { codice: "17 01 02", descrizione: "Mattoni", pericoloso: false },
  { codice: "17 01 03", descrizione: "Mattonelle e ceramiche", pericoloso: false },
  { codice: "17 01 07", descrizione: "Miscugli di cemento, mattoni, mattonelle e ceramiche (diversi da 17 01 06*)", pericoloso: false },
  { codice: "17 02 01", descrizione: "Legno", pericoloso: false },
  { codice: "17 02 02", descrizione: "Vetro", pericoloso: false },
  { codice: "17 02 03", descrizione: "Plastica", pericoloso: false },
  { codice: "17 02 04*", descrizione: "Vetro, plastica e legno contenenti o contaminati da sostanze pericolose", pericoloso: true },
  { codice: "17 03 02", descrizione: "Miscele bituminose diverse da 17 03 01*", pericoloso: false },
  { codice: "17 04 01", descrizione: "Rame, bronzo, ottone", pericoloso: false },
  { codice: "17 04 02", descrizione: "Alluminio", pericoloso: false },
  { codice: "17 04 05", descrizione: "Ferro e acciaio", pericoloso: false },
  { codice: "17 04 07", descrizione: "Metalli misti", pericoloso: false },
  { codice: "17 04 11", descrizione: "Cavi diversi da 17 04 10*", pericoloso: false },
  { codice: "17 05 04", descrizione: "Terra e rocce diverse da 17 05 03*", pericoloso: false },
  { codice: "17 05 06", descrizione: "Fanghi di dragaggio diversi da 17 05 05*", pericoloso: false },
  { codice: "17 06 04", descrizione: "Materiali isolanti diversi da 17 06 01* e 17 06 03*", pericoloso: false },
  { codice: "17 08 02", descrizione: "Materiali da costruzione a base di gesso diversi da 17 08 01*", pericoloso: false },
  { codice: "17 09 04", descrizione: "Rifiuti misti da costruzione e demolizione diversi da 17 09 01*, 02*, 03*", pericoloso: false },
  { codice: "15 01 01", descrizione: "Imballaggi in carta e cartone", pericoloso: false },
  { codice: "15 01 02", descrizione: "Imballaggi in plastica", pericoloso: false },
  { codice: "15 01 03", descrizione: "Imballaggi in legno", pericoloso: false },
  { codice: "15 01 06", descrizione: "Imballaggi in materiali misti", pericoloso: false },
  { codice: "08 01 11*", descrizione: "Pitture e vernici di scarto contenenti solventi organici o altre sostanze pericolose", pericoloso: true },
  { codice: "08 01 12", descrizione: "Pitture e vernici di scarto diverse da 08 01 11*", pericoloso: false },
  { codice: "20 01 21*", descrizione: "Tubi fluorescenti e altri rifiuti contenenti mercurio", pericoloso: true },
  { codice: "16 02 13*", descrizione: "Apparecchiature fuori uso contenenti componenti pericolosi", pericoloso: true },
  { codice: "13 02 05*", descrizione: "Scarti di oli minerali per motori, ingranaggi e lubrificazione", pericoloso: true },
];

export interface AmbientePdfData {
  commessa: {
    commessa_consortile?: string | null;
    committente?: string | null;
    oggetto_lavori?: string | null;
    cup?: string | null;
    cig?: string | null;
    impresa_assegnataria?: string | null;
  } | null;
  analisi: {
    aspetti_critici: string;
    gestione_rifiuti: string;
    cam_progetto: string;
  };
  revision: number;
  cerTable: typeof CER_TABLE;
  selectedCerCodes?: string[];
}

export async function generateAmbientePdf(data: AmbientePdfData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const marginL = 15;
  const marginR = 15;
  const contentW = pw - marginL - marginR;

  // Load logo
  let logoDataUrl: string | null = null;
  try {
    const { default: logoSrc } = await import("@/assets/agis-logo.png");
    logoDataUrl = await loadImageAsDataUrl(logoSrc);
  } catch { /* ignore */ }

  // Helper: add header/footer to each page
  const addHeaderFooter = (pageNum: number, totalPages: number) => {
    // Header line
    doc.setDrawColor(41, 65, 122);
    doc.setLineWidth(0.5);
    doc.line(marginL, 28, pw - marginR, 28);

    // Logo
    if (logoDataUrl) {
      try { doc.addImage(logoDataUrl, "PNG", pw - marginR - 18, 5, 18, 14); } catch {}
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(`Piano di Gestione Ambientale — Rev. ${String(data.revision).padStart(2, "0")}`, marginL, ph - 8);
    doc.text(`Pag. ${pageNum} / ${totalPages}`, pw - marginR, ph - 8, { align: "right" });
    const now = new Date();
    doc.text(`Stampato il ${now.toLocaleDateString("it-IT")} alle ${now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`, pw / 2, ph - 8, { align: "center" });
    doc.setTextColor(0, 0, 0);
  };

  // =================== COVER PAGE ===================
  // Title block
  doc.setFillColor(41, 65, 122);
  doc.rect(0, 55, pw, 40, "F");

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("PIANO DI GESTIONE AMBIENTALE", pw / 2, 72, { align: "center" });

  doc.setFontSize(11);
  doc.text(`Revisione ${String(data.revision).padStart(2, "0")}`, pw / 2, 82, { align: "center" });

  doc.setTextColor(0, 0, 0);

  // Commessa info
  let y = 110;
  doc.setFontSize(10);

  const infoRows: [string, string][] = [];
  if (data.commessa?.commessa_consortile) infoRows.push(["Commessa N.", data.commessa.commessa_consortile]);
  if (data.commessa?.oggetto_lavori) infoRows.push(["Oggetto dei lavori", data.commessa.oggetto_lavori]);
  if (data.commessa?.committente) infoRows.push(["Committente", data.commessa.committente]);
  if (data.commessa?.cup) infoRows.push(["CUP", data.commessa.cup]);
  if (data.commessa?.cig) infoRows.push(["CIG", data.commessa.cig]);
  if (data.commessa?.impresa_assegnataria) infoRows.push(["Impresa esecutrice", data.commessa.impresa_assegnataria]);

  if (infoRows.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [],
      body: infoRows,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, textColor: [41, 65, 122] },
        1: { cellWidth: contentW - 50 },
      },
      margin: { left: marginL, right: marginR },
    });
  }

  // Logo on cover
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", pw - marginR - 24, 12, 24, 18); } catch {}
  }

  // Revision date
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Data: ${dateStr}`, marginL, ph - 30);
  doc.setTextColor(0, 0, 0);

  // =================== CONTENT PAGES ===================
  doc.addPage();

  // INDEX
  y = 35;
  doc.setFontSize(14);
  doc.setTextColor(41, 65, 122);
  doc.text("INDICE", marginL, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  const indexItems = [
    "1. Aspetti critici e peculiarità ambientali del cantiere",
    "2. Gestione rifiuti di cantiere",
    "3. Criteri Ambientali Minimi (CAM) di progetto",
    "4. Tabella codici CER — Rifiuti da costruzione e demolizione",
  ];

  doc.setFontSize(10);
  for (const item of indexItems) {
    doc.text(item, marginL + 5, y);
    y += 7;
  }

  // Section helper
  const addSection = (title: string, sectionNum: string, content: string) => {
    // Check if we need a new page
    if (y > ph - 50) {
      doc.addPage();
      y = 35;
    }

    y += 8;
    doc.setFontSize(13);
    doc.setTextColor(41, 65, 122);
    doc.text(`${sectionNum}. ${title}`, marginL, y);
    doc.setDrawColor(41, 65, 122);
    doc.setLineWidth(0.3);
    doc.line(marginL, y + 2, pw - marginR, y + 2);
    doc.setTextColor(0, 0, 0);
    y += 10;

    if (!content.trim()) {
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Sezione non compilata.", marginL, y);
      doc.setTextColor(0, 0, 0);
      y += 8;
      return;
    }

    doc.setFontSize(9);
    const lines = doc.splitTextToSize(content, contentW);
    for (const line of lines) {
      if (y > ph - 20) {
        doc.addPage();
        y = 35;
      }
      doc.text(line, marginL, y);
      y += 4.5;
    }
    y += 4;
  };

  // Add sections
  y += 10;
  addSection("Aspetti critici e peculiarità ambientali del cantiere", "1", data.analisi.aspetti_critici);
  addSection("Gestione rifiuti di cantiere", "2", data.analisi.gestione_rifiuti);
  addSection("Criteri Ambientali Minimi (CAM) di progetto", "3", data.analisi.cam_progetto);

  // =================== CER TABLE ===================
  if (y > ph - 60) {
    doc.addPage();
    y = 35;
  }

  y += 8;
  doc.setFontSize(13);
  doc.setTextColor(41, 65, 122);
  doc.text("4. Tabella codici CER — Rifiuti da costruzione e demolizione", marginL, y);
  doc.setDrawColor(41, 65, 122);
  doc.setLineWidth(0.3);
  doc.line(marginL, y + 2, pw - marginR, y + 2);
  doc.setTextColor(0, 0, 0);
  y += 8;

  doc.setFontSize(8);
  const hasSelection = data.selectedCerCodes && data.selectedCerCodes.length > 0;
  doc.text(
    hasSelection
      ? "Codici CER pertinenti alle lavorazioni di cantiere (evidenziati in grassetto). I codici non pertinenti sono riportati in grigio."
      : "Elenco dei principali codici CER potenzialmente producibili dalle lavorazioni di cantiere.",
    marginL, y
  );
  y += 6;

  const cerBody = data.cerTable.map((row) => [
    row.codice,
    row.descrizione,
    row.pericoloso ? "Sì" : "No",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Codice CER", "Descrizione", "Pericoloso"]],
    body: cerBody,
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [41, 65, 122], textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold" },
      1: { cellWidth: contentW - 22 - 20 },
      2: { cellWidth: 20, halign: "center" },
    },
    margin: { left: marginL, right: marginR },
    didParseCell: (hookData: any) => {
      if (hookData.section === "body" && hookData.row.index !== undefined) {
        const cer = data.cerTable[hookData.row.index];
        const isSelected = !hasSelection || data.selectedCerCodes?.includes(cer.codice);
        if (cer?.pericoloso && isSelected) {
          hookData.cell.styles.textColor = [180, 30, 30];
          hookData.cell.styles.fillColor = [255, 240, 240];
        } else if (!isSelected) {
          hookData.cell.styles.textColor = [180, 180, 180];
          hookData.cell.styles.fontStyle = "normal";
        } else {
          // Selected, non-hazardous: subtle highlight
          hookData.cell.styles.fillColor = [240, 247, 255];
        }
      }
    },
  });

  // Apply headers/footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i - 1, totalPages - 1);
  }

  const commNum = data.commessa?.commessa_consortile || "commessa";
  doc.save(`PGA_${commNum}_Rev${String(data.revision).padStart(2, "0")}.pdf`);
}
