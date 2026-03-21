import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentCardGrid } from "@/components/DocumentCardGrid";
import { DocumentPreview } from "@/components/DocumentPreview";
import { DocumentToolbar } from "@/components/DocumentToolbar";
import { FileText } from "lucide-react";
import { DEFAULT_VISIBLE_COLUMNS, type ColumnKey } from "@/components/DocumentTable";
import { useColumnOrder } from "@/hooks/useColumnOrder";
import { useViewMode } from "@/hooks/useViewMode";
import { useDocumentFilters } from "@/hooks/useDocumentFilters";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useCommessa } from "@/contexts/CommessaContext";
import { useReanalyzeDocument } from "@/hooks/useReanalyzeDocument";
import { useDocumentPage } from "@/hooks/useDocumentPage";

export default function DocumentiPage() {
  const { commessaId } = useCommessa();
  const { documents, loading, hasError, fetchDocuments, handleDelete: deleteDoc, handleUpdate } = useDocumentPage("documenti");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);
  const { columnOrder, updateColumnOrder, columnWidths, updateColumnWidths, resetColumns } = useColumnOrder("documenti", DEFAULT_VISIBLE_COLUMNS);
  const { viewMode, updateViewMode } = useViewMode("documenti");
  const { activeFilterCount, setActiveFilterCount, clearFiltersRef, clearAllFilters } = useDocumentFilters();
  const { reanalyze, reanalyzingIds } = useReanalyzeDocument(fetchDocuments);

  const handleDelete = (id: string, filePath: string) => {
    if (selectedDoc?.id === id) setSelectedDoc(null);
    deleteDoc(id, filePath);
  };

  const renderDocumentView = () => {
    if (viewMode === "grid") {
      return <DocumentCardGrid documents={documents} onDelete={handleDelete} onSelect={setSelectedDoc} onReanalyze={reanalyze} reanalyzingIds={reanalyzingIds} selectedId={selectedDoc?.id} searchQuery={searchQuery} />;
    }
    return <DocumentTable documents={documents} onDelete={handleDelete} onUpdate={handleUpdate} onReanalyze={reanalyze} reanalyzingIds={reanalyzingIds} onSelect={setSelectedDoc} selectedId={selectedDoc?.id ?? null} searchQuery={searchQuery} visibleColumns={visibleColumns} columnOrder={columnOrder} onColumnOrderChange={updateColumnOrder} columnWidths={columnWidths} onColumnWidthsChange={updateColumnWidths} onFilterCountChange={setActiveFilterCount} clearFiltersRef={clearFiltersRef} />;
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
        <div className="p-3 lg:p-4 max-w-full space-y-2 flex-shrink-0">
          <PageHeader title="Documenti" icon={FileText} actions={<DocumentUpload section="documenti" commessaId={commessaId} onUploadComplete={fetchDocuments} compact />} />
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
            <div className="text-center py-12 text-muted-foreground text-sm">Nessun documento caricato. Carica il tuo primo documento per iniziare l'analisi AI.</div>
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
