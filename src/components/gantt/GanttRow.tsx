import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { differenceInDays, format, getDay } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Link, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, GitBranch, GripVertical } from "lucide-react";
import { GanttPhase, GanttTimelineContext } from "./types";
import { GanttBar } from "./GanttBar";
import type { DropPosition } from "./GanttChart";

interface GanttRowProps {
  phase: GanttPhase;
  colorClass: string;
  ctx: GanttTimelineContext;
  labelWidth: number;
  isSub?: boolean;
  parentId?: string;
  todayOffset: number | null;
  onDrag?: (id: string, newStart: Date, newEnd: Date) => void;
  onRowMeasure?: (id: string, y: number) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onAddSubPhase?: (parentId: string) => void;
  onAddPhase?: () => void;
  onCmeLink?: (id: string) => void;
  onDependencyLink?: (id: string) => void;
  onProgressChange?: (id: string, progress: number) => void;
  highlighted?: boolean;
  onHorizontalDragStateChange?: (id: string, dragging: boolean) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onPromote?: (id: string) => void;
  onDemote?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canPromote?: boolean;
  canDemote?: boolean;
  // Drag-and-drop props
  isDragging?: boolean;
  dropPosition?: DropPosition | null;
  onDragStart?: (id: string) => void;
  onDragOver?: (id: string, position: DropPosition) => void;
  onDragEnd?: () => void;
  onDragCancel?: () => void;
  dragActive?: boolean;
}

