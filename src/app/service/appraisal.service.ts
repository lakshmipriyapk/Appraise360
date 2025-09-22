import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appraisal } from '../model/appraisal.model';

@Injectable({
  providedIn: 'root'
})
export class AppraisalService {
  private apiUrl = 'http://localhost:8080/api/appraisals';

  constructor(private http: HttpClient) { }

  getAllAppraisals(): Observable<Appraisal[]> {
    return this.http.get<Appraisal[]>(this.apiUrl);
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
    return this.http.post<Appraisal>(this.apiUrl, appraisal);
  }

  updateAppraisal(appraisal: Appraisal): Observable<Appraisal> {
    return this.http.put<Appraisal>(`${this.apiUrl}/${appraisal.appraisalId}`, appraisal);
  }

  deleteAppraisal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
