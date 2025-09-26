import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../model/feedback.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:8080/api/feedbacks';

  constructor(private http: HttpClient) { }

  getAllFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.apiUrl);
  }

  getFeedbackById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.apiUrl}/${id}`);
  }

  getFeedbacksByEmployeeId(employeeId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getFeedbacksByManagerId(managerId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/manager/${managerId}`);
  }

  createFeedback(employeeId: number, reviewerId: number, feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/employee/${employeeId}/manager/${reviewerId}`, feedback);
  }

  updateFeedback(feedback: Feedback): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.apiUrl}/${feedback.feedbackId}`, feedback);
  }

  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
