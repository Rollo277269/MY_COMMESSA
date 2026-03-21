import { useMemo, useCallback, useState, useRef } from "react";
import { differenceInDays, isWithinInterval } from "date-fns";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GanttPhase, GanttViewMode, ContractDates } from "./types";
import { useGanttTimeline } from "./useGanttTimeline";
import { GanttHeader } from "./GanttHeader";
import { GanttRow } from "./GanttRow";
import { GanttConnections } from "./GanttConnections";

export type DropPosition = "above" | "below" | "child";

interface GanttChartProps {
  phases: GanttPhase[];
  contractDates?: ContractDates;
  onPhaseChange?: (id: string, newStart: Date, newEnd: Date) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onAddPhase?: () => void;
  onAddSubPhase?: (parentId: string) => void;
  onCmeLink?: (id: string) => void;
  onDependencyLink?: (id: string) => void;
  onProgressChange?: (id: string, progress: number) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onPromote?: (id: string) => void;
  onDemote?: (id: string) => void;
  onMovePhase?: (id: string, newParentId: string | null, newSortOrder: number) => void;
}

const PHASE_COLORS = [
  "bg-accent",
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

export function GanttChart({ phases, contractDates, onPhaseChange, onRename, onDelete, onAddPhase, onAddSubPhase, onCmeLink, onDependencyLink, onProgressChange, onMoveUp, onMoveDown, onPromote, onDemote, onMovePhase }: GanttChartProps) {
  const [rowPositions, setRowPositions] = useState<Map<string, number>>(new Map());
  const [viewMode, setViewMode] = useState<GanttViewMode>("month");
  const [labelWidth, setLabelWidth] = useState(360);
  const resizing = useRef(false);
  const labelWidthRef = useRef(labelWidth);
  labelWidthRef.current = labelWidth;

  // Horizontal drag highlight state
  const [horizontalDragId, setHorizontalDragId] = useState<string | null>(null);

  const highlightedIds = useMemo(() => {
    if (!horizontalDragId) return new Set<string>();
    const flat = phases.flatMap((p) => [p, ...(p.subPhases || [])]);
    const ids = new Set<string>();
    const queue = [horizontalDragId];
    const visited = new Set<string>();
    // Add sub-phase IDs if dragging a parent
    const parent = phases.find((p) => p.id === horizontalDragId);
    if (parent?.subPhases) {
      parent.subPhases.forEach((s) => { ids.add(s.id); queue.push(s.id); });
    }
    // BFS for dependents
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const ph of flat) {
        if (ph.dependsOn?.includes(current) && !visited.has(ph.id)) {
          ids.add(ph.id);
          queue.push(ph.id);
          // Also add sub-phases of dependent parents
          const depParent = phases.find((p) => p.id === ph.id);
          if (depParent?.subPhases) depParent.subPhases.forEach((s) => ids.add(s.id));
        }
      }
    }
    return ids;
  }, [horizontalDragId, phases]);

  const handleHorizontalDragState = useCallback((id: string, dragging: boolean) => {
    setHorizontalDragId(dragging ? id : null);
  }, []);

  // Drag-and-drop state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: DropPosition } | null>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = true;
    const startX = e.clientX;
    const startW = labelWidthRef.current;
    const onMove = (ev: MouseEvent) => {
      ev.preventDefault();
      const delta = ev.clientX - startX;
      setLabelWidth(Math.max(200, Math.min(700, startW + delta)));
    };
    const onUp = () => {
      resizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const ctx = useGanttTimeline(phases, viewMode, contractDates);

  const todayOffset = useMemo(() => {
    const today = new Date();
    if (isWithinInterval(today, { start: ctx.timelineStart, end: ctx.timelineEnd })) {
      return (differenceInDays(today, ctx.timelineStart) / ctx.totalDays) * 100;
    }
    return null;
  }, [ctx]);

  const handleDrag = useCallback(
    (id: string, newStart: Date, newEnd: Date) => {
      onPhaseChange?.(id, newStart, newEnd);
    },
    [onPhaseChange]
  );

  const handleRowMeasure = useCallback((id: string, y: number) => {
    setRowPositions((prev) => {
      if (prev.get(id) === y) return prev;
      const next = new Map(prev);
      next.set(id, y);
      return next;
    });
  }, []);

  // Build a flat list to compute drop targets
  const flatRows = useMemo(() => {
    const rows: { id: string; parentId: string | null; isSub: boolean; parentIndex: number; subIndex: number }[] = [];
    phases.forEach((p, pi) => {
      rows.push({ id: p.id, parentId: null, isSub: false, parentIndex: pi, subIndex: -1 });
      p.subPhases?.forEach((s, si) => {
        rows.push({ id: s.id, parentId: p.id, isSub: true, parentIndex: pi, subIndex: si });
      });
    });
    return rows;
  }, [phases]);

  const handleDragStart = useCallback((id: string) => {
    setDragId(id);
  }, []);

  const handleDragOver = useCallback((targetId: string, position: DropPosition) => {
    setDropTarget({ id: targetId, position });
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragId && dropTarget && dragId !== dropTarget.id && onMovePhase) {
      const targetRow = flatRows.find((r) => r.id === dropTarget.id);
      const dragRow = flatRows.find((r) => r.id === dragId);
      if (!targetRow || !dragRow) { setDragId(null); setDropTarget(null); return; }

      let newParentId: string | null;
      let newSortOrder: number;

      if (dropTarget.position === "child") {
        // Drop as child of target (target must be a main phase)
        if (targetRow.isSub) { setDragId(null); setDropTarget(null); return; }
        newParentId = targetRow.id;
        const targetPhase = phases[targetRow.parentIndex];
        newSortOrder = targetPhase.subPhases?.length ?? 0;
      } else if (dropTarget.position === "above") {
        newParentId = targetRow.parentId;
        newSortOrder = targetRow.isSub ? targetRow.subIndex : targetRow.parentIndex;
      } else {
        // below
        newParentId = targetRow.parentId;
        newSortOrder = targetRow.isSub ? targetRow.subIndex + 1 : targetRow.parentIndex + 1;
      }

      onMovePhase(dragId, newParentId, newSortOrder);
    }
    setDragId(null);
    setDropTarget(null);
  }, [dragId, dropTarget, flatRows, phases, onMovePhase]);

  const handleDragCancel = useCallback(() => {
    setDragId(null);
    setDropTarget(null);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden animate-fade-in">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={onAddPhase}>
            <Plus className="w-3.5 h-3.5" />
            Nuova fase
          </Button>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as GanttViewMode)}>
            <TabsList className="h-7">
              <TabsTrigger value="week" className="text-xs px-3 h-6">Settimana</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3 h-6">Mese</TabsTrigger>
              <TabsTrigger value="year" className="text-xs px-3 h-6">Anno</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-x-auto">
          <div className={viewMode === "week" ? "min-w-[1400px]" : "min-w-[900px]"}>
            <GanttHeader ctx={ctx} labelWidth={labelWidth} onResizeStart={handleResizeStart} />

            <div className="relative gantt-body">
              <GanttConnections phases={phases} ctx={ctx} rowPositions={rowPositions} labelWidth={labelWidth} />

              {phases.map((phase, idx) => {
                const color = phase.color || PHASE_COLORS[idx % PHASE_COLORS.length];
                return (
                  <div key={phase.id}>
                    <GanttRow
                      phase={phase}
                      colorClass={color}
                      ctx={ctx}
                      labelWidth={labelWidth}
                      todayOffset={todayOffset}
                      onDrag={handleDrag}
                      onRowMeasure={handleRowMeasure}
                      onRename={onRename}
                      onDelete={onDelete}
                      onAddSubPhase={onAddSubPhase}
                      onAddPhase={onAddPhase}
                      onCmeLink={onCmeLink}
                      onDependencyLink={onDependencyLink}
                      onProgressChange={onProgressChange}
                      highlighted={highlightedIds.has(phase.id)}
                      onHorizontalDragStateChange={handleHorizontalDragState}
                      onMoveUp={onMoveUp}
                      onMoveDown={onMoveDown}
                      onDemote={onDemote}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < phases.length - 1}
                      canDemote={idx > 0}
                      canPromote={false}
                      isDragging={dragId === phase.id}
                      dropPosition={dropTarget?.id === phase.id ? dropTarget.position : null}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                      onDragCancel={handleDragCancel}
                      dragActive={!!dragId}
                    />
                    {phase.subPhases?.map((sub, si) => (
                      <GanttRow
                        key={sub.id}
                        phase={sub}
                        colorClass={color}
                        ctx={ctx}
                        labelWidth={labelWidth}
                        isSub
                        parentId={phase.id}
                        todayOffset={todayOffset}
                        onDrag={handleDrag}
                        onRowMeasure={handleRowMeasure}
                        onRename={onRename}
                        onDelete={onDelete}
                        onAddSubPhase={onAddSubPhase}
                        onAddPhase={onAddPhase}
                        onCmeLink={onCmeLink}
                        onDependencyLink={onDependencyLink}
                        onProgressChange={onProgressChange}
                        highlighted={highlightedIds.has(sub.id)}
                        onHorizontalDragStateChange={handleHorizontalDragState}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                        onPromote={onPromote}
                        canMoveUp={si > 0}
                        canMoveDown={si < (phase.subPhases?.length ?? 0) - 1}
                        canPromote={true}
                        canDemote={false}
                        isDragging={dragId === sub.id}
                        dropPosition={dropTarget?.id === sub.id ? dropTarget.position : null}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                        dragActive={!!dragId}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export type { GanttPhase } from "./types";
