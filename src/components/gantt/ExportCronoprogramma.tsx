import { useCallback } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { GanttPhase } from "./types";
import { toast } from "@/hooks/use-toast";

interface ExportCronoprogrammaProps {
  phases: GanttPhase[];
}

function flattenPhases(phases: GanttPhase[]) {
  const rows: { name: string; level: string; startDate: Date; endDate: Date; progress: number }[] = [];
  phases.forEach((p) => {
    rows.push({ name: p.name, level: "Fase", startDate: p.startDate, endDate: p.endDate, progress: p.progress });
    p.subPhases?.forEach((s) => {
      rows.push({ name: s.name, level: "Sotto-fase", startDate: s.startDate, endDate: s.endDate, progress: s.progress });
    });
  });
  return rows;
}

function formatDate(d: Date) {
  return format(d, "dd/MM/yyyy", { locale: it });
}

function durationDays(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
}

export function ExportCronoprogramma({ phases }: ExportCronoprogrammaProps) {
  const exportPdf = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      doc.setFontSize(16);
      doc.text("Cronoprogramma Lavori", 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Esportato il ${formatDate(new Date())}`, 14, 21);
      doc.setTextColor(0);

      const rows = flattenPhases(phases);
      const tableData = rows.map((r) => [
        r.level === "Sotto-fase" ? `   ${r.name}` : r.name,
        r.level,
        formatDate(r.startDate),
        formatDate(r.endDate),
        `${durationDays(r.startDate, r.endDate)} gg`,
        `${r.progress}%`,
      ]);

      autoTable(doc, {
        startY: 26,
        head: [["Attività", "Livello", "Inizio", "Fine", "Durata", "Avanz."]],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { cellWidth: 80 },
          5: { halign: "center" },
        },
      });

      doc.save("cronoprogramma.pdf");
      toast({ title: "PDF esportato", description: "Il file è stato scaricato" });
    } catch {
      toast({ title: "Errore", description: "Impossibile generare il PDF", variant: "destructive" });
    }
  }, [phases]);

  const exportExcel = useCallback(async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = flattenPhases(phases);

      const wsData = [
        ["Attività", "Livello", "Data Inizio", "Data Fine", "Durata (gg)", "Avanzamento (%)"],
        ...rows.map((r) => [
          r.level === "Sotto-fase" ? `   ${r.name}` : r.name,
          r.level,
          formatDate(r.startDate),
          formatDate(r.endDate),
          durationDays(r.startDate, r.endDate),
          r.progress,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [{ wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Cronoprogramma");
      XLSX.writeFile(wb, "cronoprogramma.xlsx");
      toast({ title: "Excel esportato", description: "Il file è stato scaricato" });
    } catch {
      toast({ title: "Errore", description: "Impossibile generare il file Excel", variant: "destructive" });
    }
  }, [phases]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Esporta
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportPdf} className="gap-2 text-xs">
          <FileText className="w-3.5 h-3.5" />
          Esporta PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportExcel} className="gap-2 text-xs">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Esporta Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
