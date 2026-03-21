import { useState, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import { useCommessa } from "@/contexts/CommessaContext";
import { ClipboardList, Loader2, Download, RefreshCw, FileText, Pencil, PencilOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generatePdqPdf, type PdqData, type PdqSection } from "@/lib/generatePdqPdf";
import { PdqSectionView } from "@/components/pdq/PdqSectionView";
import { PdqRevisionHistory } from "@/components/pdq/PdqRevisionHistory";
import agisLogo from "@/assets/agis-logo.png";

interface CommessaMeta {
  commessa_consortile?: string;
  oggetto_lavori?: string;
  committente?: string;
  impresa_assegnataria?: string;
}

export default function PianoQualita() {
  const { commessaId } = useCommessa();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pdqData, setPdqData] = useState<PdqData | null>(null);
  const [revision, setRevision] = useState(0);
  const [commessaMeta, setCommessaMeta] = useState<CommessaMeta>({});
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load latest PdQ from DB
  useEffect(() => {
    if (!commessaId) { setInitialLoading(false); return; }
    (async () => {
      setInitialLoading(true);
      const [pdqRes, commRes] = await Promise.all([
        supabase.from("pdq_documents").select("*").eq("commessa_id", commessaId).order("revision", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("commessa_data").select("commessa_consortile, oggetto_lavori, committente, impresa_assegnataria").eq("id", commessaId).maybeSingle(),
      ]);
      if (commRes.data) setCommessaMeta(commRes.data);
      if (pdqRes.data) {
        setPdqData({ sections: pdqRes.data.sections as any });
        setRevision(pdqRes.data.revision);
      }
      setInitialLoading(false);
    })();
  }, [commessaId]);

  const saveToDb = useCallback(async (data: PdqData, rev: number) => {
    if (!commessaId) return;
    const { error } = await supabase.from("pdq_documents").insert({
      commessa_id: commessaId,
      revision: rev,
      sections: data.sections as any,
    });
    if (error) {
      // If revision already exists, update it
      await supabase.from("pdq_documents")
        .update({ sections: data.sections as any })
        .eq("commessa_id", commessaId)
        .eq("revision", rev);
    }
  }, [commessaId]);

  const generate = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);

    try {
      const [commRes, persRes, azRes, phasesRes, cmeRes, docsRes, checkRes] = await Promise.all([
        supabase.from("commessa_data").select("*").eq("id", commessaId).maybeSingle(),
        supabase.from("persons").select("nome, ruolo, azienda").eq("commessa_id", commessaId),
        supabase.from("aziende").select("nome, tipo").eq("commessa_id", commessaId),
        supabase.from("cronoprogramma_phases").select("name, progress, parent_id").eq("commessa_id", commessaId).order("sort_order"),
        supabase.from("cme_rows").select("codice, descrizione, unita_misura, quantita, categoria").eq("commessa_id", commessaId).order("sort_order"),
        supabase.from("documents").select("file_name, section, ai_summary, ai_extracted_data").eq("commessa_id", commessaId),
        supabase.from("checklist_documenti").select("nome, indispensabile").eq("commessa_id", commessaId).order("sort_order"),
      ]);

      const commessa = commRes.data;
      if (commessa) setCommessaMeta(commessa);

      const { data: result, error } = await invokeWithRetry<PdqData>("generate-pdq", {
        body: {
          commessa,
          persons: persRes.data || [],
          aziende: azRes.data || [],
          phases: (phasesRes.data || []).filter((p: any) => !p.parent_id),
          cmeRows: cmeRes.data || [],
          documents: docsRes.data || [],
          checklist: checkRes.data || [],
        },
      });

      if (error) throw error;
      if (!result?.sections) throw new Error("Risposta AI non valida");

      const newRevision = revision + 1;

      await saveToDb(result, newRevision);

      setPdqData(result);
      setRevision(newRevision);
      setHasUnsavedChanges(false);
      toast.success(`Piano di Qualità generato — Revisione ${String(newRevision).padStart(2, "0")}`);
    } catch (err: any) {
      console.error("PdQ generation error:", err);
      toast.error(err.message || "Errore durante la generazione del PdQ");
    } finally {
      setLoading(false);
    }
  }, [commessaId, revision, saveToDb]);

  const handleSectionChange = useCallback((index: number, updated: PdqSection) => {
    if (!pdqData) return;
    const newSections = [...pdqData.sections];
    newSections[index] = updated;
    setPdqData({ sections: newSections });
    setHasUnsavedChanges(true);
  }, [pdqData]);

  const handleSaveEdits = useCallback(async () => {
    if (!pdqData || !commessaId) return;
    await saveToDb(pdqData, revision);
    setHasUnsavedChanges(false);
    toast.success("Modifiche salvate");
  }, [pdqData, commessaId, revision, saveToDb]);

  const handleLoadRevision = useCallback((data: PdqData, rev: number) => {
    setPdqData(data);
    setRevision(rev);
    setHasUnsavedChanges(false);
    setEditMode(false);
    toast.info(`Caricata revisione ${String(rev).padStart(2, "0")}`);
  }, []);

  const handleExportPdf = async () => {
    if (!pdqData) return;
    try {
      const blob = await generatePdqPdf({
        data: pdqData,
        commessaLabel: commessaMeta.commessa_consortile || commessaId || "",
        oggettoLavori: commessaMeta.oggetto_lavori,
        committente: commessaMeta.committente,
        impresa: commessaMeta.impresa_assegnataria,
        revision,
        logoSrc: agisLogo,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PdQ_${commessaMeta.commessa_consortile || "export"}_Rev${String(revision).padStart(2, "0")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF esportato");
    } catch (err) {
      console.error(err);
      toast.error("Errore nell'esportazione PDF");
    }
  };

  const commessaLabel = commessaMeta.commessa_consortile || commessaId || "";

  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full">
        <PageHeader
          title="Piano di Qualità"
          description="Genera il PdQ sulla base dei dati della commessa e delle certificazioni ISO"
          icon={ClipboardList}
          actions={
            <>
              {revision > 0 && (
                <Badge variant="outline" className="h-7 border-white/30 text-primary-foreground text-xs font-mono">
                  Rev. {String(revision).padStart(2, "0")}
                </Badge>
              )}
              {pdqData && commessaId && (
                <PdqRevisionHistory
                  commessaId={commessaId}
                  currentRevision={revision}
                  onLoadRevision={handleLoadRevision}
                />
              )}
              {pdqData && (
                <Button
                  variant="ghost" size="sm"
                  className={`h-8 gap-1.5 text-xs text-primary-foreground hover:bg-white/20 ${editMode ? "bg-white/20" : ""}`}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? <PencilOff className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                  {editMode ? "Fine modifica" : "Modifica"}
                </Button>
              )}
              {pdqData && (
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary-foreground hover:bg-white/20" onClick={handleExportPdf}>
                  <Download className="w-3.5 h-3.5" /> Esporta PDF
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary-foreground hover:bg-white/20" onClick={generate} disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {pdqData ? "Rigenera" : "Genera PdQ"}
              </Button>
            </>
          }
        />

        {initialLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!initialLoading && !pdqData && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Piano di Qualità non ancora generato</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Clicca su "Genera PdQ" per creare automaticamente il Piano di Qualità basato sui dati della commessa,
              includendo tutte le certificazioni ISO, prodotti critici, fornitori e risorse umane.
            </p>
            <Button onClick={generate} className="gap-2">
              <ClipboardList className="w-4 h-4" /> Genera Piano di Qualità
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Generazione del Piano di Qualità in corso...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">L'AI sta analizzando i dati della commessa (può richiedere fino a 60 secondi)</p>
          </div>
        )}

        {!initialLoading && pdqData && (
          <div className="space-y-3 mt-4">
            {/* Revision info bar */}
            <div className="flex items-center justify-between bg-muted/50 border border-border rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Revisione <strong className="text-foreground font-mono">{String(revision).padStart(2, "0")}</strong></span>
                <span className="text-xs">— Commessa {commessaLabel}</span>
                {editMode && (
                  <Badge variant="secondary" className="text-[10px] ml-2">Modalità modifica</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <Button size="sm" className="h-7 text-xs" onClick={handleSaveEdits}>
                    Salva modifiche
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">{pdqData.sections.length} sezioni</span>
              </div>
            </div>

            {pdqData.sections.map((section, i) => (
              <PdqSectionView
                key={section.number}
                section={section}
                editable={editMode}
                onSectionChange={(updated) => handleSectionChange(i, updated)}
              />
            ))}

            <p className="text-[10px] text-muted-foreground text-center py-4">
              Piano di Qualità Rev. {String(revision).padStart(2, "0")} — Commessa {commessaLabel}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
