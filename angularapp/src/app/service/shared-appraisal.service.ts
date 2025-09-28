import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appraisal } from '../model/appraisal.model';
import { EmployeeProfile } from '../model/employee-profile.model';
import { ReviewCycle } from '../model/review-cycle.model';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class SharedAppraisalService {
  private appraisalsSubject = new BehaviorSubject<Appraisal[]>([]);
  public appraisals$: Observable<Appraisal[]> = this.appraisalsSubject.asObservable();

  private mockAppraisals: Appraisal[] = [
    {
      appraisalId: 1,
      selfRating: 4.0,
      managerRating: 4.2,
      status: 'Completed',
      cycleName: 'Q3 2024 Review',
      appraisalDate: '2024-09-15',
      periodStart: '2024-07-01',
      periodEnd: '2024-09-30',
      managerName: 'Jane Smith',
      reviewerRole: 'Manager',
      reviewDate: '2024-09-20',
      managerComments: 'Excellent performance this quarter. Shows great initiative and technical skills.',
      employee: {
        employeeProfileId: 1,
        user: {
          userId: 1,
          username: 'john.doe',
          email: 'john.doe@company.com',
            fullName: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1-555-0001',
            password: 'password123',
          role: 'Employee'
        },
        department: 'Engineering',
        designation: 'Software Engineer',
        dateOfJoining: '2023-01-15',
        reportingManager: 'Jane Smith',
        currentProject: 'Performance Appraisal System',
        currentTeam: 'Full Stack Team',
        skills: ['Angular', 'Spring Boot', 'TypeScript'],
        lastAppraisalRating: 4.2,
        currentGoals: []
      },
      reviewCycle: {
        cycleId: 1,
        cycleName: 'Q3 2024 Review',
        status: 'Completed',
        deadline: new Date('2024-09-30'),
        appraisals: []
      }
    },
    {
      appraisalId: 2,
      selfRating: 3.5,
      managerRating: 3.8,
      status: 'In Review',
      cycleName: 'Q4 2024 Review',
      appraisalDate: '2024-12-10',
      periodStart: '2024-10-01',
      periodEnd: '2024-12-31',
      managerName: 'Mike Johnson',
      reviewerRole: 'Manager',
      reviewDate: '2024-12-25',
      managerComments: 'Good leadership skills. Needs improvement in team communication.',
      employee: {
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
          role: 'Manager'
        },
        department: 'Engineering',
        designation: 'Engineering Manager',
        dateOfJoining: '2022-05-20',
        reportingManager: 'Mike Johnson',
        currentProject: 'Platform Modernization',
        currentTeam: 'Leadership Team',
        skills: ['Leadership', 'Project Management'],
        lastAppraisalRating: 3.8,
        currentGoals: []
      },
      reviewCycle: {
        cycleId: 2,
        cycleName: 'Q4 2024 Review',
        status: 'In Progress',
        deadline: new Date('2024-12-31'),
        appraisals: []
      }
    }
  ];

  constructor() {
    this.appraisalsSubject.next(this.mockAppraisals);
  }

  getAllAppraisals(): Appraisal[] {
    return this.appraisalsSubject.value;
  }

  getAppraisalsByEmployee(employeeProfileId: number): Appraisal[] {
    return this.appraisalsSubject.value.filter(appraisal => 
      appraisal.employee.employeeProfileId === employeeProfileId
    );
  }

  addAppraisal(newAppraisal: Appraisal) {
    const currentAppraisals = this.appraisalsSubject.value;
    // Assign a temporary ID if not already present
    const appraisalWithId = { ...newAppraisal, appraisalId: newAppraisal.appraisalId || Date.now() };
    this.appraisalsSubject.next([...currentAppraisals, appraisalWithId]);
  }

  updateAppraisal(updatedAppraisal: Appraisal) {
    const currentAppraisals = this.appraisalsSubject.value;
    const index = currentAppraisals.findIndex(a => a.appraisalId === updatedAppraisal.appraisalId);
    if (index > -1) {
      currentAppraisals[index] = updatedAppraisal;
      this.appraisalsSubject.next([...currentAppraisals]);
    }
  }

  deleteAppraisal(appraisalId: number) {
    const currentAppraisals = this.appraisalsSubject.value;
    this.appraisalsSubject.next(currentAppraisals.filter(a => a.appraisalId !== appraisalId));
  }
}
