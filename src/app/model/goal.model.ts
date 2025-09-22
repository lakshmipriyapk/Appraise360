import { EmployeeProfile } from './employee-profile.model';
import { Appraisal } from './appraisal.model';

export interface Goal {
  goalId: number;
  title: string;
  description: string;
  status: string; // Pending, In Progress, Completed
  employee: EmployeeProfile;
  appraisal?: Appraisal; // Optional: Many goals can belong to one appraisal
}
  