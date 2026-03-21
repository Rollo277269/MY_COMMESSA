import { Search, X, Columns3, RotateCcw, Download, FileSpreadsheet, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  type Fattura, type CentroImputazione, type FatturaColumnKey,
  ALL_FATTURA_COLUMNS, fmtCurrency, statoPagamentoLabel,
} from "./types";

interface FattureToolbarProps {
  fatture: Fattura[];
  searchText: string;
  onSearchChange: (v: string) => void;
  filterTipo: string;
  onFilterTipoChange: (v: string) => void;
  filterStato: string;
  onFilterStatoChange: (v: string) => void;
  filterCentro: string;
  onFilterCentroChange: (v: string) => void;
  centri: CentroImputazione[];
  visibleColumns: FatturaColumnKey[];
  onVisibleColumnsChange: (cols: FatturaColumnKey[]) => void;
  onResetColumns: () => void;
  onNewFattura: () => void;
  onOpenCentri: () => void;
}

function exportPDF(fatture: Fattura[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Elenco Fatture", 14, 15);
  const headers = ["Tipo", "Numero", "Data", "Fornitore", "Cliente", "Imponibile", "Aliquota IVA", "IVA", "Totale", "Stato"];
  const rows = fatture.map(f => [
    f.tipo === "vendita" ? "Vendita" : "Acquisto",
    f.numero, f.data,
    f.tipo === "acquisto" ? f.fornitore_cliente : "",
    f.tipo === "vendita" ? f.fornitore_cliente : "",
    fmtCurrency(Number(f.importo)), `${f.aliquota_iva}%${f.split_payment ? " SP" : ""}`,
    fmtCurrency(Number(f.importo_iva)),
    fmtCurrency(Number(f.importo_totale)),
    statoPagamentoLabel[f.stato_pagamento] || f.stato_pagamento,
  ]);
  autoTable(doc, { startY: 22, head: [headers], body: rows, styles: { fontSize: 8 }, headStyles: { fillColor: [41, 128, 185] } });
  doc.save("fatture.pdf");
}

function exportExcel(fatture: Fattura[]) {
  const headers = ["Tipo", "Numero", "Data", "Fornitore", "Cliente", "Imponibile", "Aliquota IVA", "IVA", "Totale", "Stato"];
  const rows = fatture.map(f => [
    f.tipo, f.numero, f.data,
    f.tipo === "acquisto" ? f.fornitore_cliente : "",
    f.tipo === "vendita" ? f.fornitore_cliente : "",
    Number(f.importo), `${f.aliquota_iva}%${f.split_payment ? " SP" : ""}`,
    Number(f.importo_iva), Number(f.importo_totale),
    statoPagamentoLabel[f.stato_pagamento] || f.stato_pagamento,
  ]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Fatture");
  XLSX.writeFile(wb, "fatture.xlsx");
}

export function FattureToolbar({
  fatture, searchText, onSearchChange,
  filterTipo, onFilterTipoChange, filterStato, onFilterStatoChange,
  filterCentro, onFilterCentroChange, centri,
  visibleColumns, onVisibleColumnsChange, onResetColumns,
  onNewFattura, onOpenCentri,
}: FattureToolbarProps) {
  const hasActiveFilters = filterTipo !== "tutti" || filterStato !== "tutti" || filterCentro !== "tutti" || searchText !== "";

  const toggleColumn = (col: FatturaColumnKey) => {
    if (visibleColumns.includes(col)) {
      if (visibleColumns.length <= 1) return;
      onVisibleColumnsChange(visibleColumns.filter(c => c !== col));
    } else {
      const ordered = ALL_FATTURA_COLUMNS.map(c => c.key).filter(k => visibleColumns.includes(k) || k === col);
      onVisibleColumnsChange(ordered);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca numero, fornitore..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm w-52"
        />
        {searchText && (
          <button onClick={() => onSearchChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tipo filter removed - sections are now split vertically */}

      <Select value={filterStato} onValueChange={onFilterStatoChange}>
        <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="tutti">Tutti gli stati</SelectItem>
          <SelectItem value="da_pagare">Da pagare</SelectItem>
          <SelectItem value="pagata">Pagata</SelectItem>
          <SelectItem value="scaduta">Scaduta</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterCentro} onValueChange={onFilterCentroChange}>
        <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="tutti">Tutti i centri</SelectItem>
          {centri.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.nome} ({c.tipo})</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => { onFilterTipoChange("tutti"); onFilterStatoChange("tutti"); onFilterCentroChange("tutti"); onSearchChange(""); }}>
          <X className="w-4 h-4 mr-1" /> Reset
        </Button>
      )}

      <div className="flex-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Columns3 className="w-4 h-4" /> Colonne
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-52 p-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Colonne visibili</p>
          <div className="space-y-1">
            {ALL_FATTURA_COLUMNS.map(col => (
              <label key={col.key} className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-accent/50 cursor-pointer text-sm">
                <Checkbox checked={visibleColumns.includes(col.key)} onCheckedChange={() => toggleColumn(col.key)} />
                {col.label}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="sm" className="gap-1.5" onClick={onResetColumns} title="Ripristina ordine e larghezza colonne">
        <RotateCcw className="w-4 h-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-4 h-4" /> Esporta
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => exportPDF(fatture)}>
            <Download className="w-4 h-4 mr-2" /> Esporta PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportExcel(fatture)}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Esporta Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" onClick={onOpenCentri}>
        <Tag className="w-4 h-4 mr-1" /> Centri
      </Button>

    </div>
  );
}
