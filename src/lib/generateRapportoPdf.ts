import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";

export interface RapportoData {
  data: string;
  data_display: string;
  condizioni_meteo: string;
  temperatura: string;
  operai: { nome: string; qualifica: string; ore: string }[];
  lavorazioni: string;
  materiali: { fornitore: string; descrizione: string; ddt: string; quantita: string }[];
  altri_documenti: string;
  note: string;
  cme_ids?: string[];
  crono_ids?: string[];
  cme_descrizioni?: string[];
  crono_nomi?: string[];
}

async function fetchCommessa() {
  const { data } = await supabase
    .from('commessa_data')
    .select('committente, oggetto_lavori, importo_contrattuale, commessa_consortile, impresa_assegnataria, direttore_lavori, rup, cup, cig')
    .limit(1)
    .maybeSingle();
  return data;
}

export async function generateRapportoPdf(formData: RapportoData): Promise<Blob> {
  const commessa = await fetchCommessa();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 12;

  // === HEADER ===
  doc.setFillColor(30, 64, 120);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RAPPORTO GIORNALIERO", 14, y + 6);

  if (commessa?.commessa_consortile) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Commessa N. ${commessa.commessa_consortile}`, 14, y + 13);
  }

  if (commessa?.impresa_assegnataria) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(commessa.impresa_assegnataria, pageWidth - 14, y + 6, { align: "right" });
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${formData.data_display || formData.data || "—"}`, pageWidth - 14, y + 13, { align: "right" });

  y = 42;

  // Commessa details
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const details: string[] = [];
  if (commessa?.committente) details.push(`Committente: ${commessa.committente}`);
  if (commessa?.oggetto_lavori) details.push(`Oggetto: ${commessa.oggetto_lavori}`);
  if (commessa?.cup) details.push(`CUP: ${commessa.cup}`);
  if (commessa?.cig) details.push(`CIG: ${commessa.cig}`);
  if (commessa?.direttore_lavori) details.push(`DL: ${commessa.direttore_lavori}`);
  if (commessa?.rup) details.push(`RUP: ${commessa.rup}`);

  if (details.length > 0) {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, y - 4, pageWidth - 28, details.length * 4.5 + 4, 2, 2, "FD");
    details.forEach((line, i) => {
      doc.text(line, 18, y + i * 4.5);
    });
    y += details.length * 4.5 + 6;
  }

  doc.setDrawColor(30, 64, 120);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Meteo
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Meteo: ${formData.condizioni_meteo || "—"}${formData.temperatura ? ` - ${formData.temperatura}°C` : ""}`, 14, y);
  y += 8;

  // === BODY (same as before) ===
  const operai = (formData.operai || []).filter(o => o.nome?.trim());
  if (operai.length > 0) {
    doc.setFontSize(12);
    doc.text("OPERAI PRESENTI", 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [["Nome", "Qualifica", "Ore"]],
      body: operai.map(o => [o.nome, o.qualifica || "", o.ore || "8"]),
      theme: "grid",
      headStyles: { fillColor: [30, 64, 120], fontSize: 9 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  if (formData.lavorazioni) {
    doc.setFontSize(12);
    doc.text("LAVORAZIONI SVOLTE", 14, y);
    y += 5;
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(formData.lavorazioni, pageWidth - 28);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 6;
  }

  const materiali = (formData.materiali || []).filter(m => m.descrizione?.trim() || m.fornitore?.trim());
  if (materiali.length > 0) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.text("ACQUISTI E MATERIALI RICEVUTI", 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [["Fornitore", "Descrizione", "Rif. DDT", "Quantità"]],
      body: materiali.map(m => [m.fornitore || "", m.descrizione || "", m.ddt || "", m.quantita || ""]),
      theme: "grid",
      headStyles: { fillColor: [30, 64, 120], fontSize: 9 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  if (formData.altri_documenti) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.text("ALTRI DOCUMENTI ACQUISITI", 14, y);
    y += 5;
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(formData.altri_documenti, pageWidth - 28);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 6;
  }

  if (formData.note) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.text("NOTE ANDAMENTO LAVORI", 14, y);
    y += 5;
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(formData.note, pageWidth - 28);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 6;
  }

  if (formData.cme_descrizioni && formData.cme_descrizioni.length > 0) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.text("VOCI CME COLLEGATE", 14, y);
    y += 5;
    doc.setFontSize(9);
    formData.cme_descrizioni.forEach(desc => {
      if (y > 280) { doc.addPage(); y = 15; }
      const lines = doc.splitTextToSize(`• ${desc}`, pageWidth - 28);
      doc.text(lines, 14, y);
      y += lines.length * 4.5;
    });
    y += 4;
  }

  if (formData.crono_nomi && formData.crono_nomi.length > 0) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.text("FASI CRONOPROGRAMMA COLLEGATE", 14, y);
    y += 5;
    doc.setFontSize(9);
    formData.crono_nomi.forEach(name => {
      if (y > 280) { doc.addPage(); y = 15; }
      doc.text(`• ${name}`, 14, y);
      y += 4.5;
    });
  }

  return doc.output("blob");
}
