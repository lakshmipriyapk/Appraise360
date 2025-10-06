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
import { UserService } from '../../../service/user.service';
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
  backendAccessible = false;
  
  // Local storage keys
  private readonly LOCAL_GOALS_KEY = 'employee_goals';
  private readonly LOCAL_FEEDBACK_KEY = 'employee_feedback';
  private readonly LOCAL_PROFILE_KEY = 'employee_profile';

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
    private authService: AuthService,
    private userService: UserService
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

  loadCurrentUser() {
    // Get current user from AuthService
    this.authService.currentUser$.subscribe(user => {
      console.log('Current user from AuthService:', user);
      if (user) {
        // Try to load real data from backend first
        this.loadEmployeeProfileByUserId(user.userId || 0);
      } else {
        // No user found, stop loading immediately
        this.isLoading = false;
      }
    });
  }

  loadEmployeeProfileByUserId(userId: number) {
    console.log('=== LOADING EMPLOYEE PROFILE BY USER ID ===');
    console.log('User ID:', userId);
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Backend request timed out, creating basic profile');
      this.createBasicEmployeeProfile(userId);
    }, 5000); // 5 second timeout
    
    // Try to get the real employee profile from the backend
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (profiles) => {
        clearTimeout(timeoutId); // Clear timeout since we got a response
        console.log('=== ALL EMPLOYEE PROFILES FROM DATABASE ===');
        console.log('Total profiles found:', profiles.length);
        profiles.forEach((profile, index) => {
          console.log(`Profile ${index + 1}:`, {
            employeeProfileId: profile.employeeProfileId,
            userId: profile.user?.userId,
            fullName: profile.user?.fullName,
            email: profile.user?.email,
            username: profile.user?.username
          });
        });
        
        console.log('Looking for profile with user ID:', userId);
        
        // Find the profile for the current user - try multiple ways
        let userProfile = profiles.find(profile => profile.user?.userId === userId);
        
        // If not found by userId, try by employeeProfileId
        if (!userProfile) {
          console.log('Not found by userId, trying by employeeProfileId...');
          userProfile = profiles.find(profile => profile.employeeProfileId === userId);
        }
        
        // If still not found, try by username or email
        if (!userProfile) {
          console.log('Not found by employeeProfileId, trying by username/email...');
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            console.log('Current user from AuthService:', currentUser);
            userProfile = profiles.find(profile => 
              profile.user?.username === currentUser.username ||
              profile.user?.email === currentUser.email ||
              profile.user?.fullName === currentUser.fullName
            );
          }
        }
        
        if (userProfile) {
          console.log('✅ EMPLOYEE PROFILE FOUND IN DATABASE:', userProfile);
          console.log('Employee Name:', userProfile.user?.fullName);
          console.log('Employee Email:', userProfile.user?.email);
          console.log('Employee Profile ID:', userProfile.employeeProfileId);
          console.log('Department:', userProfile.department);
          console.log('Designation:', userProfile.designation);
          console.log('Skills:', userProfile.skills);
          console.log('Current Goals:', userProfile.currentGoals);
          console.log('Reporting Manager:', userProfile.reportingManager);
          console.log('Current Project:', userProfile.currentProject);
          console.log('Current Team:', userProfile.currentTeam);
          console.log('Date of Joining:', userProfile.dateOfJoining);
          console.log('Last Appraisal Rating:', userProfile.lastAppraisalRating);
          
          this.currentEmployee = userProfile;
          this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
          this.isLoading = false; // Stop loading
          
          // Load related data after profile is found
          this.loadRelatedData();
          
          // Ensure data filtering after a short delay
          setTimeout(() => {
            this.ensureDataFiltering();
          }, 500);
        } else {
          console.log('❌ NO EMPLOYEE PROFILE FOUND IN DATABASE');
          console.log('Creating basic profile for user ID:', userId);
          this.createBasicEmployeeProfile(userId);
        }
      },
      error: (error: any) => {
        clearTimeout(timeoutId); // Clear timeout since we got an error
        console.error('❌ ERROR LOADING EMPLOYEE PROFILES FROM BACKEND:', error);
        console.log('Creating basic profile as fallback...');
        this.createBasicEmployeeProfile(userId);
      }
    });
  }

  createBasicEmployeeProfile(userId: number) {
    const currentUser = this.authService.getCurrentUser();
    console.log('Creating basic employee profile for user:', currentUser);
    console.log('User ID:', userId);
    console.log('User fullName:', currentUser?.fullName);
    console.log('User firstName:', currentUser?.firstName);
    console.log('User lastName:', currentUser?.lastName);
    
    if (!currentUser) {
      console.error('No current user found, cannot create employee profile');
      this.isLoading = false; // Stop loading even if no user
      return;
    }
    
    // Create a basic employee profile with ONLY signup data
    // Leave other fields empty for employee to fill later
    this.currentEmployee = {
      employeeProfileId: userId,
      user: currentUser,
      department: '', // Empty - employee will fill
      designation: '', // Empty - employee will fill
      dateOfJoining: new Date().toISOString().split('T')[0], // Set as signup date
      reportingManager: '', // Empty - employee will fill
      currentProject: '', // Empty - employee will fill
      currentTeam: '', // Empty - employee will fill
      skills: '', // Empty - employee will fill
      currentGoals: '', // Empty - employee will fill
      lastAppraisalRating: 0 // Default
    };
    
    console.log('Created basic currentEmployee with only signup data:', this.currentEmployee);
    console.log('Employee name will be:', this.currentEmployee?.user?.fullName);
    console.log('User object details:', this.currentEmployee?.user);
    console.log('User fullName property:', this.currentEmployee?.user?.fullName);
    console.log('User username property:', this.currentEmployee?.user?.username);
    
    // Update the shared service with the current employee
    if (this.currentEmployee) {
      this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
    }
    
    // Always stop loading when creating basic profile
    this.isLoading = false;
    console.log('Loading stopped, dashboard should now be visible');
    
    // Load related data even for basic profile
    this.loadRelatedData();
    
    // Ensure data filtering after a short delay
    setTimeout(() => {
      this.ensureDataFiltering();
    }, 500);
  }

  refreshUserData() {
    const currentUser = this.authService.getCurrentUser();
    console.log('Refreshing user data - current user:', currentUser);
    
    if (currentUser && this.currentEmployee) {
      // Update the current employee with the latest user data
      this.currentEmployee.user = currentUser;
      this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
      console.log('Updated currentEmployee with latest user data:', this.currentEmployee);
    }
  }

  // Note: Removed helper methods that generated fake data
  // Now using real data from database or basic defaults

  private checkBackendConnectivity() {
    console.log('Checking backend connectivity...');
    
    // Try to make a simple API call to check if backend is accessible
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('✅ Backend is accessible, found', users.length, 'users');
        console.log('Sample user data:', users[0]);
        this.backendAccessible = true;
        this.errorMessage = ''; // Clear any previous error messages
        
        // Sync local data with backend when connection is restored
        this.syncLocalDataWithBackend();
      },
      error: (error: any) => {
        console.log('❌ Backend not accessible:', error);
        console.log('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: error.url
        });
        this.backendAccessible = false;
        
        // Don't set error message to prevent error page display
        // Just log the error for debugging
        console.log('Backend connectivity issue - continuing with local data');
      }
    });
  }

  // Method to manually test backend connectivity - disabled to prevent error page
  testBackendConnection() {
    console.log('Backend connectivity test disabled to prevent error page display');
  }

  // Alternative method to test direct backend connection - disabled to prevent error page
  testDirectBackendConnection() {
    console.log('Direct backend connection test disabled to prevent error page display');
  }

  // ===== EMPLOYEE PROFILE HELPER METHODS =====
  
  // Ensure employee profile exists in database before creating goals/feedback
  private ensureEmployeeProfileExists(): Promise<void> {
    if (!this.currentEmployee?.user?.userId) {
      return Promise.reject('No current employee found');
    }

    // If employee profile already has a database ID, it exists
    if (this.currentEmployee.employeeProfileId && this.currentEmployee.employeeProfileId < 1000000) {
      return Promise.resolve();
    }

    // Create employee profile in database
    return this.createEmployeeProfileInDatabase();
  }

  // Save goal locally when database operations fail
  private saveGoalLocally(newGoal: any) {
    const localGoal = {
      ...newGoal,
      goalId: Date.now(),
      createdDate: new Date().toISOString()
    };
    
    this.currentGoals.push(localGoal);
    this.sharedGoalService.addGoal(localGoal);
    this.closeGoalModal();
    this.calculateGoalStats();
    
    if (this.currentEmployee?.user?.userId) {
      this.saveGoalsToLocal(this.currentEmployee.user.userId);
    }
    
    alert('Goal saved locally. It will persist when you log in again.');
  }

  // Save feedback locally when database operations fail
  private saveFeedbackLocally(feedbackData: any) {
    const localFeedback = {
      ...feedbackData,
      feedbackId: Date.now(),
      createdDate: new Date().toISOString()
    };
    
    this.recentFeedback.push(localFeedback);
    this.closeSelfFeedbackModal();
    
    if (this.currentEmployee?.user?.userId) {
      this.saveFeedbackToLocal(this.currentEmployee.user.userId);
    }
    
    alert('Self feedback saved locally. It will persist when you log in again.');
  }

  // ===== LOCAL STORAGE METHODS =====
  
  // Load locally saved data when employee logs in
  private loadLocalData() {
    if (!this.currentEmployee?.user?.userId) {
      console.log('No current employee found, skipping local data load');
      return;
    }

    const userId = this.currentEmployee.user.userId;
    console.log('Loading local data for user:', userId);

    // Load local goals
    this.loadLocalGoals(userId);
    
    // Load local feedback
    this.loadLocalFeedback(userId);
    
    // Load local profile updates
    this.loadLocalProfile(userId);
  }

  // Load goals from localStorage
  private loadLocalGoals(userId: number) {
    try {
      const localGoals = localStorage.getItem(`${this.LOCAL_GOALS_KEY}_${userId}`);
      if (localGoals) {
        const goals = JSON.parse(localGoals);
        console.log('Loaded local goals:', goals.length);
        
        // Merge with existing goals (avoid duplicates)
        goals.forEach((localGoal: any) => {
          const exists = this.currentGoals.find(goal => goal.goalId === localGoal.goalId);
          if (!exists) {
            this.currentGoals.push(localGoal);
          }
        });
        
        // Update shared service
        this.currentGoals.forEach(goal => this.sharedGoalService.addGoal(goal));
        this.calculateGoalStats();
      }
    } catch (error) {
      console.error('Error loading local goals:', error);
    }
  }

  // Load feedback from localStorage
  private loadLocalFeedback(userId: number) {
    try {
      const localFeedback = localStorage.getItem(`${this.LOCAL_FEEDBACK_KEY}_${userId}`);
      if (localFeedback) {
        const feedback = JSON.parse(localFeedback);
        console.log('Loaded local feedback:', feedback.length);
        
        // Merge with existing feedback (avoid duplicates)
        feedback.forEach((localFeedbackItem: any) => {
          const exists = this.recentFeedback.find(fb => fb.feedbackId === localFeedbackItem.feedbackId);
          if (!exists) {
            this.recentFeedback.push(localFeedbackItem);
          }
        });
      }
    } catch (error) {
      console.error('Error loading local feedback:', error);
    }
  }

  // Load profile updates from localStorage
  private loadLocalProfile(userId: number) {
    try {
      const localProfile = localStorage.getItem(`${this.LOCAL_PROFILE_KEY}_${userId}`);
      if (localProfile && this.currentEmployee) {
        const profileUpdates = JSON.parse(localProfile);
        console.log('Loaded local profile updates:', profileUpdates);
        
        // Apply profile updates
        Object.assign(this.currentEmployee, profileUpdates);
        this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
      }
    } catch (error) {
      console.error('Error loading local profile:', error);
    }
  }

  // Save goals to localStorage
  private saveGoalsToLocal(userId: number) {
    try {
      localStorage.setItem(`${this.LOCAL_GOALS_KEY}_${userId}`, JSON.stringify(this.currentGoals));
      console.log('Goals saved to localStorage for user:', userId);
    } catch (error) {
      console.error('Error saving goals to localStorage:', error);
    }
  }

  // Save feedback to localStorage
  private saveFeedbackToLocal(userId: number) {
    try {
      localStorage.setItem(`${this.LOCAL_FEEDBACK_KEY}_${userId}`, JSON.stringify(this.recentFeedback));
      console.log('Feedback saved to localStorage for user:', userId);
    } catch (error) {
      console.error('Error saving feedback to localStorage:', error);
    }
  }

  // Save profile to localStorage
  private saveProfileToLocal(userId: number) {
    try {
      if (this.currentEmployee) {
        localStorage.setItem(`${this.LOCAL_PROFILE_KEY}_${userId}`, JSON.stringify(this.currentEmployee));
        console.log('Profile saved to localStorage for user:', userId);
      }
    } catch (error) {
      console.error('Error saving profile to localStorage:', error);
    }
  }

  // Sync local data with backend when connection is restored
  private syncLocalDataWithBackend() {
    if (!this.backendAccessible || !this.currentEmployee?.user?.userId) {
      return;
    }

    const userId = this.currentEmployee.user.userId;
    console.log('Syncing local data with backend for user:', userId);

    // Sync goals
    this.syncLocalGoalsWithBackend(userId);
    
    // Sync feedback
    this.syncLocalFeedbackWithBackend(userId);
  }

  // Sync local goals with backend
  private syncLocalGoalsWithBackend(userId: number) {
    const localGoals = this.currentGoals.filter(goal => (goal.goalId || 0) > 1000000); // Local goals have high IDs
    
    localGoals.forEach(goal => {
      this.goalService.createGoalWithEmployeeId(this.currentEmployee!.employeeProfileId || 0, goal).subscribe({
        next: (savedGoal) => {
          console.log('Local goal synced with backend:', savedGoal);
          // Update the goal with the real ID from backend
          const index = this.currentGoals.findIndex(g => g.goalId === goal.goalId);
          if (index !== -1) {
            this.currentGoals[index] = savedGoal;
          }
          this.saveGoalsToLocal(userId);
        },
        error: (error) => {
          console.error('Error syncing local goal with backend:', error);
        }
      });
    });
  }

  // Sync local feedback with backend
  private syncLocalFeedbackWithBackend(userId: number) {
    const localFeedback = this.recentFeedback.filter(feedback => (feedback.feedbackId || 0) > 1000000); // Local feedback has high IDs
    
    localFeedback.forEach(feedback => {
      this.feedbackService.createFeedbackWithIds(
        this.currentEmployee!.employeeProfileId || 0,
        this.currentEmployee!.user?.userId || 0,
        feedback
      ).subscribe({
        next: (savedFeedback) => {
          console.log('Local feedback synced with backend:', savedFeedback);
          // Update the feedback with the real ID from backend
          const index = this.recentFeedback.findIndex(f => f.feedbackId === feedback.feedbackId);
          if (index !== -1) {
            this.recentFeedback[index] = savedFeedback;
          }
          this.saveFeedbackToLocal(userId);
        },
        error: (error) => {
          console.error('Error syncing local feedback with backend:', error);
        }
      });
    });
  }

  ngOnInit() {
    console.log('=== EMPLOYEE DASHBOARD INITIALIZATION ===');
    console.log('Employee Dashboard ngOnInit - starting...');
    
    // Check backend connectivity first
    this.checkBackendConnectivity();
    
    // Clear any existing employee data first
    this.sharedEmployeeService.clearCurrentEmployee();
    
    // Load current user and employee data
    this.loadCurrentUserAndEmployeeData();
    
    // Safety timeout - force stop loading after 10 seconds
    setTimeout(() => {
      if (this.isLoading) {
        console.log('Safety timeout: Force stopping loading state');
        this.isLoading = false;
        
        // If still no employee data, create a basic one
        if (!this.currentEmployee) {
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            console.log('Creating basic employee profile due to timeout');
            this.createBasicEmployeeProfile(currentUser.userId || 0);
          }
        }
      }
    }, 10000); // 10 second safety timeout
  }

  // New method to load current user and employee data
  loadCurrentUserAndEmployeeData() {
    console.log('=== LOADING CURRENT USER AND EMPLOYEE DATA ===');
    
    // Get current user from auth service
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user from auth service:', currentUser);
    
    if (currentUser) {
      console.log('✅ Current user found:', currentUser.fullName);
      console.log('User ID:', currentUser.userId);
      console.log('User Email:', currentUser.email);
      console.log('User Role:', currentUser.role);
      
      // Load employee profile for this user
      this.loadEmployeeProfileByUserId(currentUser.userId || 0);
    } else {
      console.log('❌ No current user found in auth service');
      this.isLoading = false;
      this.errorMessage = 'No user logged in. Please login again.';
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Wait for current user to be loaded, then load related data
    this.authService.currentUser$.subscribe(user => {
      if (user && this.currentEmployee) {
        this.loadRelatedData();
      } else {
        // Don't use mock data - wait for real user data
        console.log('Waiting for real user data...');
        this.isLoading = false;
      }
    });
  }

  loadEmployeeData(userId: number) {
    // Try to get employee profile by user ID (this method might not exist)
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (profiles) => {
        // Find the profile for the current user
        const userProfile = profiles.find(profile => profile.user?.userId === userId);
        if (userProfile) {
          this.currentEmployee = userProfile;
          this.loadRelatedData();
        } else {
          // No employee profile found, don't use mock data
          console.log('No employee profile found for user');
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        console.error('Error loading employee profile:', error);
        // Don't use mock data when backend fails
        this.isLoading = false;
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
      skills: 'Angular, Spring Boot, TypeScript, Java, SQL',
      lastAppraisalRating: 4.2,
      currentGoals: 'Complete Angular Training, Deliver Q3 Project Milestone, Improve Code Review Skills',
      user: {
        userId: 1,
        username: 'john.doe',
        email: 'john.doe@company.com',
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1-555-0001',
        password: 'password123',
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
        employee: this.currentEmployee!
      },
      {
        goalId: 2,
        title: 'Deliver Q3 Project Milestone',
        description: 'Complete the performance appraisal system development',
        status: 'Completed',
        employee: this.currentEmployee!
      },
      {
        goalId: 3,
        title: 'Improve Code Review Skills',
        description: 'Participate in more code reviews and provide constructive feedback',
        status: 'Pending',
        employee: this.currentEmployee!
      }
    ];

    // Mock feedback data
    this.recentFeedback = [
      {
        feedbackId: 1,
        feedbackType: 'Admin Feedback',
        comments: 'Great progress on the recent project! Your Angular skills have improved significantly.',
        rating: 4,
        employee: this.currentEmployee!,
        reviewer: {
          userId: 2,
          username: 'admin.smith',
          email: 'admin.smith@company.com',
          fullName: 'Admin Smith',
          firstName: 'Admin',
          lastName: 'Smith',
          phoneNumber: '+1-555-0000',
          password: 'password123',
          role: 'Admin'
        }
      },
      {
        feedbackId: 2,
        feedbackType: 'Peer Feedback',
        comments: 'Very helpful during team meetings and always willing to share knowledge.',
        rating: 5,
        employee: this.currentEmployee!,
        reviewer: {
          userId: 3,
          username: 'peer.jones',
          email: 'peer.jones@company.com',
          fullName: 'Peer Jones',
          firstName: 'Peer',
          lastName: 'Jones',
          phoneNumber: '+1-555-0000',
          password: 'password123',
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
        cycleName: 'Q3 2024 Review',
        appraisalDate: '2024-09-15',
        periodStart: '2024-07-01',
        periodEnd: '2024-09-30',
        managerName: 'John Smith',
        reviewerRole: 'Admin',
        reviewDate: '2024-09-20',
        managerComments: 'Excellent performance this quarter. Shows great initiative and technical skills.',
        employee: this.currentEmployee!,
        reviewCycle: {
          cycleId: 1,
          cycleName: 'Q3 2024 Review',
          status: 'Completed',
          startDate: '2024-07-01',
          endDate: '2024-09-30',
          description: ''
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
      console.error('Cannot load related data: currentEmployee is null');
      this.isLoading = false;
      return;
    }

    console.log('=== LOADING EMPLOYEE-SPECIFIC DATA ===');
    console.log('Employee:', this.currentEmployee?.user?.fullName);
    console.log('Employee Profile ID:', this.currentEmployee.employeeProfileId);
    console.log('Employee User ID:', this.currentEmployee?.user?.userId);
    console.log('Employee Email:', this.currentEmployee?.user?.email);
    console.log('Employee Username:', this.currentEmployee?.user?.username);

    // Special logging for Lakshmipriya P K
    if (this.currentEmployee?.user?.fullName?.includes('Lakshmipriya')) {
      console.log('🎯 LAKSHMIPRIYA P K DETECTED - LOADING HER SPECIFIC DATA');
      console.log('Her Employee Profile ID:', this.currentEmployee.employeeProfileId);
      console.log('Her User ID:', this.currentEmployee?.user?.userId);
    }

    // Load goals from database (both self-created and manager-assigned)
    console.log('🎯 Loading goals for employee ID:', this.currentEmployee.employeeProfileId);
    this.goalService.getGoalsByEmployee(this.currentEmployee.employeeProfileId || 0).subscribe({
      next: (goals) => {
        console.log('✅ Goals loaded from database for employee:', goals.length);
        console.log('Goals:', goals.map(g => g.title));
        
        // Special logging for Lakshmipriya P K
        if (this.currentEmployee?.user?.fullName?.includes('Lakshmipriya')) {
          console.log('🎯 LAKSHMIPRIYA P K GOALS:', goals);
          goals.forEach(goal => {
            console.log(`  - ${goal.title} (Status: ${goal.status}, Priority: ${goal.priority})`);
          });
        }
        
        this.currentGoals = goals;
        // Update shared service with individual goals
        goals.forEach(goal => this.sharedGoalService.addGoal(goal));
        this.calculateGoalStats();
      },
      error: (error: any) => {
        console.error('❌ Error loading goals from database:', error);
        console.log('🔄 Falling back to load all goals and filter...');
        // Try to load all goals and filter by employee
        this.loadAllGoalsAndFilter();
      }
    });

    // Load feedback from database (both self and manager feedback)
    console.log('🎯 Loading feedback for employee ID:', this.currentEmployee.employeeProfileId);
    this.feedbackService.getFeedbacksByEmployee(this.currentEmployee.employeeProfileId || 0).subscribe({
      next: (feedback) => {
        console.log('✅ Feedback loaded from database for employee:', feedback.length);
        console.log('Feedback types:', feedback.map(f => f.feedbackType));
        
        // Special logging for Lakshmipriya P K
        if (this.currentEmployee?.user?.fullName?.includes('Lakshmipriya')) {
          console.log('🎯 LAKSHMIPRIYA P K FEEDBACK:', feedback);
          feedback.forEach(fb => {
            console.log(`  - ${fb.feedbackType} (Rating: ${fb.rating}, Comments: ${fb.comments?.substring(0, 50)}...)`);
          });
        }
        
        this.recentFeedback = feedback;
        this.dashboardStats.feedbackCount = feedback.length;
        
        // Find self feedback
        this.currentSelfFeedback = feedback.find(f => f.feedbackType === 'Self Assessment');
        if (this.currentSelfFeedback) {
          console.log('✅ Found self feedback for employee');
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading feedback from database:', error);
        console.log('🔄 Falling back to load all feedback and filter...');
        // Try to load all feedback and filter by employee
        this.loadAllFeedbackAndFilter();
      }
    });

    // Load appraisals from database
    console.log('🎯 Loading appraisals for employee ID:', this.currentEmployee.employeeProfileId);
    this.appraisalService.getAppraisalsByEmployee(this.currentEmployee.employeeProfileId || 0).subscribe({
      next: (appraisals) => {
        console.log('✅ Appraisals loaded from database for employee:', appraisals.length);
        console.log('Appraisals:', appraisals.map(a => `ID: ${a.appraisalId}, Status: ${a.status}`));
        
        // Special logging for Lakshmipriya P K
        if (this.currentEmployee?.user?.fullName?.includes('Lakshmipriya')) {
          console.log('🎯 LAKSHMIPRIYA P K APPRAISALS:', appraisals);
          appraisals.forEach(appraisal => {
            console.log(`  - Appraisal ID: ${appraisal.appraisalId} (Status: ${appraisal.status}, Rating: ${appraisal.managerRating})`);
          });
        }
        
        this.appraisals = appraisals;
        // Update shared service with individual appraisals
        appraisals.forEach(appraisal => this.sharedAppraisalService.addAppraisal(appraisal));
        this.calculateAppraisalStats();
      },
      error: (error: any) => {
        console.error('❌ Error loading appraisals from database:', error);
        console.log('🔄 Falling back to load all appraisals and filter...');
        // Try to load all appraisals and filter by employee
        this.loadAllAppraisalsAndFilter();
      }
    });

    // Set loading to false after all data loading is initiated
    this.isLoading = false;
  }

  // Fallback methods to load all data and filter by employee
  loadAllGoalsAndFilter() {
    this.goalService.getAllGoals().subscribe({
      next: (allGoals) => {
        console.log('=== LOADING ALL GOALS AND FILTERING ===');
        console.log('All goals from database:', allGoals.length);
        console.log('Current employee:', this.currentEmployee?.user?.fullName);
        console.log('Employee Profile ID:', this.currentEmployee?.employeeProfileId);
        console.log('Employee User ID:', this.currentEmployee?.user?.userId);
        
        // Enhanced filtering with multiple criteria
        this.currentGoals = allGoals.filter(goal => {
          const matchesEmployeeProfileId = goal.employee?.employeeProfileId === this.currentEmployee?.employeeProfileId;
          const matchesUserId = goal.employee?.user?.userId === this.currentEmployee?.user?.userId;
          const matchesEmail = goal.employee?.user?.email === this.currentEmployee?.user?.email;
          const matchesUsername = goal.employee?.user?.username === this.currentEmployee?.user?.username;
          
          const isMatch = matchesEmployeeProfileId || matchesUserId || matchesEmail || matchesUsername;
          
          if (isMatch) {
            console.log('✅ Goal matches employee:', goal.title);
          }
          
          return isMatch;
        });
        
        console.log('✅ Filtered goals for employee:', this.currentGoals.length);
        console.log('Goals:', this.currentGoals.map(g => g.title));
        this.calculateGoalStats();
      },
      error: (error) => {
        console.error('Error loading all goals:', error);
      }
    });
  }

  loadAllFeedbackAndFilter() {
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (allFeedback) => {
        console.log('=== LOADING ALL FEEDBACK AND FILTERING ===');
        console.log('All feedback from database:', allFeedback.length);
        console.log('Current employee:', this.currentEmployee?.user?.fullName);
        console.log('Employee Profile ID:', this.currentEmployee?.employeeProfileId);
        console.log('Employee User ID:', this.currentEmployee?.user?.userId);
        
        // Enhanced filtering with multiple criteria
        this.recentFeedback = allFeedback.filter(feedback => {
          const matchesEmployeeProfileId = feedback.employee?.employeeProfileId === this.currentEmployee?.employeeProfileId;
          const matchesUserId = feedback.employee?.user?.userId === this.currentEmployee?.user?.userId;
          const matchesEmail = feedback.employee?.user?.email === this.currentEmployee?.user?.email;
          const matchesUsername = feedback.employee?.user?.username === this.currentEmployee?.user?.username;
          const matchesReviewerId = feedback.reviewer?.userId === this.currentEmployee?.user?.userId;
          
          const isMatch = matchesEmployeeProfileId || matchesUserId || matchesEmail || matchesUsername || matchesReviewerId;
          
          if (isMatch) {
            console.log('✅ Feedback matches employee:', feedback.feedbackType, '-', feedback.comments?.substring(0, 50) + '...');
          }
          
          return isMatch;
        });
        
        console.log('✅ Filtered feedback for employee:', this.recentFeedback.length);
        console.log('Feedback types:', this.recentFeedback.map(f => f.feedbackType));
        this.dashboardStats.feedbackCount = this.recentFeedback.length;
        
        // Find self feedback
        this.currentSelfFeedback = this.recentFeedback.find(f => f.feedbackType === 'Self Assessment');
        if (this.currentSelfFeedback) {
          console.log('✅ Found self feedback for employee');
        }
      },
      error: (error) => {
        console.error('Error loading all feedback:', error);
      }
    });
  }

  loadAllAppraisalsAndFilter() {
    this.appraisalService.getAllAppraisals().subscribe({
      next: (allAppraisals) => {
        console.log('=== LOADING ALL APPRAISALS AND FILTERING ===');
        console.log('All appraisals from database:', allAppraisals.length);
        console.log('Current employee:', this.currentEmployee?.user?.fullName);
        console.log('Employee Profile ID:', this.currentEmployee?.employeeProfileId);
        console.log('Employee User ID:', this.currentEmployee?.user?.userId);
        
        // Enhanced filtering with multiple criteria
        this.appraisals = allAppraisals.filter(appraisal => {
          const matchesEmployeeProfileId = appraisal.employee?.employeeProfileId === this.currentEmployee?.employeeProfileId;
          const matchesUserId = appraisal.employee?.user?.userId === this.currentEmployee?.user?.userId;
          const matchesEmail = appraisal.employee?.user?.email === this.currentEmployee?.user?.email;
          const matchesUsername = appraisal.employee?.user?.username === this.currentEmployee?.user?.username;
          
          const isMatch = matchesEmployeeProfileId || matchesUserId || matchesEmail || matchesUsername;
          
          if (isMatch) {
            console.log('✅ Appraisal matches employee:', appraisal.appraisalId, '- Status:', appraisal.status);
          }
          
          return isMatch;
        });
        
        console.log('✅ Filtered appraisals for employee:', this.appraisals.length);
        console.log('Appraisals:', this.appraisals.map(a => `ID: ${a.appraisalId}, Status: ${a.status}`));
        this.calculateAppraisalStats();
      },
      error: (error) => {
        console.error('Error loading all appraisals:', error);
      }
    });
  }

  // Method to refresh all employee-specific data
  refreshEmployeeData() {
    console.log('=== REFRESHING ALL EMPLOYEE-SPECIFIC DATA ===');
    console.log('Current employee:', this.currentEmployee?.user?.fullName);
    
    if (!this.currentEmployee) {
      console.error('Cannot refresh data: currentEmployee is null');
      return;
    }
    
    // Clear existing data
    this.currentGoals = [];
    this.recentFeedback = [];
    this.appraisals = [];
    this.currentSelfFeedback = null;
    
    // Reload all data
    this.loadRelatedData();
  }

  // Method to ensure data is filtered correctly
  ensureDataFiltering() {
    console.log('=== ENSURING DATA FILTERING FOR EMPLOYEE ===');
    console.log('Current employee:', this.currentEmployee?.user?.fullName);
    
    if (!this.currentEmployee) {
      console.error('Cannot filter data: currentEmployee is null');
      return;
    }
    
    // Filter goals
    if (this.currentGoals.length > 0) {
      const originalGoalsCount = this.currentGoals.length;
      this.currentGoals = this.currentGoals.filter(goal => {
        const matchesEmployeeProfileId = goal.employee?.employeeProfileId === this.currentEmployee?.employeeProfileId;
        const matchesUserId = goal.employee?.user?.userId === this.currentEmployee?.user?.userId;
        const matchesEmail = goal.employee?.user?.email === this.currentEmployee?.user?.email;
        const matchesUsername = goal.employee?.user?.username === this.currentEmployee?.user?.username;
        
        return matchesEmployeeProfileId || matchesUserId || matchesEmail || matchesUsername;
      });
      console.log(`✅ Goals filtered: ${originalGoalsCount} → ${this.currentGoals.length}`);
    }
    
    // Filter feedback
    if (this.recentFeedback.length > 0) {
      const originalFeedbackCount = this.recentFeedback.length;
      this.recentFeedback = this.recentFeedback.filter(feedback => {
        const matchesEmployeeProfileId = feedback.employee?.employeeProfileId === this.currentEmployee?.employeeProfileId;
        const matchesUserId = feedback.employee?.user?.userId === this.currentEmployee?.user?.userId;
        const matchesEmail = feedback.employee?.user?.email === this.currentEmployee?.user?.email;
        const matchesUsername = feedback.employee?.user?.username === this.currentEmployee?.user?.username;
        const matchesReviewerId = feedback.reviewer?.userId === this.currentEmployee?.user?.userId;
        
        return matchesEmployeeProfileId || matchesUserId || matchesEmail || matchesUsername || matchesReviewerId;
      });
      console.log(`✅ Feedback filtered: ${originalFeedbackCount} → ${this.recentFeedback.length}`);
      
      // Update self feedback
      this.currentSelfFeedback = this.recentFeedback.find(f => f.feedbackType === 'Self Assessment');
    }
    
    // Filter appraisals
    if (this.appraisals.length > 0) {
      const originalAppraisalsCount = this.appraisals.length;
      this.appraisals = this.appraisals.filter(appraisal => {
        const matchesEmployeeProfileId = appraisal.employee?.employeeProfileId === this.currentEmployee?.employeeProfileId;
        const matchesUserId = appraisal.employee?.user?.userId === this.currentEmployee?.user?.userId;
        const matchesEmail = appraisal.employee?.user?.email === this.currentEmployee?.user?.email;
        const matchesUsername = appraisal.employee?.user?.username === this.currentEmployee?.user?.username;
        
        return matchesEmployeeProfileId || matchesUserId || matchesEmail || matchesUsername;
      });
      console.log(`✅ Appraisals filtered: ${originalAppraisalsCount} → ${this.appraisals.length}`);
    }
    
    // Recalculate stats
    this.calculateGoalStats();
    this.calculateAppraisalStats();
    this.dashboardStats.feedbackCount = this.recentFeedback.length;
  }

  calculateGoalStats() {
    this.dashboardStats.totalGoals = this.currentGoals.length;
    this.dashboardStats.completedGoals = this.currentGoals.filter(g => g.status === 'Completed').length;
    this.dashboardStats.pendingGoals = this.currentGoals.filter(g => g.status === 'Pending' || g.status === 'In Progress').length;
  }

  // Helper method to get skills as array
  getSkillsArray(): string[] {
    if (!this.currentEmployee) {
      console.log('❌ No current employee for skills');
      return [];
    }
    
    console.log('🔍 Getting skills for employee:', this.currentEmployee.user?.fullName);
    console.log('Raw skills data:', this.currentEmployee.skills);
    console.log('Skills type:', typeof this.currentEmployee.skills);
    
    if (Array.isArray(this.currentEmployee.skills)) {
      console.log('✅ Skills is already an array:', this.currentEmployee.skills);
      return this.currentEmployee.skills;
    } else if (typeof this.currentEmployee.skills === 'string' && this.currentEmployee.skills.trim()) {
      const skillsArray = this.currentEmployee.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      console.log('✅ Converted skills string to array:', skillsArray);
      return skillsArray;
    }
    
    console.log('❌ No valid skills found');
    return [];
  }

  // Helper method to get current goals as array
  getCurrentGoalsArray(): string[] {
    if (!this.currentEmployee) {
      console.log('❌ No current employee for goals');
      return [];
    }
    
    console.log('🔍 Getting current goals for employee:', this.currentEmployee.user?.fullName);
    console.log('Raw current goals data:', this.currentEmployee.currentGoals);
    console.log('Current goals type:', typeof this.currentEmployee.currentGoals);
    
    if (Array.isArray(this.currentEmployee.currentGoals)) {
      console.log('✅ Current goals is already an array:', this.currentEmployee.currentGoals);
      return this.currentEmployee.currentGoals;
    } else if (typeof this.currentEmployee.currentGoals === 'string' && this.currentEmployee.currentGoals.trim()) {
      const goalsArray = this.currentEmployee.currentGoals.split(',').map(goal => goal.trim()).filter(goal => goal.length > 0);
      console.log('✅ Converted current goals string to array:', goalsArray);
      return goalsArray;
    }
    
    console.log('❌ No valid current goals found');
    return [];
  }

  // Method to set test data for debugging
  setTestData() {
    console.log('=== SETTING TEST DATA FOR DEBUGGING ===');
    
    const testEmployee: EmployeeProfile = {
      employeeProfileId: 3,
      department: 'IT',
      designation: 'Full Stack Developer',
      dateOfJoining: '2023-02-10',
      reportingManager: 'Manager A',
      currentProject: 'Project Gamma',
      currentTeam: 'Team Alpha',
      skills: 'Vue.js, Python, PostgreSQL',
      currentGoals: 'Implement Feature Z',
      lastAppraisalRating: 4.0,
      user: {
        userId: 3,
        username: 'lakshmi123',
        email: 'lakshmipriya15042002@gmail.com',
        password: 'Lakshmi@2002',
        firstName: 'Lakshmipriya',
        lastName: 'P K',
        fullName: 'Lakshmipriya P K',
        phoneNumber: '8197757797',
        role: 'Employee'
      }
    };
    
    this.currentEmployee = testEmployee;
    this.isLoading = false;
    
    console.log('✅ Test data set:', testEmployee);
    console.log('Skills array:', this.getSkillsArray());
    console.log('Current goals array:', this.getCurrentGoalsArray());
  }

  // Method to debug profile section
  debugProfileSection() {
    console.log('=== DEBUGGING PROFILE SECTION ===');
    console.log('isLoading:', this.isLoading);
    console.log('currentEmployee:', this.currentEmployee);
    
    if (this.currentEmployee) {
      console.log('Employee Name:', this.currentEmployee.user?.fullName);
      console.log('Employee Email:', this.currentEmployee.user?.email);
      console.log('Employee Phone:', this.currentEmployee.user?.phoneNumber);
      console.log('Employee Username:', this.currentEmployee.user?.username);
      console.log('Department:', this.currentEmployee.department);
      console.log('Designation:', this.currentEmployee.designation);
      console.log('Date of Joining:', this.currentEmployee.dateOfJoining);
      console.log('Reporting Manager:', this.currentEmployee.reportingManager);
      console.log('Current Project:', this.currentEmployee.currentProject);
      console.log('Current Team:', this.currentEmployee.currentTeam);
      console.log('Skills:', this.currentEmployee.skills);
      console.log('Current Goals:', this.currentEmployee.currentGoals);
      console.log('Last Appraisal Rating:', this.currentEmployee.lastAppraisalRating);
      
      console.log('Skills Array:', this.getSkillsArray());
      console.log('Current Goals Array:', this.getCurrentGoalsArray());
      
      console.log('Dashboard Stats:', this.dashboardStats);
    } else {
      console.log('❌ No current employee found');
    }
  }

  calculateAppraisalStats() {
    if (this.appraisals.length > 0) {
      const latestAppraisal = this.appraisals[this.appraisals.length - 1];
      this.dashboardStats.lastAppraisalRating = latestAppraisal.managerRating || 0;
      
      const totalRating = this.appraisals.reduce((sum, appraisal) => sum + (appraisal.managerRating || 0), 0);
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
    if (this.selfFeedbackForm.valid && this.currentEmployee) {
      const formData = this.selfFeedbackForm.value;
      
      const feedbackData: any = {
        feedbackId: 0, // Will be set by backend
        feedbackType: 'Self Assessment',
        comments: formData.comments,
        rating: formData.rating,
        achievements: formData.achievements,
        challenges: formData.challenges,
        improvements: formData.improvements,
        employee: { employeeProfileId: this.currentEmployee.employeeProfileId }, // Send only ID
        reviewer: { userId: this.currentEmployee?.user?.userId } // Send only ID
      };

      console.log('Saving self feedback to database:', feedbackData);

      // First ensure employee profile exists, then create feedback
      if (!this.currentEmployee.employeeProfileId) {
        console.log('Employee profile not created yet, creating it first...');
        this.createEmployeeProfileInDatabase().then(() => {
          this.createFeedbackWithEmployeeProfile(feedbackData);
        });
      } else {
        this.createFeedbackWithEmployeeProfile(feedbackData);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.selfFeedbackForm.controls).forEach(key => {
        this.selfFeedbackForm.get(key)?.markAsTouched();
      });
    }
  }

  private createFeedbackWithEmployeeProfile(feedbackData: any) {
    if (!this.currentEmployee) {
      console.error('No current employee found');
      return;
    }

    // Ensure employee profile exists in database first
    this.ensureEmployeeProfileExists().then(() => {
    // Save to database using employee and reviewer IDs
    this.feedbackService.createFeedbackWithIds(
        this.currentEmployee!.employeeProfileId || 0,
        this.currentEmployee!.user?.userId || 0,
      feedbackData
    ).subscribe({
      next: (savedFeedback: any) => {
          console.log('Self feedback saved successfully to database:', savedFeedback);
          
          // Add to local feedback list
          this.recentFeedback.push(savedFeedback);
          
          // Update shared service
          if (this.currentEmployee) {
            this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
          }

          // Close modal and reset form
          this.closeSelfFeedbackModal();
          
          // Show success message
          alert('Self feedback saved to database successfully!');
        },
      error: (error: any) => {
          console.error('Error saving self feedback to database:', error);
          console.log('Error details:', error);
          
          // Check if it's a connection error
          if (error.status === 0 || error.status === 404) {
            console.log('Backend not accessible, saving locally only');
            
            // Create a local feedback with generated ID
            const localFeedback = {
              ...feedbackData,
              feedbackId: Date.now(), // Generate a temporary ID
              createdDate: new Date().toISOString()
            };
            
            // Add to local feedback list
            this.recentFeedback.push(localFeedback);
            
            // Update shared service
            if (this.currentEmployee) {
              this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
            }

            // Close modal and reset form
            this.closeSelfFeedbackModal();
            
            alert('Self feedback saved locally. Backend service is temporarily unavailable.');
          } else {
            console.log('Database error, but saving locally');
            
            // Create a local feedback with generated ID
            const localFeedback = {
              ...feedbackData,
              feedbackId: Date.now(), // Generate a temporary ID
              createdDate: new Date().toISOString()
            };
            
            // Add to local feedback list
            this.recentFeedback.push(localFeedback);
          
          // Save to localStorage for persistence
          if (this.currentEmployee?.user?.userId) {
            this.saveFeedbackToLocal(this.currentEmployee.user.userId);
          }
            
            // Update shared service
            if (this.currentEmployee) {
              this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
            }

            // Close modal and reset form
            this.closeSelfFeedbackModal();
            
          alert('Database save failed, but self feedback saved locally. It will persist when you log in again.');
          }
        }
      });
    }).catch((error: any) => {
      console.error('Error ensuring employee profile exists:', error);
      // Fall back to local save
      this.saveFeedbackLocally(feedbackData);
    });
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
      
      const newGoal: any = {
        goalId: 0, // Will be set by backend
        title: formData.title,
        description: formData.description,
        status: 'Pending',
        priority: formData.priority,
        startDate: new Date().toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        targetDate: new Date(formData.targetDate).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        progress: 0,
        createdBy: 'self',
        category: formData.category,
        appraisal: null
      };

      console.log('Saving goal to database:', newGoal);

      // First ensure employee profile exists, then create goal
      if (!this.currentEmployee.employeeProfileId) {
        console.log('Employee profile not created yet, creating it first...');
        this.createEmployeeProfileInDatabase().then(() => {
          this.createGoalWithEmployeeProfile(newGoal);
        });
      } else {
        this.createGoalWithEmployeeProfile(newGoal);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.goalForm.controls).forEach(key => {
        this.goalForm.get(key)?.markAsTouched();
      });
    }
  }

  private createGoalWithEmployeeProfile(newGoal: any) {
    if (!this.currentEmployee) {
      console.error('No current employee found');
      return;
    }

    // Ensure employee profile exists in database first
    this.ensureEmployeeProfileExists().then(() => {
    // Save to database using employee ID
      this.goalService.createGoalWithEmployeeId(this.currentEmployee!.employeeProfileId || 0, newGoal).subscribe({
      next: (savedGoal: any) => {
          console.log('Goal saved successfully to database:', savedGoal);
          
          // Add to local goals list
          this.currentGoals.push(savedGoal);
          
          // Add to shared service
          this.sharedGoalService.addGoal(savedGoal);
          
          // Close modal and reset form
          this.closeGoalModal();
          
          // Update dashboard stats
          this.calculateGoalStats();
          
          // Show success message
          alert('Goal saved to database successfully!');
        },
        error: (error: any) => {
          console.error('Error saving goal to database:', error);
          console.log('Error details:', error);
          
          // Check if it's a connection error or server error
          if (error.status === 0 || error.status === 404 || error.status === 500) {
            console.log('Backend not accessible, saving locally only');
            
            // Create a local goal with generated ID
            const localGoal = {
              ...newGoal,
              goalId: Date.now(), // Generate a temporary ID
              createdDate: new Date().toISOString()
            };
            
            // Add to local goals list
            this.currentGoals.push(localGoal);
            
            // Add to shared service
            this.sharedGoalService.addGoal(localGoal);
            
            // Close modal and reset form
            this.closeGoalModal();
            
            // Update dashboard stats
            this.calculateGoalStats();
            
            alert('Goal saved locally. Backend service is temporarily unavailable.');
          } else {
            console.log('Database error, but saving locally');
            
            // Create a local goal with generated ID
            const localGoal = {
              ...newGoal,
              goalId: Date.now(), // Generate a temporary ID
              createdDate: new Date().toISOString()
            };
            
            // Add to local goals list
            this.currentGoals.push(localGoal);
            
            // Add to shared service
            this.sharedGoalService.addGoal(localGoal);
          
          // Save to localStorage for persistence
          if (this.currentEmployee?.user?.userId) {
            this.saveGoalsToLocal(this.currentEmployee.user.userId);
          }
            
            // Close modal and reset form
            this.closeGoalModal();
            
            // Update dashboard stats
            this.calculateGoalStats();
            
          alert('Database save failed, but goal saved locally. It will persist when you log in again.');
          }
        }
      });
    }).catch((error: any) => {
      console.error('Error ensuring employee profile exists:', error);
      // Fall back to local save
      this.saveGoalLocally(newGoal);
    });
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
    
    console.log('Saving goal status update to database:', goal);

    // Save to database
    this.goalService.updateGoal(goal.goalId || 0, goal).subscribe({
      next: (updatedGoal: any) => {
        console.log('Goal status updated successfully in database:', updatedGoal);
        
        // Update in shared service
        this.sharedGoalService.updateGoalStatus(goal.goalId, newStatus);
        
        // Update dashboard stats
        this.calculateGoalStats();
        
        // Show success message
        alert(`Goal status updated to ${newStatus} and saved to database!`);
      },
      error: (error: any) => {
        console.error('Error updating goal status in database:', error);
        alert('Failed to update goal status. Please try again.');
      }
    });
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
    if (this.requestFeedbackForm.valid && this.currentEmployee) {
      const formData = this.requestFeedbackForm.value;
      
      const requestData = {
        requestId: 0, // Will be set by backend
        requesterId: this.currentEmployee.employeeProfileId,
        requesterName: this.currentEmployee?.user?.fullName,
        requestee: formData.requestee,
        feedbackType: formData.feedbackType,
        message: formData.message,
        deadline: formData.deadline,
        anonymous: formData.anonymous,
        requestDate: new Date().toISOString(),
        status: 'Pending'
      };

      console.log('Saving feedback request to database:', requestData);

      // For now, we'll create a feedback entry for the request
      // In a real app, you might have a separate FeedbackRequest entity
      const feedbackData: any = {
        feedbackId: 0, // Will be set by backend
        feedbackType: `Request: ${formData.feedbackType}`,
        comments: `Feedback request: ${formData.message}`,
        rating: 0, // No rating for requests
        employee: { employeeProfileId: this.currentEmployee.employeeProfileId }, // Send only ID
        reviewer: { userId: this.currentEmployee?.user?.userId }, // Send only ID
        createdDate: new Date().toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        status: 'Requested'
      };

      // Save to database
      this.feedbackService.createFeedback(feedbackData).subscribe({
        next: (savedFeedback: any) => {
          console.log('Feedback request saved successfully to database:', savedFeedback);
          
          // Add to local feedback list
          this.recentFeedback.push(savedFeedback);
          
          // Close modal and reset form
          this.closeRequestFeedbackModal();
          
          // Show success message
          alert('Feedback request saved to database successfully!');
        },
        error: (error: any) => {
          console.error('Error saving feedback request to database:', error);
          console.log('Error details:', error);
          
          // Check if it's a connection error
          if (error.status === 0 || error.status === 404) {
            console.log('Backend not accessible, saving locally only');
            
            // Create a local feedback with generated ID
            const localFeedback = {
              ...feedbackData,
              feedbackId: Date.now(), // Generate a temporary ID
              createdDate: new Date().toISOString()
            };
            
            // Add to local feedback list
            this.recentFeedback.push(localFeedback);
            
            // Close modal and reset form
            this.closeRequestFeedbackModal();
            
            alert('Backend not accessible. Feedback request saved locally only.');
          } else {
            console.log('Database error, but saving locally');
            
            // Create a local feedback with generated ID
            const localFeedback = {
              ...feedbackData,
              feedbackId: Date.now(), // Generate a temporary ID
              createdDate: new Date().toISOString()
            };
            
            // Add to local feedback list
            this.recentFeedback.push(localFeedback);
            
            // Close modal and reset form
            this.closeRequestFeedbackModal();
            
            alert('Database save failed, but feedback request saved locally.');
          }
        }
      });
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
      // Split fullName into firstName and lastName for the form
      const nameParts = this.currentEmployee?.user?.fullName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      this.editProfileForm.patchValue({
        firstName: firstName,
        lastName: lastName,
        email: this.currentEmployee?.user?.email,
        designation: this.currentEmployee.designation,
        department: this.currentEmployee.department,
        currentProject: this.currentEmployee.currentProject,
        currentTeam: this.currentEmployee.currentTeam,
        skills: this.currentEmployee.skills || ''
      });
    }
    this.showEditProfileModal = true;
  }

  closeEditProfileModal() {
    this.showEditProfileModal = false;
    this.editProfileForm.reset();
  }

  submitEditProfile() {
    console.log('=== PROFILE FORM SUBMISSION ===');
    console.log('Form valid:', this.editProfileForm.valid);
    console.log('Form errors:', this.editProfileForm.errors);
    console.log('Current employee:', this.currentEmployee);
    console.log('Form value:', this.editProfileForm.value);
    
    if (this.editProfileForm.valid && this.currentEmployee) {
      const formData = this.editProfileForm.value;
      
      // Update the current employee data
      this.currentEmployee!.user!.fullName = `${formData.firstName} ${formData.lastName}`.trim();
      this.currentEmployee!.user!.email = formData.email;
      this.currentEmployee.designation = formData.designation;
      this.currentEmployee.department = formData.department;
      this.currentEmployee.currentProject = formData.currentProject;
      this.currentEmployee.currentTeam = formData.currentTeam;
      this.currentEmployee.skills = formData.skills ? formData.skills.split(',').map((s: string) => s.trim()) : [];

      console.log('Saving employee profile to database:', this.currentEmployee);

      // Prepare payload compatible with backend (string fields + userId only)
      const updatePayload: any = {
        employeeProfileId: this.currentEmployee.employeeProfileId,
        department: this.currentEmployee.department,
        designation: this.currentEmployee.designation,
        dateOfJoining: this.currentEmployee.dateOfJoining,
        reportingManager: this.currentEmployee.reportingManager,
        currentProject: this.currentEmployee.currentProject,
        currentTeam: this.currentEmployee.currentTeam,
        // Send arrays; backend maps List<String> and stores as comma-separated internally
        skills: Array.isArray(this.currentEmployee.skills)
          ? this.currentEmployee.skills
          : ((this.currentEmployee as any).skills ? String((this.currentEmployee as any).skills).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []),
        lastAppraisalRating: this.currentEmployee.lastAppraisalRating,
        currentGoals: Array.isArray(this.currentEmployee.currentGoals)
          ? this.currentEmployee.currentGoals
          : ((this.currentEmployee as any).currentGoals ? String((this.currentEmployee as any).currentGoals).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []),
        user: { userId: this.currentEmployee?.user?.userId }
      };

      // Save to database
      this.employeeProfileService.updateProfile(this.currentEmployee!.employeeProfileId || 0, updatePayload).subscribe({
        next: (updatedProfile: any) => {
          console.log('Profile saved successfully to database:', updatedProfile);
          
          // Update local data with the response from database
          this.currentEmployee = updatedProfile;
          
          // Update shared service
          if (this.currentEmployee) {
          this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
          }

          // Close modal and reset form
          this.closeEditProfileModal();
          
          // Show success message
          alert('Profile updated and saved to database successfully!');
        },
        error: (error: any) => {
          console.error('Error saving profile to database:', error);
          console.log('Error details:', error);
          
          // If update fails, try to create new profile
          console.log('Update failed, trying to create new profile...');
          this.createEmployeeProfileInDatabase().then(() => {
            console.log('Profile created successfully after update failed');
            alert('Profile created and saved to database successfully!');
          }).catch((createError: any) => {
            console.error('Error creating profile:', createError);
            
            // Check if it's a connection error or server error
            if (error.status === 0) {
              console.log('Backend not accessible (network), saving locally only');
              // Save to localStorage for persistence
              if (this.currentEmployee?.user?.userId) {
                this.saveProfileToLocal(this.currentEmployee.user.userId);
              }
              alert('Profile updated locally. Backend service is temporarily unavailable.');
            } else {
              console.log('Server responded with error; saving locally as fallback');
              // Save to localStorage for persistence
              if (this.currentEmployee?.user?.userId) {
                this.saveProfileToLocal(this.currentEmployee.user.userId);
              }
              alert('Profile updated locally. Server rejected the request.');
            }
            
            // Even if database save fails, update local data
            if (this.currentEmployee) {
              this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
            }
            this.closeEditProfileModal();
          });
        }
      });
    } else {
      console.log('Form is invalid or no current employee');
      console.log('Form valid:', this.editProfileForm.valid);
      console.log('Current employee exists:', !!this.currentEmployee);
      
      // Log individual field errors
      Object.keys(this.editProfileForm.controls).forEach(key => {
        const control = this.editProfileForm.get(key);
        if (control && control.errors) {
          console.log(`Field ${key} errors:`, control.errors);
        }
      });
      
      // Mark all fields as touched to show validation errors
      Object.keys(this.editProfileForm.controls).forEach(key => {
        this.editProfileForm.get(key)?.markAsTouched();
      });
    }
  }

  private ensureBackendUserExists(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      if (!this.currentEmployee?.user?.userId) {
        return reject('No current user id');
      }

      const userId = this.currentEmployee.user.userId;

      // First try to fetch user by id
      this.userService.getUserById(userId).subscribe({
        next: () => {
          resolve(userId);
        },
        error: () => {
          // If not found, create the user from currentEmployee data
          const u = this.currentEmployee!.user as any;
          const payload = {
            username: u.username || u.email?.split('@')[0] || `user_${Date.now()}`,
            email: u.email,
            fullName: u.fullName,
            firstName: u.firstName,
            lastName: u.lastName,
            phoneNumber: u.phoneNumber,
            password: u.password || 'password123',
            role: u.role || 'Employee'
          } as any;

          this.userService.createUser(payload).subscribe({
            next: (created: any) => {
              // Update local reference with created id
              this.currentEmployee!.user!.userId = created.userId;
              resolve(created.userId);
            },
            error: (err) => reject(err)
          });
        }
      });
    });
  }

  private createEmployeeProfileInDatabase(): Promise<void> {
    if (!this.currentEmployee) {
      return Promise.reject('No current employee');
    }
    
    console.log('Creating new employee profile in database...');
    
    return new Promise<void>((resolve, reject) => {
      // Ensure backend user exists first
      this.ensureBackendUserExists().then((backendUserId: number) => {
        // Prepare payload, converting arrays to comma-separated strings for backend model
        const profileData = {
          department: this.currentEmployee!.department,
          designation: this.currentEmployee!.designation,
          dateOfJoining: this.currentEmployee!.dateOfJoining,
          reportingManager: this.currentEmployee!.reportingManager,
          currentProject: this.currentEmployee!.currentProject,
          currentTeam: this.currentEmployee!.currentTeam,
          // Send arrays; backend converts to comma-separated string
          skills: Array.isArray(this.currentEmployee!.skills)
            ? this.currentEmployee!.skills
            : ((this.currentEmployee as any).skills ? String((this.currentEmployee as any).skills).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []),
          lastAppraisalRating: this.currentEmployee!.lastAppraisalRating,
          currentGoals: Array.isArray(this.currentEmployee!.currentGoals)
            ? this.currentEmployee!.currentGoals
            : ((this.currentEmployee as any).currentGoals ? String((this.currentEmployee as any).currentGoals).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []),
          user: { userId: backendUserId }
        } as any;

        this.employeeProfileService.createProfileForUser(backendUserId, profileData).subscribe({
          next: (createdProfile: any) => {
            console.log('New profile created successfully:', createdProfile);
            this.currentEmployee = createdProfile;
            if (this.currentEmployee) {
              this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
            }
            this.closeEditProfileModal();
            alert('Profile created and saved to database successfully!');
            resolve();
          },
          error: (error: any) => {
            console.error('Error creating profile in database:', error);
            // Save locally as fallback
            if (this.currentEmployee?.user?.userId) {
              this.saveProfileToLocal(this.currentEmployee.user.userId);
            }
            this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
            this.closeEditProfileModal();
            alert('Profile updated locally (database save failed)');
            reject(error);
          }
        });
      }).catch((err) => {
        console.error('Failed ensuring backend user exists:', err);
        reject(err);
      });
    });
  }

}
