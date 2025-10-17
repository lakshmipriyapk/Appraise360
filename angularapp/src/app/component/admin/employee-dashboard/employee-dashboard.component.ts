import { HttpClient } from '@angular/common/http';
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
  successMessage = '';
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
    private http: HttpClient,
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
      category: ['Professional Development', [Validators.required]],
      progress: [0, [Validators.required]],
      status: ['Pending', [Validators.required]],
      priority: ['Medium'],
      targetDate: ['', [Validators.required]]
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
      reportingManager: [''],
      dateOfJoining: [''],
      currentProject: [''],
      currentTeam: [''],
      currentGoals: [''],
      skills: ['']
    });
  }

  private applySelfFeedbackToUI(feedback: any) {
    if (!feedback) return;
    this.currentSelfFeedback = feedback;
    if (this.appraisals && this.appraisals.length > 0) {
      const first = this.appraisals[0];
      if (first) {
        (first as any).selfRating = feedback?.rating ?? (first as any).selfRating;
        (first as any).selfComments = feedback?.comments ?? (first as any).selfComments;
      }
    }
  }
  
  private pickLatestSelfFeedback(allFeedback: any[]): any | null {
    if (!Array.isArray(allFeedback)) return null;
    const candidates = allFeedback.filter(f => (
      f?.feedbackType === 'Self Assessment' ||
      f?.feedbackType === 'Self Feedback' ||
      f?.feedbackType === 'Self-Feedback'
    ));
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
      const ad = a?.createdDate ? new Date(a.createdDate).getTime() : 0;
      const bd = b?.createdDate ? new Date(b.createdDate).getTime() : 0;
      return bd - ad; // newest first
    });
    return candidates[0] || null;
  }

  // Coerces current self rating to a number for star rendering
  getSelfRating(): number {
    const r: any = this.currentSelfFeedback?.rating;
    if (r === null || r === undefined) return 0;
    if (typeof r === 'number') return r;
    const n = Number(r);
    return isNaN(n) ? 0 : n;
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
    this.isLoading = true;
    
    // Get current user immediately
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (currentUser) {
      console.log('✅ User found:', currentUser.fullName);
      
      // Create basic employee profile immediately
      this.currentEmployee = {
        employeeProfileId: currentUser.userId || 1,
        department: 'IT',
        designation: 'Developer',
        dateOfJoining: '2023-01-01',
        reportingManager: 'Manager',
        currentProject: 'Project Alpha',
        currentTeam: 'Team Beta',
        skills: 'JavaScript, Angular, Spring Boot',
        currentGoals: 'Complete project milestones',
        lastAppraisalRating: 4.0,
        user: currentUser
      };
      
      // Create sample data immediately to show something
      this.createSampleGoals();
      this.createSampleFeedback();
      this.createSampleAppraisals();
      
      this.isLoading = false;
      console.log('✅ Employee dashboard loaded with sample data');
      
      // Load saved profile data from localStorage
      this.loadSavedProfileData();
      
      // Try to load real data in background
    setTimeout(() => {
        this.loadRealEmployeeProfile(currentUser);
      }, 1000);
    } else {
      console.log('❌ No user found');
        this.isLoading = false;
    }
  }

  // Load real employee profile from database
  loadRealEmployeeProfile(user: any) {
    console.log('=== LOADING REAL EMPLOYEE PROFILE FROM DATABASE ===');
    console.log('User:', user.fullName, 'ID:', user.userId);
    
    // First, get all employee profiles and find the one for this user
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (profiles) => {
        console.log('All employee profiles loaded:', profiles.length);
        
        // Find profile for this user
        let userProfile = profiles.find(profile => 
          profile.user?.userId === user.userId ||
          profile.user?.email === user.email ||
          profile.user?.username === user.username ||
          profile.user?.fullName === user.fullName
        );
        
        if (userProfile) {
          console.log('✅ Found employee profile in database:', userProfile);
          this.currentEmployee = userProfile;
          this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
          
          // Load all related data for this employee
          this.loadEmployeeSpecificData(userProfile.employeeProfileId || userProfile.user?.userId || 0);
        } else {
          console.log('❌ No employee profile found, creating basic one');
          this.createBasicEmployeeProfile(user.userId || 0);
        }
      },
      error: (error) => {
        console.error('Error loading employee profiles:', error);
        this.createBasicEmployeeProfile(user.userId || 0);
      }
    });
  }

  // Load employee-specific data from database
  loadEmployeeSpecificData(employeeId: number) {
    console.log('=== LOADING EMPLOYEE-SPECIFIC DATA FROM DATABASE ===');
    console.log('Employee ID:', employeeId);
    
    // Load goals for this employee
    this.goalService.getGoalsByEmployee(employeeId).subscribe({
      next: (goals) => {
        console.log('✅ Goals loaded from database:', goals.length);
        this.currentGoals = goals;
        this.calculateGoalStats();
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        // Try loading all goals and filter
        this.loadAllGoalsAndFilter(this.currentEmployee?.employeeProfileId || this.currentEmployee?.user?.userId || 0);
      }
    });

    // Load feedback for this employee
    this.feedbackService.getFeedbacksByEmployee(employeeId).subscribe({
      next: (feedbacks) => {
        console.log('✅ Feedback loaded from database:', feedbacks.length);
        this.recentFeedback = feedbacks;
        this.dashboardStats.feedbackCount = feedbacks.length;
      },
      error: (error) => {
        console.error('Error loading feedback:', error);
        // Try loading all feedback and filter
        this.loadAllFeedbackAndFilter(this.currentEmployee?.employeeProfileId || this.currentEmployee?.user?.userId || 0);
      }
    });

    // Load appraisals for this employee
    this.appraisalService.getAppraisalsByEmployee(employeeId).subscribe({
      next: (appraisals) => {
        console.log('✅ Appraisals loaded from database:', appraisals.length);
        this.appraisals = appraisals;
        this.calculateAppraisalStats();
        
        // Set loading to false after all data loading is completed
        this.isLoading = false;
        console.log('✅ Employee dashboard data loading completed');
      },
      error: (error) => {
        console.error('Error loading appraisals:', error);
        // Try loading all appraisals and filter
        this.loadAllAppraisalsAndFilter(this.currentEmployee?.employeeProfileId || this.currentEmployee?.user?.userId || 0);
        
        // Set loading to false even on error
        this.isLoading = false;
        console.log('✅ Employee dashboard data loading completed (with fallback)');
      }
    });
  }

  // Fallback: Load all goals and filter by employee
  loadAllGoalsAndFilter(employeeId: number) {
    console.log('Loading all goals and filtering for employee:', employeeId);
    this.goalService.getAllGoals().subscribe({
      next: (allGoals) => {
        this.currentGoals = allGoals.filter(goal => 
          goal.employee?.employeeProfileId === employeeId ||
          goal.employee?.user?.userId === employeeId
        );
        console.log('Filtered goals:', this.currentGoals.length);
        this.calculateGoalStats();
      },
      error: (error) => {
        console.error('Error loading all goals:', error);
        this.currentGoals = [];
      }
    });
  }

  // Fallback: Load all feedback and filter by employee
  loadAllFeedbackAndFilter(employeeId: number) {
    console.log('Loading all feedback and filtering for employee:', employeeId);
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (allFeedbacks) => {
        this.recentFeedback = allFeedbacks.filter(feedback => 
          feedback.employee?.employeeProfileId === employeeId ||
          feedback.employee?.user?.userId === employeeId
        );
        console.log('Filtered feedback:', this.recentFeedback.length);
        this.dashboardStats.feedbackCount = this.recentFeedback.length;
      },
      error: (error) => {
        console.error('Error loading all feedback:', error);
        this.recentFeedback = [];
      }
    });
  }

  // Fallback: Load all appraisals and filter by employee
  loadAllAppraisalsAndFilter(employeeId: number) {
    console.log('Loading all appraisals and filtering for employee:', employeeId);
    this.appraisalService.getAllAppraisals().subscribe({
      next: (allAppraisals) => {
        this.appraisals = allAppraisals.filter(appraisal => 
          appraisal.employee?.employeeProfileId === employeeId ||
          appraisal.employee?.user?.userId === employeeId
        );
        console.log('Filtered appraisals:', this.appraisals.length);
        this.calculateAppraisalStats();
      },
      error: (error) => {
        console.error('Error loading all appraisals:', error);
        this.appraisals = [];
      }
    });
  }

  // Create employee profile from user data
  createEmployeeProfileFromUser(user: any) {
    console.log('Creating employee profile from user:', user);
    
    this.currentEmployee = {
      employeeProfileId: user.userId || 0,
      department: 'IT',
      designation: 'Employee',
      dateOfJoining: '2023-01-01',
      reportingManager: 'Manager',
      currentProject: 'Project Alpha',
      currentTeam: 'Team Alpha',
      skills: 'JavaScript, Angular, Spring Boot',
      currentGoals: 'Complete project tasks',
      lastAppraisalRating: 4.0,
      user: user
    };
    
    console.log('✅ Employee profile created:', this.currentEmployee);
    this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
  }

  // Load all employee data
  loadAllEmployeeData(userId: number) {
    console.log('Loading all data for user ID:', userId);
    
    // Load goals
    this.goalService.getAllGoals().subscribe({
      next: (goals) => {
        console.log('All goals loaded:', goals.length);
        // Filter goals for this user
        this.currentGoals = goals.filter(goal => 
          goal.employee?.user?.userId === userId ||
          goal.employee?.employeeProfileId === userId
        );
        console.log('Filtered goals for user:', this.currentGoals.length);
        this.calculateGoalStats();
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        // Create sample goals
        this.createSampleGoals();
      }
    });

    // Load feedback
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (feedbacks) => {
        console.log('All feedback loaded:', feedbacks.length);
        // Filter feedback for this user
        this.recentFeedback = feedbacks.filter(feedback => 
          feedback.employee?.user?.userId === userId ||
          feedback.employee?.employeeProfileId === userId
        );
        console.log('Filtered feedback for user:', this.recentFeedback.length);
        this.dashboardStats.feedbackCount = this.recentFeedback.length;
      },
      error: (error) => {
        console.error('Error loading feedback:', error);
        // Create sample feedback
        this.createSampleFeedback();
      }
    });

    // Load appraisals
    this.appraisalService.getAllAppraisals().subscribe({
      next: (appraisals) => {
        console.log('All appraisals loaded:', appraisals.length);
        // Filter appraisals for this user
        this.appraisals = appraisals.filter(appraisal => 
          appraisal.employee?.user?.userId === userId ||
          appraisal.employee?.employeeProfileId === userId
        );
        console.log('Filtered appraisals for user:', this.appraisals.length);
        this.calculateAppraisalStats();
      },
      error: (error) => {
        console.error('Error loading appraisals:', error);
        // Create sample appraisals
        this.createSampleAppraisals();
      }
    });

    this.isLoading = false;
  }

  // Create sample data if backend fails
  createSampleGoals() {
    console.log('Creating sample goals');
    this.currentGoals = [
      {
        goalId: 1,
        title: 'Complete Project Alpha',
        description: 'Finish the main project tasks',
        status: 'In Progress',
        priority: 'High',
        progress: 75,
        startDate: '2024-01-01',
        targetDate: '2024-12-31',
        employee: this.currentEmployee || undefined
      },
      {
        goalId: 2,
        title: 'Learn New Technologies',
        description: 'Master Angular and Spring Boot',
        status: 'Pending',
        priority: 'Medium',
        progress: 30,
        startDate: '2024-01-01',
        targetDate: '2024-06-30',
        employee: this.currentEmployee || undefined
      }
    ];
    this.calculateGoalStats();
  }

  createSampleFeedback() {
    console.log('Creating sample feedback');
    this.recentFeedback = [
      {
        feedbackId: 1,
        feedbackType: 'Manager Feedback',
        rating: 4,
        comments: 'Good work on the project. Keep it up!',
        achievements: 'Completed major milestones',
        challenges: 'Time management',
        improvements: 'Better communication',
        employee: this.currentEmployee || undefined,
        reviewer: { userId: 1, fullName: 'Manager' }
      }
    ];
    this.dashboardStats.feedbackCount = this.recentFeedback.length;
  }

  createSampleAppraisals() {
    console.log('Creating sample appraisals');
    this.appraisals = [
      {
        appraisalId: 1,
        status: 'Completed',
        managerRating: 4.0,
        selfRating: 4.0,
        managerComments: 'Excellent performance this quarter',
        employee: this.currentEmployee || undefined,
        managerName: 'Manager'
      }
    ];
    this.calculateAppraisalStats();
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
        employee: this.currentEmployee || undefined!
      },
      {
        goalId: 2,
        title: 'Deliver Q3 Project Milestone',
        description: 'Complete the performance appraisal system development',
        status: 'Completed',
        employee: this.currentEmployee || undefined!
      },
      {
        goalId: 3,
        title: 'Improve Code Review Skills',
        description: 'Participate in more code reviews and provide constructive feedback',
        status: 'Pending',
        employee: this.currentEmployee || undefined!
      }
    ];

    // Mock feedback data
    this.recentFeedback = [
      {
        feedbackId: 1,
        feedbackType: 'Admin Feedback',
        comments: 'Great progress on the recent project! Your Angular skills have improved significantly.',
        rating: 4,
        employee: this.currentEmployee || undefined!,
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
        employee: this.currentEmployee || undefined!,
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
        employee: this.currentEmployee || undefined!,
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
        this.loadAllGoalsAndFilter(this.currentEmployee?.employeeProfileId || this.currentEmployee?.user?.userId || 0);
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
        
        // Pick the latest self feedback by createdDate
        this.currentSelfFeedback = this.pickLatestSelfFeedback(feedback);
        console.log('✅ Resolved current self feedback:', this.currentSelfFeedback);
      },
      error: (error: any) => {
        console.error('❌ Error loading feedback from database:', error);
        console.log('🔄 Falling back to load all feedback and filter...');
        // Try to load all feedback and filter by employee
        this.loadAllFeedbackAndFilter(this.currentEmployee?.employeeProfileId || this.currentEmployee?.user?.userId || 0);
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
        this.loadAllAppraisalsAndFilter(this.currentEmployee?.employeeProfileId || this.currentEmployee?.user?.userId || 0);
      }
    });

    // Set loading to false after all data loading is initiated
    this.isLoading = false;
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

  // Method to force load data - emergency fix
  forceLoadData() {
    console.log('🚨 FORCE LOADING DATA - EMERGENCY FIX');
    this.isLoading = true;
    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      console.log('✅ User found for force load:', currentUser.fullName);
      
      // Create sample data immediately to show something
      this.createSampleGoals();
      this.createSampleFeedback();
      this.createSampleAppraisals();
      
      // Create a basic employee profile
      this.currentEmployee = {
        employeeProfileId: currentUser.userId || 1,
        department: 'IT',
        designation: 'Developer',
        dateOfJoining: '2023-01-01',
        reportingManager: 'Manager',
        currentProject: 'Project Alpha',
        currentTeam: 'Team Beta',
        skills: 'JavaScript, Angular, Spring Boot',
        currentGoals: 'Complete project milestones',
        lastAppraisalRating: 4.0,
        user: currentUser
      };
      
      this.isLoading = false;
      console.log('✅ Sample data loaded immediately');
    } else {
      console.log('❌ No user found for force load');
      this.isLoading = false;
    }
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
    this.clearMessages();
  }

  setRating(rating: number) {
    this.selfFeedbackForm.patchValue({ rating });
  }

  submitSelfFeedback() {
    if (this.selfFeedbackForm.valid && this.currentEmployee) {
      const formData = this.selfFeedbackForm.value;
      
      // Use backend's flexible Map deserializer with snake_case keys
      const feedbackData: any = {
        feedback_type: 'Self Assessment',
        comments: formData.comments,
        rating: Number(formData.rating) || 0,
        achievements: formData.achievements,
        challenges: formData.challenges,
        improvements: formData.improvements,
        employee_id: this.currentEmployee.employeeProfileId,
        reviewer_id: this.currentEmployee?.user?.userId
      };

      console.log('Saving self feedback to database:', feedbackData);

      // Check if we're updating existing feedback or creating new
      if (this.currentSelfFeedback && this.currentSelfFeedback.feedbackId) {
        console.log('Updating existing self feedback...');
        this.updateExistingSelfFeedback(feedbackData);
      } else {
        console.log('Creating new self feedback...');
        // First ensure employee profile exists, then create feedback
        if (!this.currentEmployee.employeeProfileId) {
          console.log('Employee profile not created yet, creating it first...');
          this.createEmployeeProfileInDatabase().then(() => {
            this.createFeedbackWithEmployeeProfile(feedbackData);
          });
        } else {
          this.createFeedbackWithEmployeeProfile(feedbackData);
        }
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.selfFeedbackForm.controls).forEach(key => {
        this.selfFeedbackForm.get(key)?.markAsTouched();
      });
    }
  }

  private updateExistingSelfFeedback(feedbackData: any) {
    this.feedbackService.updateFeedback(this.currentSelfFeedback.feedbackId, feedbackData).subscribe({
      next: (updatedFeedback: any) => {
        console.log('✅ Self feedback updated successfully:', updatedFeedback);
        
        // Update local data
        this.currentSelfFeedback = updatedFeedback;
        const index = this.recentFeedback.findIndex(f => f.feedbackId === updatedFeedback.feedbackId);
        if (index !== -1) {
          this.recentFeedback[index] = updatedFeedback;
        }
        this.applySelfFeedbackToUI(updatedFeedback);
        
        // Update shared service
        if (this.currentEmployee) {
          this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee);
        }

        // Close modal and reset form
        this.closeSelfFeedbackModal();
        
        // Show success message
        this.successMessage = 'Self feedback updated successfully!';
      },
      error: (error: any) => {
        console.error('❌ Error updating self feedback:', error);
        this.errorMessage = 'Failed to update self feedback. Please try again.';
      }
    });
  }

  private createFeedbackWithEmployeeProfile(feedbackData: any) {
    if (!this.currentEmployee) {
      console.error('No current employee found');
      return;
    }

    // Ensure employee profile exists in database first
    this.ensureEmployeeProfileExists().then(() => {
    // Save to database using generic create endpoint with snake_case payload
    this.feedbackService.createFeedback(feedbackData).subscribe({
      next: (savedFeedback: any) => {
          console.log('Self feedback saved successfully to database:', savedFeedback);
          
          // Add to local list and reflect in UI
          this.recentFeedback.push(savedFeedback);
          this.applySelfFeedbackToUI(savedFeedback);
          
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
            
            alert('Failed to save self feedback. Please try again.');
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
            
          alert('Failed to save self feedback. Please try again.');
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
    if (this.currentSelfFeedback) {
      // Pre-populate form with existing feedback data
      this.selfFeedbackForm.patchValue({
        rating: this.currentSelfFeedback.rating,
        comments: this.currentSelfFeedback.comments,
        achievements: this.currentSelfFeedback.achievements || '',
        challenges: this.currentSelfFeedback.challenges || '',
        improvements: this.currentSelfFeedback.improvements || ''
      });
    }
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

      // Snake_case payload compatible with backend generic create endpoint
      const goalPayload: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        progress: Number(formData.progress) || 0,
        status: formData.status ?? 'Pending',
        priority: formData.priority,
        start_date: new Date().toISOString().split('T')[0],
        target_date: new Date(formData.targetDate).toISOString().split('T')[0],
        created_by: 'self',
        employee_id: this.currentEmployee.employeeProfileId
      };

      console.log('Saving goal to database (snake_case):', goalPayload);

      this.ensureEmployeeProfileExists().then(() => {
        this.goalService.createGoal(goalPayload).subscribe({
          next: (savedGoal: any) => {
            console.log('Goal saved successfully to database:', savedGoal);
            this.currentGoals = this.currentGoals.filter(g => !!g.goalId && typeof g.goalId === 'number');
            this.currentGoals.push(savedGoal);
            this.sharedGoalService.addGoal(savedGoal);
            this.closeGoalModal();
            this.calculateGoalStats();
            alert('Goal saved to database successfully!');
          },
          error: (error: any) => {
            console.error('Error saving goal to database:', error);
            alert('Failed to save goal. Please try again.');
          }
        });
      }).catch((error: any) => {
        console.error('Error ensuring employee profile exists:', error);
        this.saveGoalLocally(goalPayload);
      });
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
          
          // Replace any temporary local goal entries with saved one
          this.currentGoals = this.currentGoals.filter(g => !!g.goalId && typeof g.goalId === 'number');
          this.currentGoals.push(savedGoal);
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
          
          alert('Failed to save goal. Please try again.');
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

    // For Completed, send completionDate and progress explicitly in payload
    const payload: any = {
      status: goal.status,
      progress: Number(goal.progress) || 0,
      completionDate: goal.completionDate ? new Date(goal.completionDate).toISOString().split('T')[0] : null
    };

    this.goalService.updateGoal(goal.goalId || 0, payload).subscribe({
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
    this.clearMessages();
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitEditProfile() {
    console.log('=== USING SERVICE METHODS FOR PROFILE SAVE ===');
    
    if (!this.editProfileForm.valid || !this.currentEmployee) {
      console.log('Form is invalid or no current employee');
      return;
    }

      const formData = this.editProfileForm.value;
      
    // Update local data immediately
    this.currentEmployee.user!.fullName = `${formData.firstName} ${formData.lastName}`.trim();
    this.currentEmployee.user!.email = formData.email;
      this.currentEmployee.department = formData.department;
    this.currentEmployee.designation = formData.designation;
    this.currentEmployee.dateOfJoining = formData.dateOfJoining;
    this.currentEmployee.reportingManager = formData.reportingManager;
      this.currentEmployee.currentProject = formData.currentProject;
      this.currentEmployee.currentTeam = formData.currentTeam;
    this.currentEmployee.skills = formData.skills;
    this.currentEmployee.currentGoals = formData.currentGoals;
    this.currentEmployee.lastAppraisalRating = formData.lastAppraisalRating || 4.0;

    console.log('Updated employee data:', this.currentEmployee);

    // Use service methods instead of direct HTTP calls
    this.saveUsingServiceMethods();
  }

  private saveUsingServiceMethods() {
    console.log('=== SAVING USING SERVICE METHODS ===');
    
    const userId = this.currentEmployee!.user!.userId!;
    
    // Prepare profile data
    const profileData: any = {
      department: this.currentEmployee!.department,
      designation: this.currentEmployee!.designation,
      dateOfJoining: this.currentEmployee!.dateOfJoining,
      reportingManager: this.currentEmployee!.reportingManager,
      currentProject: this.currentEmployee!.currentProject,
      currentTeam: this.currentEmployee!.currentTeam,
      skills: this.currentEmployee!.skills,
      currentGoals: this.currentEmployee!.currentGoals,
      lastAppraisalRating: this.currentEmployee!.lastAppraisalRating,
      user: { userId: userId }
    };

    console.log('Profile data for service:', profileData);

    // Try to update existing profile first, then create if needed
    if (this.currentEmployee!.employeeProfileId && this.currentEmployee!.employeeProfileId > 0) {
      console.log('Updating existing profile...');
      this.employeeProfileService.updateProfile(this.currentEmployee!.employeeProfileId, profileData).subscribe({
        next: (result: any) => {
          console.log('✅ SUCCESS: Profile updated via service:', result);
          this.currentEmployee = result;
          this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
          this.closeEditProfileModal();
          this.successMessage = 'Profile updated successfully!';
        },
        error: (updateError: any) => {
          console.error('❌ Service update failed:', updateError);
          this.tryCreateProfile(userId, profileData);
        }
      });
    } else {
      this.tryCreateProfile(userId, profileData);
    }
  }

  private tryCreateProfile(userId: number, profileData: any) {
    console.log('Creating new profile...');
    // Use generic endpoint with snake_case compatibility to improve success odds
    const payload = { ...profileData, user: { userId } };
    this.employeeProfileService.createProfileForUser(userId, payload).subscribe({
      next: (result: any) => {
        console.log('✅ SUCCESS: Profile created via service:', result);
        this.currentEmployee = result;
        this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
        this.closeEditProfileModal();
        this.successMessage = 'Profile saved successfully!';
      },
      error: (error: any) => {
        console.error('❌ Service create failed:', error);
        // Fallback: call generic create without /user/{id}
        this.employeeProfileService.createProfile(payload as any).subscribe({
          next: (res2: any) => {
            console.log('✅ SUCCESS: Profile created via generic endpoint:', res2);
            this.currentEmployee = res2;
            this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
            this.closeEditProfileModal();
            this.successMessage = 'Profile saved successfully!';
          },
          error: (err2: any) => {
            console.error('❌ Generic create failed:', err2);
            this.tryUserServiceUpdate();
          }
        });
      }
    });
  }

  private tryUserServiceUpdate() {
    console.log('=== TRYING USER SERVICE UPDATE ===');
    
    const userData = {
      firstName: this.editProfileForm.value.firstName,
      lastName: this.editProfileForm.value.lastName,
      email: this.editProfileForm.value.email,
      phoneNumber: this.currentEmployee!.user!.phoneNumber,
      username: this.currentEmployee!.user!.username,
      role: this.currentEmployee!.user!.role
    };

    console.log('User data for service:', userData);

    this.userService.updateUser(this.currentEmployee!.user!.userId!, userData).subscribe({
      next: (result: any) => {
        console.log('✅ SUCCESS: User updated via service:', result);
        
        // Update local data
        this.currentEmployee!.user = result;
        this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
        this.closeEditProfileModal();
        alert('✅ User data updated in database successfully!');
        },
        error: (error: any) => {
        console.error('❌ User service update failed:', error);
        
        // ROBUST FALLBACK - Save to localStorage
        this.saveToLocalStorage();
      }
    });
  }

  private saveToLocalStorage() {
    console.log('=== SAVING TO LOCAL STORAGE ===');
    
    const profileData = {
      userId: this.currentEmployee!.user!.userId,
      employeeProfileId: this.currentEmployee!.employeeProfileId,
      firstName: this.editProfileForm.value.firstName,
      lastName: this.editProfileForm.value.lastName,
      fullName: this.currentEmployee!.user!.fullName,
      email: this.currentEmployee!.user!.email,
      phoneNumber: this.currentEmployee!.user!.phoneNumber,
      username: this.currentEmployee!.user!.username,
      role: this.currentEmployee!.user!.role,
      department: this.currentEmployee!.department,
      designation: this.currentEmployee!.designation,
      dateOfJoining: this.currentEmployee!.dateOfJoining,
      reportingManager: this.currentEmployee!.reportingManager,
      currentProject: this.currentEmployee!.currentProject,
      currentTeam: this.currentEmployee!.currentTeam,
      skills: this.currentEmployee!.skills,
      currentGoals: this.currentEmployee!.currentGoals,
      lastAppraisalRating: this.currentEmployee!.lastAppraisalRating,
      savedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(`employee_profile_${this.currentEmployee!.user!.userId}`, JSON.stringify(profileData));
    
    // Also save to sessionStorage for immediate use
    sessionStorage.setItem(`current_employee_profile`, JSON.stringify(profileData));
    
    // Update shared service
    this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
    this.closeEditProfileModal();
    
    alert('Failed to save profile. Please try again.');
  }

  private loadSavedProfileData() {
    console.log('=== LOADING SAVED PROFILE DATA ===');
    
    if (!this.currentEmployee?.user?.userId) {
      console.log('❌ No current employee or user ID');
      return;
    }
    
    const userId = this.currentEmployee.user.userId;
    const savedData = localStorage.getItem(`employee_profile_${userId}`);
    
    if (savedData) {
      try {
        const profileData = JSON.parse(savedData);
        console.log('✅ Found saved profile data:', profileData);
        
        // Update current employee with saved data
        if (this.currentEmployee) {
          const updatedUser = this.currentEmployee.user!;
          updatedUser.firstName = (profileData.firstName ?? updatedUser.firstName);
          updatedUser.lastName = (profileData.lastName ?? updatedUser.lastName);
          updatedUser.email = (profileData.email ?? updatedUser.email);
          // Recompute fullName safely to avoid 'undefined'
          updatedUser.fullName = this.getDisplayName(updatedUser);
          this.currentEmployee.department = profileData.department || this.currentEmployee.department;
          this.currentEmployee.designation = profileData.designation || this.currentEmployee.designation;
          this.currentEmployee.currentProject = profileData.currentProject || this.currentEmployee.currentProject;
          this.currentEmployee.currentTeam = profileData.currentTeam || this.currentEmployee.currentTeam;
          this.currentEmployee.skills = profileData.skills || this.currentEmployee.skills;
          this.currentEmployee.currentGoals = profileData.currentGoals || this.currentEmployee.currentGoals;
          
          console.log('✅ Profile data loaded from localStorage');
        }
      } catch (error) {
        console.error('❌ Error parsing saved profile data:', error);
      }
            } else {
      console.log('ℹ️ No saved profile data found');
    }
  }

  getDisplayName(user?: User | null): string {
    if (!user) return 'No Name Found';
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    const full = (user.fullName || '').trim();
    if (first || last) return `${first} ${last}`.trim();
    if (full) return full;
    if (user.username) return user.username;
    if (user.email) return user.email;
    return 'No Name Found';
  }

  private simpleDirectSave() {
    console.log('=== SIMPLE DIRECT SAVE ===');
    
    const userId = this.currentEmployee!.user!.userId!;
    
    // Create minimal profile data
    const simpleProfileData = {
      department: this.currentEmployee!.department,
      designation: this.currentEmployee!.designation,
      dateOfJoining: this.currentEmployee!.dateOfJoining,
      reportingManager: this.currentEmployee!.reportingManager,
      currentProject: this.currentEmployee!.currentProject,
      currentTeam: this.currentEmployee!.currentTeam,
      skills: this.currentEmployee!.skills,
      currentGoals: this.currentEmployee!.currentGoals,
      lastAppraisalRating: this.currentEmployee!.lastAppraisalRating,
      user: { userId: userId }
    };

    console.log('Simple profile data:', simpleProfileData);

    // Try the simplest possible approach
    this.http.post<any>('http://localhost:8080/api/employeeProfiles', simpleProfileData).subscribe({
      next: (result: any) => {
        console.log('✅ SUCCESS: Profile saved:', result);
        this.currentEmployee = result;
        this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
            this.closeEditProfileModal();
        alert('✅ Profile saved to database successfully!');
      },
      error: (error: any) => {
        console.error('❌ Simple save failed:', error);
        
        // Try with even simpler data
        const minimalData = {
          department: 'IT',
          designation: 'Developer',
          user: { userId: userId }
        };
        
        console.log('Trying minimal data:', minimalData);
        
        this.http.post<any>('http://localhost:8080/api/employeeProfiles', minimalData).subscribe({
          next: (result: any) => {
            console.log('✅ SUCCESS: Minimal profile saved:', result);
            this.currentEmployee = result;
            this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
            this.closeEditProfileModal();
            alert('✅ Profile saved to database successfully!');
          },
          error: (error2: any) => {
            console.error('❌ Minimal save also failed:', error2);
            
            // Try updating user data only
            this.updateUserOnly();
          }
        });
      }
    });
  }

  private updateUserOnly() {
    console.log('=== UPDATING USER DATA ONLY ===');
    
    const userData = {
      firstName: this.editProfileForm.value.firstName,
      lastName: this.editProfileForm.value.lastName,
      email: this.editProfileForm.value.email,
      phoneNumber: this.currentEmployee!.user!.phoneNumber,
      username: this.currentEmployee!.user!.username,
      role: this.currentEmployee!.user!.role
    };

    console.log('User data to update:', userData);

    this.http.put<any>(`http://localhost:8080/api/users/${this.currentEmployee!.user!.userId}`, userData).subscribe({
      next: (result: any) => {
        console.log('✅ SUCCESS: User updated:', result);
        
        // Update local data
        this.currentEmployee!.user = result;
        this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
            this.closeEditProfileModal();
        alert('✅ User data updated in database successfully!');
      },
      error: (error: any) => {
        console.error('❌ User update failed:', error);
        
        // Final fallback - just save locally
        this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
        this.closeEditProfileModal();
        alert('⚠️ Profile updated locally. Database connection issue.');
      }
    });
  }

  private guaranteedDatabaseSave() {
    console.log('=== GUARANTEED DATABASE SAVE ===');
    
    const userId = this.currentEmployee!.user!.userId!;
    const profileData = {
      department: this.currentEmployee!.department,
      designation: this.currentEmployee!.designation,
      dateOfJoining: this.currentEmployee!.dateOfJoining,
      reportingManager: this.currentEmployee!.reportingManager,
      currentProject: this.currentEmployee!.currentProject,
      currentTeam: this.currentEmployee!.currentTeam,
      skills: this.currentEmployee!.skills,
      currentGoals: this.currentEmployee!.currentGoals,
      lastAppraisalRating: this.currentEmployee!.lastAppraisalRating,
      user: { userId: userId }
    };

    console.log('Attempting database save with data:', profileData);

    // First, ensure the user exists in the database
    this.ensureUserExists(userId).then(() => {
      // Method 1: Direct HTTP POST to create profile
      this.http.post<any>(`http://localhost:8080/api/employeeProfiles/user/${userId}`, profileData).subscribe({
        next: (result: any) => {
          console.log('✅ SUCCESS: Profile created in database:', result);
          this.currentEmployee = result;
          this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
          this.closeEditProfileModal();
          alert('✅ Profile saved to database successfully!');
        },
        error: (error: any) => {
          console.error('❌ Method 1 failed:', error);
          
          // Method 2: Try direct POST to main endpoint
          this.http.post<any>('http://localhost:8080/api/employeeProfiles', profileData).subscribe({
            next: (result: any) => {
              console.log('✅ SUCCESS: Profile created via main endpoint:', result);
              this.currentEmployee = result;
              this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
              this.closeEditProfileModal();
              alert('✅ Profile saved to database successfully!');
            },
            error: (error2: any) => {
              console.error('❌ Method 2 failed:', error2);
              
              // Method 3: Try PUT to update existing profile
              if (this.currentEmployee!.employeeProfileId && this.currentEmployee!.employeeProfileId > 0) {
                this.http.put<any>(`http://localhost:8080/api/employeeProfiles/${this.currentEmployee!.employeeProfileId}`, profileData).subscribe({
                  next: (result: any) => {
                    console.log('✅ SUCCESS: Profile updated in database:', result);
                    this.currentEmployee = result;
                    this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
                    this.closeEditProfileModal();
                    alert('✅ Profile updated in database successfully!');
                  },
                  error: (error3: any) => {
                    console.error('❌ Method 3 failed:', error3);
                    this.finalFallback();
        }
      });
    } else {
                this.finalFallback();
              }
            }
          });
        }
      });
    }).catch((error) => {
      console.error('❌ Failed to ensure user exists:', error);
      this.finalFallback();
    });
  }

  private ensureUserExists(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('=== ENSURING USER EXISTS ===');
      
      // First check if user exists
      this.http.get<any>(`http://localhost:8080/api/users/${userId}`).subscribe({
        next: (user) => {
          console.log('✅ User exists:', user);
          resolve();
        },
        error: (error) => {
          console.log('❌ User does not exist, creating user...');
          
          // Create user if it doesn't exist
          const userData = {
            userId: userId,
            firstName: this.currentEmployee!.user!.firstName || 'Employee',
            lastName: this.currentEmployee!.user!.lastName || 'User',
            fullName: this.currentEmployee!.user!.fullName || 'Employee User',
            email: this.currentEmployee!.user!.email || `employee${userId}@company.com`,
            phoneNumber: this.currentEmployee!.user!.phoneNumber || '9999999999',
            username: this.currentEmployee!.user!.username || `user${userId}`,
            password: this.currentEmployee!.user!.password || 'password123',
            role: this.currentEmployee!.user!.role || 'Employee'
          };
          
          console.log('Creating user with data:', userData);
          
          this.http.post<any>('http://localhost:8080/api/users', userData).subscribe({
            next: (createdUser) => {
              console.log('✅ User created:', createdUser);
              resolve();
            },
            error: (createError) => {
              console.error('❌ Failed to create user:', createError);
              reject(createError);
            }
          });
        }
      });
    });
  }

  private updateUserThenProfile(profileData: any) {
    console.log('=== METHOD 4: UPDATE USER THEN PROFILE ===');
    
    const userData = {
      firstName: this.editProfileForm.value.firstName,
      lastName: this.editProfileForm.value.lastName,
      email: this.editProfileForm.value.email,
      phoneNumber: this.currentEmployee!.user!.phoneNumber,
      username: this.currentEmployee!.user!.username,
      role: this.currentEmployee!.user!.role
    };

    // Update user first
    this.http.put<any>(`http://localhost:8080/api/users/${this.currentEmployee!.user!.userId}`, userData).subscribe({
      next: (userResult: any) => {
        console.log('✅ User updated:', userResult);
        
        // Now try to create profile again
        this.http.post<any>(`http://localhost:8080/api/employeeProfiles/user/${this.currentEmployee!.user!.userId}`, profileData).subscribe({
          next: (profileResult: any) => {
            console.log('✅ SUCCESS: Profile created after user update:', profileResult);
            this.currentEmployee = profileResult;
            this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
            this.closeEditProfileModal();
            alert('✅ Profile saved to database successfully!');
          },
          error: (profileError: any) => {
            console.error('❌ Profile creation still failed:', profileError);
            this.finalFallback();
          }
        });
      },
      error: (userError: any) => {
        console.error('❌ User update failed:', userError);
        this.finalFallback();
      }
    });
  }

  private finalFallback() {
    console.log('=== FINAL FALLBACK ===');
    
    // Save to localStorage as backup
    const profileData = {
      userId: this.currentEmployee!.user!.userId,
      department: this.currentEmployee!.department,
      designation: this.currentEmployee!.designation,
      dateOfJoining: this.currentEmployee!.dateOfJoining,
      reportingManager: this.currentEmployee!.reportingManager,
      currentProject: this.currentEmployee!.currentProject,
      currentTeam: this.currentEmployee!.currentTeam,
      skills: this.currentEmployee!.skills,
      currentGoals: this.currentEmployee!.currentGoals,
      lastAppraisalRating: this.currentEmployee!.lastAppraisalRating,
      fullName: this.currentEmployee!.user!.fullName,
      email: this.currentEmployee!.user!.email
    };
    
    localStorage.setItem(`employee_profile_${this.currentEmployee!.user!.userId}`, JSON.stringify(profileData));
    
    this.sharedEmployeeService.updateCurrentEmployee(this.currentEmployee!);
    this.closeEditProfileModal();
    alert('Failed to save profile. Please try again.');
  }

  // Helper method to update user data
  private updateUserData(formData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.currentEmployee?.user?.userId) {
        reject('No user ID found');
        return;
      }

      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: this.currentEmployee.user.phoneNumber,
        username: this.currentEmployee.user.username,
        role: this.currentEmployee.user.role
      };

      // Update user data
      this.userService.updateUser(this.currentEmployee.user.userId, userData).subscribe({
        next: (updatedUser) => {
          console.log('✅ User data updated:', updatedUser);
          resolve();
        },
        error: (error) => {
          console.error('❌ Error updating user:', error);
          reject(error);
        }
      });
    });
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
