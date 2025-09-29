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
        this.loadEmployeeProfileByUserId(user.userId);
      } else {
        // No user found, stop loading immediately
        this.isLoading = false;
      }
    });
  }

  loadEmployeeProfileByUserId(userId: number) {
    console.log('Loading employee profile for user ID:', userId);
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Backend request timed out, creating basic profile');
      this.createBasicEmployeeProfile(userId);
    }, 2000); // 2 second timeout
    
    // Try to get the real employee profile from the backend
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (profiles) => {
        clearTimeout(timeoutId); // Clear timeout since we got a response
        console.log('Received profiles from backend:', profiles);
        
        // Find the profile for the current user
        const userProfile = profiles.find(profile => profile.user.userId === userId);
        if (userProfile) {
          console.log('Found employee profile in database:', userProfile);
          this.currentEmployee = userProfile;
          this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
          this.isLoading = false; // Stop loading
        } else {
          console.log('No employee profile found in database, creating basic profile');
          this.createBasicEmployeeProfile(userId);
        }
      },
      error: (error: any) => {
        clearTimeout(timeoutId); // Clear timeout since we got an error
        console.error('Error loading employee profiles from backend:', error);
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
      skills: [], // Empty - employee will fill
      currentGoals: [], // Empty - employee will fill
      lastAppraisalRating: 0 // Default
    };
    
    console.log('Created basic currentEmployee with only signup data:', this.currentEmployee);
    console.log('Employee name will be:', this.currentEmployee.user.fullName);
    console.log('User object details:', this.currentEmployee.user);
    console.log('User fullName property:', this.currentEmployee.user.fullName);
    console.log('User username property:', this.currentEmployee.user.username);
    
    // Update the shared service with the current employee
    if (this.currentEmployee) {
      this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
    }
    
    // Always stop loading when creating basic profile
    this.isLoading = false;
    console.log('Loading stopped, dashboard should now be visible');
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
        
        if (error.status === 0) {
          console.log('Backend server is not running or not accessible');
          this.errorMessage = 'Backend server is not running. Please start the Spring Boot application on port 8080.';
        } else if (error.status === 404) {
          console.log('Backend endpoint not found');
          this.errorMessage = 'Backend endpoint not found. Please check the API configuration.';
        } else if (error.status === 200 && error.message.includes('parsing')) {
          console.log('JSON parsing error');
          this.errorMessage = 'Backend returned invalid JSON response. Please check the backend configuration.';
        } else {
          console.log('Backend error:', error.status, error.message);
          this.errorMessage = `Backend error: ${error.status} - ${error.message}`;
        }
      }
    });
  }

  // Method to manually test backend connectivity
  testBackendConnection() {
    console.log('Manual backend connectivity test...');
    this.checkBackendConnectivity();
  }

  // Alternative method to test direct backend connection
  testDirectBackendConnection() {
    console.log('Testing direct backend connection...');
    
    // Test direct connection to backend
    fetch('http://localhost:8080/api/users')
      .then(response => {
        console.log('Direct fetch response status:', response.status);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      })
      .then(data => {
        console.log('✅ Direct backend connection successful!');
        console.log('Users found:', data.length);
        console.log('Sample user:', data[0]);
        this.backendAccessible = true;
        this.errorMessage = '';
        
        // Sync local data with backend when connection is restored
        this.syncLocalDataWithBackend();
        
        alert('✅ Backend connection successful! Found ' + data.length + ' users. Local data will be synced.');
      })
      .catch(error => {
        console.error('❌ Direct backend connection failed:', error);
        this.backendAccessible = false;
        this.errorMessage = 'Direct backend connection failed: ' + error.message;
        alert('❌ Backend connection failed: ' + error.message);
      });
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
    const localGoals = this.currentGoals.filter(goal => goal.goalId > 1000000); // Local goals have high IDs
    
    localGoals.forEach(goal => {
      this.goalService.createGoalWithEmployeeId(this.currentEmployee!.employeeProfileId, goal).subscribe({
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
    const localFeedback = this.recentFeedback.filter(feedback => feedback.feedbackId > 1000000); // Local feedback has high IDs
    
    localFeedback.forEach(feedback => {
      this.feedbackService.createFeedbackWithIds(
        this.currentEmployee!.employeeProfileId,
        this.currentEmployee!.user.userId,
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
    console.log('Employee Dashboard ngOnInit - starting...');
    
    // Check backend connectivity first
    this.checkBackendConnectivity();
    
    // Clear any existing employee data first
    this.sharedEmployeeService.clearCurrentEmployee();
    this.loadCurrentUser();
    this.loadDashboardData();
    
    // Load locally saved data
    this.loadLocalData();
    
    // Force refresh user data to ensure we have the latest
    setTimeout(() => {
      this.refreshUserData();
    }, 100);
    
    // Safety timeout - force stop loading after 5 seconds no matter what
    setTimeout(() => {
      if (this.isLoading) {
        console.log('Safety timeout: Force stopping loading state');
        this.isLoading = false;
        
        // If still no employee data, create a basic one
        if (!this.currentEmployee) {
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            this.createBasicEmployeeProfile(currentUser.userId);
          }
        }
      }
    }, 5000); // 5 second safety timeout
    
    // Don't use shared service data - only use real logged-in user data
    // this.sharedEmployeeService.currentEmployee$.subscribe(employee => {
    //   console.log('Shared service employee data:', employee);
    //   console.log('Current employee before check:', this.currentEmployee);
    //   if (employee && !this.currentEmployee) {
    //     // Only use shared employee data if we don't have current user data
    //     console.log('Using shared employee data:', employee);
    //     this.currentEmployee = employee;
    //   }
    // });
    
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
        const userProfile = profiles.find(profile => profile.user.userId === userId);
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
      skills: ['Angular', 'Spring Boot', 'TypeScript', 'Java', 'SQL'],
      lastAppraisalRating: 4.2,
      currentGoals: ['Complete Angular Training', 'Deliver Q3 Project Milestone', 'Improve Code Review Skills'],
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
        feedbackType: 'Admin Feedback',
        comments: 'Great progress on the recent project! Your Angular skills have improved significantly.',
        rating: 4,
        employee: this.currentEmployee,
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
        employee: this.currentEmployee,
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
      console.error('Cannot load related data: currentEmployee is null');
      this.isLoading = false;
      return;
    }

    console.log('Loading related data from database for employee:', this.currentEmployee.user.fullName);

    // Load goals from database (both self-created and manager-assigned)
    this.goalService.getGoalsByEmployeeId(this.currentEmployee.employeeProfileId).subscribe({
      next: (goals) => {
        console.log('Goals loaded from database:', goals);
        this.currentGoals = goals;
        // Update shared service with individual goals
        goals.forEach(goal => this.sharedGoalService.addGoal(goal));
        this.calculateGoalStats();
      },
      error: (error: any) => {
        console.error('Error loading goals from database:', error);
        this.errorMessage = 'Failed to load goals.';
      }
    });

    // Load feedback from database (both self and manager feedback)
    this.feedbackService.getFeedbacksByEmployeeId(this.currentEmployee.employeeProfileId).subscribe({
      next: (feedback) => {
        console.log('Feedback loaded from database:', feedback);
        this.recentFeedback = feedback;
        this.calculateGoalStats();
      },
      error: (error: any) => {
        console.error('Error loading feedback from database:', error);
        this.errorMessage = 'Failed to load feedback.';
      }
    });

    // Load appraisals from database
    this.appraisalService.getAppraisalsByEmployeeId(this.currentEmployee.employeeProfileId).subscribe({
      next: (appraisals) => {
        console.log('Appraisals loaded from database:', appraisals);
        this.appraisals = appraisals;
        // Update shared service with individual appraisals
        appraisals.forEach(appraisal => this.sharedAppraisalService.addAppraisal(appraisal));
        this.calculateAppraisalStats();
      },
      error: (error: any) => {
        console.error('Error loading appraisals from database:', error);
        this.errorMessage = 'Failed to load appraisals.';
      }
    });

    // Set loading to false after all data loading is initiated
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
        reviewer: { userId: this.currentEmployee.user.userId } // Send only ID
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
        this.currentEmployee!.employeeProfileId,
        this.currentEmployee!.user.userId,
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
            
            alert('Backend not accessible. Self feedback saved locally only.');
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
      this.goalService.createGoalWithEmployeeId(this.currentEmployee!.employeeProfileId, newGoal).subscribe({
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
          
          // Check if it's a connection error
          if (error.status === 0 || error.status === 404) {
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
            
            alert('Backend not accessible. Goal saved locally only.');
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
    this.goalService.updateGoal(goal).subscribe({
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
        requesterName: this.currentEmployee.user.fullName,
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
        reviewer: { userId: this.currentEmployee.user.userId }, // Send only ID
        createdDate: new Date().toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        status: 'Requested'
      };

      // Save to database
      this.feedbackService.createSelfFeedback(feedbackData).subscribe({
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
      const nameParts = this.currentEmployee.user.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      this.editProfileForm.patchValue({
        firstName: firstName,
        lastName: lastName,
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
    console.log('=== PROFILE FORM SUBMISSION ===');
    console.log('Form valid:', this.editProfileForm.valid);
    console.log('Form errors:', this.editProfileForm.errors);
    console.log('Current employee:', this.currentEmployee);
    console.log('Form value:', this.editProfileForm.value);
    
    if (this.editProfileForm.valid && this.currentEmployee) {
      const formData = this.editProfileForm.value;
      
      // Update the current employee data
      this.currentEmployee.user.fullName = `${formData.firstName} ${formData.lastName}`.trim();
      this.currentEmployee.user.email = formData.email;
      this.currentEmployee.designation = formData.designation;
      this.currentEmployee.department = formData.department;
      this.currentEmployee.currentProject = formData.currentProject;
      this.currentEmployee.currentTeam = formData.currentTeam;
      this.currentEmployee.skills = formData.skills ? formData.skills.split(',').map((s: string) => s.trim()) : [];

      console.log('Saving employee profile to database:', this.currentEmployee);

      // Save to database
      this.employeeProfileService.updateEmployeeProfile(this.currentEmployee).subscribe({
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
            
            // Check if it's a connection error
            if (error.status === 0 || error.status === 404) {
              console.log('Backend not accessible, saving locally only');
              // Save to localStorage for persistence
              if (this.currentEmployee?.user?.userId) {
                this.saveProfileToLocal(this.currentEmployee.user.userId);
              }
              alert('Backend not accessible. Profile updated locally only. It will persist when you log in again.');
            } else {
              console.log('Database error, but saving locally');
              // Save to localStorage for persistence
              if (this.currentEmployee?.user?.userId) {
                this.saveProfileToLocal(this.currentEmployee.user.userId);
              }
              alert('Database save failed, but profile updated locally. It will persist when you log in again.');
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

  private createEmployeeProfileInDatabase(): Promise<void> {
    if (!this.currentEmployee) {
      return Promise.reject('No current employee');
    }
    
    console.log('Creating new employee profile in database...');
    
    // Create a full EmployeeProfile object with nested User object
    const profileData = {
      department: this.currentEmployee.department,
      designation: this.currentEmployee.designation,
      dateOfJoining: this.currentEmployee.dateOfJoining,
      reportingManager: this.currentEmployee.reportingManager,
      currentProject: this.currentEmployee.currentProject,
      currentTeam: this.currentEmployee.currentTeam,
      skills: this.currentEmployee.skills,
      lastAppraisalRating: this.currentEmployee.lastAppraisalRating,
      currentGoals: this.currentEmployee.currentGoals,
      user: {
        userId: this.currentEmployee.user.userId
      }
    };
    
    return new Promise<void>((resolve, reject) => {
      this.employeeProfileService.createEmployeeProfile(
        this.currentEmployee!.user.userId, 
        profileData as any
      ).subscribe({
        next: (createdProfile: any) => {
          console.log('New profile created successfully:', createdProfile);
          
          // Update local data with the response from database
          this.currentEmployee = createdProfile;
          
          // Update shared service
          if (this.currentEmployee) {
          this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
          }

          // Close modal and reset form
          this.closeEditProfileModal();
          
          alert('Profile created and saved to database successfully!');
          resolve();
        },
        error: (error: any) => {
          console.error('Error creating profile in database:', error);
          console.log('Error details:', error);
          
          // Check if it's a connection error
          if (error.status === 0 || error.status === 404) {
            console.log('Backend not accessible, saving locally only');
            // Save to localStorage for persistence
            if (this.currentEmployee?.user?.userId) {
              this.saveProfileToLocal(this.currentEmployee.user.userId);
            }
            alert('Backend not accessible. Profile updated locally only. It will persist when you log in again.');
          } else {
            console.log('Database error, but saving locally');
            // Save to localStorage for persistence
            if (this.currentEmployee?.user?.userId) {
              this.saveProfileToLocal(this.currentEmployee.user.userId);
            }
            alert('Database save failed, but profile updated locally. It will persist when you log in again.');
          }
          
          // Even if database save fails, update local data
          if (this.currentEmployee) {
            this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
          }
          this.closeEditProfileModal();
          
          alert('Profile updated locally (database save failed)');
          reject(error);
        }
      });
    });
  }

}
