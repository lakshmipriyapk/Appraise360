import { EmployeeProfile } from './employee-profile.model';
import { ReviewCycle } from './review-cycle.model';

export interface Appraisal {
  appraisalId?: number;

  selfRating?: number;
  managerRating?: number;
  status?: string;
  cycleName?: string;
  appraisalDate?: string;
  periodStart?: string;
  periodEnd?: string;
  managerName?: string;
  reviewerRole?: string;
  reviewDate?: string;
  managerComments?: string;
  selfComments?: string;

  employee?: EmployeeProfile;
  reviewCycle?: ReviewCycle;   // ✅ correct reference
}