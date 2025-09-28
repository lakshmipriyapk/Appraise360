import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EmployeeProfile } from '../model/employee-profile.model';

@Injectable({
  providedIn: 'root'
})
export class SharedEmployeeService {
  private currentEmployeeSubject = new BehaviorSubject<EmployeeProfile | null>(null);
  public currentEmployee$ = this.currentEmployeeSubject.asObservable();

  private employeeProfilesSubject = new BehaviorSubject<EmployeeProfile[]>([]);
  public employeeProfiles$ = this.employeeProfilesSubject.asObservable();

  constructor() {
    // Initialize with mock data (but don't set current employee automatically)
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockEmployee: EmployeeProfile = {
      employeeProfileId: 1,
      department: 'Engineering',
      designation: 'Software Engineer',
      dateOfJoining: '2023-01-15',
      reportingManager: 'John Smith',
      currentProject: 'Performance Appraisal System',
      currentTeam: 'Full Stack Team',
      skills: ['Angular', 'Spring Boot', 'TypeScript', 'Java', 'SQL'],
      lastAppraisalRating: 4.2,
      currentGoals: ['Complete Angular Training', 'Deliver Q3 Project Milestone', 'Improve Code Review Skills'],
      user: {
        userId: 1,
        username: 'demo.user',
        email: 'demo.user@company.com',
        fullName: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        phoneNumber: '+1-555-0001',
        password: 'password123',
        role: 'Employee'
      }
    };

    const mockProfiles: EmployeeProfile[] = [
      mockEmployee,
      {
        employeeProfileId: 2,
        user: {
          userId: 2,
          username: 'jane.smith',
          email: 'jane.smith@company.com',
          fullName: 'Jane Smith',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+1-555-0002',
          password: 'password123',
          role: 'Employee'
        },
        department: 'Engineering',
        designation: 'Senior Developer',
        dateOfJoining: '2022-03-10',
        reportingManager: 'Mike Johnson',
        currentProject: 'Project Beta',
        currentTeam: 'Development Team B',
        skills: ['Python', 'Django', 'PostgreSQL'],
        lastAppraisalRating: 4.5,
        currentGoals: ['Improve Code Quality', 'Mentor Junior Developers']
      },
      {
        employeeProfileId: 3,
        user: {
          userId: 3,
          username: 'mike.johnson',
          email: 'mike.johnson@company.com',
          fullName: 'Mike Johnson',
          firstName: 'Mike',
          lastName: 'Johnson',
          phoneNumber: '+1-555-0003',
          password: 'password123',
          role: 'Manager'
        },
        department: 'Engineering',
        designation: 'Engineering Manager',
        dateOfJoining: '2021-06-01',
        reportingManager: 'Sarah Wilson',
        currentProject: 'Team Management',
        currentTeam: 'Engineering Leadership',
        skills: ['Leadership', 'Project Management', 'Technical Architecture'],
        lastAppraisalRating: 4.8,
        currentGoals: ['Team Development', 'Process Improvement', 'Strategic Planning']
      }
    ];

    // Don't set current employee automatically - let the dashboard component set it based on logged-in user
    // this.currentEmployeeSubject.next(mockEmployee);
    this.employeeProfilesSubject.next(mockProfiles);
  }

  getCurrentEmployee(): EmployeeProfile | null {
    return this.currentEmployeeSubject.value;
  }

  getAllEmployeeProfiles(): EmployeeProfile[] {
    return this.employeeProfilesSubject.value;
  }

  updateCurrentEmployee(employee: EmployeeProfile) {
    this.currentEmployeeSubject.next(employee);
    
    // Also update in the profiles list
    const profiles = this.employeeProfilesSubject.value;
    const index = profiles.findIndex(p => p.employeeProfileId === employee.employeeProfileId);
    if (index !== -1) {
      profiles[index] = employee;
      this.employeeProfilesSubject.next(profiles);
    }
  }

  updateEmployeeProfile(employee: EmployeeProfile) {
    const profiles = this.employeeProfilesSubject.value;
    const index = profiles.findIndex(p => p.employeeProfileId === employee.employeeProfileId);
    if (index !== -1) {
      profiles[index] = employee;
      this.employeeProfilesSubject.next(profiles);
      
      // If this is the current employee, update it too
      const currentEmployee = this.currentEmployeeSubject.value;
      if (currentEmployee && currentEmployee.employeeProfileId === employee.employeeProfileId) {
        this.currentEmployeeSubject.next(employee);
      }
    }
  }

  addEmployeeProfile(employee: EmployeeProfile) {
    const profiles = this.employeeProfilesSubject.value;
    profiles.push(employee);
    this.employeeProfilesSubject.next(profiles);
  }

  deleteEmployeeProfile(employeeId: number) {
    const profiles = this.employeeProfilesSubject.value;
    const filteredProfiles = profiles.filter(p => p.employeeProfileId !== employeeId);
    this.employeeProfilesSubject.next(filteredProfiles);
    
    // If this was the current employee, clear it
    const currentEmployee = this.currentEmployeeSubject.value;
    if (currentEmployee && currentEmployee.employeeProfileId === employeeId) {
      this.currentEmployeeSubject.next(null);
    }
  }

  clearCurrentEmployee() {
    this.currentEmployeeSubject.next(null);
  }
}
