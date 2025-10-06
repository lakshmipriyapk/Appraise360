export interface ReviewCycle {
  cycleId?: number;
  cycleName: string;
  startDate: string;
  endDate: string;
  deadline?: string;
  status: string;
  description?: string;
}
