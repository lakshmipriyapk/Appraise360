import { User } from './user.model';

export interface EmployeeProfile {
  employeeProfileId: number;
  department: string;
  designation: string;
  dateOfJoining: string;
  reportingManager: string;
  currentProject: string;
  currentTeam: string;
  skills: string[];
  lastAppraisalRating: number;
  currentGoals: string[];
  user: User;
}