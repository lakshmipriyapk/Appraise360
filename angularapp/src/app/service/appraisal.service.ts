import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Appraisal } from '../model/appraisal.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppraisalService {
  private apiUrl = `${environment.apiUrl}/appraisals`;

  constructor(private http: HttpClient) { }

  getAllAppraisals(): Observable<Appraisal[]> {
    console.log('AppraisalService: Getting all appraisals');
    return this.http.get<Appraisal[]>(this.apiUrl);
  }

  // Mock method for development
  mockGetAllAppraisals(): Observable<Appraisal[]> {
    console.log('AppraisalService: Mock getting all appraisals');
    
    const mockAppraisals: Appraisal[] = [
      {
        appraisalId: 1,
        selfRating: 4,
        managerRating: 4.2,
        status: 'Completed',
        cycleName: 'Q3 2024 Review',
        appraisalDate: '2024-09-15',
        periodStart: '2024-07-01',
        periodEnd: '2024-09-30',
        managerName: 'John Smith',
        reviewerRole: 'Manager',
        reviewDate: '2024-09-20',
        managerComments: 'Excellent performance this quarter. Shows great initiative and technical skills.',
        employee: {
          employeeProfileId: 1,
          department: 'Engineering',
          designation: 'Software Engineer',
          dateOfJoining: '2023-01-15',
          reportingManager: 'John Smith',
          currentProject: 'Performance Appraisal System',
          currentTeam: 'Full Stack Team',
          skills: ['Angular', 'Spring Boot', 'TypeScript'],
          lastAppraisalRating: 4.2,
          currentGoals: ['Complete Angular Training'],
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
          }
        },
        reviewCycle: {
          cycleId: 1,
          cycleName: 'Q3 2024 Review',
          status: 'Completed',
          deadline: new Date('2024-09-30'),
          appraisals: []
        }
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockAppraisals);
        observer.complete();
      }, 500);
    });
  }

  getAppraisalById(id: number): Observable<Appraisal> {
    return this.http.get<Appraisal>(`${this.apiUrl}/${id}`);
  }

  getAppraisalsByEmployeeId(employeeId: number): Observable<Appraisal[]> {
    return this.http.get<Appraisal[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getAppraisalsByCycleId(cycleId: number): Observable<Appraisal[]> {
    return this.http.get<Appraisal[]>(`${this.apiUrl}/cycle/${cycleId}`);
  }

  createAppraisal(appraisal: Appraisal): Observable<Appraisal> {
    // For development, use mock response if backend is not available
    console.log('AppraisalService: Creating appraisal', appraisal);
    
    // Try real API call first, fallback to mock
    return this.http.post<Appraisal>(this.apiUrl, appraisal);
  }

  // Mock method for development
  mockCreateAppraisal(appraisal: Appraisal): Observable<Appraisal> {
    console.log('AppraisalService: Mock creating appraisal', appraisal);
    
    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        const mockResponse = {
          ...appraisal,
          appraisalId: Math.floor(Math.random() * 1000) + 1
        };
        observer.next(mockResponse);
        observer.complete();
      }, 1000);
    });
  }

  updateAppraisal(appraisal: Appraisal): Observable<Appraisal> {
    return this.http.put<Appraisal>(`${this.apiUrl}/${appraisal.appraisalId}`, appraisal);
  }

  deleteAppraisal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
