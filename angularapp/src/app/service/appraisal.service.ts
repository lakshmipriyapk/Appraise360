// src/app/services/appraisal.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appraisal } from '../model/appraisal.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppraisalService {
  private baseUrl = `${environment.apiUrl}/appraisals`;

  constructor(private http: HttpClient) {}

  // Get all appraisals
  getAllAppraisals(): Observable<Appraisal[]> {
    return this.http.get<Appraisal[]>(`${this.baseUrl}`);
  }

  // Get appraisal by ID
  getAppraisalById(id: number): Observable<Appraisal> {
    return this.http.get<Appraisal>(`${this.baseUrl}/${id}`);
  }

  // Get appraisals by employee
  getAppraisalsByEmployee(employeeId: number): Observable<Appraisal[]> {
    return this.http.get<Appraisal[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  // Get appraisals by cycle
  getAppraisalsByCycle(cycleId: number): Observable<Appraisal[]> {
    return this.http.get<Appraisal[]>(`${this.baseUrl}/cycle/${cycleId}`);
  }

  // Create new appraisal
  createAppraisal(appraisal: Appraisal): Observable<Appraisal> {
    return this.http.post<Appraisal>(`${this.baseUrl}`, appraisal);
  }

  // Create appraisal with employeeId + cycleId
  createAppraisalWithIds(employeeId: number, cycleId: number, appraisalData: any): Observable<Appraisal> {
    return this.http.post<Appraisal>(
      `${this.baseUrl}/employee/${employeeId}/cycle/${cycleId}`,
      appraisalData
    );
  }

  // Update appraisal
  updateAppraisal(id: number, appraisal: Appraisal): Observable<Appraisal> {
    return this.http.put<Appraisal>(`${this.baseUrl}/${id}`, appraisal);
  }

  // Delete appraisal
  deleteAppraisal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}