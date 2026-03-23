import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { useCommessa } from "@/contexts/CommessaContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Receipt, Plus, Trash2, ArrowUpRight, ArrowDownRight, BarChart3, Tag,
  RefreshCw, FileText, Sparkles, AlertCircle, CheckCircle2, Loader2, GripVertical, Download } from
"lucide-react";
import { useReanalyzeDocument } from "@/hooks/useReanalyzeDocument";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentPreview } from "@/components/DocumentPreview";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { generateEconomiaCssrPdf } from "@/lib/generateEconomiaCssrPdf";
import agisLogo from "@/assets/agis-logo.png";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from
"@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from
"@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle } from
"@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FattureTable } from "@/components/fatture/FattureTable";
import { FattureToolbar } from "@/components/fatture/FattureToolbar";
import {
  type Fattura, type CentroImputazione, type FatturaColumnKey,
  DEFAULT_FATTURA_COLUMNS, fmtCurrency } from
"@/components/fatture/types";

const EMPTY_FATTURA = {
  tipo: "acquisto" as "vendita" | "acquisto",
  numero: "",
  data: new Date().toISOString().slice(0, 10),
  fornitore_cliente: "",
  descrizione: "",
  importo: 0,
  aliquota_iva: 22,
  stato_pagamento: "da_pagare",
  data_scadenza: "",
  cm_centro_imputazione_id: "",
  note: "",
  cig: "",
  cup: "",
  split_payment: false,
  ritenuta_acconto: 0,
  codice_sdi: ""
};