function DateCell({ date, isSub, onChange }: { date: Date; isSub?: boolean; onChange?: (d: Date) => void }) {
  const [manualEdit, setManualEdit] = useState(false);
  const [text, setText] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setText(format(date, "dd.MM.yyyy"));
    setManualEdit(true);
  };

  useEffect(() => {
    if (manualEdit && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [manualEdit]);

  const handleSubmit = () => {
    const parts = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (parts) {
      const d = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
      if (!isNaN(d.getTime())) onChange?.(d);
    }
    setManualEdit(false);
  };

  if (manualEdit) {
    return (
      <Input
        ref={editRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") setManualEdit(false);
        }}
        className={cn("w-[80px] h-6 text-center px-1 py-0 border-accent", isSub ? "text-[10px]" : "text-xs")}
        placeholder="gg.mm.aaaa"
      />
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-[75px] text-center border-l border-border pl-2 hover:bg-muted/40 rounded-sm transition-colors cursor-pointer",
            isSub ? "text-[10px] text-muted-foreground/70" : "text-xs text-muted-foreground"
          )}
          onDoubleClick={(e) => { e.preventDefault(); handleStartEdit(); }}
        >
          {format(date, "dd.MM.yyyy")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => { if (d && onChange) onChange(d); }}
          initialFocus
          locale={it}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

export function GanttRow({
  phase,
  colorClass,
  ctx,
  labelWidth,
  isSub,
  parentId,
  todayOffset,
  onDrag,
  onRowMeasure,
  onRename,
  onDelete,
  onAddSubPhase,
  onAddPhase,
  onCmeLink,
  onDependencyLink,
  onProgressChange,
  highlighted,
  onHorizontalDragStateChange,
  onMoveUp,
  onMoveDown,
  onPromote,
  onDemote,
  canMoveUp,
  canMoveDown,
  canPromote,
  canDemote,
  isDragging,
  dropPosition,
  onDragStart,
  onDragOver: onDragOverProp,
  onDragEnd,
  onDragCancel,
  dragActive,
}: GanttRowProps) {
  const { timelineStart, totalDays, weeks, days, viewMode } = ctx;
  const rowRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(phase.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (rowRef.current && onRowMeasure) {
      const rect = rowRef.current.getBoundingClientRect();
      const parentRect = rowRef.current.closest(".gantt-body")?.getBoundingClientRect();
      if (parentRect) {
        onRowMeasure(phase.id, rect.top - parentRect.top + rect.height / 2);
      }
    }
  });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleRenameSubmit = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== phase.name) {
      onRename?.(phase.id, trimmed);
    } else {
      setEditName(phase.name);
    }
    setEditing(false);
  };

  // Drag handlers
  const handleDragStartEvent = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", phase.id);
    onDragStart?.(phase.id);
  }, [phase.id, onDragStart]);

  const handleDragOverEvent = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: DropPosition;
    if (y < height * 0.25) {
      position = "above";
    } else if (y > height * 0.75) {
      position = "below";
    } else {
      position = isSub ? "below" : "child";
    }
    
    onDragOverProp?.(phase.id, position);
  }, [phase.id, isSub, onDragOverProp]);

  const handleDropEvent = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragEnd?.();
  }, [onDragEnd]);

  const handleDragEndEvent = useCallback(() => {
    onDragCancel?.();
  }, [onDragCancel]);

  const rowHeight = isSub ? "min-h-[2rem]" : "min-h-[3rem]";

  const gridLines = viewMode === "week"
    ? days.map((day, i) => ({
        key: i,
        offset: (differenceInDays(day, timelineStart) / totalDays) * 100,
        isWeekend: getDay(day) === 0 || getDay(day) === 6,
      }))
    : weeks.map((week, i) => ({
        key: i,
        offset: (differenceInDays(week, timelineStart) / totalDays) * 100,
        isWeekend: false,
      }));

  const cmeCount = phase.cmeRowIds?.length ?? 0;

  // Horizontal slide to promote/demote
  const [levelSlideX, setLevelSlideX] = useState(0);
  const levelSliding = useRef(false);

  const handleLevelSlideStart = useCallback((e: React.MouseEvent) => {
    // Only on the name area, not on editing
    if (editing) return;
    if (e.button !== 0) return;
    e.preventDefault();
    levelSliding.current = true;
    const startX = e.clientX;
    setLevelSlideX(0);

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      setLevelSlideX(dx);
    };
    const onUp = (ev: MouseEvent) => {
      levelSliding.current = false;
      const dx = ev.clientX - startX;
      setLevelSlideX(0);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      const threshold = 60;
      if (dx > threshold && canDemote) {
        onDemote?.(phase.id);
      } else if (dx < -threshold && canPromote) {
        onPromote?.(phase.id);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [editing, canDemote, canPromote, onDemote, onPromote, phase.id]);

  const levelSlideHint = useMemo(() => {
    if (levelSlideX > 60 && canDemote) return "demote";
    if (levelSlideX < -60 && canPromote) return "promote";
    return null;
  }, [levelSlideX, canDemote, canPromote]);

  const labelContent = (
    <div className={cn("flex-shrink-0 border-r border-border flex items-center", isSub ? "pl-8 pr-2 py-1" : "p-3")} style={{ width: labelWidth }}>
      {/* Drag handle */}
      <div
        className="flex-shrink-0 cursor-grab active:cursor-grabbing mr-1 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
        draggable
        onDragStart={handleDragStartEvent}
        onDragEnd={handleDragEndEvent}
      >
        <GripVertical className={cn(isSub ? "w-3 h-3" : "w-3.5 h-3.5")} />
      </div>
      <div
        className={cn(
          "flex items-center gap-2 flex-1 min-w-0 relative select-none",
          !editing && "cursor-ew-resize"
        )}
        style={{ transform: `translateX(${levelSlideX}px)` }}
        onMouseDown={handleLevelSlideStart}
      >
        <div
          className={cn(
            "flex-shrink-0 rounded-sm",
            isSub ? "w-1.5 h-1.5 rounded-full bg-muted-foreground/40" : "w-2.5 h-2.5",
            !isSub && colorClass
          )}
        />
        {editing ? (
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") { setEditName(phase.name); setEditing(false); }
            }}
            className={cn("h-6 text-xs px-1 py-0 border-accent", isSub && "text-[11px]")}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={cn("break-words whitespace-normal leading-tight", isSub ? "text-xs text-muted-foreground" : "text-sm font-medium text-card-foreground")}>
            {phase.name}
          </span>
        )}
        {cmeCount > 0 && (
          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 cursor-pointer" onClick={() => onCmeLink?.(phase.id)} onMouseDown={(e) => e.stopPropagation()}>
            CME {cmeCount}
          </Badge>
        )}
        {/* Level slide hint */}
        {levelSlideHint === "demote" && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-30">
            → Sotto-fase
          </div>
        )}
        {levelSlideHint === "promote" && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-30">
            ← Fase principale
          </div>
        )}
      </div>
      <div className="flex items-center gap-0 ml-2 flex-shrink-0">
        <DateCell date={phase.startDate} isSub={isSub} onChange={(d) => onDrag?.(phase.id, d, phase.endDate)} />
        <DateCell date={phase.endDate} isSub={isSub} onChange={(d) => onDrag?.(phase.id, phase.startDate, d)} />
      </div>
    </div>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={rowRef}
          className={cn(
            "flex border-b transition-colors relative",
            isSub
              ? "border-border/50 hover:bg-muted/10"
              : "border-border hover:bg-muted/20 group",
            isDragging && "opacity-40",
          )}
          onDragOver={handleDragOverEvent}
          onDrop={handleDropEvent}
        >
          {/* Drop indicators */}
          {dragActive && dropPosition === "above" && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-20 pointer-events-none" />
          )}
          {dragActive && dropPosition === "below" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-20 pointer-events-none" />
          )}
          {dragActive && dropPosition === "child" && (
            <div className="absolute inset-0 border-2 border-primary/40 bg-primary/5 rounded z-20 pointer-events-none" />
          )}

          {labelContent}

          {/* Timeline area */}
          <div
            className={cn("flex-1 relative gantt-timeline", rowHeight)}
          >
            {gridLines.map((line) => (
              <div
                key={line.key}
                className={cn(
                  "absolute top-0 bottom-0 border-l",
                  line.isWeekend
                    ? "border-border/15 bg-muted/20"
                    : isSub ? "border-border/20" : "border-border/30"
                )}
                style={{
                  left: `${line.offset}%`,
                  ...(line.isWeekend && viewMode === "week" ? { width: `${(1 / totalDays) * 100}%` } : {}),
                }}
              />
            ))}
            {todayOffset !== null && (
              <div
                className={cn("absolute top-0 bottom-0 w-px z-10", isSub ? "bg-destructive/50" : "bg-destructive")}
                style={{ left: `${todayOffset}%` }}
              />
            )}
            {/* Contract start line (consegna lavori) */}
            {ctx.contractDates?.consegnaLavori && (() => {
              const offset = (differenceInDays(ctx.contractDates.consegnaLavori, ctx.timelineStart) / totalDays) * 100;
              return offset >= 0 && offset <= 100 ? (
                <div
                  className="absolute top-0 bottom-0 w-0.5 z-[6] bg-success/70"
                  style={{ left: `${offset}%` }}
                />
              ) : null;
            })()}
            {/* Contract end line (scadenza or after proroghe) */}
            {(() => {
              const endDate = ctx.contractDates?.dataFineEffettiva ?? ctx.contractDates?.scadenzaContratto;
              if (!endDate) return null;
              const offset = (differenceInDays(endDate, ctx.timelineStart) / totalDays) * 100;
              return offset >= 0 && offset <= 100 ? (
                <div
                  className="absolute top-0 bottom-0 w-0.5 z-[6] bg-warning/70"
                  style={{ left: `${offset}%` }}
                />
              ) : null;
            })()}
            {/* Original scadenza line if proroghe exist */}
            {ctx.contractDates?.dataFineEffettiva && ctx.contractDates?.scadenzaContratto && (() => {
              const offset = (differenceInDays(ctx.contractDates.scadenzaContratto, ctx.timelineStart) / totalDays) * 100;
              return offset >= 0 && offset <= 100 ? (
                <div
                  className="absolute top-0 bottom-0 z-[6] border-l border-dashed border-warning/40"
                  style={{ left: `${offset}%` }}
                />
              ) : null;
            })()}
            <GanttBar phase={phase} colorClass={colorClass} ctx={ctx} isSub={isSub} highlighted={highlighted} onDrag={onDrag} onProgressChange={onProgressChange} onHorizontalDragStateChange={(dragging) => onHorizontalDragStateChange?.(phase.id, dragging)} />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => { setEditName(phase.name); setEditing(true); }}>
          <Pencil className="w-3.5 h-3.5 mr-2" />
          Rinomina
        </ContextMenuItem>
        {!isSub && (
          <ContextMenuItem onClick={() => onAddSubPhase?.(phase.id)}>
            <Plus className="w-3.5 h-3.5 mr-2" />
            Aggiungi sotto-fase
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => onAddPhase?.()}>
          <Plus className="w-3.5 h-3.5 mr-2" />
          Aggiungi fase principale
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCmeLink?.(phase.id)}>
          <Link className="w-3.5 h-3.5 mr-2" />
          Collega lavorazioni CME
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDependencyLink?.(phase.id)}>
          <GitBranch className="w-3.5 h-3.5 mr-2" />
          Collega dipendenze
          {(phase.dependsOn?.length ?? 0) > 0 && (
            <span className="ml-auto text-[10px] text-muted-foreground">({phase.dependsOn!.length})</span>
          )}
        </ContextMenuItem>
        <ContextMenuSeparator />
        {canMoveUp && (
          <ContextMenuItem onClick={() => onMoveUp?.(phase.id)}>
            <ArrowUp className="w-3.5 h-3.5 mr-2" />
            Sposta su
          </ContextMenuItem>
        )}
        {canMoveDown && (
          <ContextMenuItem onClick={() => onMoveDown?.(phase.id)}>
            <ArrowDown className="w-3.5 h-3.5 mr-2" />
            Sposta giù
          </ContextMenuItem>
        )}
        {canDemote && (
          <ContextMenuItem onClick={() => onDemote?.(phase.id)}>
            <ArrowRight className="w-3.5 h-3.5 mr-2" />
            Rendi sotto-fase
          </ContextMenuItem>
        )}
        {canPromote && (
          <ContextMenuItem onClick={() => onPromote?.(phase.id)}>
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Rendi fase principale
          </ContextMenuItem>
        )}
        {(canMoveUp || canMoveDown || canDemote || canPromote) && <ContextMenuSeparator />}
        <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete?.(phase.id)}>
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Elimina
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
