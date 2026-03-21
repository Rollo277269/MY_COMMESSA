import { FileText, Loader2, CheckCircle2, AlertCircle, Trash2, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Calendar as CalendarIcon, GripVertical, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { it } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export type ColumnKey = "file_name" | "titolo" | "elaborato_da" | "elaborato_cod" | "data" | "scadenza" | "revisione" | "created_at" | "ai_status";

export const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "file_name", label: "Nome file" },
  { key: "titolo", label: "Oggetto" },
  { key: "elaborato_da", label: "Elaborato da" },
  { key: "elaborato_cod", label: "Elaborato Cod." },
  { key: "data", label: "Data documento" },
  { key: "scadenza", label: "Scadenza" },
  { key: "revisione", label: "Rev." },
  { key: "created_at", label: "Data caricamento" },
  { key: "ai_status", label: "AI" },
];

export const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [
  "file_name", "titolo", "elaborato_da", "data", "scadenza", "revisione", "created_at", "ai_status"
];

interface DocumentTableProps {
  documents: DocumentData[];
  onDelete: (id: string, filePath: string) => void;
  onSelect?: (doc: DocumentData | null) => void;
  onUpdate?: (id: string, updatedAiData: any, newFileName?: string) => void;
  onReanalyze?: (doc: DocumentData) => void;
  reanalyzingIds?: Set<string>;
  selectedId?: string | null;
  searchQuery?: string;
  visibleColumns?: ColumnKey[];
  columnOrder?: ColumnKey[];
  onColumnOrderChange?: (newOrder: ColumnKey[]) => void;
  columnWidths?: Record<string, number>;
  onColumnWidthsChange?: (widths: Record<string, number>) => void;
  onFilterCountChange?: (count: number) => void;
  clearFiltersRef?: React.MutableRefObject<(() => void) | null>;
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="w-4 h-4 text-success" />,
  processing: <Loader2 className="w-4 h-4 text-accent animate-spin" />,
  error: <AlertCircle className="w-4 h-4 text-destructive" />,
  pending: <Loader2 className="w-4 h-4 text-muted-foreground" />,
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    // Try dd/mm/yyyy, dd.mm.yyyy, dd-mm-yyyy
    const parts = dateStr.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (parts) {
      return `${parts[1].padStart(2, '0')}.${parts[2].padStart(2, '0')}.${parts[3]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }
    return dateStr;
  } catch { return dateStr; }
}

function parseLocalDate(str: string): Date | undefined {
  if (!str) return undefined;
  const parts = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (parts) return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
  const iso = new Date(str);
  return isNaN(iso.getTime()) ? undefined : iso;
}

function formatDateIt(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function DateFieldInput({ value, onChange, id, placeholder }: { value: string; onChange: (v: string) => void; id?: string; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const selected = parseLocalDate(value);
  return (
    <div className="flex gap-1.5 items-center">
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" placeholder={placeholder || "gg.mm.aaaa"} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selected} onSelect={(d) => { if (d) { onChange(formatDateIt(d)); } setOpen(false); }} locale={it} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );
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

function getScadenza(ai: any): string {
  if (!ai?.scadenze) return "—";
  if (Array.isArray(ai.scadenze)) return ai.scadenze[0] ? String(ai.scadenze[0]) : "—";
  return String(ai.scadenze);
}

type SortKey = "file_name" | "titolo" | "elaborato_da" | "elaborato_cod" | "data" | "scadenza" | "revisione" | "created_at";
type SortDir = "asc" | "desc";

function getSortValue(doc: DocumentData, key: SortKey): string {
  const ai = doc.ai_extracted_data;
  switch (key) {
    case "file_name": return doc.file_name.toLowerCase();
    case "titolo": return getField(ai, "titolo").toLowerCase();
    case "elaborato_da": return getElaboratoDa(ai).toLowerCase();
    case "elaborato_cod": return getField(ai, "elaborato_cod").toLowerCase();
    case "data": return getField(ai, "data");
    case "scadenza": return getScadenza(ai);
    case "revisione": return getField(ai, "revisione").toLowerCase();
    case "created_at": return doc.created_at;
    default: return "";
  }
}

function SortableHead({ label, sortKey, currentSort, currentDir, onSort }: {
  label: string; sortKey: SortKey; currentSort: SortKey | null; currentDir: SortDir; onSort: (key: SortKey) => void;
}) {
  const isActive = currentSort === sortKey;
  return (
    <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => onSort(sortKey)}>
      <span className="flex items-center gap-1">
        {label}
        {isActive ? (currentDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </span>
    </TableHead>
  );
}

const DEFAULT_COL_WIDTHS: Partial<Record<ColumnKey, number>> = {
  file_name: 180,
  titolo: 200,
  elaborato_da: 160,
  elaborato_cod: 130,
  data: 120,
  scadenza: 120,
  revisione: 70,
  created_at: 130,
  ai_status: 60,
};

function getCellContent(doc: DocumentData, col: ColumnKey): React.ReactNode {
  const ai = doc.ai_extracted_data;
  switch (col) {
    case "file_name": return <span className="font-medium truncate block">{doc.file_name}</span>;
    case "titolo": return <span className="truncate block">{getField(ai, "titolo")}</span>;
    case "elaborato_da": return <span className="truncate block">{getElaboratoDa(ai)}</span>;
    case "elaborato_cod": return <span className="truncate block">{getField(ai, "elaborato_cod")}</span>;
    case "data": return formatDate(getField(ai, "data"));
    case "scadenza": return formatDate(getScadenza(ai));
    case "revisione": return <span className="text-center block">{getField(ai, "revisione")}</span>;
    case "created_at": return formatDate(doc.created_at);
    case "ai_status": return null; // rendered separately with props
    default: return "—";
  }
}

export function DocumentTable({ documents, onDelete, onSelect, onUpdate, onReanalyze, reanalyzingIds, selectedId, searchQuery = "", visibleColumns = DEFAULT_VISIBLE_COLUMNS, columnOrder, onColumnOrderChange, columnWidths = {}, onColumnWidthsChange, onFilterCountChange, clearFiltersRef }: DocumentTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingDoc, setEditingDoc] = useState<DocumentData | null>(null);
  const [editForm, setEditForm] = useState({ file_name: "", titolo: "", elaborato_da: "", elaborato_cod: "", data: "", scadenza: "", revisione: "" });
  const [inlineEdit, setInlineEdit] = useState<{ docId: string; col: ColumnKey } | null>(null);
  const [inlineValue, setInlineValue] = useState("");
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const dragColRef = useRef<ColumnKey | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null);
  const resizeRef = useRef<{ col: ColumnKey; startX: number; startWidth: number } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});

  // Use columnOrder if provided, otherwise fall back to visibleColumns order
  const orderedColumns = useMemo(() => {
    if (columnOrder) {
      // Only show columns that are both in columnOrder and visibleColumns
      const visSet = new Set(visibleColumns);
      const ordered = columnOrder.filter(c => visSet.has(c));
      // Add any visible columns not in the order (appended at end)
      visibleColumns.forEach(c => { if (!ordered.includes(c)) ordered.push(c); });
      return ordered;
    }
    return visibleColumns;
  }, [columnOrder, visibleColumns]);

  const handleDragStart = (col: ColumnKey) => {
    dragColRef.current = col;
  };

  const handleDragOver = (e: React.DragEvent, col: ColumnKey) => {
    e.preventDefault();
    if (dragColRef.current && dragColRef.current !== col) {
      setDragOverCol(col);
    }
  };

  const handleDrop = (col: ColumnKey) => {
    const fromCol = dragColRef.current;
    if (!fromCol || fromCol === col) { setDragOverCol(null); dragColRef.current = null; return; }
    const newOrder = [...orderedColumns];
    const fromIdx = newOrder.indexOf(fromCol);
    const toIdx = newOrder.indexOf(col);
    if (fromIdx === -1 || toIdx === -1) { setDragOverCol(null); dragColRef.current = null; return; }
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, fromCol);
    onColumnOrderChange?.(newOrder);
    setDragOverCol(null);
    dragColRef.current = null;
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    dragColRef.current = null;
  };

  const getColWidth = useCallback((col: ColumnKey) => {
    return columnWidths[col] || DEFAULT_COL_WIDTHS[col] || 120;
  }, [columnWidths]);

  const handleResizeStart = useCallback((e: React.MouseEvent, col: ColumnKey) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = getColWidth(col);
    resizeRef.current = { col, startX, startWidth };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const diff = ev.clientX - resizeRef.current.startX;
      const newWidth = Math.max(50, resizeRef.current.startWidth + diff);
      const newWidths = { ...columnWidths, [resizeRef.current.col]: newWidth };
      onColumnWidthsChange?.(newWidths);
    };

    const handleMouseUp = () => {
      resizeRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [columnWidths, getColWidth, onColumnWidthsChange]);

  const openEdit = (doc: DocumentData) => {
    const ai = doc.ai_extracted_data || {};
    setEditForm({
      file_name: doc.file_name,
      titolo: ai.titolo || "",
      elaborato_da: ai.elaborato_da || (ai.parti_coinvolte?.[0]?.nome || ai.parti_coinvolte?.[0] || ""),
      elaborato_cod: ai.elaborato_cod || "",
      data: ai.data || "",
      scadenza: getScadenza(ai) === "—" ? "" : getScadenza(ai),
      revisione: ai.revisione || "",
    });
    setEditingDoc(doc);
  };

  const saveEdit = () => {
    if (!editingDoc || !onUpdate) return;
    const ai = { ...(editingDoc.ai_extracted_data || {}) };
    ai.titolo = editForm.titolo;
    ai.elaborato_da = editForm.elaborato_da;
    ai.elaborato_cod = editForm.elaborato_cod || null;
    ai.data = editForm.data;
    ai.scadenze = editForm.scadenza || null;
    ai.revisione = editForm.revisione || null;
    const newFileName = editForm.file_name.trim() !== editingDoc.file_name ? editForm.file_name.trim() : undefined;
    onUpdate(editingDoc.id, ai, newFileName);
    setEditingDoc(null);
  };

  const editableColumns: ColumnKey[] = ["file_name", "titolo", "elaborato_da", "elaborato_cod", "data", "scadenza", "revisione"];

  const startInlineEdit = useCallback((doc: DocumentData, col: ColumnKey) => {
    if (!onUpdate || !editableColumns.includes(col)) return;
    const ai = doc.ai_extracted_data || {};
    let value = "";
    switch (col) {
      case "file_name": value = doc.file_name; break;
      case "titolo": value = ai.titolo || ""; break;
      case "elaborato_da": value = ai.elaborato_da || (ai.parti_coinvolte?.[0]?.nome || ai.parti_coinvolte?.[0] || ""); break;
      case "elaborato_cod": value = ai.elaborato_cod || ""; break;
      case "data": value = ai.data || ""; break;
      case "scadenza": { const s = getScadenza(ai); value = s === "—" ? "" : s; break; }
      case "revisione": value = ai.revisione || ""; break;
    }
    setInlineEdit({ docId: doc.id, col });
    setInlineValue(value);
    setTimeout(() => inlineInputRef.current?.focus(), 0);
  }, [onUpdate]);

  const saveInlineEdit = useCallback(() => {
    if (!inlineEdit || !onUpdate) { setInlineEdit(null); return; }
    const doc = documents.find(d => d.id === inlineEdit.docId);
    if (!doc) { setInlineEdit(null); return; }
    const { col } = inlineEdit;
    const val = inlineValue.trim();

    if (col === "file_name") {
      if (val && val !== doc.file_name) {
        onUpdate(doc.id, doc.ai_extracted_data, val);
      }
    } else {
      const ai = { ...(doc.ai_extracted_data || {}) };
      switch (col) {
        case "titolo": ai.titolo = val || null; break;
        case "elaborato_da": ai.elaborato_da = val || null; break;
        case "elaborato_cod": ai.elaborato_cod = val || null; break;
        case "data": ai.data = val || null; break;
        case "scadenza": ai.scadenze = val || null; break;
        case "revisione": ai.revisione = val || null; break;
      }
      onUpdate(doc.id, ai);
    }
    setInlineEdit(null);
  }, [inlineEdit, inlineValue, documents, onUpdate]);

  const cancelInlineEdit = useCallback(() => { setInlineEdit(null); }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  function getCellTextValue(doc: DocumentData, col: ColumnKey): string {
    const ai = doc.ai_extracted_data;
    switch (col) {
      case "file_name": return doc.file_name;
      case "titolo": return getField(ai, "titolo");
      case "elaborato_da": return getElaboratoDa(ai);
      case "elaborato_cod": return getField(ai, "elaborato_cod");
      case "data": return formatDate(getField(ai, "data"));
      case "scadenza": return formatDate(getScadenza(ai));
      case "revisione": return getField(ai, "revisione");
      case "created_at": return formatDate(doc.created_at);
      case "ai_status": return doc.ai_status || "pending";
      default: return "—";
    }
  }

  const uniqueValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const col of orderedColumns) {
      const vals = new Set<string>();
      for (const doc of documents) {
        vals.add(getCellTextValue(doc, col));
      }
      result[col] = Array.from(vals).sort((a, b) => a.localeCompare(b, "it"));
    }
    return result;
  }, [documents, orderedColumns]);

  const toggleFilter = useCallback((col: string, value: string) => {
    setColumnFilters(prev => {
      const current = prev[col] ? new Set(prev[col]) : new Set<string>();
      if (current.has(value)) current.delete(value);
      else current.add(value);
      const next = { ...prev };
      if (current.size === 0) delete next[col];
      else next[col] = current;
      return next;
    });
  }, []);

  const clearFilter = useCallback((col: string) => {
    setColumnFilters(prev => {
      const next = { ...prev };
      delete next[col];
      return next;
    });
  }, []);

  const activeFilterCount = Object.keys(columnFilters).length;

  // Expose filter count and clear function to parent
  useEffect(() => {
    onFilterCountChange?.(activeFilterCount);
  }, [activeFilterCount, onFilterCountChange]);

  useEffect(() => {
    if (clearFiltersRef) {
      clearFiltersRef.current = () => setColumnFilters({});
    }
  }, [clearFiltersRef]);

  const filtered = useMemo(() => {
    let docs = documents;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter((doc) => {
        const ai = doc.ai_extracted_data;
        return (
          doc.file_name.toLowerCase().includes(q) ||
          getField(ai, "titolo").toLowerCase().includes(q) ||
          getElaboratoDa(ai).toLowerCase().includes(q) ||
          getField(ai, "elaborato_cod").toLowerCase().includes(q) ||
          (doc.ai_summary || "").toLowerCase().includes(q)
        );
      });
    }
    // Apply column filters
    for (const [col, allowedValues] of Object.entries(columnFilters)) {
      if (allowedValues.size > 0) {
        docs = docs.filter(doc => allowedValues.has(getCellTextValue(doc, col as ColumnKey)));
      }
    }
    if (sortKey) {
      docs = [...docs].sort((a, b) => {
        const va = getSortValue(a, sortKey);
        const vb = getSortValue(b, sortKey);
        const cmp = va.localeCompare(vb, "it");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return docs;
  }, [documents, searchQuery, sortKey, sortDir, columnFilters]);

  const colSpan = orderedColumns.length + 2; // +2 for expand icon + actions

  if (documents.length === 0) return null;

  const sortableColumns: ColumnKey[] = ["file_name", "titolo", "elaborato_da", "elaborato_cod", "data", "scadenza", "revisione", "created_at"];
  const columnMeta = Object.fromEntries(ALL_COLUMNS.map(c => [c.key, c.label]));

  return (
    <>
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden animate-fade-in">
        <Table style={{ tableLayout: "fixed", width: "auto", minWidth: "100%" }}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8" style={{ width: 32 }}></TableHead>
              {orderedColumns.map(col => {
                const isSortable = sortableColumns.includes(col);
                const width = getColWidth(col);
                return (
                  <TableHead
                    key={col}
                    className={cn(
                      "relative select-none hover:text-foreground transition-colors",
                      isSortable && "cursor-pointer",
                      col === "ai_status" && "text-center",
                      dragOverCol === col && "bg-primary/10"
                    )}
                    style={{ width, minWidth: 50, maxWidth: width }}
                    draggable
                    onDragStart={() => handleDragStart(col)}
                    onDragOver={(e) => handleDragOver(e, col)}
                    onDrop={() => handleDrop(col)}
                    onDragEnd={handleDragEnd}
                    onClick={() => isSortable && handleSort(col as SortKey)}
                  >
                    <span className="flex items-center gap-1 pr-2">
                      <GripVertical className="w-3 h-3 opacity-30 flex-shrink-0 cursor-grab" />
                      <span className="truncate">{columnMeta[col]}</span>
                      {isSortable && (
                        sortKey === col
                          ? (sortDir === "asc" ? <ArrowUp className="w-3 h-3 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 flex-shrink-0" />)
                          : <ArrowUpDown className="w-3 h-3 opacity-30 flex-shrink-0" />
                      )}
                      {/* Column filter */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "ml-auto flex-shrink-0 p-0.5 rounded hover:bg-accent/50 transition-colors",
                              columnFilters[col] ? "text-primary" : "text-muted-foreground opacity-40 hover:opacity-100"
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Filter className="w-3 h-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2 max-h-64 overflow-auto" align="start" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtra</p>
                            {columnFilters[col] && (
                              <button className="text-xs text-primary hover:underline" onClick={() => clearFilter(col)}>
                                Rimuovi
                              </button>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            {(uniqueValues[col] || []).map(val => (
                              <label key={val} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-accent/50 cursor-pointer text-sm truncate">
                                <Checkbox
                                  checked={columnFilters[col]?.has(val) ?? false}
                                  onCheckedChange={() => toggleFilter(col, val)}
                                />
                                <span className="truncate">{val}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </span>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 z-10"
                      onMouseDown={(e) => handleResizeStart(e, col)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableHead>
                );
              })}
              <TableHead className="w-20" style={{ width: 80 }}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground text-sm">
                  Nessun risultato trovato
                </TableCell>
              </TableRow>
            ) : filtered.map((doc) => {
              const ai = doc.ai_extracted_data;
              const isExpanded = expandedId === doc.id;

              return (
                <>
                  <TableRow
                    key={doc.id}
                    className={cn("cursor-pointer", selectedId === doc.id && "bg-accent/10")}
                    onClick={() => onSelect?.(selectedId === doc.id ? null : doc)}
                  >
                    <TableCell className="px-2">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </TableCell>
                    {orderedColumns.map(col => {
                      const isEditing = inlineEdit?.docId === doc.id && inlineEdit?.col === col;
                      const isEditable = onUpdate && editableColumns.includes(col);
                      return (
                        <TableCell
                          key={col}
                          style={{ width: getColWidth(col), maxWidth: getColWidth(col), overflow: "hidden" }}
                          className={cn(isEditable && "hover:bg-accent/30 transition-colors")}
                          onDoubleClick={(e) => {
                            if (isEditable) {
                              e.stopPropagation();
                              startInlineEdit(doc, col);
                            }
                          }}
                        >
                          {isEditing ? (
                            <Input
                              ref={inlineInputRef}
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={saveInlineEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveInlineEdit();
                                if (e.key === "Escape") cancelInlineEdit();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-7 text-sm px-1 py-0"
                            />
                          ) : col === "ai_status" ? (
                            <AiStatusCell doc={doc} onReanalyze={onReanalyze} reanalyzingIds={reanalyzingIds} />
                          ) : (
                            getCellContent(doc, col)
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <div className="flex gap-1">
                        {onUpdate && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(doc);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(doc.id, doc.file_path);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {isExpanded && doc.ai_status === "completed" && ai && (
                    <TableRow key={`${doc.id}-detail`} className="hover:bg-transparent">
                      <TableCell colSpan={colSpan} className="bg-muted/30 p-4">
                        {doc.ai_summary && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Riepilogo AI</p>
                            <p className="text-sm text-card-foreground">{doc.ai_summary}</p>
                          </div>
                        )}
                        <ExtractedDataGrid data={ai} />
                      </TableCell>
                    </TableRow>
                  )}

                  {isExpanded && doc.ai_status === "error" && (
                    <TableRow key={`${doc.id}-error`} className="hover:bg-transparent">
                      <TableCell colSpan={colSpan} className="bg-destructive/5 p-4">
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-destructive flex-1">L'analisi AI ha riscontrato un errore.</p>
                          {onReanalyze && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-xs"
                              disabled={reanalyzingIds?.has(doc.id)}
                              onClick={(e) => { e.stopPropagation(); onReanalyze(doc); }}
                            >
                              <RefreshCw className={cn("w-3.5 h-3.5", reanalyzingIds?.has(doc.id) && "animate-spin")} />
                              Rianalizza
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingDoc} onOpenChange={(open) => !open && setEditingDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-filename">Nome file</Label>
              <Input id="edit-filename" value={editForm.file_name} onChange={(e) => setEditForm(f => ({ ...f, file_name: e.target.value }))} placeholder="Nome del file" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-titolo">Oggetto</Label>
              <Input id="edit-titolo" value={editForm.titolo} onChange={(e) => setEditForm(f => ({ ...f, titolo: e.target.value }))} placeholder="Oggetto del documento" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-elaborato">Elaborato da</Label>
              <Input id="edit-elaborato" value={editForm.elaborato_da} onChange={(e) => setEditForm(f => ({ ...f, elaborato_da: e.target.value }))} placeholder="Autore / elaborato da" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-elaborato-cod">Elaborato Cod.</Label>
              <Input id="edit-elaborato-cod" value={editForm.elaborato_cod} onChange={(e) => setEditForm(f => ({ ...f, elaborato_cod: e.target.value }))} placeholder="es. EL-001" />
            </div>
            <div className="space-y-2">
              <Label>Data documento</Label>
              <DateFieldInput id="edit-data" value={editForm.data} onChange={(v) => setEditForm(f => ({ ...f, data: v }))} />
            </div>
            <div className="space-y-2">
              <Label>Scadenza</Label>
              <DateFieldInput id="edit-scadenza" value={editForm.scadenza} onChange={(v) => setEditForm(f => ({ ...f, scadenza: v }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-revisione">Revisione</Label>
              <Input id="edit-revisione" value={editForm.revisione} onChange={(e) => setEditForm(f => ({ ...f, revisione: e.target.value }))} placeholder="es. Rev. 01" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDoc(null)}>Annulla</Button>
            <Button onClick={saveEdit}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AiStatusCell({ doc, onReanalyze, reanalyzingIds }: { doc: DocumentData; onReanalyze?: (doc: DocumentData) => void; reanalyzingIds?: Set<string> }) {
  const ai = doc.ai_extracted_data;
  const status = doc.ai_status || "pending";
  const icon = statusIcons[status];
  const isReanalyzing = reanalyzingIds?.has(doc.id);

  const reanalyzeButton = onReanalyze && (status === "completed" || status === "error") ? (
    <Button
      size="icon"
      variant="ghost"
      className="h-6 w-6 text-muted-foreground hover:text-foreground"
      disabled={isReanalyzing}
      onClick={(e) => { e.stopPropagation(); onReanalyze(doc); }}
      title="Rianalizza"
    >
      <RefreshCw className={cn("w-3.5 h-3.5", isReanalyzing && "animate-spin")} />
    </Button>
  ) : null;

  if (status !== "completed" || !ai) {
    return (
      <span className="flex items-center justify-center gap-1">
        {icon}
        {reanalyzeButton}
      </span>
    );
  }

  return (
    <span className="flex items-center justify-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex justify-center cursor-pointer hover:opacity-70 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {icon}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-96 overflow-auto" align="end" onClick={(e) => e.stopPropagation()}>
          <h4 className="text-sm font-semibold mb-2">Sintesi AI</h4>
          {doc.ai_summary && (
            <p className="text-sm text-muted-foreground mb-3">{doc.ai_summary}</p>
          )}
          {!doc.ai_summary && (
            <p className="text-sm text-muted-foreground mb-3 italic">Nessuna sintesi disponibile.</p>
          )}
          <ExtractedDataGrid data={ai} />
        </PopoverContent>
      </Popover>
      {reanalyzeButton}
    </span>
  );
}

function ExtractedDataGrid({ data }: { data: any }) {
  const fields = [
    { key: "tipo_documento", label: "Tipo Documento" },
    { key: "importi", label: "Importi" },
    { key: "riferimenti_normativi", label: "Riferimenti Normativi" },
    { key: "materiali", label: "Materiali" },
    { key: "lavorazioni", label: "Lavorazioni" },
    { key: "note_sicurezza", label: "Note Sicurezza" },
    { key: "note_ambientali", label: "Note Ambientali" },
  ];

  const rendered = fields.filter(({ key }) => {
    const v = data[key];
    return v && !(Array.isArray(v) && v.length === 0);
  });

  if (rendered.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {rendered.map(({ key, label }) => (
        <div key={key}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-sm text-card-foreground">{getField(data, key)}</p>
        </div>
      ))}
    </div>
  );
}
