export interface ReviewCycle {
  cycleId: number;
  cycleName: string;
  appraisals: any[]; // Using any[] to avoid circular dependency
}
  