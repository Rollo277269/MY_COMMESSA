import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Plus, LogOut, FolderOpen, ArrowRight, FileText,
  BarChart3, LayoutGrid, List, Camera, ImageIcon, Search,
  ArrowUp, ArrowDown, ArrowUpDown, Filter, X, Moon, Sun, Maximize, Minimize, FileDown, Columns3 } from
"lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";
import agisLogo from "@/assets/agis-logo.png";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from
"@/components/ui/dialog";

interface Commessa {
  id: string;
  committente: string | null;
  oggetto_lavori: string | null;
  commessa_consortile: string | null;
  impresa_assegnataria: string | null;
  foto_url: string | null;
  created_at: string;
  stato: string;
}

interface CommessaStats {
  docCount: number;
  avgProgress: number;
  phaseCount: number;
}

interface ColWidth {
  foto: number;
  numero: number;
  oggetto: number;
  committente: number;
  impresa: number;
  doc: number;
  avanzamento: number;
  data: number;
}

const DEFAULT_COL_WIDTHS: ColWidth = {
  foto: 56,
  numero: 80,
  oggetto: 280,
  committente: 160,
  impresa: 140,
  doc: 64,
  avanzamento: 110,
  data: 100
};

export default function SelezionaCommessaPage() {
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [stats, setStats] = useState<Record<string, CommessaStats>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "da_iniziare" | "in_corso" | "completate">("all");
  const [newForm, setNewForm] = useState({ commessa_consortile: "", committente: "", oggetto_lavori: "" });
  const [creating, setCreating] = useState(false);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);
  const [draggingCommessaId, setDraggingCommessaId] = useState<string | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = useState<string | null>(null);
  const [colWidths, setColWidths] = useState<ColWidth>(DEFAULT_COL_WIDTHS);
  const resizingCol = useRef<{key: keyof ColWidth;startX: number;startW: number;} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortKey, setSortKey] = useState<keyof ColWidth | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<keyof ColWidth>>(() => {
    try {
      const saved = localStorage.getItem("commesse-hidden-cols");
      return saved ? new Set(JSON.parse(saved)) : new Set<keyof ColWidth>();
    } catch { return new Set<keyof ColWidth>(); }
  });
  const { setCommessaId } = useCommessa();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchCommesse = async () => {
    setLoading(true);
    const { data } = await supabase.
    from("commessa_data").
    select("id, committente, oggetto_lavori, commessa_consortile, impresa_assegnataria, foto_url, created_at, stato").
    order("commessa_consortile", { ascending: true, nullsFirst: false });
    const list = (data as Commessa[] || []).sort((a, b) => {
      const numA = parseFloat((a.commessa_consortile || "").replace(/[^\d.]/g, "")) || 0;
      const numB = parseFloat((b.commessa_consortile || "").replace(/[^\d.]/g, "")) || 0;
      return numA - numB;
    });
    setCommesse(list);

    if (list.length > 0) {
      const ids = list.map((c) => c.id);
      const [docsRes, phasesRes] = await Promise.all([
      supabase.from("documents").select("id, commessa_id").in("commessa_id", ids),
      supabase.from("cronoprogramma_phases").select("id, commessa_id, progress").in("commessa_id", ids)]
      );
      const statsMap: Record<string, CommessaStats> = {};
      for (const c of list) {
        const docs = (docsRes.data || []).filter((d) => d.commessa_id === c.id);
        const phases = (phasesRes.data || []).filter((p) => p.commessa_id === c.id);
        const avgProgress = phases.length > 0 ?
        Math.round(phases.reduce((sum, p) => sum + (p.progress || 0), 0) / phases.length) :
        0;
        statsMap[c.id] = { docCount: docs.length, avgProgress, phaseCount: phases.length };
      }
      setStats(statsMap);
    }
    setLoading(false);
  };

  useEffect(() => {fetchCommesse();}, []);

  const selectCommessa = (id: string) => {
    setCommessaId(id);
    const redirect = sessionStorage.getItem("postCommessaRedirect");
    sessionStorage.removeItem("postCommessaRedirect");
    navigate(redirect && redirect !== "/commesse" ? redirect : "/");
  };

  const createCommessa = async () => {
    if (!newForm.oggetto_lavori.trim()) {
      toast({ title: "Inserisci almeno l'oggetto dei lavori", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {setCreating(false);return;}
    const { data, error } = await supabase.
    from("commessa_data").
    insert({
      commessa_consortile: newForm.commessa_consortile || null,
      committente: newForm.committente || null,
      oggetto_lavori: newForm.oggetto_lavori,
      user_id: user.id
    } as any).
    select("id").
    single();
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else if (data) {
      toast({ title: "Commessa creata" });
      setDialogOpen(false);
      setNewForm({ commessa_consortile: "", committente: "", oggetto_lavori: "" });
      selectCommessa(data.id);
    }
    setCreating(false);
  };

  const handleLogout = async () => {
    setCommessaId(null);
    await supabase.auth.signOut();
  };

  const handlePhotoClick = (commessaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadingPhotoId(commessaId);
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingPhotoId) return;
    const ext = file.name.split(".").pop();
    const path = `${uploadingPhotoId}/cover.${ext}`;
    const { error: uploadError } = await supabase.storage.
    from("commessa-photos").
    upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Errore upload", description: uploadError.message, variant: "destructive" });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("commessa-photos").getPublicUrl(path);
    await supabase.
    from("commessa_data").
    update({ foto_url: publicUrl } as any).
    eq("id", uploadingPhotoId);
    toast({ title: "Foto aggiornata" });
    setUploadingPhotoId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fetchCommesse();
  };

  // Column resize handlers
  const onResizeStart = (key: keyof ColWidth, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizingCol.current = { key, startX: e.clientX, startW: colWidths[key] };
    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingCol.current) return;
      const diff = ev.clientX - resizingCol.current.startX;
      const newW = Math.max(40, resizingCol.current.startW + diff);
      setColWidths((prev) => ({ ...prev, [resizingCol.current!.key]: newW }));
    };
    const onMouseUp = () => {
      resizingCol.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // Cell text value helper for sorting/filtering
  const getCellValue = useCallback((c: Commessa, key: keyof ColWidth): string => {
    const s = stats[c.id] || { docCount: 0, avgProgress: 0, phaseCount: 0 };
    switch (key) {
      case "numero":return c.commessa_consortile || "—";
      case "oggetto":return c.oggetto_lavori || "Senza titolo";
      case "committente":return c.committente || "—";
      case "impresa":return c.impresa_assegnataria || "—";
      case "doc":return String(s.docCount);
      case "avanzamento":return String(s.avgProgress);
      case "data":return new Date(c.created_at).toLocaleDateString("it-IT");
      default:return "";
    }
  }, [stats]);

  const sortableColumns: (keyof ColWidth)[] = ["numero", "oggetto", "committente", "impresa", "doc", "avanzamento", "data"];

  const handleSort = useCallback((key: keyof ColWidth) => {
    if (!sortableColumns.includes(key)) return;
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");else
    {setSortKey(key);setSortDir("asc");}
  }, [sortKey]);

  const toggleFilter = useCallback((col: string, value: string) => {
    setColumnFilters((prev) => {
      const current = prev[col] ? new Set(prev[col]) : new Set<string>();
      if (current.has(value)) current.delete(value);else
      current.add(value);
      const next = { ...prev };
      if (current.size === 0) delete next[col];else
      next[col] = current;
      return next;
    });
  }, []);

  const clearFilter = useCallback((col: string) => {
    setColumnFilters((prev) => {const next = { ...prev };delete next[col];return next;});
  }, []);

  const clearAllFilters = useCallback(() => setColumnFilters({}), []);

  const activeFilterCount = Object.keys(columnFilters).length;

  // Unique values for each column
  const uniqueValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const col of sortableColumns) {
      const vals = new Set<string>();
      for (const c of commesse) vals.add(getCellValue(c, col));
      result[col] = Array.from(vals).sort((a, b) => a.localeCompare(b, "it"));
    }
    return result;
  }, [commesse, getCellValue]);

  // Search + column filter + sort
  const getCommessaStatus = useCallback((commessaId: string): "da_iniziare" | "in_corso" | "completate" => {
    const c = commesse.find((x) => x.id === commessaId);
    const stato = c?.stato || "da_iniziare";
    if (stato === "completate" || stato === "completata") return "completate";
    if (stato === "in_corso") return "in_corso";
    return "da_iniziare";
  }, [commesse]);

  const handleStatusChange = async (commessaId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("commessa_data").update({ stato: newStatus } as any).eq("id", commessaId);
    setCommesse((prev) => prev.map((c) => c.id === commessaId ? { ...c, stato: newStatus } : c));
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = commesse.filter((c) =>
    !q ||
    c.oggetto_lavori?.toLowerCase().includes(q) ||
    c.committente?.toLowerCase().includes(q) ||
    c.commessa_consortile?.toLowerCase().includes(q) ||
    c.impresa_assegnataria?.toLowerCase().includes(q)
    );
    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => getCommessaStatus(c.id) === statusFilter);
    }
    // Column filters
    for (const [col, allowedValues] of Object.entries(columnFilters)) {
      if (allowedValues.size > 0) {
        result = result.filter((c) => allowedValues.has(getCellValue(c, col as keyof ColWidth)));
      }
    }
    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const va = getCellValue(a, sortKey);
        const vb = getCellValue(b, sortKey);
        const na = parseFloat(va),nb = parseFloat(vb);
        const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : va.localeCompare(vb, "it");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [commesse, searchQuery, statusFilter, sortKey, sortDir, columnFilters, getCellValue, getCommessaStatus]);

  const handlePhotoDrop = async (commessaId: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadingPhotoId(commessaId);
    const ext = file.name.split(".").pop();
    const path = `${commessaId}/cover.${ext}`;
    const { error: uploadError } = await supabase.storage.
    from("commessa-photos").
    upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Errore upload", description: uploadError.message, variant: "destructive" });
      setUploadingPhotoId(null);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("commessa-photos").getPublicUrl(path);
    await supabase.from("commessa_data").update({ foto_url: publicUrl } as any).eq("id", commessaId);
    toast({ title: "Foto aggiornata" });
    setUploadingPhotoId(null);
    fetchCommesse();
  };

  const PhotoThumbnail = ({ c, size = "md" }: {c: Commessa;size?: "sm" | "md";}) => {
    const [dragging, setDragging] = useState(false);
    const dim = size === "sm" ? "w-10 h-10" : "w-full h-28";
    const isUploading = uploadingPhotoId === c.id;
    return (
      <div
        className={cn(
          dim, "rounded-lg overflow-hidden bg-muted flex items-center justify-center cursor-pointer group/photo relative",
          size === "sm" && "flex-shrink-0",
          dragging && "ring-2 ring-primary bg-primary/10",
          isUploading && "pointer-events-none opacity-60"
        )}
        onClick={(e) => handlePhotoClick(c.id, e)}
        onDragOver={(e) => {e.preventDefault();e.stopPropagation();setDragging(true);}}
        onDragLeave={(e) => {e.preventDefault();e.stopPropagation();setDragging(false);}}
        onDrop={(e) => {
          e.preventDefault();e.stopPropagation();setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handlePhotoDrop(c.id, file);
        }}
        title="Clicca o trascina una foto">
        
        {isUploading ?
        <div className="flex flex-col items-center gap-1 text-primary">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {size === "md" && <span className="text-[10px]">Caricamento...</span>}
          </div> :
        dragging ?
        <div className="flex flex-col items-center gap-1 text-primary">
            <Camera className={size === "sm" ? "w-4 h-4" : "w-6 h-6"} />
            {size === "md" && <span className="text-[10px] font-medium">Rilascia qui</span>}
          </div> :
        c.foto_url ?
        <>
            <img src={c.foto_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </> :

        <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover/photo:text-primary transition-colors">
            <ImageIcon className={size === "sm" ? "w-4 h-4" : "w-6 h-6"} />
            {size === "md" && <span className="text-[10px]">Trascina o clicca</span>}
          </div>
        }
      </div>);

  };

  const statusOptions = [
  { value: "da_iniziare", label: "Da iniziare", bg: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400", dot: "bg-yellow-500" },
  { value: "in_corso", label: "In corso", bg: "bg-orange-500/15 text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  { value: "completate", label: "Completata", bg: "bg-green-500/15 text-green-700 dark:text-green-400", dot: "bg-green-500" }];


  const StatusBadge = ({ commessaId }: {commessaId: string;}) => {
    const status = getCommessaStatus(commessaId);
    const cfg = statusOptions.find((o) => o.value === status) || statusOptions[0];
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold hover:ring-2 hover:ring-primary/30 transition-all", cfg.bg)}
            title="Cambia stato">
            
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="start" onClick={(e) => e.stopPropagation()}>
          {statusOptions.map((opt) =>
          <button
            key={opt.value}
            onClick={(e) => handleStatusChange(commessaId, opt.value, e)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              status === opt.value ? "bg-accent text-foreground" : "hover:bg-accent/50 text-muted-foreground"
            )}>
            
              <span className={cn("w-2 h-2 rounded-full", opt.dot)} />
              {opt.label}
            </button>
          )}
        </PopoverContent>
      </Popover>);

  };

  const ResizeHandle = ({ colKey }: {colKey: keyof ColWidth;}) =>
  <div
    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 transition-colors z-10"
    onMouseDown={(e) => onResizeStart(colKey, e)} />;

  const columns: {key: keyof ColWidth;label: string;}[] = [
  { key: "foto", label: "Foto" },
  { key: "numero", label: "N." },
  { key: "oggetto", label: "Oggetto Lavori" },
  { key: "committente", label: "Committente" },
  { key: "impresa", label: "Impresa" },
  { key: "doc", label: "Doc" },
  { key: "avanzamento", label: "Avanzamento" },
  { key: "data", label: "Creata il" }];

  const visibleColumns = useMemo(() => columns.filter((c) => !hiddenColumns.has(c.key)), [hiddenColumns]);

  const toggleColumn = useCallback((key: keyof ColWidth) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      localStorage.setItem("commesse-hidden-cols", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const exportPdf = useCallback(() => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    const printCols = visibleColumns.filter((col) => col.key !== "foto");
    const head = [printCols.map((col) => col.label)];
    const body = filtered.map((c) => {
      const s = stats[c.id] || { docCount: 0, avgProgress: 0, phaseCount: 0 };
      return printCols.map((col) => {
        switch (col.key) {
          case "numero": return c.commessa_consortile || "—";
          case "oggetto": return c.oggetto_lavori || "Senza titolo";
          case "committente": return c.committente || "—";
          case "impresa": return c.impresa_assegnataria || "—";
          case "doc": return String(s.docCount);
          case "avanzamento": return `${s.avgProgress}%`;
          case "data": return new Date(c.created_at).toLocaleDateString("it-IT");
          default: return "";
        }
      });
    });

    const pw = doc.internal.pageSize.getWidth();

    // Logo AGIS top-right
    try { doc.addImage(agisLogo, "PNG", pw - 32, 4, 18, 14); } catch {}

    doc.setFontSize(14);
    doc.text("Elenco Commesse", 14, 15);
    doc.setFontSize(8);
    doc.text(`Stampato il ${new Date().toLocaleDateString("it-IT")} — ${filtered.length} commesse`, 14, 21);

    autoTable(doc, {
      startY: 25,
      head,
      body,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 65, 122], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      margin: { left: 10, right: 10 },
    });

    doc.save("elenco-commesse.pdf");
  }, [filtered, stats, visibleColumns]);


  return (
    <div className="min-h-screen bg-background">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      <div className="max-w-[100vw] mx-auto">
        {/* Sticky toolbar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Title */}
            <div className="flex items-center gap-2 mr-auto">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <h1 className="font-display font-bold text-foreground whitespace-nowrap text-4xl">Le tue Commesse</h1>
            </div>

            {/* Search */}
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca..."
                className="pl-9 h-8 text-sm" />
            </div>

            {/* Status filter tabs (drop targets) */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              {([
              { value: "all", label: "Tutte", color: "" },
              { value: "da_iniziare", label: "Da iniziare", color: "bg-yellow-500" },
              { value: "in_corso", label: "In corso", color: "bg-orange-500" },
              { value: "completate", label: "Completate", color: "bg-green-500" }] as
              const).map((opt) => {
                const count = opt.value === "all"
                  ? commesse.length
                  : commesse.filter((c) => getCommessaStatus(c.id) === opt.value).length;
                return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  onDragOver={(e) => {if (draggingCommessaId && opt.value !== "all") {e.preventDefault();setDropTargetStatus(opt.value);}}}
                  onDragLeave={() => setDropTargetStatus(null)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDropTargetStatus(null);
                    if (draggingCommessaId && opt.value !== "all") {
                      await supabase.from("commessa_data").update({ stato: opt.value } as any).eq("id", draggingCommessaId);
                      setCommesse((prev) => prev.map((c) => c.id === draggingCommessaId ? { ...c, stato: opt.value } : c));
                      setDraggingCommessaId(null);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                    statusFilter === opt.value ?
                    "bg-primary text-primary-foreground" :
                    "bg-card text-muted-foreground hover:bg-accent",
                    dropTargetStatus === opt.value && "ring-2 ring-primary scale-105 bg-primary/20 text-foreground"
                  )}>
                    {opt.color && <span className={cn("w-2 h-2 rounded-full flex-shrink-0", opt.color)} />}
                    {opt.label}
                    <span className={cn(
                      "ml-0.5 text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
                      statusFilter === opt.value
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active column filters */}
            {activeFilterCount > 0 &&
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={clearAllFilters}>
                <Filter className="w-3.5 h-3.5 text-primary" />
                {activeFilterCount} filtri
                <X className="w-3 h-3" />
              </Button>
            }

            {/* View mode */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 transition-colors", viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent")}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn("p-1.5 transition-colors", viewMode === "table" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent")}>
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Column chooser */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-accent transition-colors"
                  title="Scegli colonne">
                  <Columns3 className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Colonne</p>
                <div className="space-y-0.5">
                  {columns.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-accent/50 cursor-pointer text-sm">
                      <Checkbox
                        checked={!hiddenColumns.has(col.key)}
                        onCheckedChange={() => toggleColumn(col.key)} />
                      <span className="truncate">{col.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* PDF export */}
            <button
              onClick={exportPdf}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-accent transition-colors"
              title="Esporta elenco in PDF (A3)">
              <FileDown className="w-4 h-4" />
            </button>

            {/* Fullscreen + Dark mode */}
            <button
              onClick={() => {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
                else document.exitFullscreen().catch(() => {});
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-accent transition-colors"
              title={document.fullscreenElement ? "Esci da schermo intero" : "Schermo intero"}>
              {document.fullscreenElement ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                document.documentElement.classList.toggle("dark");
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-accent transition-colors"
              title={document.documentElement.classList.contains("dark") ? "Modalità giorno" : "Modalità notte"}>
              {document.documentElement.classList.contains("dark") ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* New + Logout */}
            <Button size="sm" className="gap-1.5 h-8" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4" /> Nuova
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="px-3 pt-3">

        {loading ?
          <div className="text-center py-12 text-muted-foreground">Caricamento...</div> :
          viewMode === "grid" ? (
          /* ========== GRID VIEW ========== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => {
              const s = stats[c.id] || { docCount: 0, avgProgress: 0, phaseCount: 0 };
              return (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDraggingCommessaId(c.id)}
                  onDragEnd={() => {setDraggingCommessaId(null);setDropTargetStatus(null);}}
                  onClick={() => selectCommessa(c.id)}
                  className={cn("bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer flex flex-col", draggingCommessaId === c.id && "opacity-50")}>
                
                  <PhotoThumbnail c={c} size="md" />
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
                        {c.commessa_consortile &&
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            N. {c.commessa_consortile}
                          </span>
                        }
                        <StatusBadge commessaId={c.id} />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">
                        {c.oggetto_lavori || "Commessa senza titolo"}
                      </h3>
                      {c.committente &&
                      <p className="text-xs text-muted-foreground">{c.committente}</p>
                      }
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {s.docCount} doc</span>
                        <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> {s.phaseCount} fasi</span>
                      </div>
                      {s.phaseCount > 0 &&
                      <div className="flex items-center gap-2">
                          <Progress value={s.avgProgress} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">{s.avgProgress}%</span>
                        </div>
                      }
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString("it-IT")}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>);

            })}
            {filtered.length === 0 &&
            <div className="col-span-full text-center py-12 text-muted-foreground">Nessuna commessa trovata</div>
            }
          </div>) : (

          /* ========== TABLE VIEW ========== */
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {visibleColumns.map((col) => {
                      const isSortable = sortableColumns.includes(col.key);
                      return (
                        <th
                          key={col.key}
                          className={cn(
                            "relative text-left font-medium text-muted-foreground px-3 py-3 select-none",
                            isSortable && "cursor-pointer hover:text-foreground transition-colors"
                          )}
                          style={{ width: colWidths[col.key], minWidth: 40 }}
                          onClick={() => isSortable && handleSort(col.key)}>
                        
                          <span className="flex items-center gap-1">
                            <span className="truncate">{col.label}</span>
                            {isSortable && (
                            sortKey === col.key ?
                            sortDir === "asc" ? <ArrowUp className="w-3 h-3 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 flex-shrink-0" /> :
                            <ArrowUpDown className="w-3 h-3 opacity-30 flex-shrink-0" />)
                            }
                            {isSortable &&
                            <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                  className={cn(
                                    "ml-auto flex-shrink-0 p-0.5 rounded hover:bg-accent/50 transition-colors",
                                    columnFilters[col.key] ? "text-primary" : "text-muted-foreground opacity-40 hover:opacity-100"
                                  )}
                                  onClick={(e) => e.stopPropagation()}>
                                
                                    <Filter className="w-3 h-3" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2 max-h-64 overflow-auto" align="start" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtra</p>
                                    {columnFilters[col.key] &&
                                  <button className="text-xs text-primary hover:underline" onClick={() => clearFilter(col.key)}>Rimuovi</button>
                                  }
                                  </div>
                                  <div className="space-y-0.5">
                                    {(uniqueValues[col.key] || []).map((val) =>
                                  <label key={val} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-accent/50 cursor-pointer text-sm truncate">
                                        <Checkbox
                                      checked={columnFilters[col.key]?.has(val) ?? false}
                                      onCheckedChange={() => toggleFilter(col.key, val)} />
                                  
                                        <span className="truncate">{val}</span>
                                      </label>
                                  )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            }
                          </span>
                          <ResizeHandle colKey={col.key} />
                        </th>);

                    })}
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const s = stats[c.id] || { docCount: 0, avgProgress: 0, phaseCount: 0 };
                    return (
                      <tr
                        key={c.id}
                        draggable
                        onDragStart={() => setDraggingCommessaId(c.id)}
                        onDragEnd={() => {setDraggingCommessaId(null);setDropTargetStatus(null);}}
                        className={cn("border-b border-border/50 cursor-pointer hover:bg-accent/50 transition-colors", draggingCommessaId === c.id && "opacity-50")}
                        onClick={() => selectCommessa(c.id)}>
                      
                        {visibleColumns.map((col) => {
                          const s = stats[c.id] || { docCount: 0, avgProgress: 0, phaseCount: 0 };
                          switch (col.key) {
                            case "foto": return <td key={col.key} className="px-3 py-2" style={{ width: colWidths.foto }}><PhotoThumbnail c={c} size="sm" /></td>;
                            case "numero": return <td key={col.key} className="px-3 py-2 font-mono text-xs text-muted-foreground" style={{ width: colWidths.numero }}><div className="flex items-center gap-2"><span>{c.commessa_consortile || "—"}</span><StatusBadge commessaId={c.id} /></div></td>;
                            case "oggetto": return <td key={col.key} className="px-3 py-2 font-medium" style={{ width: colWidths.oggetto }}><span className="whitespace-normal break-words">{c.oggetto_lavori || "Senza titolo"}</span></td>;
                            case "committente": return <td key={col.key} className="px-3 py-2 text-muted-foreground" style={{ width: colWidths.committente }}>{c.committente || "—"}</td>;
                            case "impresa": return <td key={col.key} className="px-3 py-2 text-muted-foreground" style={{ width: colWidths.impresa }}>{c.impresa_assegnataria || "—"}</td>;
                            case "doc": return <td key={col.key} className="px-3 py-2 text-center text-muted-foreground" style={{ width: colWidths.doc }}>{s.docCount}</td>;
                            case "avanzamento": return <td key={col.key} className="px-3 py-2" style={{ width: colWidths.avanzamento }}><div className="flex items-center gap-2"><Progress value={s.avgProgress} className="h-1.5 flex-1" /><span className="text-[10px] text-muted-foreground w-7 text-right">{s.avgProgress}%</span></div></td>;
                            case "data": return <td key={col.key} className="px-3 py-2 text-xs text-muted-foreground" style={{ width: colWidths.data }}>{new Date(c.created_at).toLocaleDateString("it-IT")}</td>;
                            default: return null;
                          }
                        })}
                        <td className="px-3 py-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </td>
                      </tr>);

                  })}
                  {filtered.length === 0 &&
                  <tr><td colSpan={visibleColumns.length + 1} className="text-center py-8 text-muted-foreground">Nessuna commessa trovata</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>)
          }
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuova Commessa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Oggetto dei lavori *</Label>
              <Input value={newForm.oggetto_lavori} onChange={(e) => setNewForm((f) => ({ ...f, oggetto_lavori: e.target.value }))} placeholder="Descrivi l'oggetto dei lavori" />
            </div>
            <div className="space-y-2">
              <Label>Commessa Consortile N.</Label>
              <Input value={newForm.commessa_consortile} onChange={(e) => setNewForm((f) => ({ ...f, commessa_consortile: e.target.value }))} placeholder="es. 2025/001" />
            </div>
            <div className="space-y-2">
              <Label>Committente</Label>
              <Input value={newForm.committente} onChange={(e) => setNewForm((f) => ({ ...f, committente: e.target.value }))} placeholder="Nome del committente" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annulla</Button>
            <Button onClick={createCommessa} disabled={creating}>{creating ? "Creazione..." : "Crea Commessa"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>);

}