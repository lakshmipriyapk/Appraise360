import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Goal } from '../model/goal.model';

@Injectable({
  providedIn: 'root'
})
export class SharedGoalService {
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  goals$ = this.goalsSubject.asObservable();

  // Set all goals
  setGoals(goals: Goal[]) {
    this.goalsSubject.next(goals);
  }

  // Add a single goal
  addGoal(goal: Goal) {
    const currentGoals = this.goalsSubject.getValue();
    this.goalsSubject.next([goal, ...currentGoals]);
  }

  // Update a goal's status
  updateGoalStatus(goalId: number, status: string) {
    const currentGoals = this.goalsSubject.getValue();
    const updatedGoals = currentGoals.map(g =>
      g.goalId === goalId ? { ...g, status } : g
    );
    this.goalsSubject.next(updatedGoals);
  }
}
