import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentCardGrid } from "@/components/DocumentCardGrid";
import { DocumentPreview } from "@/components/DocumentPreview";
import { DocumentToolbar } from "@/components/DocumentToolbar";
import { PhotoLightbox } from "@/components/foto/PhotoLightbox";
import { PhotoFilters } from "@/components/foto/PhotoFilters";
import { Camera } from "lucide-react";
import { DEFAULT_VISIBLE_COLUMNS, type ColumnKey } from "@/components/DocumentTable";
import { useColumnOrder } from "@/hooks/useColumnOrder";
import { useViewMode } from "@/hooks/useViewMode";
import { useDocumentFilters } from "@/hooks/useDocumentFilters";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useCommessa } from "@/contexts/CommessaContext";
import { useDocumentPage } from "@/hooks/useDocumentPage";

function isImageFile(fileType: string | null, fileName: string): boolean {
  if (fileType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
}

export default function FotoPage() {
  const { commessaId } = useCommessa();
  const { documents, loading, hasError, fetchDocuments, handleDelete: deleteDoc, handleUpdate } = useDocumentPage("foto");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);
  const { columnOrder, updateColumnOrder, columnWidths, updateColumnWidths, resetColumns } = useColumnOrder("foto", DEFAULT_VISIBLE_COLUMNS);
  const { viewMode, updateViewMode } = useViewMode("foto", "grid");
  const { activeFilterCount, setActiveFilterCount, clearFiltersRef, clearAllFilters } = useDocumentFilters();
  const [lightboxDoc, setLightboxDoc] = useState<any | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.created_at);
        if (dateRange.from && docDate < dateRange.from) return false;
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (docDate > endOfDay) return false;
        }
        return true;
      });
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((doc) => {
        const ai = doc.ai_extracted_data;
        if (!ai) return false;
        const docTags: string[] = [
          ...(ai.tags || ai.categorie || ai.etichette || []),
          ai.tipo_documento,
          ai.categoria,
        ].filter(Boolean).map((t: string) => (typeof t === "string" ? t.trim() : ""));
        return selectedTags.some((st) => docTags.includes(st));
      });
    }
    return filtered;
  }, [documents, dateRange, selectedTags]);

  const imageDocuments = useMemo(
    () => filteredDocuments.filter((d) => isImageFile(d.file_type, d.file_name)),
    [filteredDocuments]
  );
  const lightboxIndex = lightboxDoc ? imageDocuments.findIndex((d) => d.id === lightboxDoc.id) : -1;

  const handleCardClick = (doc: any) => {
    if (isImageFile(doc.file_type, doc.file_name) && viewMode === "grid") {
      setLightboxDoc(doc);
    } else {
      setSelectedDoc(selectedDoc?.id === doc.id ? null : doc);
    }
  };

  const handleDelete = (id: string, filePath: string) => {
    if (selectedDoc?.id === id) setSelectedDoc(null);
    if (lightboxDoc?.id === id) setLightboxDoc(null);
    deleteDoc(id, filePath);
  };

  const renderDocumentView = () => {
    if (viewMode === "grid") {
      return <DocumentCardGrid documents={filteredDocuments} onDelete={handleDelete} onSelect={handleCardClick} selectedId={selectedDoc?.id} searchQuery={searchQuery} />;
    }
    return <DocumentTable documents={filteredDocuments} onDelete={handleDelete} onUpdate={handleUpdate} onSelect={setSelectedDoc} selectedId={selectedDoc?.id ?? null} searchQuery={searchQuery} visibleColumns={visibleColumns} columnOrder={columnOrder} onColumnOrderChange={updateColumnOrder} columnWidths={columnWidths} onColumnWidthsChange={updateColumnWidths} onFilterCountChange={setActiveFilterCount} clearFiltersRef={clearFiltersRef} />;
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
        <div className="p-3 lg:p-4 max-w-full space-y-2 flex-shrink-0">
          <PageHeader title="Foto" icon={Camera} actions={<DocumentUpload section="foto" commessaId={commessaId} onUploadComplete={fetchDocuments} compact />} />
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
            <div className="text-center py-12 text-muted-foreground text-sm">Nessuna foto caricata. Carica la prima foto per iniziare.</div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <div className="flex-1">
                  <DocumentToolbar documents={filteredDocuments} searchQuery={searchQuery} onSearchChange={setSearchQuery} visibleColumns={visibleColumns} onVisibleColumnsChange={setVisibleColumns} viewMode={viewMode} onViewModeChange={updateViewMode} onResetColumns={resetColumns} activeFilterCount={activeFilterCount} onClearAllFilters={clearAllFilters} />
                </div>
              </div>
              <div className="mb-2">
                <PhotoFilters documents={documents} dateRange={dateRange} onDateRangeChange={setDateRange} selectedTags={selectedTags} onSelectedTagsChange={setSelectedTags} />
              </div>
              {selectedDoc && viewMode === "table" ? (
                <ResizablePanelGroup direction="horizontal" className="rounded-lg border border-border bg-card h-[calc(100%-88px)]">
                  <ResizablePanel defaultSize={50} minSize={30}><div className="h-full overflow-auto">{renderDocumentView()}</div></ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={25}><DocumentPreview document={selectedDoc} onClose={() => setSelectedDoc(null)} /></ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                <div className="overflow-auto h-[calc(100%-88px)]">{renderDocumentView()}</div>
              )}
            </>
          )}
        </div>
      </div>

      <PhotoLightbox
        document={lightboxDoc}
        onClose={() => setLightboxDoc(null)}
        onPrev={() => lightboxIndex > 0 && setLightboxDoc(imageDocuments[lightboxIndex - 1])}
        onNext={() => lightboxIndex < imageDocuments.length - 1 && setLightboxDoc(imageDocuments[lightboxIndex + 1])}
        hasPrev={lightboxIndex > 0}
        hasNext={lightboxIndex < imageDocuments.length - 1}
      />
    </AppLayout>
  );
}
