// src/app/models/user.model.ts

import { EmployeeProfile } from './employee-profile.model';

export interface User {
  userId?: number;
  email?: string;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  password?: string;
  phoneNumber?: string;
  role?: string;
  username?: string;
  employeeProfiles?: EmployeeProfile[]; // link to employee profiles
}