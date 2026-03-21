import { useState, useMemo, useRef, useCallback } from "react";
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown, GripVertical, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import {
  type Fattura, type CentroImputazione, type FatturaColumnKey,
  ALL_FATTURA_COLUMNS, DEFAULT_FATTURA_COLUMNS,
  fmtCurrency, fmtPercent, statoPagamentoColor, getStatoPagamentoLabel,
} from "./types";

interface FattureTableProps {
  fatture: Fattura[];
  centri: CentroImputazione[];
  loading: boolean;
  onEdit: (f: Fattura) => void;
  onDelete: (id: string) => void;
  onToggleTipo?: (id: string, newTipo: "acquisto" | "vendita") => void;
  onChangeCentro?: (id: string, centroId: string | null) => void;
  onSelect?: (f: Fattura) => void;
  selectedId?: string | null;
  searchText: string;
  filterTipo: string;
  filterStato: string;
  filterCentro: string;
  visibleColumns: FatturaColumnKey[];
  columnOrder: FatturaColumnKey[];
  onColumnOrderChange: (order: FatturaColumnKey[]) => void;
  columnWidths: Record<string, number>;
  onColumnWidthsChange: (widths: Record<string, number>) => void;
}

type SortDir = "asc" | "desc";

const DEFAULT_COL_WIDTHS: Partial<Record<FatturaColumnKey, number>> = {
  tipo: 100,
  numero: 120,
  data: 110,
  fornitore: 200,
  cliente: 200,
  descrizione: 200,
  centro: 150,
  importo: 130,
  aliquota_iva: 100,
  importo_iva: 100,
  importo_totale: 130,
  incassato: 130,
  residuo: 140,
  stato_pagamento: 110,
  data_scadenza: 110,
  cig: 120,
  cup: 120,
  codice_sdi: 120,
};

function getIncassato(f: Fattura): number {
  return Number(f.importo_incassato) || 0;
}

function getResiduo(f: Fattura): number {
  return Number(f.importo_totale) - (Number(f.importo_incassato) || 0);
}

function getSortValue(f: Fattura, key: FatturaColumnKey, centroName: (id: string | null) => string): string | number {
  switch (key) {
    case "tipo": return f.tipo;
    case "numero": return f.numero.toLowerCase();
    case "data": return f.data;
    case "fornitore": return f.tipo === "acquisto" ? f.fornitore_cliente.toLowerCase() : "";
    case "cliente": return f.tipo === "vendita" ? f.fornitore_cliente.toLowerCase() : "";
    case "descrizione": return (f.descrizione || "").toLowerCase();
    case "centro": return centroName(f.centro_imputazione_id).toLowerCase();
    case "importo": return Number(f.importo);
    case "aliquota_iva": return Number(f.aliquota_iva);
    case "importo_iva": return Number(f.importo_iva);
    case "importo_totale": return Number(f.importo_totale);
    case "incassato": return getIncassato(f);
    case "residuo": return getResiduo(f);
    case "stato_pagamento": return f.stato_pagamento;
    case "data_scadenza": return f.data_scadenza || "";
    case "cig": return f.cig || "";
    case "cup": return f.cup || "";
    case "codice_sdi": return f.codice_sdi || "";
    default: return "";
  }
}

