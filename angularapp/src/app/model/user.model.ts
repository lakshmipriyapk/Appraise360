export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  firstName: string; // For frontend compatibility
  lastName: string; // For frontend compatibility
  phoneNumber: string;
  password: string;
  role: string;
  employeeProfiles?: any[]; // Optional field for backend response
}
