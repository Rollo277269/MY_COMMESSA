import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentCardGrid } from "@/components/DocumentCardGrid";
import { DocumentPreview } from "@/components/DocumentPreview";
import { DocumentToolbar } from "@/components/DocumentToolbar";
import { VoiceDictationDialog } from "@/components/VoiceDictationDialog";
import { RapportoFormSheet } from "@/components/rapporti/RapportoFormSheet";
import { ClipboardList, Mic, FilePlus, FileOutput, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import { useCommessa } from "@/contexts/CommessaContext";
import { DEFAULT_VISIBLE_COLUMNS, type ColumnKey } from "@/components/DocumentTable";
import { useToast } from "@/hooks/use-toast";
import { useColumnOrder } from "@/hooks/useColumnOrder";
import { useViewMode } from "@/hooks/useViewMode";
import { useDocumentFilters } from "@/hooks/useDocumentFilters";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { generateRapportoPdf, type RapportoData } from "@/lib/generateRapportoPdf";
import { useDocumentPage } from "@/hooks/useDocumentPage";

export default function RapportiGiornalieriPage() {
  const { commessaId } = useCommessa();
  const { documents, loading, hasError, fetchDocuments, handleDelete: deleteDoc, handleUpdate } = useDocumentPage("rapporti-giornalieri");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);
  const [dictationOpen, setDictationOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);
  const { toast } = useToast();
  const { columnOrder, updateColumnOrder, columnWidths, updateColumnWidths, resetColumns } = useColumnOrder("rapporti", DEFAULT_VISIBLE_COLUMNS);
  const { viewMode, updateViewMode } = useViewMode("rapporti");
  const { activeFilterCount, setActiveFilterCount, clearFiltersRef, clearAllFilters } = useDocumentFilters();

  const handleDelete = (id: string, filePath: string) => {
    if (selectedDoc?.id === id) setSelectedDoc(null);
    deleteDoc(id, filePath);
  };

  const handleConvertToPdf = async (doc: any) => {
    const testo = doc.ai_extracted_data?.testo_dettato;
    if (!testo) {
      toast({ title: "Nessun testo dettato trovato in questo documento", variant: "destructive" });
      return;
    }
    setConverting(doc.id);
    try {
      const { data: parsed, error: fnError } = await invokeWithRetry<any>("cm-parse-rapporto-dettatura", { body: { testo } });
      if (fnError) throw fnError;
      const rapportoData: RapportoData = {
        data: parsed.data || new Date().toISOString().slice(0, 10),
        data_display: parsed.data_display || new Date().toLocaleDateString("it-IT"),
        condizioni_meteo: parsed.condizioni_meteo || "",
        temperatura: parsed.temperatura || "",
        operai: parsed.operai || [],
        lavorazioni: parsed.lavorazioni || "",
        materiali: parsed.materiali || [],
        altri_documenti: parsed.altri_documenti || "",
        note: parsed.note || "",
      };
      const pdfBlob = await generateRapportoPdf(rapportoData);
      const pdfName = doc.file_name.replace(/\.txt$/i, "") + "_Rapporto.pdf";
      const pdfPath = `rapporti-giornalieri/${pdfName}`;
      const { error: uploadError } = await supabase.storage.from("cm-documents").upload(pdfPath, pdfBlob, { contentType: "application/pdf" });
      if (uploadError) throw uploadError;
      const { error: insertError } = await supabase.from("cm_documents").insert([{
        file_name: pdfName, file_path: pdfPath, file_type: "application/pdf",
        file_size: pdfBlob.size, section: "rapporti-giornalieri", ai_status: "completed",
        ai_summary: `Rapporto giornaliero del ${rapportoData.data_display} (da dettatura)`,
        ai_extracted_data: { ...rapportoData, testo_originale: testo } as any,
        ...(commessaId ? { cm_commessa_id: commessaId } : {}),
      }]);
      if (insertError) throw insertError;
      toast({ title: "PDF rapporto generato con successo" });
      fetchDocuments();
    } catch (err: any) {
      toast({ title: "Errore conversione", description: err.message, variant: "destructive" });
    } finally {
      setConverting(null);
    }
  };

  const isDictation = (doc: any) => doc.file_type === "text/plain" && doc.ai_extracted_data?.testo_dettato;

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
        <div className="p-3 lg:p-4 max-w-full space-y-2 flex-shrink-0">
          <PageHeader
            title="Rapporti Giornalieri"
            icon={ClipboardList}
            actions={
              <div className="flex items-center gap-2">
                <Button size="sm" variant="default" className="gap-1.5 h-7 text-xs px-2.5" onClick={() => setFormOpen(true)}>
                  <FilePlus className="w-3 h-3" /> Nuovo Rapporto
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs px-2.5" onClick={() => setDictationOpen(true)}>
                  <Mic className="w-3 h-3" /> Dettatura Libera
                </Button>
                <DocumentUpload section="rapporti-giornalieri" commessaId={commessaId} onUploadComplete={fetchDocuments} compact />
              </div>
            }
          />
          <VoiceDictationDialog open={dictationOpen} onOpenChange={setDictationOpen} section="rapporti-giornalieri" onComplete={fetchDocuments} />
          <RapportoFormSheet open={formOpen} onOpenChange={setFormOpen} section="rapporti-giornalieri" onComplete={fetchDocuments} />
          {selectedDoc && isDictation(selectedDoc) && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border">
              <span className="text-xs text-muted-foreground flex-1">
                Questo file è una dettatura vocale. Puoi convertirlo in un PDF strutturato con i campi del rapportino.
              </span>
              <Button size="sm" variant="default" className="gap-1.5 h-7 text-xs px-2.5" onClick={() => handleConvertToPdf(selectedDoc)} disabled={converting === selectedDoc.id}>
                {converting === selectedDoc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileOutput className="w-3 h-3" />}
                {converting === selectedDoc.id ? "Elaborazione AI..." : "Converti in PDF"}
              </Button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden px-3 lg:px-4 pb-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Caricamento...</div>
          ) : hasError ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-destructive text-sm">Errore durante il caricamento dei documenti.</p>
              <button onClick={() => fetchDocuments()} className="text-sm underline text-muted-foreground hover:text-foreground">Riprova</button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Nessun rapporto giornaliero caricato. Carica il primo rapporto.</div>
          ) : (
            <>
              <DocumentToolbar documents={documents} searchQuery={searchQuery} onSearchChange={setSearchQuery} visibleColumns={visibleColumns} onVisibleColumnsChange={setVisibleColumns} viewMode={viewMode} onViewModeChange={updateViewMode} onResetColumns={resetColumns} activeFilterCount={activeFilterCount} onClearAllFilters={clearAllFilters} />
              {viewMode === "grid" ? (
                <div className="overflow-auto h-[calc(100%-44px)]">
                  <DocumentCardGrid documents={documents} onDelete={handleDelete} onSelect={setSelectedDoc} selectedId={selectedDoc?.id} searchQuery={searchQuery} />
                </div>
              ) : selectedDoc ? (
                <ResizablePanelGroup direction="horizontal" className="rounded-lg border border-border bg-card h-[calc(100%-44px)]">
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full overflow-auto">
                      <DocumentTable documents={documents} onDelete={handleDelete} onUpdate={handleUpdate} onSelect={setSelectedDoc} selectedId={selectedDoc?.id} searchQuery={searchQuery} visibleColumns={visibleColumns} columnOrder={columnOrder} onColumnOrderChange={updateColumnOrder} columnWidths={columnWidths} onColumnWidthsChange={updateColumnWidths} onFilterCountChange={setActiveFilterCount} clearFiltersRef={clearFiltersRef} />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={25}>
                    <DocumentPreview document={selectedDoc} onClose={() => setSelectedDoc(null)} />
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                <DocumentTable documents={documents} onDelete={handleDelete} onUpdate={handleUpdate} onSelect={setSelectedDoc} selectedId={null} searchQuery={searchQuery} visibleColumns={visibleColumns} columnOrder={columnOrder} onColumnOrderChange={updateColumnOrder} columnWidths={columnWidths} onColumnWidthsChange={updateColumnWidths} onFilterCountChange={setActiveFilterCount} clearFiltersRef={clearFiltersRef} />
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
