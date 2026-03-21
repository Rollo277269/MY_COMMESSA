import { differenceInDays, addDays, format, getDay } from "date-fns";
import { it } from "date-fns/locale";
import { GanttTimelineContext } from "./types";

interface GanttHeaderProps {
  ctx: GanttTimelineContext;
  labelWidth: number;
  onResizeStart: (e: React.MouseEvent) => void;
}

export function GanttHeader({ ctx, labelWidth, onResizeStart }: GanttHeaderProps) {
  const { timelineStart, timelineEnd, totalDays, months, weeks, days, viewMode } = ctx;

  return (
    <>
      {/* Primary header row */}
      <div className="flex border-b border-border bg-muted/40">
        <div className="flex-shrink-0 border-r border-border relative" style={{ width: labelWidth }}>
          <div className="flex">
            <div className="flex-1 p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fase
            </div>
            <div className="w-[85px] p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center border-l border-border">
              Inizio
            </div>
            <div className="w-[85px] p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center border-l border-border">
              Fine
            </div>
          </div>
          <div
            className="absolute -right-1 top-0 bottom-0 w-3 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 z-20 flex items-center justify-center"
            onMouseDown={onResizeStart}
          >
            <div className="w-0.5 h-8 bg-border hover:bg-primary/60 rounded-full transition-colors" />
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="flex">
            {viewMode === "year" ? (
              (() => {
                const years: { year: number; width: number }[] = [];
                let currentYear = timelineStart.getFullYear();
                const endYear = timelineEnd.getFullYear();
                while (currentYear <= endYear) {
                  const yearStart = currentYear === timelineStart.getFullYear() ? timelineStart : new Date(currentYear, 0, 1);
                  const yearEnd = currentYear === endYear ? timelineEnd : new Date(currentYear, 11, 31);
                  const d = differenceInDays(yearEnd, yearStart) + 1;
                  years.push({ year: currentYear, width: (d / totalDays) * 100 });
                  currentYear++;
                }
                return years.map((y) => (
                  <div
                    key={y.year}
                    className="text-center text-xs font-semibold text-muted-foreground py-2 border-r border-border last:border-r-0 uppercase"
                    style={{ width: `${y.width}%` }}
                  >
                    {y.year}
                  </div>
                ));
              })()
            ) : (
              months.map((month, i) => {
                const monthStart = i === 0 ? timelineStart : month;
                const monthEnd =
                  i === months.length - 1
                    ? timelineEnd
                    : addDays(months[i + 1], -1);
                const d = differenceInDays(monthEnd, monthStart) + 1;
                const width = (d / totalDays) * 100;
                return (
                  <div
                    key={i}
                    className="text-center text-xs font-semibold text-muted-foreground py-2 border-r border-border last:border-r-0 uppercase"
                    style={{ width: `${width}%` }}
                  >
                    {format(month, "MMM yyyy", { locale: it })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Secondary header row */}
      <div className="flex border-b border-border bg-muted/20">
        <div className="flex-shrink-0 border-r border-border" style={{ width: labelWidth }} />
        <div className="flex-1 relative">
          <div className="flex">
            {viewMode === "week" ? (
              days.map((day, i) => {
                const width = (1 / totalDays) * 100;
                const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                return (
                  <div
                    key={i}
                    className={`text-center text-[10px] py-1 border-r border-border/50 last:border-r-0 ${
                      isWeekend ? "text-muted-foreground/40 bg-muted/30" : "text-muted-foreground/60"
                    }`}
                    style={{ width: `${width}%` }}
                  >
                    {format(day, "EEE dd", { locale: it })}
                  </div>
                );
              })
            ) : viewMode === "year" ? (
              months.map((month, i) => {
                const monthStart = i === 0 ? timelineStart : month;
                const monthEnd =
                  i === months.length - 1
                    ? timelineEnd
                    : addDays(months[i + 1], -1);
                const d = differenceInDays(monthEnd, monthStart) + 1;
                const width = (d / totalDays) * 100;
                return (
                  <div
                    key={i}
                    className="text-center text-[10px] text-muted-foreground/60 py-1 border-r border-border/50 last:border-r-0"
                    style={{ width: `${width}%` }}
                  >
                    {format(month, "MMM", { locale: it })}
                  </div>
                );
              })
            ) : (
              weeks.map((week, i) => {
                const weekEnd =
                  i < weeks.length - 1
                    ? addDays(weeks[i + 1], -1)
                    : timelineEnd;
                const d = differenceInDays(weekEnd, week) + 1;
                const width = (d / totalDays) * 100;
                return (
                  <div
                    key={i}
                    className="text-center text-[10px] text-muted-foreground/60 py-1 border-r border-border/50 last:border-r-0"
                    style={{ width: `${width}%` }}
                  >
                    {format(week, "dd", { locale: it })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
