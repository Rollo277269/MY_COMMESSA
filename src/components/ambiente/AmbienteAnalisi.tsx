import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateAmbientePdf, CER_TABLE } from "@/lib/generateAmbientePdf";
import { generateAmbienteDocx } from "@/lib/generateAmbienteDocx";
import {
  ChevronDown,
  ChevronRight,
  Save,
  Trash2,
  Recycle,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  Loader2,
  Sparkles,
  FileDown,
  FileText,
} from "lucide-react";

interface AmbienteAnalisiData {
  aspetti_critici: string;
  gestione_rifiuti: string;
  cam_progetto: string;
  revision?: number;
  selected_cer_codes?: string[];
}

const EMPTY: AmbienteAnalisiData = {
  aspetti_critici: "",
  gestione_rifiuti: "",
  cam_progetto: "",
  revision: 0,
  selected_cer_codes: [],
};

const PLACEHOLDERS: Record<string, string> = {
  aspetti_critici:
    "Descrivere le peculiarità ambientali del sito di cantiere: vincoli paesaggistici, presenza di corpi idrici, aree protette, SIC/ZPS, rischio idrogeologico, presenza di amianto o terreni contaminati, emissioni acustiche e atmosferiche, impatto sul traffico locale...",
  gestione_rifiuti:
    "Classificazione rifiuti prodotti (CER), modalità di raccolta differenziata in cantiere, aree di stoccaggio temporaneo, registro di carico/scarico, formulari FIR, qualificazione dei trasportatori autorizzati, individuazione impianti di destinazione e discariche autorizzate, obiettivi di recupero e riciclo...",
  cam_progetto:
    "Criteri Ambientali Minimi applicabili (DM 23/06/2022 o aggiornamenti), requisiti CAM per materiali da costruzione (contenuto di riciclato, EPD, certificazioni FSC/PEFC), criteri energetici, requisiti per demolizione selettiva, percentuali minime di materiali riciclati, relazione CAM di progetto, verifiche di conformità previste...",
};

const SECTIONS: {
  key: "aspetti_critici" | "gestione_rifiuti" | "cam_progetto";
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    key: "aspetti_critici",
    label: "Aspetti critici e peculiarità ambientali",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "gestione_rifiuti",
    label: "Gestione rifiuti di cantiere",
    icon: <Recycle className="h-4 w-4" />,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "cam_progetto",
    label: "Criteri Ambientali Minimi (CAM)",
    icon: <ShieldCheck className="h-4 w-4" />,
    color: "text-sky-600 dark:text-sky-400",
  },
];

interface Props {
  commessaId: string | null;
}

