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

interface ReportPdfData {
  commessa: {
    commessa_consortile?: string | null;
    committente?: string | null;
    oggetto_lavori?: string | null;
    cup?: string | null;
    cig?: string | null;
    cig_derivato?: string | null;
    impresa_assegnataria?: string | null;
    rup?: string | null;
    direttore_lavori?: string | null;
  } | null;
  dataRows: { label: string; value: string }[];
  counts: { documents: number; persons: number; companies: number; phases: number; avgProgress: number; cmeRows: number; sicurezza: number; ambiente: number };
  alerts: { level: string; title: string; desc: string }[];
  phaseData: { name: string; progress: number }[];
  economia: {
    importoBase: number;
    ribasso: number;
    importoContrattuale: number;
    oneriSicurezza: number;
    aggioPct: number;
    quotaConsorzio: number;
    importoConsorziata: number;
    quotaServiziPct?: number;
    quotaServizi?: number;
  };
}

function fmtC(val: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" as any }).format(val);
}

export async function generateReportCommessaPdf(data: ReportPdfData, logoSrc?: string): Promise<Blob> {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  let y = 0;

  const blue: [number, number, number] = [30, 64, 120];
  const gray: [number, number, number] = [100, 100, 100];
  const darkGray: [number, number, number] = [40, 40, 40];
  const red: [number, number, number] = [200, 50, 50];
  const orange: [number, number, number] = [200, 140, 30];
  const green: [number, number, number] = [40, 160, 80];

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
  doc.rect(0, 0, pw, 32, "F");

  // Logo top-right
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", pw - 32, 6, 18, 14); } catch {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("REPORT DI COMMESSA", 14, 14);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (data.commessa?.commessa_consortile) {
    doc.text(`Commessa N. ${data.commessa.commessa_consortile}`, 14, 22);
  }
  const rightEdge = logoDataUrl ? pw - 36 : pw - 14;
  if (data.commessa?.impresa_assegnataria) {
    doc.setFont("helvetica", "bold");
    doc.text(data.commessa.impresa_assegnataria, rightEdge, 14, { align: "right" });
    doc.setFont("helvetica", "normal");
  }
  doc.text(`Generato il ${new Date().toLocaleDateString("it-IT")}`, rightEdge, 22, { align: "right" });

  if (data.commessa?.oggetto_lavori) {
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(data.commessa.oggetto_lavori, pw - 28);
    doc.text(lines.slice(0, 2), 14, 28);
  }

  y = 38;

  // ═══ KPI ═══
  sectionTitle("INDICATORI CHIAVE (KPI)");
  
  const kpis = [
    ["Avanzamento", `${data.counts.avgProgress}%`],
    ["Fasi", String(data.counts.phases)],
    ["Documenti", String(data.counts.documents)],
    ["Persone", String(data.counts.persons)],
    ["Aziende", String(data.counts.companies)],
    ["Voci CME", String(data.counts.cmeRows)],
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

  // ═══ ALERTS ═══
  sectionTitle("CRITICITÀ E ALERT");
  doc.setFontSize(9);
  data.alerts.forEach((a) => {
    checkPage(10);
    const color = a.level === "critical" ? red : a.level === "warning" ? orange : green;
    doc.setTextColor(...color);
    doc.setFont("helvetica", "bold");
    const icon = a.level === "critical" ? "✗" : a.level === "warning" ? "⚠" : "✓";
    doc.text(`${icon}  ${a.title}`, 18, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(a.desc, 18, y + 4.5);
    y += 11;
  });

  // ═══ DATI COMMESSA ═══
  sectionTitle("DATI DELLA COMMESSA");

  autoTable(doc, {
    startY: y,
    body: data.dataRows.map((r) => [r.label, r.value]),
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: { top: 1.5, bottom: 1.5, left: 4, right: 4 } },
    columnStyles: {
      0: { fontStyle: "normal", textColor: gray, cellWidth: 65 },
      1: { fontStyle: "bold", textColor: darkGray },
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ═══ AVANZAMENTO LAVORI ═══
  if (data.phaseData.length > 0) {
    sectionTitle("AVANZAMENTO LAVORI");

    autoTable(doc, {
      startY: y,
      head: [["Fase", "Avanzamento", ""]],
      body: data.phaseData.map((p) => [
        p.name,
        `${p.progress}%`,
        "",
      ]),
      theme: "grid",
      headStyles: { fillColor: blue, fontSize: 8.5 },
      styles: { fontSize: 8.5, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: pw - 28 - 105 },
      },
      margin: { left: 14, right: 14 },
      didDrawCell: (hookData: any) => {
        // Draw progress bar in column 2
        if (hookData.section === "body" && hookData.column.index === 2) {
          const phase = data.phaseData[hookData.row.index];
          if (!phase) return;
          const cellX = hookData.cell.x + 2;
          const cellY = hookData.cell.y + hookData.cell.height / 2 - 2;
          const barW = hookData.cell.width - 4;
          const barH = 4;

          doc.setFillColor(230, 230, 230);
          doc.roundedRect(cellX, cellY, barW, barH, 1, 1, "F");

          const fillW = barW * (phase.progress / 100);
          if (fillW > 0) {
            const col = phase.progress >= 100 ? green : phase.progress > 0 ? [50, 120, 200] as [number, number, number] : gray;
            doc.setFillColor(...col);
            doc.roundedRect(cellX, cellY, fillW, barH, 1, 1, "F");
          }
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ═══ ECONOMIA - CONSORZIO ═══
  sectionTitle("ECONOMIA — VISTA CONSORZIO");

  const ecoConsorzio: string[][] = [
    ["Importo a base di gara", fmtC(data.economia.importoBase)],
    [`Ribasso (${data.economia.ribasso}%)`, `- ${fmtC(data.economia.importoBase * data.economia.ribasso / 100)}`],
    ["Importo contrattuale", fmtC(data.economia.importoContrattuale)],
    ["Oneri di sicurezza", fmtC(data.economia.oneriSicurezza)],
    [`Quota lavori consorzio (${data.economia.aggioPct}%)`, fmtC(data.economia.quotaConsorzio)],
  ];
  if ((data.economia.quotaServiziPct ?? 0) > 0) {
    ecoConsorzio.push([`Quota servizi tecnici (${data.economia.quotaServiziPct}%)`, fmtC(data.economia.quotaServizi ?? 0)]);
  }
  const totaleTrattenute = data.economia.quotaConsorzio + (data.economia.quotaServizi ?? 0);
  ecoConsorzio.push(
    ["Totale trattenute consorzio", fmtC(totaleTrattenute)],
    ["Importo alla consorziata", fmtC(data.economia.importoConsorziata)],
    ["Totale complessivo", fmtC(data.economia.importoContrattuale + data.economia.oneriSicurezza)],
  );

  autoTable(doc, {
    startY: y,
    body: ecoConsorzio,
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: { top: 1.5, bottom: 1.5, left: 4, right: 4 } },
    columnStyles: {
      0: { textColor: gray, cellWidth: 80 },
      1: { fontStyle: "bold", textColor: darkGray, halign: "right" },
    },
    didParseCell: (hookData: any) => {
      const idx = hookData.row.index;
      if (idx === 2 || idx === 4 || idx === 6) {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fillColor = [235, 240, 250];
      }
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ═══ ECONOMIA - CONSORZIATA ═══
  checkPage(40);
  sectionTitle("ECONOMIA — VISTA CONSORZIATA (ESECUTORE)");

  const ecoEsecutore = [
    ["Importo ricevuto dal consorzio", fmtC(data.economia.importoConsorziata)],
    ["Oneri di sicurezza", fmtC(data.economia.oneriSicurezza)],
    ["Manodopera", "€ 0"],
    ["Materiali", "€ 0"],
    ["Noli e trasporti", "€ 0"],
    ["Subappalti", "€ 0"],
    ["Spese generali", "€ 0"],
    ["Margine stimato", fmtC(data.economia.importoConsorziata)],
  ];

  autoTable(doc, {
    startY: y,
    body: ecoEsecutore,
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: { top: 1.5, bottom: 1.5, left: 4, right: 4 } },
    columnStyles: {
      0: { textColor: gray, cellWidth: 80 },
      1: { fontStyle: "bold", textColor: darkGray, halign: "right" },
    },
    didParseCell: (hookData: any) => {
      if (hookData.row.index === 7) {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fillColor = [230, 250, 235];
      }
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // ═══ CONFORMITÀ ═══
  checkPage(20);
  sectionTitle("STATO CONFORMITÀ");
  doc.setFontSize(9);

  const conformita = [
    { label: "Sicurezza", count: data.counts.sicurezza },
    { label: "Ambiente", count: data.counts.ambiente },
  ];
  conformita.forEach((c) => {
    const col = c.count > 0 ? green : red;
    const icon = c.count > 0 ? "✓" : "✗";
    const desc = c.count > 0 ? `${c.count} documenti caricati` : "Nessun documento caricato";
    doc.setTextColor(...col);
    doc.setFont("helvetica", "bold");
    doc.text(`${icon}  ${c.label}`, 18, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(desc, 60, y);
    y += 6;
  });

  // ═══ FOOTER ═══
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(
      `Report di Commessa — ${data.commessa?.commessa_consortile || ""} — Pagina ${i}/${totalPages}`,
      pw / 2, ph - 8, { align: "center" }
    );
  }

  return doc.output("blob");
}
