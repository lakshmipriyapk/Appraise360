import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import{NgFor, NgClass, NgIf,} from '@angular/common';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { GoalService } from '../../../service/goal.service';
import { FeedbackService } from '../../../service/feedback.service';
import { AppraisalService } from '../../../service/appraisal.service';
import { AuthService } from '../../../service/auth.service';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { Goal } from '../../../model/goal.model';
import { Feedback } from '../../../model/feedback.model';
import { Appraisal } from '../../../model/appraisal.model';


interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
  status: string;
  employeeName: string;
  employeeId: number;
}

interface EmployeeStats {
  totalEmployees: number;
  newlyJoined: number;
  activeEmployees: number;
  employeesOnLeave: number;
  totalDepartments: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  // Sidebar menu
  menuItems = [
    { title: 'Admin Dashboard', icon: 'fa-tachometer-alt', route: '/admin-dashboard' },
    { title: 'Appraisal', icon: 'fa-clipboard-check', route: '/appraisal' },
    { title: 'Employee Profile', icon: 'fa-user', route: '/employee-profile' },
    { title: 'Feedback', icon: 'fa-comments', route: '/feedback' },
    { title: 'Goal', icon: 'fa-bullseye', route: '/goal' },
    { title: 'Review Cycle', icon: 'fa-calendar-alt', route: '/review-cycle' }
  ];

  cards: any;
  performanceMetrics: PerformanceMetric[] = [];
  recentActivities: RecentActivity[] = [];
  employeeStats: EmployeeStats = {
    totalEmployees: 0,
    newlyJoined: 0,
    activeEmployees: 0,
    employeesOnLeave: 0,
    totalDepartments: 0
  };

