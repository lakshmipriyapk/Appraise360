import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { SharedEmployeeService } from '../../../service/shared-employee.service';
import { SharedGoalService } from '../../../service/shared-goal.service';
import { SharedAppraisalService } from '../../../service/shared-appraisal.service';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  // Current user data
  currentEmployee: EmployeeProfile | null = null;
  currentGoals: Goal[] = [];
  recentFeedback: Feedback[] = [];
  appraisals: Appraisal[] = [];
  
  // Self feedback properties
  currentSelfFeedback: any = null;
  showSelfFeedbackModal: boolean = false;
  selfFeedbackForm: FormGroup;
  
  // Goal creation properties
  showGoalModal: boolean = false;
  goalForm: FormGroup;
  
  // Request feedback properties
  showRequestFeedbackModal: boolean = false;
  requestFeedbackForm: FormGroup;

  // Edit profile properties
  showEditProfileModal: boolean = false;
  editProfileForm: FormGroup;
  
  
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
    private fb: FormBuilder,
    private employeeProfileService: EmployeeProfileService,
    private sharedEmployeeService: SharedEmployeeService,
    private sharedGoalService: SharedGoalService,
    private sharedAppraisalService: SharedAppraisalService,
    private goalService: GoalService,
    private feedbackService: FeedbackService,
    private appraisalService: AppraisalService,
    private authService: AuthService
  ) {
    this.selfFeedbackForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: ['', [Validators.required, Validators.minLength(10)]],
      achievements: [''],
      challenges: [''],
      improvements: ['']
    });

    this.goalForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      targetDate: ['', [Validators.required]],
      priority: ['Medium'],
      category: ['Professional Development']
    });

    this.requestFeedbackForm = this.fb.group({
      requestee: ['', [Validators.required]],
      feedbackType: ['', [Validators.required]],
      message: [''],
      deadline: [''],
      anonymous: [false]
    });

    this.editProfileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      designation: ['', [Validators.required]],
      department: ['', [Validators.required]],
      currentProject: [''],
      currentTeam: [''],
      skills: ['']
    });
  }

  ngOnInit() {
    this.loadDashboardData();
    
    // Subscribe to shared employee data
    this.sharedEmployeeService.currentEmployee$.subscribe(employee => {
      if (employee) {
        this.currentEmployee = employee;
      }
    });
    
    // Subscribe to shared goal data
    this.sharedGoalService.goals$.subscribe(goals => {
      if (goals && goals.length > 0) {
        // Filter goals for current employee
        const employeeGoals = goals.filter(goal => 
          goal.employee.employeeProfileId === this.currentEmployee?.employeeProfileId
        );
        this.currentGoals = employeeGoals;
      }
    });

    // Subscribe to shared appraisal data
    this.sharedAppraisalService.appraisals$.subscribe(appraisals => {
      if (appraisals && appraisals.length > 0) {
        // Filter appraisals for current employee
        const employeeAppraisals = appraisals.filter(appraisal => 
          appraisal.employee.employeeProfileId === this.currentEmployee?.employeeProfileId
        );
        this.appraisals = employeeAppraisals;
        this.calculateAppraisalStats();
      }
    });
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Get current employee from shared service
    const currentEmployee = this.sharedEmployeeService.getCurrentEmployee();
    if (currentEmployee) {
      this.currentEmployee = currentEmployee;
      this.loadRelatedData();
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
          status: 'Completed',
          deadline: new Date('2024-09-30'),
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

  getOverallGoalProgressPercentage(): number {
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

  // Self Feedback Methods
  openSelfFeedbackModal() {
    this.showSelfFeedbackModal = true;
    if (this.currentSelfFeedback) {
      this.selfFeedbackForm.patchValue({
        rating: this.currentSelfFeedback.rating,
        comments: this.currentSelfFeedback.comments,
        achievements: this.currentSelfFeedback.achievements || '',
        challenges: this.currentSelfFeedback.challenges || '',
        improvements: this.currentSelfFeedback.improvements || ''
      });
    } else {
      this.selfFeedbackForm.reset();
      this.selfFeedbackForm.patchValue({ rating: 0 });
    }
  }

  closeSelfFeedbackModal() {
    this.showSelfFeedbackModal = false;
    this.selfFeedbackForm.reset();
    this.selfFeedbackForm.patchValue({ rating: 0 });
  }

  setRating(rating: number) {
    this.selfFeedbackForm.patchValue({ rating });
  }

  submitSelfFeedback() {
    if (this.selfFeedbackForm.valid) {
      const feedbackData = {
        ...this.selfFeedbackForm.value,
        employeeProfileId: this.currentEmployee?.employeeProfileId,
        createdDate: new Date(),
        feedbackType: 'Self Assessment'
      };

      // Mock save - in real app, this would call a service
      this.currentSelfFeedback = feedbackData;
      console.log('Self feedback saved:', feedbackData);
      
      this.closeSelfFeedbackModal();
      
      // Show success message
      alert('Self feedback saved successfully!');
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.selfFeedbackForm.controls).forEach(key => {
        this.selfFeedbackForm.get(key)?.markAsTouched();
      });
    }
  }

  editSelfFeedback() {
    this.openSelfFeedbackModal();
  }

  // Goal Management Methods
  openGoalModal() {
    this.showGoalModal = true;
    this.goalForm.reset();
    this.goalForm.patchValue({
      priority: 'Medium',
      category: 'Professional Development'
    });
  }

  closeGoalModal() {
    this.showGoalModal = false;
    this.goalForm.reset();
  }

  submitGoal() {
    if (this.goalForm.valid && this.currentEmployee) {
      const formData = this.goalForm.value;
      
      const newGoal: Goal = {
        goalId: 0, // Will be set by shared service
        title: formData.title,
        description: formData.description,
        status: 'Pending',
        priority: formData.priority,
        startDate: new Date(formData.startDate),
        targetDate: new Date(formData.targetDate),
        progress: 0,
        createdBy: 'self',
        category: formData.category,
        employee: this.currentEmployee,
        appraisal: undefined
      };

      // Add to shared service
      this.sharedGoalService.addGoal(newGoal);
      
      console.log('Goal created:', newGoal);
      
      this.closeGoalModal();
      
      // Update dashboard stats
      this.calculateGoalStats();
      
      // Show success message
      alert('Goal created successfully!');
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.goalForm.controls).forEach(key => {
        this.goalForm.get(key)?.markAsTouched();
      });
    }
  }

  // Goal Status Update Methods
  updateGoalStatus(goal: any, newStatus: string) {
    const oldStatus = goal.status;
    
    // Update the goal status
    goal.status = newStatus;
    
    // Update progress based on status
    goal.progress = this.getProgressFromStatus(newStatus);
    
    // Update completion date if completed
    if (newStatus === 'Completed' && oldStatus !== 'Completed') {
      goal.completionDate = new Date();
    } else if (newStatus !== 'Completed') {
      goal.completionDate = null;
    }
    
    // Update in shared service
    this.sharedGoalService.updateGoalStatus(goal.goalId, newStatus);
    
    // In a real app, this would call goalService.updateGoal(goal)
    console.log('Goal status updated:', goal);
    
    // Update dashboard stats
    this.calculateGoalStats();
    
    // Show success message
    alert(`Goal status updated to ${newStatus}!`);
  }

  getProgressFromStatus(status: string): number {
    switch (status) {
      case 'Pending': return 0;
      case 'In Progress': return 50;
      case 'Completed': return 100;
      default: return 0;
    }
  }

  getGoalProgressPercentage(goal: any): number {
    // If goal has a progress property, use it; otherwise calculate from status
    if (goal.progress !== undefined) {
      return goal.progress;
    }
    return this.getProgressFromStatus(goal.status);
  }

  // Request Feedback Methods
  openRequestFeedbackModal() {
    this.showRequestFeedbackModal = true;
    this.requestFeedbackForm.reset();
    this.requestFeedbackForm.patchValue({
      anonymous: false
    });
  }

  closeRequestFeedbackModal() {
    this.showRequestFeedbackModal = false;
    this.requestFeedbackForm.reset();
  }

  submitFeedbackRequest() {
    if (this.requestFeedbackForm.valid) {
      const requestData = {
        ...this.requestFeedbackForm.value,
        requestId: Date.now(), // Mock ID - in real app, this would come from backend
        requesterId: this.currentEmployee?.employeeProfileId,
        requesterName: `${this.currentEmployee?.user.firstName} ${this.currentEmployee?.user.lastName}`,
        requestDate: new Date(),
        status: 'Pending'
      };

      // Mock save - in real app, this would call feedbackService.requestFeedback()
      console.log('Feedback request sent:', requestData);
      
      this.closeRequestFeedbackModal();
      
      // Show success message
      alert('Feedback request sent successfully!');
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.requestFeedbackForm.controls).forEach(key => {
        this.requestFeedbackForm.get(key)?.markAsTouched();
      });
    }
  }

  // Edit Profile Methods
  openEditProfileModal() {
    if (this.currentEmployee) {
      this.editProfileForm.patchValue({
        firstName: this.currentEmployee.user.firstName,
        lastName: this.currentEmployee.user.lastName,
        email: this.currentEmployee.user.email,
        designation: this.currentEmployee.designation,
        department: this.currentEmployee.department,
        currentProject: this.currentEmployee.currentProject,
        currentTeam: this.currentEmployee.currentTeam,
        skills: this.currentEmployee.skills?.join(', ')
      });
    }
    this.showEditProfileModal = true;
  }

  closeEditProfileModal() {
    this.showEditProfileModal = false;
    this.editProfileForm.reset();
  }

  submitEditProfile() {
    if (this.editProfileForm.valid && this.currentEmployee) {
      const formData = this.editProfileForm.value;
      
      // Update the current employee data
      this.currentEmployee.user.firstName = formData.firstName;
      this.currentEmployee.user.lastName = formData.lastName;
      this.currentEmployee.user.email = formData.email;
      this.currentEmployee.designation = formData.designation;
      this.currentEmployee.department = formData.department;
      this.currentEmployee.currentProject = formData.currentProject;
      this.currentEmployee.currentTeam = formData.currentTeam;
      this.currentEmployee.skills = formData.skills ? formData.skills.split(',').map((s: string) => s.trim()) : [];

      // Update shared service
      this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
      
      // Mock save - in real app, this would call employeeProfileService.updateProfile()
      console.log('Profile updated:', this.currentEmployee);
      
      this.closeEditProfileModal();
      
      // Show success message
      alert('Profile updated successfully!');
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.editProfileForm.controls).forEach(key => {
        this.editProfileForm.get(key)?.markAsTouched();
      });
    }
  }

}
