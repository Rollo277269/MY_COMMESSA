import { useMemo } from "react";
import {
  addDays,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfWeek,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
} from "date-fns";
import { GanttPhase, GanttTimelineContext, GanttViewMode, ContractDates } from "./types";

export function useGanttTimeline(
  phases: GanttPhase[],
  viewMode: GanttViewMode = "month",
  contractDates?: ContractDates
): GanttTimelineContext {
  return useMemo(() => {
    const allPhases = phases.flatMap((p) => [p, ...(p.subPhases || [])]);

    // Use contract dates as anchors when available
    let minDate = contractDates?.consegnaLavori ?? new Date();
    let maxDate = contractDates?.dataFineEffettiva ?? contractDates?.scadenzaContratto ?? new Date();

    if (allPhases.length > 0) {
      const phasesMin = new Date(Math.min(...allPhases.map((p) => p.startDate.getTime())));
      const phasesMax = new Date(Math.max(...allPhases.map((p) => p.endDate.getTime())));
      minDate = new Date(Math.min(minDate.getTime(), phasesMin.getTime()));
      maxDate = new Date(Math.max(maxDate.getTime(), phasesMax.getTime()));
    }

    let timelineStart: Date;
    let timelineEnd: Date;

    if (viewMode === "year") {
      timelineStart = startOfYear(addDays(minDate, -30));
      timelineEnd = endOfYear(addDays(maxDate, 30));
    } else if (viewMode === "week") {
      timelineStart = startOfWeek(addDays(minDate, -3), { weekStartsOn: 1 });
      timelineEnd = addDays(startOfWeek(addDays(maxDate, 3), { weekStartsOn: 1 }), 6);
    } else {
      timelineStart = startOfMonth(addDays(minDate, -7));
      timelineEnd = endOfMonth(addDays(maxDate, 7));
    }

    const totalDays = differenceInDays(timelineEnd, timelineStart);
    const months = eachMonthOfInterval({ start: timelineStart, end: timelineEnd });
    const weeks = eachWeekOfInterval(
      { start: timelineStart, end: timelineEnd },
      { weekStartsOn: 1 }
    );
    const days = viewMode === "week"
      ? eachDayOfInterval({ start: timelineStart, end: timelineEnd })
      : [];

    return { timelineStart, timelineEnd, totalDays, months, weeks, days, viewMode, contractDates };
  }, [phases, viewMode, contractDates]);
}
