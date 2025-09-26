import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewCycle } from '../model/review-cycle.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewCycleService {
  private apiUrl = 'http://localhost:8080/api/review-cycles';

  constructor(private http: HttpClient) { }

  getAllReviewCycles(): Observable<ReviewCycle[]> {
    return this.http.get<ReviewCycle[]>(this.apiUrl);
  }

  getReviewCycleById(id: number): Observable<ReviewCycle> {
    return this.http.get<ReviewCycle>(`${this.apiUrl}/${id}`);
  }

  createReviewCycle(reviewCycle: ReviewCycle): Observable<ReviewCycle> {
    return this.http.post<ReviewCycle>(this.apiUrl, reviewCycle);
  }

  updateReviewCycle(reviewCycle: ReviewCycle): Observable<ReviewCycle> {
    return this.http.put<ReviewCycle>(`${this.apiUrl}/${reviewCycle.cycleId}`, reviewCycle);
  }

  deleteReviewCycle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
