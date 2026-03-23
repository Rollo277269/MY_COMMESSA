import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fmtCurrency } from "@/components/fatture/types";
import type { Fattura, CentroImputazione } from "@/components/fatture/types";

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

export interface EconomiaCssrPdfData {
  commessaLabel: string;
  fatture: Fattura[];
  centri: CentroImputazione[];
  filteredFatture: Fattura[];
  quotaLavoriPct: number;
  quotaServiziPct: number;
  ivaStats: {
    ivaVendite: number;
    ivaAcquisti: number;
    ivaSplitVendite: number;
    ivaSplitAcquisti: number;
  };
  chartImages?: string[];
}

export async function generateEconomiaCssrPdf(data: EconomiaCssrPdfData, logoSrc?: string): Promise<Blob> {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  let y = 0;

  const blue: [number, number, number] = [30, 64, 120];
  const gray: [number, number, number] = [100, 100, 100];
  const darkGray: [number, number, number] = [40, 40, 40];
  const greenC: [number, number, number] = [40, 160, 80];
  const redC: [number, number, number] = [200, 50, 50];

  function checkPage(need: number) {
    if (y + need > ph - 20) { doc.addPage(); y = 15; }
  }

  function sectionTitle(title: string) {
    checkPage(14);
    doc.setFillColor(...blue);
    doc.rect(14, y, pw - 28, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, 18, y + 5.5);
    y += 12;
    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "normal");
  }

  // ═══ HEADER ═══
  let logoDataUrl: string | null = null;
  if (logoSrc) {
    try { logoDataUrl = await loadImageAsDataUrl(logoSrc); } catch {}
  }

  doc.setFillColor(...blue);
  doc.rect(0, 0, pw, 28, "F");
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", pw - 32, 5, 18, 14); } catch {}
  }
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ECONOMIA CSSR", 14, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(data.commessaLabel || "", 14, 20);
  const rightEdge = logoDataUrl ? pw - 36 : pw - 14;
  doc.text(`Generato il ${new Date().toLocaleDateString("it-IT")}`, rightEdge, 20, { align: "right" });
  y = 34;

  // ═══ KPI ═══
  const vendite = data.fatture.filter((f) => f.tipo === "vendita");
  const acquisti = data.fatture.filter((f) => f.tipo === "acquisto");
  const totVendite = vendite.reduce((s, f) => s + Number(f.importo_totale), 0);
  const totAcquisti = acquisti.reduce((s, f) => s + Number(f.importo_totale), 0);
  const margine = totVendite - totAcquisti;

  sectionTitle("RIEPILOGO KPI");
  const kpis = [
    ["Totale Ricavi", fmtCurrency(totVendite)],
    ["Totale Costi", fmtCurrency(totAcquisti)],
    ["Margine", fmtCurrency(margine)],
    ["Fatture Totali", String(data.fatture.length)],
    [`Quota lavori (${data.quotaLavoriPct}%)`, fmtCurrency(totVendite * data.quotaLavoriPct / 100)],
    [`Quota servizi (${data.quotaServiziPct}%)`, fmtCurrency(totVendite * data.quotaServiziPct / 100)],
  ];
  doc.setFontSize(9);
  const kpiColW = (pw - 28) / 3;
  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 14 + col * kpiColW;
    const ky = y + row * 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(kpi[0], x + 2, ky);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text(kpi[1], x + 2, ky + 5);
  });
  y += Math.ceil(kpis.length / 3) * 12 + 4;

  // ═══ GRAFICI ═══
  if (data.chartImages && data.chartImages.length > 0) {
    checkPage(70);
    sectionTitle("GRAFICI ANDAMENTO");

    const chartCount = data.chartImages.length;
    const totalW = pw - 28;
    const gap = 3;
    const chartW = (totalW - gap * (chartCount - 1)) / chartCount;
    const chartH = chartW * 0.65;

    data.chartImages.forEach((imgData, i) => {
      const xPos = 14 + i * (chartW + gap);
      try {
        doc.addImage(imgData, "PNG", xPos, y, chartW, chartH);
      } catch {}
    });
    y += chartH + 6;
  }

  // ═══ COMPARAZIONE CENTRI RICAVO vs COSTO ═══
  const centriRicavo = data.centri.filter((c) => c.tipo === "ricavo");
  const centriCosto = data.centri.filter((c) => c.tipo === "costo");

  if (centriRicavo.length > 0 || centriCosto.length > 0) {
    checkPage(40);
    sectionTitle("COMPARAZIONE CENTRI DI RICAVO / COSTO");

    const maxRows = Math.max(centriRicavo.length, centriCosto.length);
    const tableBody: string[][] = [];

    let totRicavo = 0;
    let totCosto = 0;

    for (let i = 0; i < maxRows; i++) {
      const cr = centriRicavo[i];
      const cc = centriCosto[i];
      const valR = cr ? data.filteredFatture.filter((f) => f.tipo === "vendita" && f.cm_centro_imputazione_id === cr.id).reduce((s, f) => s + Number(f.importo_totale), 0) : 0;
      const valC = cc ? data.filteredFatture.filter((f) => f.tipo === "acquisto" && f.cm_centro_imputazione_id === cc.id).reduce((s, f) => s + Number(f.importo_totale), 0) : 0;
      if (cr) totRicavo += valR;
      if (cc) totCosto += valC;
      tableBody.push([
        cr?.nome || "",
        cr ? fmtCurrency(valR) : "",
        cc?.nome || "",
        cc ? fmtCurrency(valC) : "",
      ]);
    }

    tableBody.push(["TOTALE", fmtCurrency(totRicavo), "TOTALE", fmtCurrency(totCosto)]);

    autoTable(doc, {
      startY: y,
      head: [["Centro Ricavo", "Importo", "Centro Costo", "Importo"]],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: blue, fontSize: 8.5, textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 35, halign: "right" },
        2: { cellWidth: 45 },
        3: { cellWidth: 35, halign: "right" },
      },
      didParseCell: (hookData: any) => {
        if (hookData.section === "body" && hookData.row.index === tableBody.length - 1) {
          hookData.cell.styles.fontStyle = "bold";
          if (hookData.column.index <= 1) {
            hookData.cell.styles.fillColor = [230, 250, 235];
            hookData.cell.styles.textColor = greenC;
          } else {
            hookData.cell.styles.fillColor = [250, 230, 230];
            hookData.cell.styles.textColor = redC;
          }
        }
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    // Margine row
    checkPage(12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const diff = totRicavo - totCosto;
    doc.setTextColor(diff >= 0 ? greenC[0] : redC[0], diff >= 0 ? greenC[1] : redC[1], diff >= 0 ? greenC[2] : redC[2]);
    doc.text(`Margine (Ricavi - Costi): ${fmtCurrency(diff)}`, 18, y);
    y += 8;
    doc.setTextColor(...darkGray);
  }

  // ═══ RIEPILOGO IVA ═══
  sectionTitle("RIEPILOGO IVA");
  const ivaRows = [
    ["IVA ordinaria (emesse)", fmtCurrency(data.ivaStats.ivaVendite)],
    ["IVA split payment (emesse)", fmtCurrency(data.ivaStats.ivaSplitVendite)],
    ["IVA ordinaria (ricevute)", fmtCurrency(data.ivaStats.ivaAcquisti)],
    ["IVA split payment (ricevute)", fmtCurrency(data.ivaStats.ivaSplitAcquisti)],
  ];
  autoTable(doc, {
    startY: y,
    body: ivaRows,
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: { top: 1.5, bottom: 1.5, left: 4, right: 4 } },
    columnStyles: { 0: { textColor: gray, cellWidth: 90 }, 1: { fontStyle: "bold", textColor: darkGray, halign: "right" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ═══ FATTURE EMESSE ═══
  if (vendite.length > 0) {
    checkPage(30);
    sectionTitle("FATTURE EMESSE (RICAVI)");
    autoTable(doc, {
      startY: y,
      head: [["N°", "Data", "Cliente", "Imponibile", "IVA", "Totale", "Stato"]],
      body: vendite.map((f) => [
        f.numero,
        f.data ? new Date(f.data).toLocaleDateString("it-IT") : "",
        f.fornitore_cliente,
        fmtCurrency(f.importo),
        fmtCurrency(Number(f.importo_iva) || 0),
        fmtCurrency(Number(f.importo_totale) || 0),
        f.stato_pagamento === "pagato" ? "Pagato" : f.stato_pagamento === "parziale" ? "Parziale" : "Da pagare",
      ]),
      theme: "grid",
      headStyles: { fillColor: greenC, fontSize: 8, textColor: 255 },
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      columnStyles: { 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ═══ FATTURE RICEVUTE ═══
  if (acquisti.length > 0) {
    checkPage(30);
    sectionTitle("FATTURE RICEVUTE (COSTI)");
    autoTable(doc, {
      startY: y,
      head: [["N°", "Data", "Fornitore", "Imponibile", "IVA", "Totale", "Stato"]],
      body: acquisti.map((f) => [
        f.numero,
        f.data ? new Date(f.data).toLocaleDateString("it-IT") : "",
        f.fornitore_cliente,
        fmtCurrency(f.importo),
        fmtCurrency(Number(f.importo_iva) || 0),
        fmtCurrency(Number(f.importo_totale) || 0),
        f.stato_pagamento === "pagato" ? "Pagato" : f.stato_pagamento === "parziale" ? "Parziale" : "Da pagare",
      ]),
      theme: "grid",
      headStyles: { fillColor: redC, fontSize: 8, textColor: 255 },
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      columnStyles: { 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ═══ FOOTER ═══
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(
      `Economia CSSR — ${data.commessaLabel} — Pagina ${i}/${totalPages}`,
      pw / 2, ph - 8, { align: "center" }
    );
  }

  return doc.output("blob");
}
