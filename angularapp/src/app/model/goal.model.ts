// src/app/models/goal.model.ts

import { EmployeeProfile } from './employee-profile.model';
import { Appraisal } from './appraisal.model';

export interface Goal {
  goalId?: number;

  title: string;
  description?: string;
  status?: string;       // Pending, In Progress, Completed
  priority?: string;     // High, Medium, Low

  startDate?: string;    // ISO format date
  targetDate?: string;
  completionDate?: string;
  progress?: number;     // 0-100

  managerComments?: string;
  createdBy?: string;    // manager / self
  category?: string;     // Technical, Behavioral, Leadership, Learning & Development
  createdDate?: string;  // ISO datetime

  employee?: EmployeeProfile;
  appraisal?: Appraisal;
}