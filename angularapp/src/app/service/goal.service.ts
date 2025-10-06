// src/app/services/goal.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Goal } from '../model/goal.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private baseUrl = `${environment.apiUrl}/goals`;

  constructor(private http: HttpClient) {}

  // Get all goals
  getAllGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}`);
  }

  // Get goal by ID
  getGoalById(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.baseUrl}/${id}`);
  }

  // Get goals by employee
  getGoalsByEmployee(employeeId: number): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  // Get goals by appraisal
  getGoalsByAppraisal(appraisalId: number): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}/appraisal/${appraisalId}`);
  }

  // Create goal
  createGoal(goal: Goal): Observable<Goal> {
    return this.http.post<Goal>(`${this.baseUrl}`, goal);
  }

  // Create goal with employeeId
  createGoalWithEmployeeId(employeeId: number, goal: Goal): Observable<Goal> {
    return this.http.post<Goal>(`${this.baseUrl}/employee/${employeeId}`, goal);
  }

  // Create goal with employeeId and appraisalId
  createGoalWithAppraisal(employeeId: number, appraisalId: number, goal: Goal): Observable<Goal> {
    return this.http.post<Goal>(`${this.baseUrl}/employee/${employeeId}/appraisal/${appraisalId}`, goal);
  }

  // Update goal
  updateGoal(id: number, goal: Goal): Observable<Goal> {
    return this.http.put<Goal>(`${this.baseUrl}/${id}`, goal);
  }

  // Delete goal
  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}