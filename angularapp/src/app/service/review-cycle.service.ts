// src/app/services/review-cycle.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewCycle } from '../model/review-cycle.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewCycleService {
  private baseUrl = `${environment.apiUrl}/reviewCycles`;

  constructor(private http: HttpClient) {}

  // Get all review cycles
  getAllReviewCycles(): Observable<ReviewCycle[]> {
    return this.http.get<ReviewCycle[]>(`${this.baseUrl}`);
  }

  // Get review cycle by ID
  getReviewCycleById(id: number): Observable<ReviewCycle> {
    return this.http.get<ReviewCycle>(`${this.baseUrl}/${id}`);
  }

  // Create review cycle
  createReviewCycle(cycle: ReviewCycle): Observable<ReviewCycle> {
    return this.http.post<ReviewCycle>(`${this.baseUrl}`, cycle);
  }

  // Update review cycle
  updateReviewCycle(id: number, cycle: ReviewCycle): Observable<ReviewCycle> {
    return this.http.put<ReviewCycle>(`${this.baseUrl}/${id}`, cycle);
  }

  // Delete review cycle
  deleteReviewCycle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}