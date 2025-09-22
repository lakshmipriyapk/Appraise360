import { EmployeeProfile } from './employee-profile.model';
import { User } from './user.model';

export interface Feedback {
  feedbackId: number;
  comments: string;
  employee: EmployeeProfile;
  manager: User;
}