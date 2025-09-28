import { EmployeeProfile } from './employee-profile.model';
import { ReviewCycle } from './review-cycle.model';

export interface Appraisal {
  appraisalId: number;
  selfRating: number;
  managerRating: number;
  status: string; // Submitted, In Review, Completed
  
  // Additional fields to match backend
  cycleName: string;
  appraisalDate: string; // Date as string for frontend
  periodStart: string; // Date as string for frontend
  periodEnd: string; // Date as string for frontend
  managerName: string;
  reviewerRole: string;
  reviewDate: string; // Date as string for frontend
  managerComments: string;
  
  employee: EmployeeProfile;
  reviewCycle: ReviewCycle;
}
  