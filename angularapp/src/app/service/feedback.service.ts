// src/app/services/feedback.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../model/feedback.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private baseUrl = `${environment.apiUrl}/feedbacks`;

  constructor(private http: HttpClient) {}

  // Get all feedbacks
  getAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}`);
  }

  // Get feedback by ID
  getFeedbackById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.baseUrl}/${id}`);
  }

  // Get feedbacks received by employee
  getFeedbacksByEmployee(employeeId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  // Get feedbacks given by reviewer
  getFeedbacksByReviewer(reviewerId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/reviewer/${reviewerId}`);
  }

  // Create feedback (with employee & optional reviewer embedded in body)
  createFeedback(feedbackData: any): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.baseUrl}`, feedbackData);
  }

  // Create feedback with employeeId & reviewerId in path
  createFeedbackWithIds(employeeId: number, reviewerId: number, feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.baseUrl}/employee/${employeeId}/reviewer/${reviewerId}`, feedback);
  }

  // Update feedback
  updateFeedback(id: number, feedback: Feedback): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.baseUrl}/${id}`, feedback);
  }

  // Delete feedback
  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
