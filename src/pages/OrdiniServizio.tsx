import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentCardGrid } from "@/components/DocumentCardGrid";
import { DocumentPreview } from "@/components/DocumentPreview";
import { DocumentToolbar } from "@/components/DocumentToolbar";
import { FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { DEFAULT_VISIBLE_COLUMNS, type ColumnKey } from "@/components/DocumentTable";
import { useToast } from "@/hooks/use-toast";
import { useColumnOrder } from "@/hooks/useColumnOrder";
import { useViewMode } from "@/hooks/useViewMode";
import { useDocumentFilters } from "@/hooks/useDocumentFilters";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { sortDocumentsByDate } from "@/lib/sortDocumentsByDate";

export default function OrdiniServizioPage() {
  const { commessaId } = useCommessa();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);
  const { toast } = useToast();
  const { columnOrder, updateColumnOrder, columnWidths, updateColumnWidths, resetColumns } = useColumnOrder("ordini-servizio", DEFAULT_VISIBLE_COLUMNS);
  const { viewMode, updateViewMode } = useViewMode("ordini-servizio");
  const { activeFilterCount, setActiveFilterCount, clearFiltersRef, clearAllFilters } = useDocumentFilters();

  const fetchDocuments = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('documents').select('*')
      .eq('section', 'ordini-servizio').eq('commessa_id', commessaId)
      .order('created_at', { ascending: false });
    if (!error) setDocuments(sortDocumentsByDate(data || []));
    setLoading(false);
  }, [commessaId]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleDelete = async (id: string, filePath: string) => {
    await supabase.storage.from('documents').remove([filePath]);
    await supabase.from('documents').delete().eq('id', id);
    if (selectedDoc?.id === id) setSelectedDoc(null);
    toast({ title: "Documento eliminato" });
    fetchDocuments();
  };

  const handleUpdate = async (id: string, updatedAiData: any, newFileName?: string) => {
    const updateData: any = { ai_extracted_data: updatedAiData };
    if (newFileName) updateData.file_name = newFileName;
    const { error } = await supabase.from('documents').update(updateData).eq('id', id);
    if (error) { toast({ title: "Errore", variant: "destructive" }); }
    else { toast({ title: "Documento aggiornato" }); fetchDocuments(); }
  };

  const renderDocumentView = () => {
    if (viewMode === "grid") {
      return <DocumentCardGrid documents={documents} onDelete={handleDelete} onSelect={setSelectedDoc} selectedId={selectedDoc?.id} searchQuery={searchQuery} />;
    }
    return <DocumentTable documents={documents} onDelete={handleDelete} onUpdate={handleUpdate} onSelect={setSelectedDoc} selectedId={selectedDoc?.id ?? null} searchQuery={searchQuery} visibleColumns={visibleColumns} columnOrder={columnOrder} onColumnOrderChange={updateColumnOrder} columnWidths={columnWidths} onColumnWidthsChange={updateColumnWidths} onFilterCountChange={setActiveFilterCount} clearFiltersRef={clearFiltersRef} />;
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
        <div className="p-3 lg:p-4 max-w-full space-y-2 flex-shrink-0">
          <PageHeader title="Ordini di Servizio" icon={FileCheck} actions={<DocumentUpload section="ordini-servizio" commessaId={commessaId} onUploadComplete={fetchDocuments} compact />} />
        </div>
        <div className="flex-1 overflow-hidden px-3 lg:px-4 pb-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Caricamento...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Nessun ordine di servizio caricato. Carica il primo ordine di servizio.</div>
          ) : (
            <>
              <DocumentToolbar documents={documents} searchQuery={searchQuery} onSearchChange={setSearchQuery} visibleColumns={visibleColumns} onVisibleColumnsChange={setVisibleColumns} viewMode={viewMode} onViewModeChange={updateViewMode} onResetColumns={resetColumns} activeFilterCount={activeFilterCount} onClearAllFilters={clearAllFilters} />
              {selectedDoc && viewMode === "table" ? (
                <ResizablePanelGroup direction="horizontal" className="rounded-lg border border-border bg-card h-[calc(100%-44px)]">
                  <ResizablePanel defaultSize={50} minSize={30}><div className="h-full overflow-auto">{renderDocumentView()}</div></ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={25}><DocumentPreview document={selectedDoc} onClose={() => setSelectedDoc(null)} /></ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                <div className="overflow-auto h-[calc(100%-44px)]">{renderDocumentView()}</div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
