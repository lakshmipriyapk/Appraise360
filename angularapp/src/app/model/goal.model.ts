import { EmployeeProfile } from './employee-profile.model';
import { Appraisal } from './appraisal.model';

export interface Goal {
  goalId: number;
  title: string;
  description: string;
  status: string; // Pending, In Progress, Completed
  priority?: string; // High, Medium, Low
  startDate?: Date;
  targetDate?: Date;
  completionDate?: Date;
  progress?: number; // 0-100
  managerComments?: string; // Manager's feedback on goal progress
  employee: EmployeeProfile;
  appraisal?: Appraisal; // Optional: Many goals can belong to one appraisal
  createdBy?: string; // 'manager' or 'self' - indicates who created the goal
  category?: string; // Goal category like 'Professional Development', 'Skill Enhancement', etc.
  createdDate?: Date; // When the goal was created
}
  