export function FattureTable({
  fatture, centri, loading, onEdit, onDelete, onToggleTipo, onChangeCentro, onSelect, selectedId,
  searchText, filterTipo, filterStato, filterCentro,
  visibleColumns, columnOrder, onColumnOrderChange,
  columnWidths, onColumnWidthsChange,
}: FattureTableProps) {
  const [sortKey, setSortKey] = useState<FatturaColumnKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const dragColRef = useRef<FatturaColumnKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<FatturaColumnKey | null>(null);
  const resizeRef = useRef<{ col: FatturaColumnKey; startX: number; startWidth: number } | null>(null);

  const centroName = useCallback((id: string | null) => centri.find((c) => c.id === id)?.nome || "—", [centri]);

  const orderedColumns = useMemo(() => {
    const visSet = new Set(visibleColumns);
    const ordered = columnOrder.filter(c => visSet.has(c));
    visibleColumns.forEach(c => { if (!ordered.includes(c)) ordered.push(c); });
    return ordered;
  }, [columnOrder, visibleColumns]);

  const filtered = useMemo(() => {
    let data = fatture;
    if (filterTipo !== "tutti") data = data.filter(f => f.tipo === filterTipo);
    if (filterStato !== "tutti") data = data.filter(f => f.stato_pagamento === filterStato);
    if (filterCentro !== "tutti") data = data.filter(f => f.centro_imputazione_id === filterCentro);
    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      data = data.filter(f =>
        f.numero.toLowerCase().includes(s) ||
        f.fornitore_cliente.toLowerCase().includes(s) ||
        (f.descrizione || "").toLowerCase().includes(s)
      );
    }
    if (sortKey) {
      data = [...data].sort((a, b) => {
        const va = getSortValue(a, sortKey, centroName);
        const vb = getSortValue(b, sortKey, centroName);
        const cmp = typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "it");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [fatture, filterTipo, filterStato, filterCentro, searchText, sortKey, sortDir, centroName]);

  const handleSort = (key: FatturaColumnKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const getColWidth = useCallback((col: FatturaColumnKey) => columnWidths[col] || DEFAULT_COL_WIDTHS[col] || 120, [columnWidths]);

  const handleResizeStart = useCallback((e: React.MouseEvent, col: FatturaColumnKey) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startWidth = getColWidth(col);
    resizeRef.current = { col, startX, startWidth };
    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const diff = ev.clientX - resizeRef.current.startX;
      const newWidth = Math.max(50, resizeRef.current.startWidth + diff);
      onColumnWidthsChange({ ...columnWidths, [resizeRef.current.col]: newWidth });
    };
    const handleMouseUp = () => {
      resizeRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = ""; document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [columnWidths, getColWidth, onColumnWidthsChange]);

  const handleDragStart = (col: FatturaColumnKey) => { dragColRef.current = col; };
  const handleDragOver = (e: React.DragEvent, col: FatturaColumnKey) => {
    e.preventDefault();
    if (dragColRef.current && dragColRef.current !== col) setDragOverCol(col);
  };
  const handleDrop = (col: FatturaColumnKey) => {
    const fromCol = dragColRef.current;
    if (!fromCol || fromCol === col) { setDragOverCol(null); dragColRef.current = null; return; }
    const newOrder = [...orderedColumns];
    const fromIdx = newOrder.indexOf(fromCol);
    const toIdx = newOrder.indexOf(col);
    if (fromIdx === -1 || toIdx === -1) { setDragOverCol(null); dragColRef.current = null; return; }
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, fromCol);
    onColumnOrderChange(newOrder);
    setDragOverCol(null); dragColRef.current = null;
  };
  const handleDragEnd = () => { setDragOverCol(null); dragColRef.current = null; };

  const columnMeta = Object.fromEntries(ALL_FATTURA_COLUMNS.map(c => [c.key, c.label]));

  const getCellContent = (f: Fattura, col: FatturaColumnKey) => {
    switch (col) {
      case "tipo":
        return (
          <Badge
            variant={f.tipo === "vendita" ? "default" : "destructive"}
            className={cn("text-xs", f.tipo === "vendita" && "bg-success text-success-foreground", onToggleTipo && "cursor-pointer hover:opacity-80")}
            onClick={onToggleTipo ? (e) => { e.stopPropagation(); onToggleTipo(f.id, f.tipo === "vendita" ? "acquisto" : "vendita"); } : undefined}
            title={onToggleTipo ? "Clicca per cambiare tipo" : undefined}
          >
            {f.tipo === "vendita" ? "Vendita" : "Acquisto"}
          </Badge>
        );
      case "numero": return <span className="font-medium truncate block">{f.numero}</span>;
      case "data": return <span className="text-muted-foreground text-xs">{format(new Date(f.data), "dd/MM/yyyy")}</span>;
      case "fornitore": return <span className="truncate block">{f.tipo === "acquisto" ? f.fornitore_cliente : "Consorzio Stabile Santa Rita"}</span>;
      case "cliente": return <span className="truncate block">{f.tipo === "vendita" ? f.fornitore_cliente : "Consorzio Stabile Santa Rita"}</span>;
      case "descrizione": return <span className="truncate block text-muted-foreground text-xs">{f.descrizione || "—"}</span>;
      case "centro": return onChangeCentro ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Select
              value={f.centro_imputazione_id || "__none__"}
              onValueChange={(val) => onChangeCentro(f.id, val === "__none__" ? null : val)}
            >
              <SelectTrigger className="h-7 text-xs border-none shadow-none bg-transparent px-1 min-w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {centri.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {f.centro_auto_assigned && <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
            {centroName(f.centro_imputazione_id)}
            {f.centro_auto_assigned && <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />}
          </span>
        );
      case "importo": return <span className="text-right tabular-nums block">{fmtCurrency(Number(f.importo))}</span>;
      case "aliquota_iva": return <span className="text-right tabular-nums text-xs block">{fmtPercent(Number(f.aliquota_iva))}{f.split_payment ? " SP" : ""}</span>;
      case "importo_iva": return <span className="text-right tabular-nums text-xs block">{fmtCurrency(Number(f.importo_iva))}</span>;
      case "importo_totale": return <span className="text-right font-semibold tabular-nums block">{fmtCurrency(Number(f.importo_totale))}</span>;
      case "incassato": {
        const inc = getIncassato(f);
        return <span className={cn("text-right tabular-nums block", inc > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground")}>{fmtCurrency(inc)}</span>;
      }
      case "residuo": {
        const res = getResiduo(f);
        return <span className={cn("text-right tabular-nums block", res > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground")}>{fmtCurrency(res)}</span>;
      }
      case "stato_pagamento":
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statoPagamentoColor[f.stato_pagamento]}`}>{getStatoPagamentoLabel(f.stato_pagamento, f.tipo)}</span>;
      case "data_scadenza": return <span className="text-muted-foreground text-xs">{f.data_scadenza ? format(new Date(f.data_scadenza), "dd/MM/yyyy") : "—"}</span>;
      case "cig": return <span className="text-xs truncate block">{f.cig || "—"}</span>;
      case "cup": return <span className="text-xs truncate block">{f.cup || "—"}</span>;
      case "codice_sdi": return <span className="text-xs truncate block">{f.codice_sdi || "—"}</span>;
      default: return "—";
    }
  };

  const isRightAligned = (col: FatturaColumnKey) => ["importo", "aliquota_iva", "importo_iva", "importo_totale", "incassato", "residuo"].includes(col);

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      <Table style={{ tableLayout: "fixed", width: "auto", minWidth: "100%" }}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {orderedColumns.map(col => {
              const width = getColWidth(col);
              return (
                <TableHead
                  key={col}
                  className={cn(
                    "relative select-none cursor-pointer hover:text-foreground transition-colors",
                    isRightAligned(col) && "text-right",
                    dragOverCol === col && "bg-primary/10"
                  )}
                  style={{ width, minWidth: 50, maxWidth: width }}
                  draggable
                  onDragStart={() => handleDragStart(col)}
                  onDragOver={(e) => handleDragOver(e, col)}
                  onDrop={() => handleDrop(col)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleSort(col)}
                >
                  <span className={cn("flex items-center gap-1 pr-2", isRightAligned(col) && "justify-end")}>
                    <GripVertical className="w-3 h-3 opacity-30 flex-shrink-0 cursor-grab" />
                    <span className="truncate">{columnMeta[col]}</span>
                    {sortKey === col
                      ? (sortDir === "asc" ? <ArrowUp className="w-3 h-3 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 flex-shrink-0" />)
                      : <ArrowUpDown className="w-3 h-3 opacity-30 flex-shrink-0" />}
                  </span>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 z-10"
                    onMouseDown={(e) => handleResizeStart(e, col)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableHead>
              );
            })}
            <TableHead className="w-20" style={{ width: 80 }} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={orderedColumns.length + 1} className="text-center py-8 text-muted-foreground">Caricamento...</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={orderedColumns.length + 1} className="text-center py-8 text-muted-foreground">Nessuna fattura trovata</TableCell></TableRow>
          ) : filtered.map((f) => (
            <TableRow key={f.id} className={cn("cursor-pointer", selectedId === f.id && "bg-accent/50")} onClick={() => onSelect?.(f)}>
              {orderedColumns.map(col => (
                <TableCell key={col} style={{ width: getColWidth(col), maxWidth: getColWidth(col) }} className={cn(isRightAligned(col) && "text-right")}>
                  {getCellContent(f, col)}
                </TableCell>
              ))}
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(f)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(f.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {filtered.length > 0 && (
          <TableFooter>
            <TableRow className="bg-muted/50 font-bold text-base">
              {orderedColumns.map((col, i) => {
                const w = getColWidth(col);
                if (i === 0) return <TableCell key={col} style={{ width: w }} className="font-bold text-base">TOTALI</TableCell>;
                const sumCols: FatturaColumnKey[] = ["importo", "importo_iva", "importo_totale", "incassato", "residuo"];
                if (sumCols.includes(col)) {
                  let total = 0;
                  for (const f of filtered) {
                    if (col === "incassato") total += getIncassato(f);
                    else if (col === "residuo") total += getResiduo(f);
                    else total += Number((f as any)[col] || 0);
                  }
                  return <TableCell key={col} style={{ width: w }} className="text-right font-bold text-base tabular-nums">{fmtCurrency(total)}</TableCell>;
                }
                return <TableCell key={col} style={{ width: w }} />;
              })}
              <TableCell />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
