// src/app/model/employee-profile.model.ts

import { User } from './user.model';
import { Goal } from './goal.model';
import { Appraisal } from './appraisal.model';
import { Feedback } from './feedback.model';

export interface EmployeeProfile {
  employeeProfileId?: number;

  department: string;
  designation: string;
  dateOfJoining: string;          // ISO date string (yyyy-MM-dd)
  reportingManager: string;
  currentProject: string;
  currentTeam: string;
  skills: string;
  lastAppraisalRating?: number;   // can be null/undefined
  currentGoals: string;

  // Relations
  user?: User;
  goals?: Goal[];
  appraisals?: Appraisal[];
  feedbacks?: Feedback[];
}