export function AmbienteAnalisi({ commessaId }: Props) {
  const [data, setData] = useState<AmbienteAnalisiData>(EMPTY);
  const [saved, setSaved] = useState<AmbienteAnalisiData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [commessa, setCommessa] = useState<any>(null);
  const [open, setOpen] = useState(true);
  const { toast } = useToast();

  const isDirty =
    data.aspetti_critici !== saved.aspetti_critici ||
    data.gestione_rifiuti !== saved.gestione_rifiuti ||
    data.cam_progetto !== saved.cam_progetto ||
    JSON.stringify(data.selected_cer_codes || []) !== JSON.stringify(saved.selected_cer_codes || []);

  const hasContent =
    !!data.aspetti_critici.trim() ||
    !!data.gestione_rifiuti.trim() ||
    !!data.cam_progetto.trim();

  const filledCount = SECTIONS.filter((s) => !!data[s.key]?.trim()).length;
  const revision = data.revision || 0;

  useEffect(() => {
    if (!commessaId) return;
    setLoading(true);
    Promise.all([
      supabase
        .from("cm_commessa_data")
        .select("ambiente_analisi, commessa_consortile, committente, oggetto_lavori, cup, cig, impresa_assegnataria")
        .eq("id", commessaId)
        .maybeSingle(),
    ]).then(([{ data: row }]) => {
      if (row) {
        setCommessa(row);
        const raw = (row as any)?.ambiente_analisi;
        if (raw && typeof raw === "object") {
          const parsed: AmbienteAnalisiData = {
            aspetti_critici: raw.aspetti_critici || "",
            gestione_rifiuti: raw.gestione_rifiuti || "",
            cam_progetto: raw.cam_progetto || "",
            revision: raw.revision || 0,
            selected_cer_codes: Array.isArray(raw.selected_cer_codes) ? raw.selected_cer_codes : [],
          };
          setData(parsed);
          setSaved(parsed);
        }
      }
      setLoading(false);
    });
  }, [commessaId]);

  const handleSave = useCallback(async () => {
    if (!commessaId) return;
    setSaving(true);

    // Increment revision on save if content changed
    const newRevision = (saved.revision || 0) + 1;
    const toSave = { ...data, revision: newRevision };

    const { error } = await supabase
      .from("cm_commessa_data")
      .update({ ambiente_analisi: toSave as any })
      .eq("id", commessaId);
    setSaving(false);
    if (error) {
      toast({ title: "Errore nel salvataggio", variant: "destructive" });
    } else {
      setData(toSave);
      setSaved(toSave);
      toast({ title: `Piano ambientale salvato — Rev. ${String(newRevision).padStart(2, "0")}` });
    }
  }, [commessaId, data, saved, toast]);

  const handleGenerate = useCallback(async () => {
    if (!commessaId) return;
    setGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke(
        "cm-generate-ambiente-analisi",
        { body: { commessaId } }
      );

      if (error) throw error;
      if (result?.error) {
        toast({ title: result.error, variant: "destructive" });
        return;
      }

      if (result?.analisi) {
        const cerCodes = Array.isArray(result.analisi.cer_codes_selezionati)
          ? result.analisi.cer_codes_selezionati
          : [];
        const analisi: AmbienteAnalisiData = {
          aspetti_critici: result.analisi.aspetti_critici || "",
          gestione_rifiuti: result.analisi.gestione_rifiuti || "",
          cam_progetto: result.analisi.cam_progetto || "",
          revision: data.revision || 0,
          selected_cer_codes: cerCodes,
        };
        setData(analisi);
        toast({ title: `Analisi generata — ${cerCodes.length} codici CER selezionati. Salva per confermare.` });
      }
    } catch (e: any) {
      console.error("Generate error:", e);
      toast({
        title: "Errore nella generazione",
        description: e?.message || "Riprova tra qualche istante",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [commessaId, data.revision, toast]);

  const handleExportPdf = useCallback(async () => {
    if (!hasContent) {
      toast({ title: "Compila almeno una sezione prima di esportare", variant: "destructive" });
      return;
    }
    setExporting(true);
    try {
      await generateAmbientePdf({
        commessa,
        analisi: {
          aspetti_critici: data.aspetti_critici,
          gestione_rifiuti: data.gestione_rifiuti,
          cam_progetto: data.cam_progetto,
        },
        revision: revision,
        cerTable: CER_TABLE,
        selectedCerCodes: data.selected_cer_codes,
      });
      toast({ title: "PDF esportato" });
    } catch (e) {
      console.error(e);
      toast({ title: "Errore nell'esportazione PDF", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }, [data, revision, commessa, hasContent, toast]);

  const handleExportDocx = useCallback(async () => {
    if (!hasContent) {
      toast({ title: "Compila almeno una sezione prima di esportare", variant: "destructive" });
      return;
    }
    setExportingDocx(true);
    try {
      await generateAmbienteDocx({
        commessa,
        analisi: {
          aspetti_critici: data.aspetti_critici,
          gestione_rifiuti: data.gestione_rifiuti,
          cam_progetto: data.cam_progetto,
        },
        revision: revision,
        cerTable: CER_TABLE,
        selectedCerCodes: data.selected_cer_codes,
      });
      toast({ title: "Word esportato" });
    } catch (e) {
      console.error(e);
      toast({ title: "Errore nell'esportazione Word", variant: "destructive" });
    } finally {
      setExportingDocx(false);
    }
  }, [data, revision, commessa, hasContent, toast]);

  const handleClear = useCallback(async () => {
    if (!commessaId) return;
    const cleared = { ...EMPTY, revision: data.revision };
    setData(cleared);
    setSaving(true);
    await supabase
      .from("cm_commessa_data")
      .update({ ambiente_analisi: cleared as any })
      .eq("id", commessaId);
    setSaved(cleared);
    setSaving(false);
    toast({ title: "Analisi ambientale svuotata" });
  }, [commessaId, data.revision, toast]);

  if (!commessaId) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-border/60 shadow-sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none py-3 px-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-sm font-semibold">
                  Piano di Gestione Ambientale
                </CardTitle>
                {revision > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
                    Rev. {String(revision).padStart(2, "0")}
                  </Badge>
                )}
                {filledCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {filledCount}/{SECTIONS.length}
                  </Badge>
                )}
                {isDirty && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-amber-400 text-amber-600">
                    non salvato
                  </Badge>
                )}
              </div>
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground text-sm gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Caricamento...
              </div>
            ) : (
              <>
                {SECTIONS.map((section) => (
                  <div key={section.key} className="space-y-1.5">
                    <label className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${section.color}`}>
                      {section.icon}
                      {section.label}
                    </label>
                    <Textarea
                      value={data[section.key]}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, [section.key]: e.target.value }))
                      }
                      placeholder={PLACEHOLDERS[section.key]}
                      className="min-h-[100px] text-sm resize-y"
                    />
                  </div>
                ))}

                {/* CER Code Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Recycle className="h-4 w-4" />
                    Codici CER pertinenti ({(data.selected_cer_codes || []).length}/{CER_TABLE.length} selezionati)
                  </label>
                  <div className="border border-border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-1">
                    {CER_TABLE.map((cer) => {
                      const isSelected = (data.selected_cer_codes || []).includes(cer.codice);
                      return (
                        <label
                          key={cer.codice}
                          className={`flex items-center gap-2 text-xs cursor-pointer py-0.5 px-1 rounded hover:bg-muted/50 transition-colors ${
                            isSelected ? "font-medium" : "text-muted-foreground"
                          } ${cer.pericoloso ? "text-destructive" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setData((prev) => {
                                const codes = prev.selected_cer_codes || [];
                                const next = isSelected
                                  ? codes.filter((c) => c !== cer.codice)
                                  : [...codes, cer.codice];
                                return { ...prev, selected_cer_codes: next };
                              });
                            }}
                            className="rounded border-border"
                          />
                          <span className="font-mono text-[11px] min-w-[70px]">{cer.codice}</span>
                          <span className="truncate">{cer.descrizione}</span>
                          {cer.pericoloso && (
                            <Badge variant="destructive" className="text-[9px] h-4 px-1 ml-auto shrink-0">
                              Pericoloso
                            </Badge>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="gap-1.5"
                  >
                    {generating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {generating ? "Generazione..." : "Genera da documenti"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!isDirty || saving}
                    className="gap-1.5"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Salva
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportPdf}
                    disabled={exporting || !hasContent}
                    className="gap-1.5"
                  >
                    {exporting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileDown className="h-3.5 w-3.5" />
                    )}
                    Esporta PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportDocx}
                    disabled={exportingDocx || !hasContent}
                    className="gap-1.5"
                  >
                    {exportingDocx ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    Esporta Word
                  </Button>
                  {hasContent && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClear}
                      className="gap-1.5 text-muted-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Svuota
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
