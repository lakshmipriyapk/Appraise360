import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Goal } from '../model/goal.model';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private apiUrl = 'http://localhost:8080/api/goals';

  constructor(private http: HttpClient) { }

  getAllGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(this.apiUrl);
  }

  getGoalById(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.apiUrl}/${id}`);
  }

  getGoalsByEmployeeId(employeeId: number): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getGoalsByAppraisalId(appraisalId: number): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.apiUrl}/appraisal/${appraisalId}`);
  }

  createGoal(goal: Goal): Observable<Goal> {
    return this.http.post<Goal>(this.apiUrl, goal);
  }

  updateGoal(goal: Goal): Observable<Goal> {
    return this.http.put<Goal>(`${this.apiUrl}/${goal.goalId}`, goal);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
