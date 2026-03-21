import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentCardGrid } from "@/components/DocumentCardGrid";
import { DocumentPreview } from "@/components/DocumentPreview";
import { DocumentToolbar } from "@/components/DocumentToolbar";
import { Compass, FolderPlus, Folder, FolderOpen, X, Pencil, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { DEFAULT_VISIBLE_COLUMNS, type ColumnKey } from "@/components/DocumentTable";
import { useToast } from "@/hooks/use-toast";
import { useColumnOrder } from "@/hooks/useColumnOrder";
import { useViewMode } from "@/hooks/useViewMode";
import { useDocumentFilters } from "@/hooks/useDocumentFilters";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDocumentPage } from "@/hooks/useDocumentPage";

const DEFAULT_FOLDERS = ["Progetto a base di gara"];

export default function ProgettoPage() {
  const { commessaId } = useCommessa();
  const { documents, loading, hasError, fetchDocuments, handleDelete: deleteDoc, handleUpdate } = useDocumentPage("progetto");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);
  const { toast } = useToast();
  const { columnOrder, updateColumnOrder, columnWidths, updateColumnWidths, resetColumns } = useColumnOrder("progetto", DEFAULT_VISIBLE_COLUMNS);
  const { viewMode, updateViewMode } = useViewMode("progetto");
  const { activeFilterCount, setActiveFilterCount, clearFiltersRef, clearAllFilters } = useDocumentFilters();

  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS);
  const [activeFolder, setActiveFolder] = useState<string>(DEFAULT_FOLDERS[0]);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);

  useEffect(() => {
    if (!commessaId) return;
    const storageKey = `progetto-folders-${commessaId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        if (parsed.length > 0) {
          setFolders(parsed);
          setActiveFolder(prev => parsed.includes(prev) ? prev : parsed[0]);
          return;
        }
      } catch {}
    }
    setFolders(DEFAULT_FOLDERS);
    setActiveFolder(DEFAULT_FOLDERS[0]);
  }, [commessaId]);

  const saveFolders = useCallback((newFolders: string[]) => {
    if (!commessaId) return;
    setFolders(newFolders);
    localStorage.setItem(`progetto-folders-${commessaId}`, JSON.stringify(newFolders));
  }, [commessaId]);

  const filteredDocuments = documents.filter(doc => {
    const docFolder = (doc as any).subfolder || DEFAULT_FOLDERS[0];
    return docFolder === activeFolder;
  });

  const handleDelete = (id: string, filePath: string) => {
    if (selectedDoc?.id === id) setSelectedDoc(null);
    deleteDoc(id, filePath);
  };

  const handleAddFolder = () => {
    const name = newFolderName.trim();
    if (!name || folders.includes(name)) {
      toast({ title: "Nome cartella non valido o già esistente", variant: "destructive" });
      return;
    }
    const updated = [...folders, name];
    saveFolders(updated);
    setActiveFolder(name);
    setNewFolderName("");
    setIsAddingFolder(false);
    toast({ title: `Cartella "${name}" creata` });
  };

  const handleRenameFolder = (oldName: string) => {
    const newName = editFolderName.trim();
    if (!newName || (newName !== oldName && folders.includes(newName))) {
      toast({ title: "Nome non valido o già esistente", variant: "destructive" });
      return;
    }
    const updated = folders.map(f => f === oldName ? newName : f);
    saveFolders(updated);
    if (activeFolder === oldName) setActiveFolder(newName);
    supabase.from('documents').update({ subfolder: newName } as any)
      .eq('commessa_id', commessaId!).eq('section', 'progetto').eq('subfolder', oldName)
      .then(() => fetchDocuments());
    setEditingFolder(null);
    setEditFolderName("");
    toast({ title: `Cartella rinominata in "${newName}"` });
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder || folders.length <= 1) return;
    const remaining = folders.filter(f => f !== deletingFolder);
    const targetFolder = remaining[0];
    await supabase.from('documents').update({ subfolder: targetFolder } as any)
      .eq('commessa_id', commessaId!).eq('section', 'progetto').eq('subfolder', deletingFolder);
    saveFolders(remaining);
    if (activeFolder === deletingFolder) setActiveFolder(targetFolder);
    setDeletingFolder(null);
    fetchDocuments();
    toast({ title: `Cartella eliminata. Documenti spostati in "${targetFolder}"` });
  };

  const renderDocumentView = () => {
    if (viewMode === "grid") {
      return <DocumentCardGrid documents={filteredDocuments} onDelete={handleDelete} onSelect={setSelectedDoc} selectedId={selectedDoc?.id} searchQuery={searchQuery} />;
    }
    return <DocumentTable documents={filteredDocuments} onDelete={handleDelete} onUpdate={handleUpdate} onSelect={setSelectedDoc} selectedId={selectedDoc?.id ?? null} searchQuery={searchQuery} visibleColumns={visibleColumns} columnOrder={columnOrder} onColumnOrderChange={updateColumnOrder} columnWidths={columnWidths} onColumnWidthsChange={updateColumnWidths} onFilterCountChange={setActiveFilterCount} clearFiltersRef={clearFiltersRef} />;
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
        <div className="p-3 lg:p-4 max-w-full space-y-2 flex-shrink-0">
          <PageHeader title="Progetto" icon={Compass} actions={<DocumentUpload section="progetto" commessaId={commessaId} onUploadComplete={fetchDocuments} compact subfolder={activeFolder} />} />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {folders.map((folder) => (
              <div key={folder} className="group relative flex-shrink-0">
                {editingFolder === folder ? (
                  <div className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
                    <Input value={editFolderName} onChange={(e) => setEditFolderName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameFolder(folder); if (e.key === 'Escape') setEditingFolder(null); }} className="h-6 text-xs w-32 px-1.5" autoFocus />
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleRenameFolder(folder)}><Check className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditingFolder(null)}><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <button onClick={() => setActiveFolder(folder)} onDoubleClick={() => { setEditingFolder(folder); setEditFolderName(folder); }}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap", activeFolder === folder ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground")}>
                    {activeFolder === folder ? <FolderOpen className="h-3.5 w-3.5" /> : <Folder className="h-3.5 w-3.5" />}
                    {folder}
                    <span className="text-[10px] opacity-70 ml-0.5">({documents.filter(d => ((d as any).subfolder || DEFAULT_FOLDERS[0]) === folder).length})</span>
                  </button>
                )}
                {editingFolder !== folder && activeFolder === folder && folders.length > 1 && (
                  <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                    <button onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setEditFolderName(folder); }} className="h-4 w-4 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-accent"><Pencil className="h-2.5 w-2.5 text-muted-foreground" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeletingFolder(folder); }} className="h-4 w-4 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center hover:bg-destructive/20"><X className="h-2.5 w-2.5 text-destructive" /></button>
                  </div>
                )}
              </div>
            ))}
            {isAddingFolder ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddFolder(); if (e.key === 'Escape') { setIsAddingFolder(false); setNewFolderName(""); } }} placeholder="es. Variante 1" className="h-7 text-xs w-36 px-2" autoFocus />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleAddFolder}><Check className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setIsAddingFolder(false); setNewFolderName(""); }}><X className="h-3.5 w-3.5" /></Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 flex-shrink-0 border-dashed" onClick={() => setIsAddingFolder(true)}>
                <FolderPlus className="h-3.5 w-3.5" />Aggiungi variante
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden px-3 lg:px-4 pb-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Caricamento...</div>
          ) : hasError ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-destructive text-sm">Errore durante il caricamento dei documenti.</p>
              <button onClick={() => fetchDocuments()} className="text-sm underline text-muted-foreground hover:text-foreground">Riprova</button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Nessun documento in "{activeFolder}". Carica il primo documento.</div>
          ) : (
            <>
              <DocumentToolbar documents={filteredDocuments} searchQuery={searchQuery} onSearchChange={setSearchQuery} visibleColumns={visibleColumns} onVisibleColumnsChange={setVisibleColumns} viewMode={viewMode} onViewModeChange={updateViewMode} onResetColumns={resetColumns} activeFilterCount={activeFilterCount} onClearAllFilters={clearAllFilters} />
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

      <AlertDialog open={!!deletingFolder} onOpenChange={(open) => { if (!open) setDeletingFolder(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare la cartella "{deletingFolder}"?</AlertDialogTitle>
            <AlertDialogDescription>I documenti contenuti verranno spostati nella cartella "{folders.filter(f => f !== deletingFolder)[0]}". Questa azione non può essere annullata.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
