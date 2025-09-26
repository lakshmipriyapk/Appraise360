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
    // Initialize with mock data
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
        username: 'john.doe',
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
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
          firstName: 'Jane',
          lastName: 'Smith',
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
          firstName: 'Mike',
          lastName: 'Johnson',
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

    this.currentEmployeeSubject.next(mockEmployee);
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
}
