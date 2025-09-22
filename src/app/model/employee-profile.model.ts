import { User } from './user.model';

export interface EmployeeProfile {
  employeeProfileId: number;
  department: string;
  designation: string;
  user: User;
}