import { useState, useCallback, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import {
  Calculator, Upload, FileSpreadsheet, Loader2, Download, Trash2, Check, X, Pencil, Search, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import { useCommessa } from "@/contexts/CommessaContext";

import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import * as XLSX from "xlsx";

interface CmeRow {
  id?: string;
  numero: string | null;
  codice: string | null;
  descrizione: string;
  unita_misura: string | null;
  par_ug: number | null;
  lunghezza: number | null;
  larghezza: number | null;
  h_peso: number | null;
  quantita: number | null;
  prezzo_unitario: number | null;
  importo: number | null;
  categoria: string | null;
  sort_order: number;
}

function formatCurrency(v: number | null) {
  if (v == null) return "—";
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" as any }).format(v);
}

function formatNumber(v: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ExpandableText({ text, maxLen = 80 }: { text: string; maxLen?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (!text || text.length <= maxLen) return <span>{text}</span>;
  return (
    <span
      className="cursor-pointer hover:text-foreground transition-colors"
      onClick={() => setExpanded(!expanded)}
      title={expanded ? "Comprimi" : "Clicca per espandere"}
    >
      {expanded ? text : `${text.slice(0, maxLen)}…`}
    </span>
  );
}

export default function CMEPage() {
  const { commessaId } = useCommessa();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<CmeRow>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["cme_rows", commessaId],
    queryFn: async () => {
      if (!commessaId) return [];
      const { data, error } = await supabase
        .from("cm_cme_rows")
        .select("*")
        .eq("cm_commessa_id", commessaId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as CmeRow[];
    },
    enabled: !!commessaId,
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      if (!commessaId) return;
      const { data } = await supabase.from("cm_cme_rows").select("id").eq("cm_commessa_id", commessaId);
      if (data && data.length > 0) {
        const { error } = await supabase
          .from("cm_cme_rows")
          .delete()
          .in("id", data.map((r) => r.id));
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cme_rows", commessaId] });
      toast({ title: "CME cancellato" });
    },
  });

  const updateRow = useMutation({
    mutationFn: async (row: CmeRow) => {
      if (!row.id) return;
      const { id, importo: _importo, ...updates } = row; // importo è GENERATED ALWAYS — non inviarlo nell'UPDATE
      const { error } = await supabase.from("cm_cme_rows").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cme_rows", commessaId] });
      setEditingId(null);
      setEditData({});
    },
    onError: (e: any) => {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    },
  });

  const startEdit = (row: CmeRow) => {
    setEditingId(row.id!);
    setEditData({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateRow.mutate({ ...editData, id: editingId } as CmeRow);
  };

  const saveRows = useMutation({
    mutationFn: async (newRows: Omit<CmeRow, "id">[]) => {
      if (!commessaId) return;
      const { data: existing } = await supabase.from("cm_cme_rows").select("id").eq("cm_commessa_id", commessaId);
      if (existing && existing.length > 0) {
        await supabase.from("cm_cme_rows").delete().in("id", existing.map((r) => r.id));
      }
      if (newRows.length > 0) {
        // Esclude importo: è GENERATED ALWAYS AS (quantita * prezzo_unitario) nel DB
        const rowsWithCommessa = newRows.map(({ importo: _importo, ...r }) => ({ ...r, cm_commessa_id: commessaId }));
        const { error } = await supabase.from("cm_cme_rows").insert(rowsWithCommessa);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cme_rows", commessaId] });
      toast({ title: "CME importato", description: "Il computo metrico è stato importato correttamente" });
    },
    onError: (e: any) => {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    },
  });

  const parseExcelFile = useCallback(async (file: File): Promise<Omit<CmeRow, "id">[]> => {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: null });

    if (jsonData.length === 0) return [];

    const keys = Object.keys(jsonData[0]);
    const findCol = (patterns: string[]) =>
      keys.find((k) => patterns.some((p) => k.toLowerCase().includes(p))) || null;

    const colNum = findCol(["num", "n.", "nr", "n°", "prog", "ord"]);
    const colCod = findCol(["tariffa", "cod", "articolo"]);
    const colDesc = findCol(["design", "desc", "lavoraz", "oggetto", "voce"]);
    const colUm = findCol(["u.m", "unità", "misura"]);
    const colParUg = findCol(["par.ug", "p.ug", "parti ug", "par ug"]);
    const colLung = findCol(["lung", "lunghezza"]);
    const colLarg = findCol(["larg", "larghezza"]);
    const colHPeso = findCol(["h/peso", "h_peso", "peso", "altezza"]);
    const colQta = findCol(["quan", "qta", "q.tà"]);
    const colPu = findCol(["prezzo", "p.u", "unitario"]);
    const colImp = findCol(["importo", "totale", "ammontare"]);

    return jsonData.map((row, i) => ({
      numero: colNum ? String(row[colNum] ?? "") : String(i + 1),
      codice: colCod ? String(row[colCod] ?? "") : null,
      descrizione: colDesc ? String(row[colDesc] ?? "") : String(Object.values(row).find((v) => typeof v === "string" && String(v).length > 10) || `Riga ${i + 1}`),
      unita_misura: colUm ? String(row[colUm] ?? "") || null : null,
      par_ug: colParUg ? Number(row[colParUg]) || null : null,
      lunghezza: colLung ? Number(row[colLung]) || null : null,
      larghezza: colLarg ? Number(row[colLarg]) || null : null,
      h_peso: colHPeso ? Number(row[colHPeso]) || null : null,
      quantita: colQta ? Number(row[colQta]) || null : null,
      prezzo_unitario: colPu ? Number(row[colPu]) || null : null,
      importo: colImp ? Number(row[colImp]) || null : null,
      categoria: null,
      sort_order: i,
    }));
  }, []);

  const extractPdfText = useCallback(async (file: File): Promise<string[]> => {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pageTexts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join(" ");
      pageTexts.push(text);
    }
    return pageTexts;
  }, []);

  const isTotalOrCarryRow = (r: any) => {
    const desc = (r.descrizione || "").toLowerCase().trim();
    const totalPatterns = ["a riportare", "riporto", "totale computo", "totale lavori", "totale generale", "subtotale", "sub-totale", "sommano"];
    return totalPatterns.some(p => desc === p || desc.startsWith(p));
  };

  const mapRow = (r: any, i: number): Omit<CmeRow, "id"> => ({
    numero: r.numero || String(i + 1),
    codice: r.codice || null,
    descrizione: r.descrizione || `Voce ${i + 1}`,
    unita_misura: r.unita_misura || null,
    par_ug: r.par_ug ?? null,
    lunghezza: r.lunghezza ?? null,
    larghezza: r.larghezza ?? null,
    h_peso: r.h_peso ?? null,
    quantita: r.quantita ?? null,
    prezzo_unitario: r.prezzo_unitario ?? null,
    importo: r.importo ?? null,
    categoria: null,
    sort_order: i,
  });

  const parseWithAI = useCallback(async (file: File): Promise<Omit<CmeRow, "id">[]> => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    let textContent: string;

    if (ext === "pdf") {
      toast({ title: "Estrazione testo dal PDF..." });
      const pageTexts = await extractPdfText(file);
      console.log(`PDF: ${pageTexts.length} pages extracted`);

      // Send in chunks of ~5 pages to avoid token limits
      const PAGES_PER_CHUNK = 5;
      const allRows: any[] = [];

      for (let i = 0; i < pageTexts.length; i += PAGES_PER_CHUNK) {
        const chunk = pageTexts.slice(i, i + PAGES_PER_CHUNK);
        const chunkText = chunk.map((t, idx) => `--- PAGINA ${i + idx + 1} ---\n${t}`).join("\n\n");

        toast({
          title: `Analisi in corso...`,
          description: `Pagine ${i + 1}-${Math.min(i + PAGES_PER_CHUNK, pageTexts.length)} di ${pageTexts.length}`,
        });

        const { data, error } = await invokeWithRetry<any>("cm-parse-cme", {
          body: { textContent: chunkText },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (data?.rows?.length) allRows.push(...data.rows);
      }

      return allRows.filter(r => !isTotalOrCarryRow(r)).map((r, i) => mapRow(r, i));
    } else {
      textContent = await file.text();
      const { data, error } = await invokeWithRetry<any>("cm-parse-cme", {
        body: { textContent },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data.rows || []).filter((r: any) => !isTotalOrCarryRow(r)).map((r: any, i: number) => mapRow(r, i));
    }
  }, [toast, extractPdfText]);

  const handleFile = useCallback(async (file: File) => {
    setParsing(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let parsed: Omit<CmeRow, "id">[];

      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        parsed = await parseExcelFile(file);
      } else {
        parsed = await parseWithAI(file);
      }

      if (parsed.length === 0) {
        toast({ title: "Nessuna voce trovata", description: "Il file non contiene voci del computo", variant: "destructive" });
      } else {
        await saveRows.mutateAsync(parsed);
      }
    } catch (e: any) {
      toast({ title: "Errore di importazione", description: e.message, variant: "destructive" });
    }
    setParsing(false);
  }, [parseExcelFile, parseWithAI, saveRows, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const exportExcel = useCallback(() => {
    const exportData = rows.map((r) => ({
      "Num. Ord.": r.numero,
      "TARIFFA": r.codice,
      "DESIGNAZIONE DEI LAVORI": r.descrizione,
      "par.ug.": r.par_ug,
      "lung.": r.lunghezza,
      "largh.": r.larghezza,
      "H/peso": r.h_peso,
      "Quantità": r.quantita,
      "Prezzo Unitario (€)": r.prezzo_unitario,
      "TOTALE (€)": r.importo,
    }));

    const totalImporto = rows.reduce((sum, r) => sum + (r.importo || 0), 0);
    exportData.push({
      "Num. Ord.": "",
      "TARIFFA": "",
      "DESIGNAZIONE DEI LAVORI": "TOTALE COMPUTO",
      "par.ug.": null as any,
      "lung.": null as any,
      "largh.": null as any,
      "H/peso": null as any,
      "Quantità": null as any,
      "Prezzo Unitario (€)": null as any,
      "TOTALE (€)": totalImporto,
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CME");
    XLSX.writeFile(wb, "computo_metrico_estimativo.xlsx");
  }, [rows]);

  const totalImporto = rows.reduce((sum, r) => sum + (r.importo || 0), 0);

  const categorie = Array.from(new Set(rows.map(r => r.categoria).filter(Boolean))) as string[];

  const filteredRows = rows.filter((r) => {
    if (selectedCategoria && r.categoria !== selectedCategoria) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.descrizione?.toLowerCase().includes(q) ||
        r.codice?.toLowerCase().includes(q) ||
        r.numero?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredImporto = filteredRows.reduce((sum, r) => sum + (r.importo || 0), 0);

  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full space-y-4">
        <PageHeader
          title="Computo Metrico Estimativo"
          
          icon={Calculator}
        />

        {rows.length === 0 && !parsing ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-16 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors animate-fade-in",
              dragOver
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50 hover:bg-muted/30"
            )}
          >
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-card-foreground">
                Trascina qui il file del Computo Metrico
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supporta Excel (.xlsx, .xls, .csv) e documenti di testo
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        ) : parsing ? (
          <div className="border border-border rounded-lg p-16 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-muted-foreground">Analisi del computo metrico in corso...</p>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{rows.length} voci</span>
                </div>
                <div className="text-sm font-semibold text-card-foreground">
                  Totale: {formatCurrency(totalImporto)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" />
                  Reimporta
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={exportExcel}>
                  <Download className="w-4 h-4" />
                  Esporta Excel
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => clearAll.mutate()}>
                  <Trash2 className="w-4 h-4" />
                  Cancella
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per descrizione, codice o numero..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              {categorie.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={selectedCategoria ?? ""}
                    onChange={(e) => setSelectedCategoria(e.target.value || null)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Tutte le categorie</option>
                    {categorie.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
              {(searchQuery || selectedCategoria) && (
                <div className="text-xs text-muted-foreground">
                  {filteredRows.length} di {rows.length} voci — {formatCurrency(filteredImporto)}
                </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden animate-fade-in">
              <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-muted">
                      <TableHead className="w-16" rowSpan={2}>Num. Ord.</TableHead>
                      <TableHead className="w-24" rowSpan={2}>TARIFFA</TableHead>
                      <TableHead className="min-w-[250px]" rowSpan={2}>DESIGNAZIONE DEI LAVORI</TableHead>
                      <TableHead className="w-32" rowSpan={2}>Categoria</TableHead>
                      <TableHead className="text-center border-l border-border" colSpan={4}>DIMENSIONI</TableHead>
                      <TableHead className="w-20 text-right" rowSpan={2}>Quantità</TableHead>
                      <TableHead className="text-center border-l border-border" colSpan={2}>IMPORTI</TableHead>
                      <TableHead className="w-12" rowSpan={2}></TableHead>
                    </TableRow>
                    <TableRow className="bg-muted">
                      <TableHead className="w-16 text-center text-xs border-l border-border">par.ug.</TableHead>
                      <TableHead className="w-16 text-center text-xs">lung.</TableHead>
                      <TableHead className="w-16 text-center text-xs">largh.</TableHead>
                      <TableHead className="w-16 text-center text-xs">H/peso</TableHead>
                      <TableHead className="w-24 text-right text-xs border-l border-border">unitario</TableHead>
                      <TableHead className="w-24 text-right text-xs">TOTALE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row) => {
                      const isEditing = editingId === row.id;
                      const ed = editData;
                      return (
                        <TableRow key={row.id} className={isEditing ? "bg-accent/5" : ""}>
                          <TableCell className="text-xs text-muted-foreground">
                            {isEditing ? <Input className="h-7 w-14 text-xs" value={ed.numero ?? ""} onChange={(e) => setEditData(d => ({ ...d, numero: e.target.value }))} /> : row.numero}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {isEditing ? <Input className="h-7 w-20 text-xs" value={ed.codice ?? ""} onChange={(e) => setEditData(d => ({ ...d, codice: e.target.value }))} /> : (row.codice || "—")}
                          </TableCell>
                          <TableCell className="text-xs max-w-[300px]">
                            {isEditing ? <Input className="h-7 text-xs" value={ed.descrizione ?? ""} onChange={(e) => setEditData(d => ({ ...d, descrizione: e.target.value }))} /> : <ExpandableText text={row.descrizione} />}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {isEditing ? (
                              <>
                                <Input
                                  list="cme-categorie"
                                  className="h-7 w-28 text-xs"
                                  placeholder="Categoria..."
                                  value={ed.categoria ?? ""}
                                  onChange={(e) => setEditData(d => ({ ...d, categoria: e.target.value || null }))}
                                />
                                <datalist id="cme-categorie">
                                  {categorie.map((c) => (
                                    <option key={c} value={c} />
                                  ))}
                                </datalist>
                              </>
                            ) : (row.categoria || "—")}
                          </TableCell>
                          <TableCell className="text-xs text-center border-l border-border">
                            {isEditing ? <Input type="number" className="h-7 w-14 text-xs text-center" value={ed.par_ug ?? ""} onChange={(e) => setEditData(d => ({ ...d, par_ug: e.target.value ? Number(e.target.value) : null }))} /> : formatNumber(row.par_ug)}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            {isEditing ? <Input type="number" className="h-7 w-14 text-xs text-center" value={ed.lunghezza ?? ""} onChange={(e) => setEditData(d => ({ ...d, lunghezza: e.target.value ? Number(e.target.value) : null }))} /> : formatNumber(row.lunghezza)}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            {isEditing ? <Input type="number" className="h-7 w-14 text-xs text-center" value={ed.larghezza ?? ""} onChange={(e) => setEditData(d => ({ ...d, larghezza: e.target.value ? Number(e.target.value) : null }))} /> : formatNumber(row.larghezza)}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            {isEditing ? <Input type="number" className="h-7 w-14 text-xs text-center" value={ed.h_peso ?? ""} onChange={(e) => setEditData(d => ({ ...d, h_peso: e.target.value ? Number(e.target.value) : null }))} /> : formatNumber(row.h_peso)}
                          </TableCell>
                          <TableCell className="text-sm text-right tabular-nums">
                            {isEditing ? <Input type="number" className="h-7 w-20 text-sm text-right" value={ed.quantita ?? ""} onChange={(e) => setEditData(d => ({ ...d, quantita: e.target.value ? Number(e.target.value) : null }))} /> : formatNumber(row.quantita)}
                          </TableCell>
                          <TableCell className="text-sm text-right tabular-nums border-l border-border">
                            {isEditing ? <Input type="number" className="h-7 w-24 text-sm text-right" value={ed.prezzo_unitario ?? ""} onChange={(e) => setEditData(d => ({ ...d, prezzo_unitario: e.target.value ? Number(e.target.value) : null }))} /> : formatCurrency(row.prezzo_unitario)}
                          </TableCell>
                          <TableCell className="text-sm text-right tabular-nums font-medium">
                            {isEditing
                              ? formatCurrency((ed.quantita ?? 0) * (ed.prezzo_unitario ?? 0) || null)
                              : formatCurrency(row.importo)}
                          </TableCell>
                          <TableCell className="w-12">
                            {isEditing ? (
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={saveEdit}><Check className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => startEdit(row)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-muted/30 font-semibold border-t-2 border-border">
                      <TableCell colSpan={10} className="text-right text-sm">
                        TOTALE COMPUTO
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {formatCurrency(totalImporto)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
