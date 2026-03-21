import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GanttPhase } from "@/components/gantt/types";
import { format, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useCommessa } from "@/contexts/CommessaContext";

interface DbPhase {
  id: string;
  parent_id: string | null;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
  color: string | null;
  depends_on: string[] | null;
  sort_order: number;
  cme_row_ids: string[] | null;
}

function dbToGantt(rows: DbPhase[]): GanttPhase[] {
  const parents = rows
    .filter((r) => !r.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  return parents.map((p) => {
    const subs = rows
      .filter((r) => r.parent_id === p.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const subPhases = subs.length
      ? subs.map((s) => ({
          id: s.id,
          name: s.name,
          startDate: parseISO(s.start_date),
          endDate: parseISO(s.end_date),
          progress: s.progress,
          color: s.color ?? undefined,
          dependsOn: s.depends_on?.length ? s.depends_on : undefined,
          cmeRowIds: s.cme_row_ids?.length ? s.cme_row_ids : undefined,
        }))
      : undefined;

    // If phase has sub-phases, derive start/end from them
    let startDate = parseISO(p.start_date);
    let endDate = parseISO(p.end_date);
    if (subPhases && subPhases.length > 0) {
      startDate = new Date(Math.min(...subPhases.map((s) => s.startDate.getTime())));
      endDate = new Date(Math.max(...subPhases.map((s) => s.endDate.getTime())));
    }

    return {
      id: p.id,
      name: p.name,
      startDate,
      endDate,
      progress: p.progress,
      color: p.color ?? undefined,
      dependsOn: p.depends_on?.length ? p.depends_on : undefined,
      cmeRowIds: p.cme_row_ids?.length ? p.cme_row_ids : undefined,
      subPhases,
    };
  });
}

export function useCronoprogramma() {
  const queryClient = useQueryClient();
  const { commessaId } = useCommessa();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cronoprogramma", commessaId] });

  const query = useQuery({
    queryKey: ["cronoprogramma", commessaId],
    enabled: !!commessaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cronoprogramma_phases")
        .select("*")
        .eq("commessa_id", commessaId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return dbToGantt(data as DbPhase[]);
    },
  });

  const syncParentDates = async (phaseId: string) => {
    // Find the phase's parent and recalculate parent dates from siblings
    const { data: phase } = await supabase
      .from("cronoprogramma_phases")
      .select("parent_id")
      .eq("id", phaseId)
      .single();
    if (!phase?.parent_id) return;

    const { data: siblings } = await supabase
      .from("cronoprogramma_phases")
      .select("start_date, end_date")
      .eq("parent_id", phase.parent_id);
    if (!siblings || siblings.length === 0) return;

    const minStart = siblings.reduce((min, s) => s.start_date < min ? s.start_date : min, siblings[0].start_date);
    const maxEnd = siblings.reduce((max, s) => s.end_date > max ? s.end_date : max, siblings[0].end_date);

    await supabase
      .from("cronoprogramma_phases")
      .update({ start_date: minStart, end_date: maxEnd })
      .eq("id", phase.parent_id);
  };

  const updatePhase = useMutation({
    mutationFn: async (phase: { id: string; startDate: Date; endDate: Date }) => {
      const { error } = await supabase
        .from("cronoprogramma_phases")
        .update({
          start_date: format(phase.startDate, "yyyy-MM-dd"),
          end_date: format(phase.endDate, "yyyy-MM-dd"),
        })
        .eq("id", phase.id);
      if (error) throw error;
      await syncParentDates(phase.id);
    },
    onSuccess: invalidate,
    onError: () => {
      toast({ title: "Errore", description: "Impossibile salvare le modifiche", variant: "destructive" });
    },
  });

  const renamePhase = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("cronoprogramma_phases")
        .update({ name })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => {
      toast({ title: "Errore", description: "Impossibile rinominare la fase", variant: "destructive" });
    },
  });

  const addPhase = useMutation({
    mutationFn: async ({ name, parentId, sortOrder }: { name: string; parentId?: string; sortOrder: number }) => {
      const today = format(new Date(), "yyyy-MM-dd");
      const endDate = format(new Date(Date.now() + 30 * 86400000), "yyyy-MM-dd");
      const { error } = await supabase
        .from("cronoprogramma_phases")
        .insert({
          name,
          parent_id: parentId ?? null,
          start_date: today,
          end_date: endDate,
          progress: 0,
          sort_order: sortOrder,
          commessa_id: commessaId,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Fase aggiunta" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile aggiungere la fase", variant: "destructive" });
    },
  });

  const deletePhase = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cronoprogramma_phases")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Fase eliminata" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile eliminare la fase", variant: "destructive" });
    },
  });

  const updateCmeLinks = useMutation({
    mutationFn: async ({ id, cmeRowIds }: { id: string; cmeRowIds: string[] }) => {
      const { error } = await supabase
        .from("cronoprogramma_phases")
        .update({ cme_row_ids: cmeRowIds } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Collegamento CME aggiornato" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile aggiornare il collegamento CME", variant: "destructive" });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const { error } = await supabase
        .from("cronoprogramma_phases")
        .update({ progress })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => {
      toast({ title: "Errore", description: "Impossibile aggiornare l'avanzamento", variant: "destructive" });
    },
  });

  const updateDependencies = useMutation({
    mutationFn: async ({ id, dependsOn }: { id: string; dependsOn: string[] }) => {
      // [L09] Cycle detection via DFS prima di salvare
      const { data: allPhases } = await supabase
        .from("cronoprogramma_phases")
        .select("id, depends_on")
        .eq("commessa_id", commessaId!);

      if (allPhases) {
        // Costruisci grafo con la dipendenza proposta inclusa
        const graph = new Map<string, string[]>();
        for (const p of allPhases) {
          graph.set(p.id, p.id === id ? dependsOn : (p.depends_on ?? []));
        }
        // DFS per rilevare cicli partendo da `id`
        const visited = new Set<string>();
        const hasCycle = (node: string, ancestors: Set<string>): boolean => {
          if (ancestors.has(node)) return true;
          if (visited.has(node)) return false;
          visited.add(node);
          ancestors.add(node);
          for (const dep of graph.get(node) ?? []) {
            if (hasCycle(dep, ancestors)) return true;
          }
          ancestors.delete(node);
          return false;
        };
        if (hasCycle(id, new Set())) {
          throw new Error("Dipendenza circolare rilevata: questa dipendenza creerebbe un ciclo nel cronoprogramma.");
        }
      }

      const { error } = await supabase
        .from("cronoprogramma_phases")
        .update({ depends_on: dependsOn } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Dipendenze aggiornate" });
    },
    onError: (e: Error) => {
      toast({ title: "Errore dipendenze", description: e.message, variant: "destructive" });
    },
  });

  const reorderPhase = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const { data: allPhases, error: fetchErr } = await supabase
        .from("cronoprogramma_phases")
        .select("id, parent_id, sort_order")
        .eq("commessa_id", commessaId!)
        .order("sort_order");
      if (fetchErr) throw fetchErr;

      const phase = allPhases?.find((p) => p.id === id);
      if (!phase) return;

      const siblings = (allPhases || [])
        .filter((p) => p.parent_id === phase.parent_id)
        .sort((a, b) => a.sort_order - b.sort_order);

      const idx = siblings.findIndex((s) => s.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= siblings.length) return;

      const updates = [
        { id: siblings[idx].id, sort_order: siblings[swapIdx].sort_order },
        { id: siblings[swapIdx].id, sort_order: siblings[idx].sort_order },
      ];

      for (const u of updates) {
        const { error } = await supabase
          .from("cronoprogramma_phases")
          .update({ sort_order: u.sort_order })
          .eq("id", u.id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
    onError: () => {
      toast({ title: "Errore", description: "Impossibile riordinare", variant: "destructive" });
    },
  });

  const changeLevel = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "promote" | "demote"; targetParentId?: string }) => {
      const { data: allPhases, error: fetchErr } = await supabase
        .from("cronoprogramma_phases")
        .select("id, parent_id, sort_order")
        .eq("commessa_id", commessaId!)
        .order("sort_order");
      if (fetchErr) throw fetchErr;

      const phase = allPhases?.find((p) => p.id === id);
      if (!phase) return;

      if (action === "promote" && phase.parent_id) {
        const mainPhases = (allPhases || []).filter((p) => !p.parent_id);
        const maxOrder = mainPhases.length > 0 ? Math.max(...mainPhases.map((p) => p.sort_order)) + 1 : 0;
        const { error } = await supabase
          .from("cronoprogramma_phases")
          .update({ parent_id: null, sort_order: maxOrder })
          .eq("id", id);
        if (error) throw error;
      } else if (action === "demote" && !phase.parent_id) {
        const mainPhases = (allPhases || [])
          .filter((p) => !p.parent_id)
          .sort((a, b) => a.sort_order - b.sort_order);
        const idx = mainPhases.findIndex((p) => p.id === id);
        if (idx <= 0) return;
        const newParent = mainPhases[idx - 1];
        const children = (allPhases || []).filter((p) => p.parent_id === newParent.id);
        const maxChildOrder = children.length > 0 ? Math.max(...children.map((c) => c.sort_order)) + 1 : 0;
        const { error } = await supabase
          .from("cronoprogramma_phases")
          .update({ parent_id: newParent.id, sort_order: maxChildOrder })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Livello aggiornato" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile cambiare livello", variant: "destructive" });
    },
  });

  const movePhase = useMutation({
    mutationFn: async ({ id, newParentId, newSortOrder }: { id: string; newParentId: string | null; newSortOrder: number }) => {
      const { data: allPhases, error: fetchErr } = await supabase
        .from("cronoprogramma_phases")
        .select("id, parent_id, sort_order")
        .eq("commessa_id", commessaId!)
        .order("sort_order");
      if (fetchErr) throw fetchErr;

      // Get siblings at target location (excluding the moved phase)
      const siblings = (allPhases || [])
        .filter((p) => p.parent_id === newParentId && p.id !== id)
        .sort((a, b) => a.sort_order - b.sort_order);

      // Shift siblings to make room
      const updates: { id: string; sort_order: number; parent_id?: string | null }[] = [];
      siblings.forEach((s, i) => {
        const order = i >= newSortOrder ? i + 1 : i;
        if (s.sort_order !== order) {
          updates.push({ id: s.id, sort_order: order });
        }
      });

      // Update moved phase
      updates.push({ id, sort_order: newSortOrder, parent_id: newParentId });

      for (const u of updates) {
        const updateData: any = { sort_order: u.sort_order };
        if (u.parent_id !== undefined) updateData.parent_id = u.parent_id;
        const { error } = await supabase
          .from("cronoprogramma_phases")
          .update(updateData)
          .eq("id", u.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Fase spostata" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile spostare la fase", variant: "destructive" });
    },
  });

  const importPhases = useMutation({
    mutationFn: async (phases: { name: string; start_date: string; end_date: string; progress?: number; sub_phases?: { name: string; start_date: string; end_date: string; progress?: number }[] }[]) => {
      const parentRows = phases.map((p, idx) => ({
        name: p.name,
        parent_id: null as string | null,
        start_date: p.start_date,
        end_date: p.end_date,
        progress: p.progress ?? 0,
        sort_order: idx,
        commessa_id: commessaId,
      }));

      const { data: insertedParents, error: pErr } = await supabase
        .from("cronoprogramma_phases")
        .insert(parentRows as any)
        .select("id, sort_order");
      if (pErr) throw pErr;

      const childRows: any[] = [];
      phases.forEach((p, idx) => {
        const parentDbId = insertedParents?.find((ip) => ip.sort_order === idx)?.id;
        p.sub_phases?.forEach((s, si) => {
          childRows.push({
            name: s.name,
            parent_id: parentDbId ?? null,
            start_date: s.start_date,
            end_date: s.end_date,
            progress: s.progress ?? 0,
            sort_order: si,
            commessa_id: commessaId,
          });
        });
      });

      if (childRows.length > 0) {
        const { error: cErr } = await supabase
          .from("cronoprogramma_phases")
          .insert(childRows);
        if (cErr) throw cErr;
      }

      invalidate();
    },
    onSuccess: () => {
      toast({ title: "Cronoprogramma importato" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile importare il cronoprogramma", variant: "destructive" });
    },
  });

  const seedData = useMutation({
    mutationFn: async (phases: GanttPhase[]) => {
      const parentRows = phases.map((p, idx) => ({
        name: p.name,
        parent_id: null as string | null,
        start_date: format(p.startDate, "yyyy-MM-dd"),
        end_date: format(p.endDate, "yyyy-MM-dd"),
        progress: p.progress,
        color: p.color ?? null,
        depends_on: [] as string[],
        sort_order: idx,
        commessa_id: commessaId,
      }));

      const { data: insertedParents, error: pErr } = await supabase
        .from("cronoprogramma_phases")
        .insert(parentRows as any)
        .select("id, sort_order");
      if (pErr) throw pErr;

      const childRows: typeof parentRows = [];
      phases.forEach((p, idx) => {
        const parentDbId = insertedParents?.find((ip) => ip.sort_order === idx)?.id;
        p.subPhases?.forEach((s, si) => {
          childRows.push({
            name: s.name,
            parent_id: parentDbId ?? null,
            start_date: format(s.startDate, "yyyy-MM-dd"),
            end_date: format(s.endDate, "yyyy-MM-dd"),
            progress: s.progress,
            color: s.color ?? null,
            depends_on: [],
            sort_order: si,
            commessa_id: commessaId,
          });
        });
      });

      if (childRows.length > 0) {
        const { error: cErr } = await supabase
          .from("cronoprogramma_phases")
          .insert(childRows as any);
        if (cErr) throw cErr;
      }

      invalidate();
    },
  });

  return {
    phases: query.data,
    isLoading: query.isLoading,
    updatePhase,
    renamePhase,
    addPhase,
    deletePhase,
    updateCmeLinks,
    updateDependencies,
    updateProgress,
    reorderPhase,
    changeLevel,
    movePhase,
    importPhases,
    seedData,
    refetch: query.refetch,
    isSaving: updatePhase.isPending || renamePhase.isPending || addPhase.isPending || deletePhase.isPending || updateCmeLinks.isPending || updateDependencies.isPending || updateProgress.isPending || reorderPhase.isPending || changeLevel.isPending || movePhase.isPending || importPhases.isPending,
  };
}