export default function EconomiaCSSRPage() {
  const { toast } = useToast();
  const { commessaId } = useCommessa();
  const [fatture, setFatture] = useState<Fattura[]>([]);
  const [centri, setCentri] = useState<CentroImputazione[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotaLavori, setQuotaLavori] = useState<string>("");
  const [quotaServizi, setQuotaServizi] = useState<string>("");
  const [selectedFattura, setSelectedFattura] = useState<Fattura | null>(null);
  const [activeTab, setActiveTab] = useState<string>("emesse");

  // filters
  const [filterTipo, setFilterTipo] = useState<string>("tutti");
  const [filterStato, setFilterStato] = useState<string>("tutti");
  const [filterCentro, setFilterCentro] = useState<string>("tutti");
  const [searchText, setSearchText] = useState("");

  // column config with persistence
  const [visibleColumns, setVisibleColumns] = useState<FatturaColumnKey[]>(() => {
    try {const s = localStorage.getItem("fatture-vis-cols");if (s) return JSON.parse(s);} catch {}return DEFAULT_FATTURA_COLUMNS;
  });
  const [columnOrder, setColumnOrder] = useState<FatturaColumnKey[]>(() => {
    try {const s = localStorage.getItem("fatture-col-order");if (s) return JSON.parse(s);} catch {}return DEFAULT_FATTURA_COLUMNS;
  });
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {const s = localStorage.getItem("fatture-col-widths");if (s) return JSON.parse(s);} catch {}return {};
  });

  const updateVisibleColumns = useCallback((cols: FatturaColumnKey[]) => {
    setVisibleColumns(cols);
    try {localStorage.setItem("fatture-vis-cols", JSON.stringify(cols));} catch {}
  }, []);
  const updateColumnOrder = useCallback((order: FatturaColumnKey[]) => {
    setColumnOrder(order);
    try {localStorage.setItem("fatture-col-order", JSON.stringify(order));} catch {}
  }, []);
  const updateColumnWidths = useCallback((widths: Record<string, number>) => {
    setColumnWidths(widths);
    try {localStorage.setItem("fatture-col-widths", JSON.stringify(widths));} catch {}
  }, []);
  const resetColumns = useCallback(() => {
    setVisibleColumns(DEFAULT_FATTURA_COLUMNS);
    setColumnOrder(DEFAULT_FATTURA_COLUMNS);
    setColumnWidths({});
    try {localStorage.removeItem("fatture-vis-cols");localStorage.removeItem("fatture-col-order");localStorage.removeItem("fatture-col-widths");} catch {}
  }, []);

  // form
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FATTURA);

  // centri dialog
  const [centriDialogOpen, setCentriDialogOpen] = useState(false);
  const [newCentroNome, setNewCentroNome] = useState("");
  const [newCentroTipo, setNewCentroTipo] = useState<"costo" | "ricavo">("costo");

  /* ─── Load data ─── */
  const loadData = async () => {
    if (!commessaId) return;
    setLoading(true);
    const [{ data: f }, { data: c }, { data: d }, { data: cd }] = await Promise.all([
    supabase.from("cm_fatture").select("*").eq("cm_commessa_id", commessaId).order("data", { ascending: false }),
    supabase.from("cm_centri_imputazione").select("*").eq("cm_commessa_id", commessaId).eq("sezione", "cssr").order("sort_order"),
    supabase.from("cm_documents").select("*").eq("cm_commessa_id", commessaId).eq("section", "economia-cssr").order("created_at", { ascending: false }),
    supabase.from("cm_commessa_data").select("aggio_consorzio, quota_servizi_tecnici").eq("id", commessaId).maybeSingle()]
    );
    setFatture(f as Fattura[] || []);
    setCentri(c as CentroImputazione[] || []);
    setDocuments(d || []);
    if (cd) {
      setQuotaLavori(cd.aggio_consorzio != null ? String(cd.aggio_consorzio) : "3");
      setQuotaServizi(cd.quota_servizi_tecnici != null ? String(cd.quota_servizi_tecnici) : "0");
    }
    setLoading(false);
  };

  useEffect(() => {loadData();}, [commessaId]);

  const saveQuote = async (field: "aggio_consorzio" | "quota_servizi_tecnici", value: string) => {
    if (!commessaId) return;
    const num = parseFloat(value) || 0;
    await supabase.from("cm_commessa_data").update({ [field]: num }).eq("id", commessaId);
  };

  const { reanalyze, reanalyzingIds } = useReanalyzeDocument(loadData);

  /* ─── Delete document ─── */
  const handleDeleteDocument = async (doc: any) => {
    if (!confirm("Eliminare questo documento e le fatture associate?")) return;
    await supabase.storage.from("cm-documents").remove([doc.file_path]);
    await supabase.from("cm_fatture").delete().eq("file_path", doc.file_path);
    const { error } = await supabase.from("cm_documents").delete().eq("id", doc.id);
    if (error) {toast({ title: "Errore eliminazione documento", variant: "destructive" });return;}
    toast({ title:"Documento eliminato" });
    loadData();
  };

  /* ─── Stats ─── */
  const totVendite = useMemo(() => fatture.filter((f) => f.tipo === "vendita").reduce((s, f) => s + Number(f.importo_totale), 0), [fatture]);
  const totAcquisti = useMemo(() => fatture.filter((f) => f.tipo === "acquisto").reduce((s, f) => s + Number(f.importo_totale), 0), [fatture]);
  const margine = totVendite - totAcquisti;

  // IVA breakdown
  const ivaStats = useMemo(() => {
    let ivaVendite = 0,ivaAcquisti = 0,ivaSplitVendite = 0,ivaSplitAcquisti = 0;
    fatture.forEach((f) => {
      const iva = Number(f.importo_iva) || 0;
      if (f.tipo === "vendita") {
        if (f.split_payment) ivaSplitVendite += iva;else ivaVendite += iva;
      } else {
        if (f.split_payment) ivaSplitAcquisti += iva;else ivaAcquisti += iva;
      }
    });
    return { ivaVendite, ivaAcquisti, ivaSplitVendite, ivaSplitAcquisti, totale: ivaVendite + ivaAcquisti + ivaSplitVendite + ivaSplitAcquisti };
  }, [fatture]);

  /* ─── Drag & drop reorder centri ─── */
  const [dragCentroId, setDragCentroId] = useState<string | null>(null);
  const [dragOverCentroId, setDragOverCentroId] = useState<string | null>(null);

  const handleDragStart = (centroId: string) => {
    setDragCentroId(centroId);
  };

  const handleDragOver = (e: React.DragEvent, centroId: string) => {
    e.preventDefault();
    setDragOverCentroId(centroId);
  };

  const handleDrop = async (targetId: string, tipo: "ricavo" | "costo") => {
    if (!dragCentroId || dragCentroId === targetId) {
      setDragCentroId(null);
      setDragOverCentroId(null);
      return;
    }

    const centriTipo = centri.filter((c) => c.tipo === tipo);
    const fromIdx = centriTipo.findIndex((c) => c.id === dragCentroId);
    const toIdx = centriTipo.findIndex((c) => c.id === targetId);
    if (fromIdx < 0 || toIdx < 0) { setDragCentroId(null); setDragOverCentroId(null); return; }

    // Reorder array
    const reordered = [...centriTipo];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Assign new sort_orders
    const updates = reordered.map((c, i) => ({ ...c, sort_order: i }));

    // Optimistic update
    setCentri((prev) => {
      const other = prev.filter((c) => c.tipo !== tipo);
      return [...other, ...updates].sort((a, b) => a.sort_order - b.sort_order);
    });

    setDragCentroId(null);
    setDragOverCentroId(null);

    // Persist
    await Promise.all(
      updates.map((c) =>
        supabase.from("cm_centri_imputazione").update({ sort_order: c.sort_order }).eq("id", c.id)
      )
    );
  };

  /* ─── Chart data: monthly breakdown ─── */
  const chartData = useMemo(() => {
    const monthMap: Record<string, { month: string; ricavi: number; costi: number; incassato: number; pagato: number }> = {};
    fatture.forEach((f) => {
      const key = f.data ? f.data.substring(0, 7) : "sconosciuto";
      if (!monthMap[key]) {
        const label = f.data ? format(parseISO(f.data), "MMM yyyy", { locale: it }) : key;
        monthMap[key] = { month: label, ricavi: 0, costi: 0, incassato: 0, pagato: 0 };
      }
      const tot = Number(f.importo_totale) || 0;
      const inc = Number(f.importo_incassato) || 0;
      if (f.tipo === "vendita") {
        monthMap[key].ricavi += tot;
        monthMap[key].incassato += inc;
      } else {
        monthMap[key].costi += tot;
        monthMap[key].pagato += inc;
      }
    });
    const sorted = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
    let cumMargin = 0, cumRicavi = 0, cumCosti = 0, cumIncassato = 0, cumPagato = 0;
    return sorted.map((d) => {
      cumMargin += d.ricavi - d.costi;
      cumRicavi += d.ricavi;
      cumCosti += d.costi;
      cumIncassato += d.incassato;
      cumPagato += d.pagato;
      return { ...d, margineCumulativo: cumMargin, ricaviCum: cumRicavi, costiCum: cumCosti, incassatoCum: cumIncassato, pagatoCum: cumPagato };
    });
  }, [fatture]);

  const chartTooltipFormatter = (value: number) => fmtCurrency(value);

  const handleSave = async () => {
    if (!commessaId) return;
    const payload = {
      cm_commessa_id: commessaId,
      tipo: form.tipo, numero: form.numero, data: form.data,
      fornitore_cliente: form.fornitore_cliente,
      descrizione: form.descrizione || null,
      importo: form.importo, aliquota_iva: form.aliquota_iva,
      stato_pagamento: form.stato_pagamento,
      data_scadenza: form.data_scadenza || null,
      cm_centro_imputazione_id: form.cm_centro_imputazione_id || null,
      note: form.note || null, cig: form.cig || null, cup: form.cup || null,
      split_payment: form.split_payment,
      ritenuta_acconto: form.ritenuta_acconto || 0,
      codice_sdi: form.codice_sdi || null
    };
    if (editingId) {
      const { error } = await supabase.from("cm_fatture").update(payload).eq("id", editingId);
      if (error) {toast({ title: "Errore aggiornamento", variant: "destructive" });return;}
      toast({ title:"Fattura aggiornata" });
    } else {
      const { error } = await supabase.from("cm_fatture").insert(payload);
      if (error) {toast({ title: "Errore inserimento", variant: "destructive" });return;}
      toast({ title:"Fattura inserita" });
    }
    setSheetOpen(false);setEditingId(null);setForm(EMPTY_FATTURA);loadData();
  };

  const handleEdit = (f: Fattura) => {
    setEditingId(f.id);
    setForm({
      tipo: f.tipo, numero: f.numero, data: f.data,
      fornitore_cliente: f.fornitore_cliente,
      descrizione: f.descrizione || "", importo: f.importo,
      aliquota_iva: f.aliquota_iva, stato_pagamento: f.stato_pagamento,
      data_scadenza: f.data_scadenza || "",
      cm_centro_imputazione_id: f.cm_centro_imputazione_id || "",
      note: f.note || "", cig: f.cig || "", cup: f.cup || "",
      split_payment: f.split_payment, ritenuta_acconto: f.ritenuta_acconto || 0,
      codice_sdi: f.codice_sdi || ""
    });
    setSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cm_fatture").delete().eq("id", id);
    if (error) {toast({ title: "Errore eliminazione", variant: "destructive" });return;}
    toast({ title:"Fattura eliminata" });loadData();
  };

  const handleToggleTipo = async (id: string, newTipo: "acquisto" | "vendita") => {
    const { error } = await supabase.from("cm_fatture").update({ tipo: newTipo }).eq("id", id);
    if (error) {toast({ title: "Errore aggiornamento tipo", variant: "destructive" });return;}
  };

  const handleChangeCentro = async (id: string, centroId: string | null) => {
    const { error } = await supabase.from("cm_fatture").update({ cm_centro_imputazione_id: centroId, centro_auto_assigned: false }).eq("id", id);
    if (error) {toast({ title: "Errore aggiornamento centro", variant: "destructive" });return;}
    setFatture((prev) => prev.map((f) => f.id === id ? { ...f, cm_centro_imputazione_id: centroId, centro_auto_assigned: false } : f));
    toast({ title:"Centro aggiornato" });
  };

  /* ─── Centri CRUD ─── */
  const handleAddCentro = async () => {
    if (!commessaId || !newCentroNome.trim()) return;
    const { error } = await supabase.from("cm_centri_imputazione").insert({
      cm_commessa_id: commessaId, nome: newCentroNome.trim(), tipo: newCentroTipo,
      is_default: false, sort_order: centri.length
    });
    if (error) {toast({ title: "Errore", variant: "destructive" });return;}
    toast({ title:"Centro aggiunto" });setNewCentroNome("" );loadData();
  };

  const handleDeleteCentro = async (id: string) => {
    const { error } = await supabase.from("cm_centri_imputazione").delete().eq("id", id);
    if (error) {toast({ title: "Errore", variant: "destructive" });return;}
    toast({ title:"Centro eliminato" });loadData();
  };

  // filtered for riepilogo
  const filteredForRiepilogo = useMemo(() => {
    return fatture.filter((f) => {
      if (filterTipo !== "tutti" && f.tipo !== filterTipo) return false;
      if (filterStato !== "tutti" && f.stato_pagamento !== filterStato) return false;
      if (filterCentro !== "tutti" && f.cm_centro_imputazione_id !== filterCentro) return false;
      return true;
    });
  }, [fatture, filterTipo, filterStato, filterCentro]);

  // Split fatture by tipo
  const fattureVendite = useMemo(() => fatture.filter((f) => f.tipo === "vendita"), [fatture]);
  const fattureAcquisti = useMemo(() => fatture.filter((f) => f.tipo === "acquisto"), [fatture]);

  // Helper to render a FattureTable with optional split-screen
  const renderTableSection = (
  sectionFatture: Fattura[],
  tipoLabel: string,
  forceTipoFilter: string) =>
  {
    const isSelected = selectedFattura?.file_path && sectionFatture.some((f) => f.id === selectedFattura?.id);

    if (isSelected) {
      const fatturaFileName = selectedFattura!.file_path!.split('/').pop() || '';
      const matchingDoc = documents.find((d) => {
        const docFileName = (d.file_path || '').split('/').pop() || '';
        return docFileName.includes(fatturaFileName) || fatturaFileName.includes(docFileName) || d.file_path === selectedFattura!.file_path;
      });
      const previewPath = matchingDoc?.file_path || selectedFattura!.file_path!;

      return (
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border border-border bg-card min-h-[300px]">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full overflow-auto">
              <FattureTable
                fatture={sectionFatture}
                centri={centri}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleTipo={handleToggleTipo}
                onChangeCentro={handleChangeCentro}
                onSelect={setSelectedFattura}
                selectedId={selectedFattura?.id}
                searchText={searchText}
                filterTipo={forceTipoFilter}
                filterStato={filterStato}
                filterCentro={filterCentro}
                visibleColumns={visibleColumns}
                columnOrder={columnOrder}
                onColumnOrderChange={updateColumnOrder}
                columnWidths={columnWidths}
                onColumnWidthsChange={updateColumnWidths} />
              
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={25}>
            <DocumentPreview
              document={{
                id: selectedFattura!.id,
                file_name: `${selectedFattura!.tipo === 'vendita' ? 'Vendita' : 'Acquisto'} ${selectedFattura!.numero} - ${selectedFattura!.fornitore_cliente}`,
                file_path: previewPath,
                file_type: 'application/pdf'
              }}
              onClose={() => setSelectedFattura(null)} />
            
          </ResizablePanel>
        </ResizablePanelGroup>);

    }

    return (
      <FattureTable
        fatture={sectionFatture}
        centri={centri}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleTipo={handleToggleTipo}
        onChangeCentro={handleChangeCentro}
        onSelect={(f) => f.file_path ? setSelectedFattura(f) : null}
        selectedId={selectedFattura?.id}
        searchText={searchText}
        filterTipo={forceTipoFilter}
        filterStato={filterStato}
        filterCentro={filterCentro}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        onColumnOrderChange={updateColumnOrder}
        columnWidths={columnWidths}
        onColumnWidthsChange={updateColumnWidths} />);


  };

  const chartsContainerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      let chartImages: string[] = [];
      if (chartsContainerRef.current) {
        const chartEls = chartsContainerRef.current.querySelectorAll<HTMLElement>(".chart-capture");
        for (const el of Array.from(chartEls)) {
          const canvas = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2 });
          chartImages.push(canvas.toDataURL("image/png"));
        }
      }
      const blob = await generateEconomiaCssrPdf({
        commessaLabel: commessaId || "",
        fatture,
        centri,
        filteredFatture: filteredForRiepilogo,
        quotaLavoriPct: parseFloat(quotaLavori) || 0,
        quotaServiziPct: parseFloat(quotaServizi) || 0,
        ivaStats,
        chartImages,
      }, agisLogo);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "economia-cssr.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title:"PDF esportato" });
    } catch {
      toast({ title: "Errore generazione PDF", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full">
        <div className="flex items-center justify-between mb-4">
          <PageHeader title="Economia CSSR" icon={Receipt} />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportPdf} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Stampa PDF
          </Button>
        </div>

        {/* KPIs + Quote Consorzio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Margine" value={fmtCurrency(margine)} subtitle="Ricavi - Costi" icon={<BarChart3 className="w-4 h-4 text-accent" />} />
          <StatCard label="Fatture Totali" value={String(fatture.length)} subtitle="registrate" icon={<Receipt className="w-4 h-4 text-accent" />} />
          <div className="bg-card border border-border rounded-lg p-3 shadow-card">
            <Label className="text-[10px] text-muted-foreground">Quota lavori (consorzio) %</Label>
            <Input type="number" step="0.1" min="0" max="100" value={quotaLavori} onChange={(e) => setQuotaLavori(e.target.value)} onBlur={() => saveQuote("aggio_consorzio", quotaLavori)} className="mt-0.5 h-7 text-sm" />
            {(() => {
              const quotaLavoriPct = parseFloat(quotaLavori) || 0;
              const quotaLavoriCalc = totVendite * quotaLavoriPct / 100;
              const isMatch = Math.abs(quotaLavoriCalc - margine) < 0.01;
              return <p className={cn("text-[10px] mt-1 font-medium", isMatch ? "text-success" : "text-destructive")}>{isMatch ? "✓" : "✗"} {fmtCurrency(quotaLavoriCalc)} {!isMatch && `≠ ${fmtCurrency(margine)}`}</p>;
            })()}
          </div>
          <div className="bg-card border border-border rounded-lg p-3 shadow-card">
            <Label className="text-[10px] text-muted-foreground">Quota servizi tecnici %</Label>
            <Input type="number" step="0.1" min="0" max="100" value={quotaServizi} onChange={(e) => setQuotaServizi(e.target.value)} onBlur={() => saveQuote("quota_servizi_tecnici", quotaServizi)} className="mt-0.5 h-7 text-sm" />
          </div>
        </div>

        {!loading && chartData.length > 0 && (
          <div ref={chartsContainerRef} className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {(() => {
              const allVals = chartData.flatMap((d) => [d.ricavi, d.costi, d.ricaviCum, d.costiCum, d.incassato, d.pagato, d.incassatoCum, d.pagatoCum]);
              const sharedMax = Math.max(...allVals, 0);
              const yDomain: [number, number] = [0, sharedMax || 1];
              return (
                <>
                  <div className="bg-card rounded-lg border border-border p-4 shadow-card chart-capture">
                    <h3 className="font-display font-semibold text-foreground text-sm mb-3">Ricavi/Costi mensile</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <ComposedChart data={chartData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                        <YAxis domain={yDomain} className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={chartTooltipFormatter} contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="ricavi" name="Ricavi" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="costi" name="Costi" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} />
                        <Line type="monotone" dataKey="ricaviCum" name="Ricavi cum." stroke="hsl(var(--success))" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                        <Line type="monotone" dataKey="costiCum" name="Costi cum." stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-card rounded-lg border border-border p-4 shadow-card chart-capture">
                    <h3 className="font-display font-semibold text-foreground text-sm mb-3">Incassato/Pagato mensile</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <ComposedChart data={chartData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                        <YAxis domain={yDomain} className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={chartTooltipFormatter} contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="incassato" name="Incassato" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="pagato" name="Pagato" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} />
                        <Line type="monotone" dataKey="incassatoCum" name="Incassato cum." stroke="hsl(var(--success))" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                        <Line type="monotone" dataKey="pagatoCum" name="Pagato cum." stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </>
              );
            })()}
            <div className="bg-card rounded-lg border border-border p-4 shadow-card chart-capture">
              <h3 className="font-display font-semibold text-foreground text-sm mb-3">Margine cumulativo</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 10 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={chartTooltipFormatter} contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="margineCumulativo" name="Margine cum." stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!loading && filteredForRiepilogo.length > 0 &&
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["ricavo", "costo"] as const).map((tipo) => {
              const centriTipo = centri.filter((c) => c.tipo === tipo);
              if (centriTipo.length === 0) return null;
              return (
                <div key={tipo} className="bg-card rounded-lg border border-border p-5 shadow-card flex flex-col">
                  <h3 className="font-display font-semibold text-foreground mb-3">
                    {tipo === "costo" ? "Centri di Costo" : "Centri di Ricavo"}
                  </h3>
                  <div className="space-y-0 flex-1">
                    {centriTipo.map((c) => {
                      const tot = filteredForRiepilogo.
                      filter((f) => f.cm_centro_imputazione_id === c.id).
                      reduce((s, f) => s + Number(f.importo_totale), 0);
                      const isDragging = dragCentroId === c.id;
                      const isDragOver = dragOverCentroId === c.id && dragCentroId !== c.id;
                      return (
                        <div
                          key={c.id}
                          draggable
                          onDragStart={() => handleDragStart(c.id)}
                          onDragOver={(e) => handleDragOver(e, c.id)}
                          onDragEnd={() => { setDragCentroId(null); setDragOverCentroId(null); }}
                          onDrop={() => handleDrop(c.id, tipo)}
                          className={cn(
                            "flex items-center gap-2 py-2 px-1 border-b border-border last:border-0 rounded transition-all",
                            isDragging && "opacity-40",
                            isDragOver && "border-t-2 border-t-primary"
                          )}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                          <span className="text-sm text-card-foreground flex-1">{c.nome}</span>
                          <span className="text-sm font-medium tabular-nums text-card-foreground">{fmtCurrency(tot)}</span>
                        </div>);
                    })}
                  </div>
                  <div className={cn("flex justify-between pt-3 mt-2 border-t-2 rounded-md px-3 py-2", tipo === "ricavo" ? "bg-success text-success-foreground border-success/30" : "bg-destructive text-destructive-foreground border-destructive/30")}>
                    <span className="text-base font-bold">Totale</span>
                    <span className="text-base font-bold tabular-nums">
                      {fmtCurrency(
                        centriTipo.reduce((sum, c) =>
                        sum + filteredForRiepilogo.
                        filter((f) => f.cm_centro_imputazione_id === c.id).
                        reduce((s, f) => s + Number(f.importo_totale), 0), 0)
                      )}
                    </span>
                  </div>
                </div>);

            })}
          </div>

          {/* Riepilogo IVA */}
          <div className="mb-6 bg-card rounded-lg border border-border p-5 shadow-card">
            <h3 className="font-display font-semibold text-foreground mb-3">Riepilogo IVA</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Emesse</p>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-sm text-card-foreground">IVA ordinaria</span>
                  <span className="text-sm font-medium tabular-nums text-card-foreground">{fmtCurrency(ivaStats.ivaVendite)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-sm text-card-foreground">IVA split payment</span>
                  <span className="text-sm font-medium tabular-nums text-card-foreground">{fmtCurrency(ivaStats.ivaSplitVendite)}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ricevute</p>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-sm text-card-foreground">IVA ordinaria</span>
                  <span className="text-sm font-medium tabular-nums text-card-foreground">{fmtCurrency(ivaStats.ivaAcquisti)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-sm text-card-foreground">IVA split payment</span>
                  <span className="text-sm font-medium tabular-nums text-card-foreground">{fmtCurrency(ivaStats.ivaSplitAcquisti)}</span>
                </div>
              </div>
            </div>
          </div>
          </>
        }

        {/* ═══ TABS EMESSE / RICEVUTE ═══ */}
        <Tabs value={activeTab} onValueChange={(v) => {setActiveTab(v);setSelectedFattura(null);}} className="w-full">
          <div className="flex items-center justify-between mb-3">
            <TabsList className="h-10">
              <TabsTrigger value="emesse" className="gap-2 px-5 border-2 border-emerald-500/50 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold">
                <ArrowUpRight className="w-4 h-4" />
                Ricavi
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {fattureVendite.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ricevute" className="gap-2 px-5 border-2 border-destructive/50 data-[state=active]:border-destructive data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground font-semibold">
                <ArrowDownRight className="w-4 h-4" />
                Costi
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {fattureAcquisti.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Toolbar actions (shared) */}
            <div className="flex items-center gap-2">
              <FattureToolbar
                fatture={activeTab === "emesse" ? fattureVendite : fattureAcquisti}
                searchText={searchText}
                onSearchChange={setSearchText}
                filterTipo="tutti"
                onFilterTipoChange={() => {}}
                filterStato={filterStato}
                onFilterStatoChange={setFilterStato}
                filterCentro={filterCentro}
                onFilterCentroChange={setFilterCentro}
                centri={centri}
                visibleColumns={visibleColumns}
                onVisibleColumnsChange={updateVisibleColumns}
                onResetColumns={resetColumns}
                onNewFattura={() => {setEditingId(null);setForm({ ...EMPTY_FATTURA, tipo: activeTab === "emesse" ? "vendita" : "acquisto" });setSheetOpen(true);}}
                onOpenCentri={() => setCentriDialogOpen(true)} />
              
            </div>
          </div>

          {/* ═══ TAB EMESSE ═══ */}
          <TabsContent value="emesse" className="mt-0">
            {/* Upload + Subtotale */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-sm px-3 py-1">
                  Totale: {fmtCurrency(totVendite)}
                </Badge>
              </div>
              <div className="flex-1">
                <DocumentUpload section="economia-cssr" commessaId={commessaId} onUploadComplete={loadData} compact />
              </div>
            </div>
            {fattureVendite.length > 0 ?
            renderTableSection(fattureVendite, "Emesse", "tutti") :

            <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
                Nessuna fattura emessa registrata. Carica un documento per iniziare.
              </div>
            }
          </TabsContent>

          {/* ═══ TAB RICEVUTE ═══ */}
          <TabsContent value="ricevute" className="mt-0">
            {/* Upload + Subtotale */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <DocumentUpload section="economia-cssr" commessaId={commessaId} onUploadComplete={loadData} compact />
              </div>
            </div>
            {fattureAcquisti.length > 0 ?
            renderTableSection(fattureAcquisti, "Ricevute", "tutti") :

            <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
                Nessuna fattura ricevuta registrata. Carica un documento per iniziare.
              </div>
            }
          </TabsContent>
        </Tabs>

        {/* Documents list */}
        {documents.length > 0 &&
        <div className="mt-6 bg-card rounded-lg border border-border p-4 shadow-card">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documenti Caricati ({documents.length})
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {documents.map((doc) => {
              const isReanalyzing = reanalyzingIds.has(doc.id);
              const status = doc.ai_status;
              return (
                <div key={doc.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 text-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                      {status === 'processing' && <Loader2 className="w-3.5 h-3.5 text-accent animate-spin flex-shrink-0" />}
                      {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
                      {status === 'pending' && <Sparkles className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                      <span className="truncate text-card-foreground">{doc.file_name}</span>
                      {status === 'error' && <span className="text-xs text-destructive">Errore analisi</span>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={isReanalyzing || status === 'processing'}
                      onClick={() => reanalyze(doc)}
                      title="Rianalizza documento">
                      
                        <RefreshCw className={cn("w-3.5 h-3.5", isReanalyzing && "animate-spin")} />
                      </Button>
                      <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDocument(doc)}
                      title="Elimina documento">
                      
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>);

            })}
            </div>
          </div>
        }
      </div>

      {/* ═══ Sheet - Nuova/Modifica Fattura ═══ */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Modifica Fattura" : "Nuova Fattura"}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acquisto">Acquisto</SelectItem>
                    <SelectItem value="vendita">Vendita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Numero</Label>
                <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="FT-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
              </div>
              <div>
                <Label>Data Scadenza</Label>
                <Input type="date" value={form.data_scadenza} onChange={(e) => setForm({ ...form, data_scadenza: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>{form.tipo === "vendita" ? "Cliente" : "Fornitore"}</Label>
              <Input value={form.fornitore_cliente} onChange={(e) => setForm({ ...form, fornitore_cliente: e.target.value })} />
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea value={form.descrizione} onChange={(e) => setForm({ ...form, descrizione: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Imponibile (€)</Label>
                <Input type="number" step="0.01" value={form.importo} onChange={(e) => setForm({ ...form, importo: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Aliquota IVA (%)</Label>
                <Input type="number" value={form.aliquota_iva} onChange={(e) => setForm({ ...form, aliquota_iva: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Ritenuta (%)</Label>
                <Input type="number" value={form.ritenuta_acconto} onChange={(e) => setForm({ ...form, ritenuta_acconto: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Centro di Imputazione</Label>
                <Select value={form.cm_centro_imputazione_id} onValueChange={(v) => setForm({ ...form, cm_centro_imputazione_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                  <SelectContent>
                    {centri.map((c) =>
                    <SelectItem key={c.id} value={c.id}>{c.nome} ({c.tipo})</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stato</Label>
                <Select value={form.stato_pagamento} onValueChange={(v) => setForm({ ...form, stato_pagamento: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="da_pagare">Da pagare</SelectItem>
                    <SelectItem value="pagata">Pagata</SelectItem>
                    <SelectItem value="scaduta">Scaduta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>CIG</Label>
                <Input value={form.cig} onChange={(e) => setForm({ ...form, cig: e.target.value })} />
              </div>
              <div>
                <Label>CUP</Label>
                <Input value={form.cup} onChange={(e) => setForm({ ...form, cup: e.target.value })} />
              </div>
              <div>
                <Label>Codice SDI</Label>
                <Input value={form.codice_sdi} onChange={(e) => setForm({ ...form, codice_sdi: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.split_payment} onCheckedChange={(v) => setForm({ ...form, split_payment: v })} />
              <Label>Split Payment</Label>
            </div>
            <div>
              <Label>Note</Label>
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Annulla</Button>
            <Button onClick={handleSave} disabled={!form.numero || !form.fornitore_cliente}>
              {editingId ? "Salva Modifiche" : "Inserisci"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ═══ Dialog - Gestione Centri di Imputazione ═══ */}
      <Dialog open={centriDialogOpen} onOpenChange={setCentriDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Centri di Imputazione</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-3">Gestisci le voci di costo e ricavo.</p>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {centri.map((c) =>
            <div key={c.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant={c.tipo === "costo" ? "secondary" : "default"} className="text-[10px]">{c.tipo}</Badge>
                  <span className="text-sm">{c.nome}</span>
                  {c.is_default && <span className="text-[10px] text-muted-foreground">(predefinito)</span>}
                </div>
                {!c.is_default &&
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteCentro(c.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
              }
              </div>
            )}
          </div>
          <div className="flex items-end gap-2 mt-3">
            <div className="flex-1">
              <Label className="text-xs">Nuovo centro</Label>
              <Input value={newCentroNome} onChange={(e) => setNewCentroNome(e.target.value)} placeholder="Nome..." className="h-8 text-sm" />
            </div>
            <Select value={newCentroTipo} onValueChange={(v) => setNewCentroTipo(v as any)}>
              <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="costo">Costo</SelectItem>
                <SelectItem value="ricavo">Ricavo</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8" onClick={handleAddCentro} disabled={!newCentroNome.trim()}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>);

}