export type GanttViewMode = "week" | "month" | "year";

export interface GanttPhase {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  color?: string;
  subPhases?: GanttPhase[];
  dependsOn?: string[]; // IDs of phases this depends on
  cmeRowIds?: string[]; // IDs of linked CME rows
}

export interface ContractDates {
  consegnaLavori: Date | null;
  scadenzaContratto: Date | null;
  dataFineEffettiva: Date | null; // after proroghe
}

export interface GanttTimelineContext {
  timelineStart: Date;
  timelineEnd: Date;
  totalDays: number;
  months: Date[];
  weeks: Date[];
  days: Date[];
  viewMode: GanttViewMode;
  contractDates?: ContractDates;
}
