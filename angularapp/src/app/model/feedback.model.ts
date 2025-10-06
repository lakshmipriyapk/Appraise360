// src/app/models/feedback.model.ts

import { EmployeeProfile } from './employee-profile.model';
import { User } from './user.model';

export interface Feedback {
  feedbackId?: number;

  feedbackType?: string;   // Peer, Manager, Self
  comments?: string;
  rating?: number;         // 1–5 scale

  achievements?: string;
  challenges?: string;
  improvements?: string;

  createdDate?: string;    // ISO date string

  employee?: EmployeeProfile;
  reviewer?: User;
}
