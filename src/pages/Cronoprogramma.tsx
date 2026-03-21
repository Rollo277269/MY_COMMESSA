import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { GanttChart } from "@/components/gantt/GanttChart";
import { GanttPhase, ContractDates } from "@/components/gantt/types";
import { useCronoprogramma } from "@/hooks/useCronoprogramma";
import { useProroghe } from "@/hooks/useProroghe";
import { ImportCronoprogrammaDialog } from "@/components/gantt/ImportCronoprogrammaDialog";
import { CmeLinkDialog } from "@/components/gantt/CmeLinkDialog";
import { DependencyLinkDialog } from "@/components/gantt/DependencyLinkDialog";
import { ProrogheDialog } from "@/components/gantt/ProrogheDialog";
import { ExportCronoprogramma } from "@/components/gantt/ExportCronoprogramma";
import { Calendar, Loader2, Upload, ShieldPlus, Undo2, Plus, FileUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";




function parseDateString(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (parts) return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
  const iso = new Date(dateStr);
  if (!isNaN(iso.getTime())) return iso;
  return null;
}

export default function CronoprogrammaPage() {
  const { phases, isLoading, updatePhase, renamePhase, addPhase, deletePhase, updateCmeLinks, updateDependencies, updateProgress, reorderPhase, changeLevel, movePhase, importPhases, isSaving } = useCronoprogramma();
  const { proroghe, addProroga, deleteProroga } = useProroghe();
  const [localPhases, setLocalPhases] = useState<GanttPhase[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [cmeLinkOpen, setCmeLinkOpen] = useState(false);
  const [cmeLinkPhase, setCmeLinkPhase] = useState<{ id: string; name: string; cmeRowIds: string[] } | null>(null);
  const [depLinkOpen, setDepLinkOpen] = useState(false);
  const [depLinkPhase, setDepLinkPhase] = useState<{ id: string; name: string; dependsOn: string[] } | null>(null);
  const [prorogheOpen, setProrogheOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  // Undo stack
  const undoStackRef = useRef<GanttPhase[][]>([]);
  const MAX_UNDO = 30;

  const pushUndo = useCallback(() => {
    if (localPhases.length > 0) {
      undoStackRef.current = [...undoStackRef.current.slice(-(MAX_UNDO - 1)), JSON.parse(JSON.stringify(localPhases))];
    }
  }, [localPhases]);

  const handleUndo = useCallback(async () => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const prev = stack.pop()!;
    undoStackRef.current = [...stack];

    // Restore dates by parsing stringified dates back
    const restored: GanttPhase[] = prev.map((p: any) => ({
      ...p,
      startDate: new Date(p.startDate),
      endDate: new Date(p.endDate),
      subPhases: p.subPhases?.map((s: any) => ({
        ...s,
        startDate: new Date(s.startDate),
        endDate: new Date(s.endDate),
      })),
    }));
    setLocalPhases(restored);

    // Persist all phases back to DB
    const { format: fmt } = await import("date-fns");
    for (const p of restored) {
      await supabase.from("cronoprogramma_phases").update({
        name: p.name,
        start_date: fmt(p.startDate, "yyyy-MM-dd"),
        end_date: fmt(p.endDate, "yyyy-MM-dd"),
        progress: p.progress,
      }).eq("id", p.id);
      if (p.subPhases) {
        for (const s of p.subPhases) {
          await supabase.from("cronoprogramma_phases").update({
            name: s.name,
            start_date: fmt(s.startDate, "yyyy-MM-dd"),
            end_date: fmt(s.endDate, "yyyy-MM-dd"),
            progress: s.progress,
          }).eq("id", s.id);
        }
      }
    }
    toast({ title: "Modifica annullata" });
  }, []);

  // Listen for Ctrl+Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo]);

  // Fetch commessa data for contract dates
  const commessaQuery = useQuery({
    queryKey: ["commessa-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commessa_data")
        .select("data_consegna_lavori, data_scadenza_contratto")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const contractDates = useMemo<ContractDates | undefined>(() => {
    const cd = commessaQuery.data;
    if (!cd) return undefined;
    const consegna = parseDateString(cd.data_consegna_lavori);
    const scadenza = parseDateString(cd.data_scadenza_contratto);
    // Calculate effective end date from proroghe
    let dataFineEffettiva: Date | null = null;
    if (proroghe.length > 0) {
      const lastProroga = proroghe[proroghe.length - 1];
      dataFineEffettiva = new Date(lastProroga.nuova_data_fine);
    }
    return { consegnaLavori: consegna, scadenzaContratto: scadenza, dataFineEffettiva };
  }, [commessaQuery.data, proroghe]);




  useEffect(() => {
    if (phases && phases.length > 0) setLocalPhases(phases);
  }, [phases]);

  // Collect all dependent phase IDs recursively
  const getDependentIds = useCallback((phaseId: string, allPhases: GanttPhase[]): string[] => {
    const flat = allPhases.flatMap((p) => [p, ...(p.subPhases || [])]);
    const deps: string[] = [];
    const queue = [phaseId];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const ph of flat) {
        if (ph.dependsOn?.includes(current) && !visited.has(ph.id)) {
          deps.push(ph.id);
          queue.push(ph.id);
        }
      }
    }
    return deps;
  }, []);

  const handlePhaseChange = useCallback(
    (id: string, newStart: Date, newEnd: Date) => {
      pushUndo();

      setLocalPhases((prev) => {
        // Find old phase to compute delta
        const flat = prev.flatMap((p) => [p, ...(p.subPhases || [])]);
        const oldPhase = flat.find((p) => p.id === id);
        if (!oldPhase) return prev;

        const deltaMs = newStart.getTime() - oldPhase.startDate.getTime();

        // Check if dragged phase is a parent with sub-phases
        const isParent = prev.some((p) => p.id === id && p.subPhases && p.subPhases.length > 0);

        // Collect IDs of sub-phases that need to shift (if dragging a parent)
        const subIds = isParent
          ? (prev.find((p) => p.id === id)?.subPhases?.map((s) => s.id) || [])
          : [];

        // Collect dependent phase IDs (cascade)
        const allShiftIds = new Set([
          ...getDependentIds(id, prev),
          ...subIds,
          ...subIds.flatMap((sid) => getDependentIds(sid, prev)),
        ]);

        const shiftPhase = (p: GanttPhase): GanttPhase => ({
          ...p,
          startDate: new Date(p.startDate.getTime() + deltaMs),
          endDate: new Date(p.endDate.getTime() + deltaMs),
        });

        const updated = prev.map((p) => {
          let phase = p;

          // Update the dragged phase itself
          if (p.id === id) {
            phase = { ...p, startDate: newStart, endDate: newEnd };
            // If parent, shift all sub-phases
            if (phase.subPhases) {
              phase = {
                ...phase,
                subPhases: phase.subPhases.map((s) => allShiftIds.has(s.id) || subIds.includes(s.id) ? shiftPhase(s) : s),
              };
              // Recalculate parent dates from subs
              const minStart = new Date(Math.min(...phase.subPhases.map((s) => s.startDate.getTime())));
              const maxEnd = new Date(Math.max(...phase.subPhases.map((s) => s.endDate.getTime())));
              phase = { ...phase, startDate: minStart, endDate: maxEnd };
            }
            return phase;
          }

          // Update sub-phase if it was the dragged one
          if (p.subPhases) {
            const updatedSubs = p.subPhases.map((s) => {
              if (s.id === id) return { ...s, startDate: newStart, endDate: newEnd };
              if (allShiftIds.has(s.id)) return shiftPhase(s);
              return s;
            });
            const hasChanged = updatedSubs.some((s, i) => s !== p.subPhases![i]);
            if (hasChanged) {
              const minStart = new Date(Math.min(...updatedSubs.map((s) => s.startDate.getTime())));
              const maxEnd = new Date(Math.max(...updatedSubs.map((s) => s.endDate.getTime())));
              return { ...p, subPhases: updatedSubs, startDate: minStart, endDate: maxEnd };
            }
          }

          // Shift if this phase is a dependent
          if (allShiftIds.has(p.id)) {
            phase = shiftPhase(p);
            if (phase.subPhases) {
              phase = {
                ...phase,
                subPhases: phase.subPhases.map(shiftPhase),
              };
            }
            return phase;
          }

          return p;
        });

        // Persist all shifted phases
        const allUpdated = updated.flatMap((p) => [p, ...(p.subPhases || [])]);
        const allOld = prev.flatMap((p) => [p, ...(p.subPhases || [])]);
        const changedIds = new Set([id, ...allShiftIds, ...subIds]);

        // Schedule DB updates for all changed phases
        setTimeout(() => {
          for (const cid of changedIds) {
            const ph = allUpdated.find((p) => p.id === cid);
            if (ph) {
              updatePhase.mutate({ id: cid, startDate: ph.startDate, endDate: ph.endDate });
            }
          }
        }, 0);

        return updated;
      });
    },
    [updatePhase, pushUndo, getDependentIds]
  );

  const handleRename = useCallback((id: string, name: string) => {
    pushUndo();
    setLocalPhases((prev) =>
      prev.map((p) => {
        if (p.id === id) return { ...p, name };
        if (p.subPhases) return { ...p, subPhases: p.subPhases.map((s) => s.id === id ? { ...s, name } : s) };
        return p;
      })
    );
    renamePhase.mutate({ id, name });
  }, [renamePhase, pushUndo]);

  const handleDelete = useCallback((id: string) => {
    pushUndo();
    setLocalPhases((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p) => p.subPhases ? { ...p, subPhases: p.subPhases.filter((s) => s.id !== id) } : p);
    });
    deletePhase.mutate(id);
  }, [deletePhase, pushUndo]);

  const handleAddPhase = useCallback(() => {
    addPhase.mutate({ name: "Nuova fase", sortOrder: localPhases.length || 0 });
  }, [addPhase, localPhases]);

  const handleAddSubPhase = useCallback((parentId: string) => {
    const parent = localPhases.find((p) => p.id === parentId);
    addPhase.mutate({ name: "Nuova sotto-fase", parentId, sortOrder: parent?.subPhases?.length ?? 0 });
  }, [addPhase, localPhases]);

  const handleCmeLink = useCallback((id: string) => {
    for (const p of localPhases) {
      if (p.id === id) { setCmeLinkPhase({ id: p.id, name: p.name, cmeRowIds: p.cmeRowIds || [] }); setCmeLinkOpen(true); return; }
      if (p.subPhases) for (const s of p.subPhases) if (s.id === id) { setCmeLinkPhase({ id: s.id, name: s.name, cmeRowIds: s.cmeRowIds || [] }); setCmeLinkOpen(true); return; }
    }
  }, [localPhases]);

  const handleCmeSave = useCallback((phaseId: string, cmeRowIds: string[]) => updateCmeLinks.mutate({ id: phaseId, cmeRowIds }), [updateCmeLinks]);

  const handleImportConfirm = useCallback((importedPhases: any[]) => importPhases.mutate(importedPhases), [importPhases]);

  const handleProgressChange = useCallback((id: string, progress: number) => {
    pushUndo();
    setLocalPhases((prev) =>
      prev.map((p) => {
        if (p.id === id) return { ...p, progress };
        if (p.subPhases) return { ...p, subPhases: p.subPhases.map((s) => s.id === id ? { ...s, progress } : s) };
        return p;
      })
    );
    updateProgress.mutate({ id, progress });
  }, [updateProgress, pushUndo]);

  const handleMoveUp = useCallback((id: string) => reorderPhase.mutate({ id, direction: "up" }), [reorderPhase]);
  const handleMoveDown = useCallback((id: string) => reorderPhase.mutate({ id, direction: "down" }), [reorderPhase]);
  const handlePromote = useCallback((id: string) => changeLevel.mutate({ id, action: "promote" }), [changeLevel]);
  const handleDemote = useCallback((id: string) => changeLevel.mutate({ id, action: "demote" }), [changeLevel]);

  const handleDependencyLink = useCallback((id: string) => {
    for (const p of localPhases) {
      if (p.id === id) { setDepLinkPhase({ id: p.id, name: p.name, dependsOn: p.dependsOn || [] }); setDepLinkOpen(true); return; }
      if (p.subPhases) for (const s of p.subPhases) if (s.id === id) { setDepLinkPhase({ id: s.id, name: s.name, dependsOn: s.dependsOn || [] }); setDepLinkOpen(true); return; }
    }
  }, [localPhases]);

  const handleDepSave = useCallback((phaseId: string, dependsOn: string[]) => updateDependencies.mutate({ id: phaseId, dependsOn }), [updateDependencies]);

  const handleMovePhase = useCallback((id: string, newParentId: string | null, newSortOrder: number) => {
    pushUndo();
    movePhase.mutate({ id, newParentId, newSortOrder });
  }, [movePhase, pushUndo]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
      setDroppedFile(file);
      setImportOpen(true);
    } else if (file) {
      toast({ title: "Formato non supportato", description: "Trascina un file PDF per importare il cronoprogramma." });
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const displayPhases = localPhases.length > 0 ? localPhases : (phases ?? []);

  return (
    <AppLayout>
      <div
        className="p-3 lg:p-4 max-w-full space-y-4 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary rounded-lg m-2 pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-primary">
              <FileUp className="w-10 h-10" />
              <span className="text-sm font-medium">Rilascia il PDF per importare</span>
            </div>
          </div>
        )}
        <PageHeader
          title="Cronoprogramma"
          
          icon={Calendar}
        />

        <div className="flex items-center gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-accent" />
            <span className="text-muted-foreground">Programmato</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-accent opacity-100" />
            <span className="text-muted-foreground">Eseguito</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-px h-3 bg-destructive" />
            <span className="text-muted-foreground">Oggi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3 bg-success/70" />
            <span className="text-muted-foreground">Consegna lavori</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3 bg-warning/70" />
            <span className="text-muted-foreground">Scadenza lavori</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 border-t border-dashed border-muted-foreground/40" />
            <span className="text-muted-foreground">Connessione</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isSaving && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Salvataggio...</span>
              </div>
            )}
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={handleUndo} title="Annulla (Ctrl+Z)">
              <Undo2 className="w-3.5 h-3.5" />
              Annulla
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setProrogheOpen(true)}>
              <ShieldPlus className="w-3.5 h-3.5" />
              Proroghe{proroghe.length > 0 && ` (${proroghe.length})`}
            </Button>
            <ExportCronoprogramma phases={displayPhases} />
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setImportOpen(true)}>
              <Upload className="w-3.5 h-3.5" />
              Importa da PDF
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : displayPhases.length > 0 ? (
          <GanttChart
            phases={displayPhases}
            contractDates={contractDates}
            onPhaseChange={handlePhaseChange}
            onRename={handleRename}
            onDelete={handleDelete}
            onAddPhase={handleAddPhase}
            onAddSubPhase={handleAddSubPhase}
            onCmeLink={handleCmeLink}
            onDependencyLink={handleDependencyLink}
            onProgressChange={handleProgressChange}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onPromote={handlePromote}
            onDemote={handleDemote}
            onMovePhase={handleMovePhase}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setDroppedFile(file);
                  setImportOpen(true);
                }
                e.target.value = "";
              }}
            />
            <Calendar className="w-12 h-12 text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Nessun cronoprogramma definito</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Trascina un PDF qui, oppure clicca per selezionarlo. Puoi anche aggiungere le fasi manualmente.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={(e) => { e.stopPropagation(); setImportOpen(true); }}>
                <FileUp className="w-4 h-4" />
                Importa da PDF
              </Button>
              <Button size="sm" className="gap-1.5" onClick={(e) => { e.stopPropagation(); handleAddPhase(); }}>
                <Plus className="w-4 h-4" />
                Aggiungi fase
              </Button>
            </div>
          </div>
        )}
      </div>

      <ImportCronoprogrammaDialog open={importOpen} onOpenChange={(open) => { setImportOpen(open); if (!open) setDroppedFile(null); }} onConfirm={handleImportConfirm} initialFile={droppedFile} />

      <ProrogheDialog
        open={prorogheOpen}
        onOpenChange={setProrogheOpen}
        proroghe={proroghe}
        dataScadenzaOriginale={contractDates?.scadenzaContratto ?? null}
        onAdd={(p) => addProroga.mutate(p)}
        onDelete={(id) => deleteProroga.mutate(id)}
      />

      {cmeLinkPhase && (
        <CmeLinkDialog open={cmeLinkOpen} onOpenChange={setCmeLinkOpen} phaseId={cmeLinkPhase.id} phaseName={cmeLinkPhase.name} linkedCmeIds={cmeLinkPhase.cmeRowIds} onSave={handleCmeSave} />
      )}

      {depLinkPhase && (
        <DependencyLinkDialog open={depLinkOpen} onOpenChange={setDepLinkOpen} phaseId={depLinkPhase.id} phaseName={depLinkPhase.name} currentDeps={depLinkPhase.dependsOn} allPhases={displayPhases} onSave={handleDepSave} />
      )}
    </AppLayout>
  );
}
