import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal } from '../model/goal.model';

@Injectable({
  providedIn: 'root'
})
export class SharedGoalService {
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  public goals$ = this.goalsSubject.asObservable();

  constructor() {
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockGoals: Goal[] = [
      // Manager-assigned goals
      {
        goalId: 1,
        title: 'Complete Project Alpha',
        description: 'Finish the development and testing of Project Alpha by the end of Q2',
        status: 'In Progress',
        employee: {
          employeeProfileId: 1,
          user: {
            userId: 1,
            username: 'john.doe',
            email: 'john.doe@company.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'Employee'
          },
          department: 'Engineering',
          designation: 'Software Developer',
          dateOfJoining: '2023-01-15',
          reportingManager: 'Jane Smith',
          currentProject: 'Project Alpha',
          currentTeam: 'Development Team A',
          skills: ['JavaScript', 'Angular', 'Node.js'],
          lastAppraisalRating: 4.2,
          currentGoals: ['Complete Project Alpha', 'Learn React']
        },
        appraisal: {
          appraisalId: 1,
          employee: {
            employeeProfileId: 1,
            user: {
              userId: 1,
              username: 'john.doe',
              email: 'john.doe@company.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'Employee'
            },
            department: 'Engineering',
            designation: 'Software Developer',
            dateOfJoining: '2023-01-15',
            reportingManager: 'Jane Smith',
            currentProject: 'Project Alpha',
            currentTeam: 'Development Team A',
            skills: ['JavaScript', 'Angular', 'Node.js'],
            lastAppraisalRating: 4.2,
            currentGoals: ['Complete Project Alpha', 'Learn React']
          },
          reviewCycle: {
            cycleId: 1,
            cycleName: 'Q2 2024 Review',
            status: 'Active',
            deadline: new Date('2024-06-30'),
            appraisals: []
          },
          selfRating: 4.0,
          managerRating: 4.2,
          status: 'Completed'
        }
      },
      {
        goalId: 2,
        title: 'Improve Code Quality',
        description: 'Reduce code complexity and improve test coverage to 90%',
        status: 'Pending',
        employee: {
          employeeProfileId: 2,
          user: {
            userId: 2,
            username: 'jane.smith',
            email: 'jane.smith@company.com',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'Employee'
          },
          department: 'Engineering',
          designation: 'Senior Developer',
          dateOfJoining: '2022-03-10',
          reportingManager: 'Mike Johnson',
          currentProject: 'Project Beta',
          currentTeam: 'Development Team B',
          skills: ['Python', 'Django', 'PostgreSQL'],
          lastAppraisalRating: 4.5,
          currentGoals: ['Improve Code Quality', 'Mentor Junior Developers']
        },
        appraisal: undefined
      },
      // Employee self-created goals
      {
        goalId: 1001,
        title: 'Learn React Advanced Concepts',
        description: 'Master advanced React patterns including hooks, context, and performance optimization',
        status: 'In Progress',
        priority: 'High',
        startDate: new Date('2024-01-15'),
        targetDate: new Date('2024-06-30'),
        progress: 45,
        createdBy: 'self',
        category: 'Professional Development',
        employee: {
          employeeProfileId: 1,
          user: {
            userId: 1,
            username: 'john.doe',
            email: 'john.doe@company.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'Employee'
          },
          department: 'Engineering',
          designation: 'Software Developer',
          dateOfJoining: '2023-01-15',
          reportingManager: 'Jane Smith',
          currentProject: 'Project Alpha',
          currentTeam: 'Development Team A',
          skills: ['JavaScript', 'Angular', 'Node.js'],
          lastAppraisalRating: 4.2,
          currentGoals: ['Complete Project Alpha', 'Learn React']
        },
        appraisal: undefined
      },
      {
        goalId: 1002,
        title: 'Complete Angular Certification',
        description: 'Obtain Angular certification to enhance technical skills and career growth',
        status: 'Pending',
        priority: 'Medium',
        startDate: new Date('2024-02-01'),
        targetDate: new Date('2024-08-31'),
        progress: 0,
        createdBy: 'self',
        category: 'Certification',
        employee: {
          employeeProfileId: 1,
          user: {
            userId: 1,
            username: 'john.doe',
            email: 'john.doe@company.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'Employee'
          },
          department: 'Engineering',
          designation: 'Software Developer',
          dateOfJoining: '2023-01-15',
          reportingManager: 'Jane Smith',
          currentProject: 'Project Alpha',
          currentTeam: 'Development Team A',
          skills: ['JavaScript', 'Angular', 'Node.js'],
          lastAppraisalRating: 4.2,
          currentGoals: ['Complete Project Alpha', 'Learn React']
        },
        appraisal: undefined
      },
      {
        goalId: 1003,
        title: 'Improve Team Collaboration',
        description: 'Enhance communication skills and contribute more to team discussions',
        status: 'In Progress',
        priority: 'Medium',
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2024-12-31'),
        progress: 30,
        createdBy: 'self',
        category: 'Soft Skills',
        employee: {
          employeeProfileId: 1,
          user: {
            userId: 1,
            username: 'john.doe',
            email: 'john.doe@company.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'Employee'
          },
          department: 'Engineering',
          designation: 'Software Developer',
          dateOfJoining: '2023-01-15',
          reportingManager: 'Jane Smith',
          currentProject: 'Project Alpha',
          currentTeam: 'Development Team A',
          skills: ['JavaScript', 'Angular', 'Node.js'],
          lastAppraisalRating: 4.2,
          currentGoals: ['Complete Project Alpha', 'Learn React']
        },
        appraisal: undefined
      }
    ];

    this.goalsSubject.next(mockGoals);
  }

