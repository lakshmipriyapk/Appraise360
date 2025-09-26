import { EmployeeProfile } from './employee-profile.model';
import { User } from './user.model';

export interface Feedback {
  feedbackId: number;
  feedbackType: string; // Peer Feedback, Manager Feedback, Self-Feedback
  comments: string;
  rating?: number; // Optional rating (1-5)
  employee: EmployeeProfile;
  reviewer: User; // Can be manager, peer, or self
}