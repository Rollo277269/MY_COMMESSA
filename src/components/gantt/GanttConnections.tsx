import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { GanttPhase, GanttTimelineContext } from "./types";

interface GanttConnectionsProps {
  phases: GanttPhase[];
  ctx: GanttTimelineContext;
  rowPositions: Map<string, number>;
  labelWidth: number;
}

interface Connection {
  fromId: string;
  toId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export function GanttConnections({ phases, ctx, rowPositions, labelWidth }: GanttConnectionsProps) {
  const { timelineStart, totalDays } = ctx;

  const connections = useMemo(() => {
    const allPhases = phases.flatMap((p) => [p, ...(p.subPhases || [])]);
    const phaseMap = new Map<string, GanttPhase>();
    allPhases.forEach((p) => phaseMap.set(p.id, p));

    const conns: Connection[] = [];

    allPhases.forEach((phase) => {
      if (!phase.dependsOn) return;
      phase.dependsOn.forEach((depId) => {
        const from = phaseMap.get(depId);
        const toY = rowPositions.get(phase.id);
        const fromY = rowPositions.get(depId);
        if (!from || toY === undefined || fromY === undefined) return;

        const fromX = ((differenceInDays(from.endDate, timelineStart)) / totalDays) * 100;
        const toX = ((differenceInDays(phase.startDate, timelineStart)) / totalDays) * 100;

        conns.push({
          fromId: depId,
          toId: phase.id,
          fromX,
          fromY,
          toX,
          toY,
        });
      });
    });

    return conns;
  }, [phases, ctx, rowPositions]);

  if (connections.length === 0) return null;

  return (
    <svg
      className="absolute top-0 bottom-0 pointer-events-none"
      width="100%"
      height="100%"
      style={{ left: labelWidth, width: `calc(100% - ${labelWidth}px)`, overflow: "visible", zIndex: 5 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill="hsl(var(--primary))"
            fillOpacity="0.7"
          />
        </marker>
      </defs>
      {connections.map((conn, i) => {
        const midX = conn.fromX + (conn.toX - conn.fromX) / 2;
        return (
          <path
            key={i}
            d={`M ${conn.fromX}% ${conn.fromY} 
                C ${midX}% ${conn.fromY}, ${midX}% ${conn.toY}, ${conn.toX}% ${conn.toY}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeDasharray="6 3"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </svg>
  );
}
