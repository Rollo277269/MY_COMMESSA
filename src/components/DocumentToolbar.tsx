import { useState } from "react";
import { Download, FileSpreadsheet, Search, X, Columns3, LayoutGrid, List, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ALL_COLUMNS, type ColumnKey } from "@/components/DocumentTable";

interface DocumentData {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  section: string;
  ai_extracted_data: any;
  ai_summary: string | null;
  ai_status: string | null;
  created_at: string;
}

export type ViewMode = "table" | "grid";

interface DocumentToolbarProps {
  documents: DocumentData[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  visibleColumns: ColumnKey[];
  onVisibleColumnsChange: (cols: ColumnKey[]) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onResetColumns?: () => void;
  activeFilterCount?: number;
  onClearAllFilters?: () => void;
}

function getField(data: any, key: string): string {
  if (!data) return "—";
  const val = data[key];
  if (!val || (Array.isArray(val) && val.length === 0)) return "—";
  if (Array.isArray(val)) return val.map((v: any) => (typeof v === "object" ? JSON.stringify(v) : v)).join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function getElaboratoDa(ai: any): string {
  if (!ai) return "—";
  if (ai.elaborato_da) return String(ai.elaborato_da);
  if (ai.parti_coinvolte && Array.isArray(ai.parti_coinvolte) && ai.parti_coinvolte.length > 0) {
    return ai.parti_coinvolte
      .map((p: any) => (typeof p === "object" ? p.nome || p.name || JSON.stringify(p) : p))
      .join(", ");
  }
  return "—";
}

function formatDateIT(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  } catch { return dateStr; }
}

function buildRows(documents: DocumentData[]) {
  return documents.map((doc) => {
    const ai = doc.ai_extracted_data;
    return [
      doc.file_name,
      getField(ai, "titolo"),
      getElaboratoDa(ai),
      getField(ai, "elaborato_cod"),
      getField(ai, "data"),
      ai?.scadenze ? (Array.isArray(ai.scadenze) ? ai.scadenze[0] || "—" : String(ai.scadenze)) : "—",
      getField(ai, "revisione"),
      formatDateIT(doc.created_at),
      doc.ai_status || "pending",
    ];
  });
}

const headers = ["Nome file", "Oggetto", "Elaborato da", "Elaborato Cod.", "Data documento", "Scadenza", "Rev.", "Data caricamento", "AI Status"];

function exportPDF(documents: DocumentData[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Elenco Documenti di Progetto", 14, 15);
  autoTable(doc, {
    startY: 22,
    head: [headers],
    body: buildRows(documents),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });
  doc.save("documenti_progetto.pdf");
}

function exportExcel(documents: DocumentData[]) {
  const rows = buildRows(documents);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Documenti");
  XLSX.writeFile(wb, "documenti_progetto.xlsx");
}

export function DocumentToolbar({ documents, searchQuery, onSearchChange, visibleColumns, onVisibleColumnsChange, viewMode = "table", onViewModeChange, onResetColumns, activeFilterCount = 0, onClearAllFilters }: DocumentToolbarProps) {
  const toggleColumn = (col: ColumnKey) => {
    if (visibleColumns.includes(col)) {
      if (visibleColumns.length <= 1) return; // keep at least 1
      onVisibleColumnsChange(visibleColumns.filter(c => c !== col));
    } else {
      // Insert in the order defined by ALL_COLUMNS
      const ordered = ALL_COLUMNS.map(c => c.key).filter(k => visibleColumns.includes(k) || k === col);
      onVisibleColumnsChange(ordered);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca documenti..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {onViewModeChange && (
        <div className="flex items-center border border-border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-2"
            onClick={() => onViewModeChange("table")}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-2"
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Columns3 className="w-4 h-4" /> Colonne
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-52 p-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Colonne visibili</p>
          <div className="space-y-1">
            {ALL_COLUMNS.map(col => (
              <label
                key={col.key}
                className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-accent/50 cursor-pointer text-sm"
              >
                <Checkbox
                  checked={visibleColumns.includes(col.key)}
                  onCheckedChange={() => toggleColumn(col.key)}
                />
                {col.label}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {onResetColumns && (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onResetColumns} title="Ripristina ordine e larghezza colonne">
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}

      {activeFilterCount > 0 && onClearAllFilters && (
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onClearAllFilters}>
          <Filter className="w-3.5 h-3.5 text-primary" />
          {activeFilterCount} filtri attivi
          <X className="w-3 h-3" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-4 h-4" /> Esporta
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => exportPDF(documents)}>
            <Download className="w-4 h-4 mr-2" /> Esporta PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportExcel(documents)}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Esporta Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