  getAllGoals(): Goal[] {
    return this.goalsSubject.value;
  }

  getGoalsByEmployee(employeeId: number): Goal[] {
    return this.goalsSubject.value.filter(goal => goal.employee.employeeProfileId === employeeId);
  }

  getManagerAssignedGoals(): Goal[] {
    return this.goalsSubject.value.filter(goal => !goal.createdBy || goal.createdBy !== 'self');
  }

  getSelfCreatedGoals(): Goal[] {
    return this.goalsSubject.value.filter(goal => goal.createdBy === 'self');
  }

  addGoal(goal: Goal) {
    const currentGoals = this.goalsSubject.value;
    const newGoal = {
      ...goal,
      goalId: this.generateGoalId()
    };
    currentGoals.push(newGoal);
    this.goalsSubject.next(currentGoals);
  }

  updateGoal(updatedGoal: Goal) {
    const currentGoals = this.goalsSubject.value;
    const index = currentGoals.findIndex(goal => goal.goalId === updatedGoal.goalId);
    if (index !== -1) {
      currentGoals[index] = updatedGoal;
      this.goalsSubject.next(currentGoals);
    }
  }

  deleteGoal(goalId: number) {
    const currentGoals = this.goalsSubject.value;
    const filteredGoals = currentGoals.filter(goal => goal.goalId !== goalId);
    this.goalsSubject.next(filteredGoals);
  }

  updateGoalStatus(goalId: number, status: string) {
    const currentGoals = this.goalsSubject.value;
    const goal = currentGoals.find(g => g.goalId === goalId);
    if (goal) {
      goal.status = status;
      // Update progress based on status
      if (status === 'Completed') {
        goal.progress = 100;
        goal.completionDate = new Date();
      } else if (status === 'In Progress') {
        goal.progress = goal.progress || 25;
      } else if (status === 'Pending') {
        goal.progress = 0;
      }
      this.goalsSubject.next(currentGoals);
    }
  }

  private generateGoalId(): number {
    const currentGoals = this.goalsSubject.value;
    const maxId = Math.max(...currentGoals.map(goal => goal.goalId), 0);
    return maxId + 1;
  }
}
