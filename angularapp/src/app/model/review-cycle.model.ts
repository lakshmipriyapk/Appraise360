export interface ReviewCycle {
  cycleId: number;
  cycleName: string;
  status: string;
  deadline: Date;
  appraisals: any[]; // Using any[] to avoid circular dependency
}
  