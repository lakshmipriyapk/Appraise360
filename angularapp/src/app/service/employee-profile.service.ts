// src/app/service/employee-profile.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeProfile } from '../model/employee-profile.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileService {
  private readonly apiUrl = `${environment.apiUrl}/employeeProfiles`;

  constructor(private http: HttpClient) {}

  /** Get all employee profiles */
  getAllEmployeeProfiles(): Observable<EmployeeProfile[]> {
    return this.http.get<EmployeeProfile[]>(this.apiUrl);
  }

  /** Get profile by ID */
  getEmployeeProfileById(id: number): Observable<EmployeeProfile> {
    return this.http.get<EmployeeProfile>(`${this.apiUrl}/${id}`);
  }

  /** Get profiles by userId */
  getProfilesByUserId(userId: number): Observable<EmployeeProfile[]> {
    return this.http.get<EmployeeProfile[]>(`${this.apiUrl}/user/${userId}`);
  }

  /** Create a new profile */
  createProfile(profile: EmployeeProfile): Observable<EmployeeProfile> {
    return this.http.post<EmployeeProfile>(this.apiUrl, profile);
  }

  /** Create a profile for an existing user */
  createProfileForUser(userId: number, profile: EmployeeProfile): Observable<EmployeeProfile> {
    return this.http.post<EmployeeProfile>(`${this.apiUrl}/user/${userId}`, profile);
  }

  /** Update a profile */
  updateProfile(id: number, profile: EmployeeProfile): Observable<EmployeeProfile> {
    return this.http.put<EmployeeProfile>(`${this.apiUrl}/${id}`, profile);
  }

  /** Update employee profile with partial data */
  updateEmployeeProfilePartial(id: number, profileData: any): Observable<EmployeeProfile> {
    return this.http.put<EmployeeProfile>(`${this.apiUrl}/${id}`, profileData);
  }

  /** Delete a profile */
  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Search employee profiles by name */
  searchEmployeeProfilesByName(name: string): Observable<EmployeeProfile[]> {
    return this.http.get<EmployeeProfile[]>(`${this.apiUrl}/search?name=${encodeURIComponent(name)}`);
  }
}