  // Manager-specific data
  allEmployees: EmployeeProfile[] = [];
  allGoals: Goal[] = [];
  allFeedback: Feedback[] = [];
  allAppraisals: Appraisal[] = [];
  currentManager: any = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private employeeProfileService: EmployeeProfileService,
    private goalService: GoalService,
    private feedbackService: FeedbackService,
    private appraisalService: AppraisalService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadManagerData();
  }

  loadManagerData() {
    this.isLoading = true;
    
    // Get current manager info
    this.currentManager = this.authService.getCurrentUser();
    console.log('Current manager:', this.currentManager);
    
    // Load all employees (filter only employees, exclude admins)
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (employees) => {
        console.log('All employees loaded:', employees);
        // Filter only employees (exclude admins)
        this.allEmployees = employees.filter(emp => 
          emp.user?.role === 'Employee' || emp.user?.role === 'employee'
        );
        console.log('Filtered employees (excluding admins):', this.allEmployees.length);
        this.calculateEmployeeStats();
        this.loadAllEmployeeData();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.errorMessage = 'Failed to load employee data. Please check your connection.';
        this.loadMockData(); // Fallback to mock data
      }
    });
  }

  loadAllEmployeeData() {
    // Load all goals
    this.goalService.getAllGoals().subscribe({
      next: (goals) => {
        console.log('All goals loaded:', goals);
        this.allGoals = goals;
        this.generateRecentActivities();
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        this.errorMessage = 'Failed to load goals data.';
      }
    });

    // Load all feedback
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (feedback) => {
        console.log('All feedback loaded:', feedback);
        this.allFeedback = feedback;
      },
      error: (error) => {
        console.error('Error loading feedback:', error);
        this.errorMessage = 'Failed to load feedback data.';
      }
    });

    // Load all appraisals
    this.appraisalService.getAllAppraisals().subscribe({
      next: (appraisals) => {
        console.log('All appraisals loaded:', appraisals);
        this.allAppraisals = appraisals;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appraisals:', error);
        this.errorMessage = 'Failed to load appraisals data.';
        this.isLoading = false;
      }
    });
  }

  calculateEmployeeStats() {
    this.employeeStats.totalEmployees = this.allEmployees.length;
    this.employeeStats.newlyJoined = this.allEmployees.filter(emp => {
      const joiningDate = new Date(emp.dateOfJoining);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return joiningDate > thirtyDaysAgo;
    }).length;
    this.employeeStats.activeEmployees = this.allEmployees.length; // All are active for now
    this.employeeStats.employeesOnLeave = 0; // No leave tracking for now
    this.employeeStats.totalDepartments = new Set(this.allEmployees.map(emp => emp.department)).size;
  }

  generateRecentActivities() {
    this.recentActivities = [];
    
    // Add recent goals
    const recentGoals = this.allGoals
      .sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime())
      .slice(0, 3);
    
    recentGoals.forEach(goal => {
      this.recentActivities.push({
        id: goal.goalId || 0,
        type: 'goal',
        description: `${goal.employee?.user?.fullName || 'Employee'} ${goal.status === 'Completed' ? 'completed' : 'updated'} goal: ${goal.title}`,
        timestamp: new Date(goal.createdDate || new Date()),
        status: goal.status?.toLowerCase() || 'pending',
        employeeName: goal.employee?.user?.fullName || 'Unknown',
        employeeId: goal.employee?.employeeProfileId || 0
      });
    });

    // Add recent feedback
    const recentFeedback = this.allFeedback
      .sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime())
      .slice(0, 2);
    
    recentFeedback.forEach(feedback => {
      this.recentActivities.push({
        id: feedback.feedbackId || 0,
        type: 'review',
        description: `${feedback.reviewer?.fullName || 'Manager'} provided feedback to ${feedback.employee?.user?.fullName || 'Employee'}`,
        timestamp: new Date(feedback.createdDate || new Date()),
        status: 'completed',
        employeeName: feedback.employee?.user?.fullName || 'Unknown',
        employeeId: feedback.employee?.employeeProfileId || 0
      });
    });

    // Sort by timestamp
    this.recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  loadMockData() {
    // Mock employee statistics
    this.employeeStats = {
      totalEmployees: 156,
      newlyJoined: 12,
      activeEmployees: 142,
      employeesOnLeave: 14,
      totalDepartments: 8
    };

    // Mock performance metrics
    this.performanceMetrics = [
      { label: 'Review Completion Rate', value: 87, target: 90, unit: '%' },
      { label: 'Employee Satisfaction', value: 4.2, target: 4.5, unit: '/5' },
      { label: 'Goal Achievement', value: 78, target: 80, unit: '%' }
    ];

    // Mock recent activities
    this.recentActivities = [
      {
        id: 1,
        type: 'review',
        description: 'John Doe completed annual review',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        employeeName: 'John Doe',
        employeeId: 101
      },
      {
        id: 2,
        type: 'goal',
        description: 'Sarah Johnson set new quarterly goals',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'pending',
        employeeName: 'Sarah Johnson',
        employeeId: 102
      },
      {
        id: 3,
        type: 'review',
        description: 'Lisa Brown started mid-year review',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        status: 'in-progress',
        employeeName: 'Lisa Brown',
        employeeId: 103
      }
    ];
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours < 1) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'review': return 'fa-clipboard-check';
      case 'goal': return 'fa-bullseye';
      case 'appraisal': return 'fa-star';
      case 'user': return 'fa-user';
      default: return 'fa-circle';
    }
  }

  getMetricStatus(metric: PerformanceMetric): string {
    const percentage = (metric.value / metric.target) * 100;
    if (percentage >= 100) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
  }

  getMetricProgress(metric: PerformanceMetric): number {
    return Math.min((metric.value / metric.target) * 100, 100);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/website/landing']);
  }

  // Manager-specific methods
  getEmployeesByManager(managerName: string): EmployeeProfile[] {
    return this.allEmployees.filter(emp => emp.reportingManager === managerName);
  }

  getEmployeeGoals(employeeId: number): Goal[] {
    return this.allGoals.filter(goal => goal.employee?.employeeProfileId === employeeId);
  }

  getEmployeeFeedback(employeeId: number): Feedback[] {
    return this.allFeedback.filter(feedback => feedback.employee?.employeeProfileId === employeeId);
  }

  getEmployeeAppraisals(employeeId: number): Appraisal[] {
    return this.allAppraisals.filter(appraisal => appraisal.employee?.employeeProfileId === employeeId);
  }

  getCompletedGoalsCount(employeeId: number): number {
    return this.getEmployeeGoals(employeeId).filter(g => g.status === 'Completed').length;
  }

  // Navigate to employee profile instead of dashboard
  viewEmployeeProfile(employeeId: number) {
    this.router.navigate(['/employee-profile'], { 
      queryParams: { employeeId: employeeId } 
    });
  }

  // Get employee performance summary
  getEmployeePerformanceSummary(employeeId: number) {
    const goals = this.getEmployeeGoals(employeeId);
    const feedback = this.getEmployeeFeedback(employeeId);
    const appraisals = this.getEmployeeAppraisals(employeeId);
    
    const completedGoals = goals.filter(g => g.status === 'Completed').length;
    const totalGoals = goals.length;
    const avgRating = feedback.length > 0 ? 
      feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length : 0;
    
    return {
      totalGoals,
      completedGoals,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
      averageRating: avgRating,
      feedbackCount: feedback.length,
      appraisalCount: appraisals.length
    };
  }
}
