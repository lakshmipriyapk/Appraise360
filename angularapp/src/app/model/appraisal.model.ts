import { EmployeeProfile } from './employee-profile.model';
import { ReviewCycle } from './review-cycle.model';

export interface Appraisal {
  appraisalId: number;
  selfRating: number;
  managerRating: number;
  status: string; // Submitted, In Review, Completed
  employee: EmployeeProfile;
  reviewCycle: ReviewCycle;
}
  