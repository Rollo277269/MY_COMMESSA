import { useRef, useCallback, useState } from "react";
import { differenceInDays, addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { GanttPhase, GanttTimelineContext } from "./types";

interface GanttBarProps {
  phase: GanttPhase;
  colorClass: string;
  ctx: GanttTimelineContext;
  isSub?: boolean;
  highlighted?: boolean;
  onDrag?: (id: string, newStart: Date, newEnd: Date) => void;
  onProgressChange?: (id: string, progress: number) => void;
  onHorizontalDragStateChange?: (dragging: boolean) => void;
}

export function GanttBar({ phase, colorClass, ctx, isSub, highlighted, onDrag, onProgressChange, onHorizontalDragStateChange }: GanttBarProps) {
  const { timelineStart, totalDays } = ctx;
  const barRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"move" | "left" | "right" | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [localProgress, setLocalProgress] = useState(phase.progress);

  const getBarStyle = () => {
    const startOffset = differenceInDays(phase.startDate, timelineStart);
    const duration = differenceInDays(phase.endDate, phase.startDate);
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "move" | "left" | "right") => {
      if (!onDrag) return;
      // Only left mouse button
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      setDragging(type);
      onHorizontalDragStateChange?.(true);

      const container = barRef.current?.closest(".gantt-timeline") as HTMLElement;
      if (!container) return;

      const startX = e.clientX;
      const containerWidth = container.getBoundingClientRect().width;
      const pxPerDay = containerWidth / totalDays;
      const origStart = new Date(phase.startDate);
      const origEnd = new Date(phase.endDate);

      const onMouseMove = (ev: MouseEvent) => {
        ev.preventDefault();
        const dx = ev.clientX - startX;
        const daysDelta = Math.round(dx / pxPerDay);
        if (daysDelta === 0) return;

        let newStart = origStart;
        let newEnd = origEnd;

        if (type === "move") {
          newStart = addDays(origStart, daysDelta);
          newEnd = addDays(origEnd, daysDelta);
        } else if (type === "left") {
          newStart = addDays(origStart, daysDelta);
          if (newStart >= origEnd) newStart = addDays(origEnd, -1);
        } else if (type === "right") {
          newEnd = addDays(origEnd, daysDelta);
          if (newEnd <= origStart) newEnd = addDays(origStart, 1);
        }

        onDrag(phase.id, newStart, newEnd);
      };

      const onMouseUp = () => {
        setDragging(null);
        onHorizontalDragStateChange?.(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [onDrag, phase, totalDays, timelineStart]
  );

  const handleProgressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLocalProgress(phase.progress);
    setProgressOpen(true);
  };

  const handleProgressCommit = (value: number[]) => {
    const v = value[0];
    setLocalProgress(v);
    onProgressChange?.(phase.id, v);
  };

  const height = isSub ? "h-5" : "h-6";
  const top = isSub ? "top-1.5" : "top-3";
  const rounded = isSub ? "rounded" : "rounded-md";

  return (
    <>
      {/* Draggable bar - no Popover/Tooltip wrapper to avoid event interference */}
      <div
        ref={barRef}
        className={cn(
          "absolute overflow-hidden group/bar transition-shadow duration-200",
          top,
          height,
          rounded,
          dragging ? "z-20 shadow-lg" : "z-10",
          onDrag && !dragging && "cursor-grab",
          dragging === "move" && "cursor-grabbing",
          highlighted && !dragging && "ring-2 ring-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.4)] animate-[pulse_1.5s_ease-in-out_infinite]",
        )}
        style={getBarStyle()}
        onMouseDown={(e) => handleMouseDown(e, "move")}
      >
        {/* Background */}
        <div
          className={cn("h-full", rounded, isSub ? "opacity-40" : "opacity-60", colorClass)}
          style={{ width: "100%" }}
        />
        {/* Progress fill */}
        <div
          className={cn("absolute inset-y-0 left-0", rounded, colorClass)}
          style={{ width: `${phase.progress}%` }}
        />

        {/* Tooltip on hover */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="absolute inset-0"
              onMouseDown={(e) => {
                // Let drag through - don't stop propagation
              }}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="pointer-events-none">
            <div className="text-xs space-y-1">
              <p className="font-semibold">{phase.name}</p>
              <p>
                {format(phase.startDate, "dd.MM.yyyy")} →{" "}
                {format(phase.endDate, "dd.MM.yyyy")}
              </p>
              <p>Avanzamento: {phase.progress}%</p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Progress label - opens popover on click */}
        <Popover open={progressOpen} onOpenChange={setProgressOpen}>
          <PopoverTrigger asChild>
            <span
              className={cn(
                "absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center text-[10px] font-bold drop-shadow-sm z-10 px-2",
                "cursor-pointer hover:underline",
                phase.progress > 0 ? "text-primary-foreground" : "text-muted-foreground opacity-0 group-hover/bar:opacity-100"
              )}
              onClick={handleProgressClick}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ width: 'auto', pointerEvents: 'auto' }}
            >
              {phase.progress}%
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="center" side="top" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Avanzamento</p>
                <span className="text-sm font-bold font-display text-accent">{localProgress}%</span>
              </div>
              <Slider
                value={[localProgress]}
                onValueChange={(v) => setLocalProgress(v[0])}
                onValueCommit={handleProgressCommit}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Resize handles */}
        {onDrag && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-foreground/20 rounded-l z-20"
              onMouseDown={(e) => handleMouseDown(e, "left")}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-foreground/20 rounded-r z-20"
              onMouseDown={(e) => handleMouseDown(e, "right")}
            />
          </>
        )}
      </div>
    </>
  );
}
