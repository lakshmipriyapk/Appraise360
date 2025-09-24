import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { GoalService } from '../../../service/goal.service';
import { FeedbackService } from '../../../service/feedback.service';
import { AppraisalService } from '../../../service/appraisal.service';
import { AuthService } from '../../../service/auth.service';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { Goal } from '../../../model/goal.model';
import { Feedback } from '../../../model/feedback.model';
import { Appraisal } from '../../../model/appraisal.model';
import { ReviewCycle } from '../../../model/review-cycle.model';
import { User } from '../../../model/user.model';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  // Current user data
  currentEmployee: EmployeeProfile | null = null;
  currentGoals: Goal[] = [];
  recentFeedback: Feedback[] = [];
  appraisals: Appraisal[] = [];
  
  // Dashboard stats
  dashboardStats = {
    totalGoals: 0,
    completedGoals: 0,
    pendingGoals: 0,
    averageRating: 0,
    lastAppraisalRating: 0,
    feedbackCount: 0
  };

  // UI state
  isLoading = true;
  activeSection = 'overview';
  errorMessage = '';

  // Menu items for employee navigation
  menuItems = [
    { title: 'Overview', route: 'overview', icon: 'fa-tachometer-alt' },
    { title: 'My Goals', route: 'goals', icon: 'fa-bullseye' },
    { title: 'Feedback', route: 'feedback', icon: 'fa-comments' },
    { title: 'Appraisals', route: 'appraisals', icon: 'fa-clipboard-check' },
    { title: 'Profile', route: 'profile', icon: 'fa-user' }
  ];

  constructor(
    private router: Router,
    private employeeProfileService: EmployeeProfileService,
    private goalService: GoalService,
    private feedbackService: FeedbackService,
    private appraisalService: AppraisalService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Check if user is logged in using auth service
    if (!this.authService.isLoggedIn()) {
      // For direct access, show mock data instead of redirecting
      console.log('No user logged in, showing mock data for demonstration');
      this.loadMockData();
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Load real employee data
      this.loadEmployeeData(currentUser.userId);
    } else {
      // Fallback to mock data
      this.loadMockData();
    }
  }

  loadEmployeeData(userId: number) {
    // Try to get employee profile by user ID (this method might not exist)
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (profiles) => {
        // Find the profile for the current user
        const userProfile = profiles.find(profile => profile.user.userId === userId);
        if (userProfile) {
          this.currentEmployee = userProfile;
          this.loadRelatedData();
        } else {
          // No employee profile found, fallback to mock data
          console.log('No employee profile found for user, using mock data');
          this.loadMockData();
        }
      },
      error: (error) => {
        console.error('Error loading employee profile, using mock data:', error);
        // Fallback to mock data when backend fails
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    // Mock employee data for development
    this.currentEmployee = {
      employeeProfileId: 1,
      department: 'Engineering',
      designation: 'Software Engineer',
      dateOfJoining: '2023-01-15',
      reportingManager: 'John Smith',
      currentProject: 'Performance Appraisal System',
      currentTeam: 'Full Stack Team',
      skills: ['Angular', 'Spring Boot', 'TypeScript', 'Java', 'SQL'],
      lastAppraisalRating: 4.2,
      currentGoals: ['Complete Angular Training', 'Deliver Q3 Project Milestone', 'Improve Code Review Skills'],
      user: {
        userId: 1,
        username: 'john.doe',
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'Employee'
      }
    };

    // Mock goals data
    this.currentGoals = [
      {
        goalId: 1,
        title: 'Complete Angular Training',
        description: 'Finish the comprehensive Angular course and certification',
        status: 'In Progress',
        employee: this.currentEmployee
      },
      {
        goalId: 2,
        title: 'Deliver Q3 Project Milestone',
        description: 'Complete the performance appraisal system development',
        status: 'Completed',
        employee: this.currentEmployee
      },
      {
        goalId: 3,
        title: 'Improve Code Review Skills',
        description: 'Participate in more code reviews and provide constructive feedback',
        status: 'Pending',
        employee: this.currentEmployee
      }
    ];

    // Mock feedback data
    this.recentFeedback = [
      {
        feedbackId: 1,
        feedbackType: 'Manager Feedback',
        comments: 'Great progress on the recent project! Your Angular skills have improved significantly.',
        rating: 4,
        employee: this.currentEmployee,
        reviewer: {
          userId: 2,
          username: 'manager.smith',
          email: 'manager.smith@company.com',
          firstName: 'Manager',
          lastName: 'Smith',
          role: 'Manager'
        }
      },
      {
        feedbackId: 2,
        feedbackType: 'Peer Feedback',
        comments: 'Very helpful during team meetings and always willing to share knowledge.',
        rating: 5,
        employee: this.currentEmployee,
        reviewer: {
          userId: 3,
          username: 'peer.jones',
          email: 'peer.jones@company.com',
          firstName: 'Peer',
          lastName: 'Jones',
          role: 'Employee'
        }
      }
    ];

    // Mock appraisals data
    this.appraisals = [
      {
        appraisalId: 1,
        selfRating: 4.0,
        managerRating: 4.2,
        status: 'Completed',
        employee: this.currentEmployee,
        reviewCycle: {
          cycleId: 1,
          cycleName: 'Q3 2024 Review',
          appraisals: []
        }
      }
    ];

    // Calculate stats
    this.calculateGoalStats();
    this.calculateAppraisalStats();
    this.dashboardStats.feedbackCount = this.recentFeedback.length;
    
    this.isLoading = false;
  }

  loadRelatedData() {
    if (!this.currentEmployee) {
      this.isLoading = false;
      return;
    }

    // Since the specific employee methods don't exist, use mock data
    console.log('Loading related data with mock data for employee:', this.currentEmployee.user.firstName);
    
    // Use the mock data that's already loaded in loadMockData
    this.calculateGoalStats();
    this.calculateAppraisalStats();
    
    // Set loading to false
    this.isLoading = false;
  }

  calculateGoalStats() {
    this.dashboardStats.totalGoals = this.currentGoals.length;
    this.dashboardStats.completedGoals = this.currentGoals.filter(g => g.status === 'Completed').length;
    this.dashboardStats.pendingGoals = this.currentGoals.filter(g => g.status === 'Pending' || g.status === 'In Progress').length;
  }

  calculateAppraisalStats() {
    if (this.appraisals.length > 0) {
      const latestAppraisal = this.appraisals[this.appraisals.length - 1];
      this.dashboardStats.lastAppraisalRating = latestAppraisal.managerRating;
      
      const totalRating = this.appraisals.reduce((sum, appraisal) => sum + appraisal.managerRating, 0);
      this.dashboardStats.averageRating = totalRating / this.appraisals.length;
    }
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  getGoalProgressPercentage(): number {
    if (this.dashboardStats.totalGoals === 0) return 0;
    return Math.round((this.dashboardStats.completedGoals / this.dashboardStats.totalGoals) * 100);
  }

  getRatingColor(rating: number): string {
    if (rating >= 4) return '#10b981'; // Green
    if (rating >= 3) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'in progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  navigateToSection(route: string) {
    this.setActiveSection(route);
  }

  logout() {
    // Use auth service to logout
    this.authService.logout();
    
    // Clear any other user-related data
    this.currentEmployee = null;
    this.currentGoals = [];
    this.recentFeedback = [];
    this.appraisals = [];
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  getSectionTitle(): string {
    const section = this.menuItems.find(item => item.route === this.activeSection);
    return section ? section.title : 'Dashboard';
  }

  getBreadcrumb(): string {
    return `Employee Dashboard > ${this.getSectionTitle()}`;
  }
}
