import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeProfile } from '../model/employee-profile.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileService {
  private apiUrl = `${environment.apiUrl}/employeeProfiles`;

  constructor(private http: HttpClient) { }

  getAllEmployeeProfiles(): Observable<EmployeeProfile[]> {
    return this.http.get<EmployeeProfile[]>(this.apiUrl);
  }

  getEmployeeProfileById(id: number): Observable<EmployeeProfile> {
    return this.http.get<EmployeeProfile>(`${this.apiUrl}/${id}`);
  }

  getEmployeeProfileByUserId(userId: number): Observable<EmployeeProfile[]> {
    return this.http.get<EmployeeProfile[]>(`${this.apiUrl}/user/${userId}`);
  }

  createEmployeeProfile(userId: number, employeeProfile: EmployeeProfile): Observable<EmployeeProfile> {
    return this.http.post<EmployeeProfile>(`${this.apiUrl}/user/${userId}`, employeeProfile);
  }

  updateEmployeeProfile(employeeProfile: EmployeeProfile): Observable<EmployeeProfile> {
    return this.http.put<EmployeeProfile>(`${this.apiUrl}/${employeeProfile.employeeProfileId}`, employeeProfile);
  }

  deleteEmployeeProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
