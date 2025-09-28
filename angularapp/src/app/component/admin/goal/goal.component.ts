import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoalService } from '../../../service/goal.service';
import { SharedGoalService } from '../../../service/shared-goal.service';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { AppraisalService } from '../../../service/appraisal.service';
import { Goal } from '../../../model/goal.model';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { Appraisal } from '../../../model/appraisal.model';

@Component({
  selector: 'app-goal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './goal.component.html',
  styleUrl: './goal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalComponent implements OnInit {
  menuItems = [
    { title: 'Dashboard', route: '/dashboard', icon: 'fa-tachometer-alt' },
    { title: 'Appraisal', route: '/appraisal', icon: 'fa-clipboard-check' },
    { title: 'Employee Profile', route: '/employee-profile', icon: 'fa-user' },
    { title: 'Feedback', route: '/feedback', icon: 'fa-comments' },
    { title: 'Goal', route: '/goal', icon: 'fa-bullseye' },
    { title: 'Review Cycle', route: '/review-cycle', icon: 'fa-calendar-alt' }
  ];

  goals: Goal[] = [];
  filteredGoals: Goal[] = [];
  employeeProfiles: EmployeeProfile[] = [];
  appraisals: Appraisal[] = [];
  selfCreatedGoals: Goal[] = []; // Goals created by employees themselves
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedGoal: Goal | null = null;

  // Forms
  goalForm: FormGroup;

  // Filters
  searchTerm = '';
  statusFilter = '';
  employeeFilter = '';

  constructor(
    public router: Router,
    private goalService: GoalService,
    private sharedGoalService: SharedGoalService,
    private employeeProfileService: EmployeeProfileService,
    private appraisalService: AppraisalService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.goalForm = this.fb.group({
      employeeId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      managerComments: [''],
      status: ['PENDING', Validators.required]
    });
  }

  ngOnInit() {
    this.loadGoals();
    this.loadEmployeeProfiles();
    this.loadAppraisals();
    
    // Subscribe to shared goal data
    this.sharedGoalService.goals$.subscribe(goals => {
      if (goals && goals.length > 0) {
        this.goals = goals;
        this.combineAllGoals();
        this.cdr.markForCheck();
      }
    });
  }

  loadGoals() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    // Get data from shared service first
    const sharedGoals = this.sharedGoalService.getAllGoals();
    if (sharedGoals && sharedGoals.length > 0) {
      this.goals = sharedGoals;
      this.combineAllGoals();
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    // Use setTimeout to prevent blocking
    setTimeout(() => {
      this.goalService.getAllGoals().subscribe({
        next: (data: any) => {
          this.goals = data;
          this.loadSelfCreatedGoals();
          this.combineAllGoals();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading goals, using mock data:', error);
          // Load mock data for development
          this.loadMockGoals();
        }
      });
    }, 100);
  }

  loadSelfCreatedGoals() {
    // In a real application, this would fetch self-created goals from the backend
    // For now, we'll simulate with some mock data
    this.selfCreatedGoals = [
      {
        goalId: 1001,
        title: 'Learn React Advanced Concepts',
        description: 'Master advanced React patterns including hooks, context, and performance optimization',
        status: 'In Progress',
        priority: 'High',
        startDate: new Date('2024-01-15'),
        targetDate: new Date('2024-06-30'),
        progress: 45,
        employee: {
          employeeProfileId: 1,
          user: { 
            userId: 1,
            username: 'john.doe',
            email: 'john.doe@example.com',
            fullName: 'John Doe',
            firstName: 'John', 
            lastName: 'Doe', 
            phoneNumber: '+1-555-0001',
            password: 'password123',
            role: 'employee'
          },
          department: 'Engineering',
          designation: 'Software Engineer',
          dateOfJoining: '2023-01-15',
          reportingManager: 'Manager Smith',
          currentProject: 'Web Development',
          currentTeam: 'Frontend Team',
          skills: ['React', 'JavaScript', 'TypeScript'],
          lastAppraisalRating: 4.2,
          currentGoals: []
        },
        createdBy: 'self', // Indicator that this was self-created
        category: 'Skill Enhancement'
      },
      {
        goalId: 1002,
        title: 'Complete AWS Certification',
        description: 'Obtain AWS Solutions Architect certification to enhance cloud skills',
        status: 'Pending',
        priority: 'Medium',
        startDate: new Date('2024-02-01'),
        targetDate: new Date('2024-08-31'),
        progress: 0,
        employee: {
          employeeProfileId: 2,
          user: { 
            userId: 2,
            username: 'jane.smith',
            email: 'jane.smith@example.com',
            fullName: 'Jane Smith',
            firstName: 'Jane', 
            lastName: 'Smith', 
            phoneNumber: '+1-555-0002',
            password: 'password123',
            role: 'employee'
          },
          department: 'Engineering',
          designation: 'Senior Developer',
          dateOfJoining: '2022-06-01',
          reportingManager: 'Manager Johnson',
          currentProject: 'Cloud Migration',
          currentTeam: 'Backend Team',
          skills: ['Java', 'Spring Boot', 'AWS'],
          lastAppraisalRating: 4.5,
          currentGoals: []
        },
        createdBy: 'self',
        category: 'Professional Development'
      }
    ];
  }

  combineAllGoals() {
    // Combine manager-assigned goals with self-created goals
    const allGoals = [...this.goals, ...this.selfCreatedGoals];
    this.filteredGoals = allGoals;
  }

  loadMockGoals() {
    // Mock goal data for development
    const mockGoals: Goal[] = [
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
            fullName: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1-555-0001',
            password: 'password123',
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
          selfRating: 4.0,
          managerRating: 4.2,
          status: 'Completed',
          cycleName: 'Q2 2024 Review',
          appraisalDate: '2024-06-15',
          periodStart: '2024-04-01',
          periodEnd: '2024-06-30',
          managerName: 'Jane Smith',
          reviewerRole: 'Manager',
          reviewDate: '2024-06-25',
          managerComments: 'Good progress on project goals. Shows improvement in technical skills.',
          employee: {
            employeeProfileId: 1,
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
          }
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
            fullName: 'Jane Smith',
            firstName: 'Jane',
            lastName: 'Smith',
            phoneNumber: '+1-555-0002',
            password: 'password123',
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
      }
    ];

    this.goals = mockGoals;
    this.loadSelfCreatedGoals();
    this.combineAllGoals();
    this.isLoading = false;
    this.cdr.markForCheck();
    console.log('Loaded mock goals:', mockGoals);
  }

  loadEmployeeProfiles() {
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (data: any) => {
        this.employeeProfiles = data;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading employee profiles, using mock data:', error);
        this.loadMockEmployeeProfiles();
      }
    });
  }

  loadMockEmployeeProfiles() {
    // Mock employee profile data for development
    const mockProfiles: EmployeeProfile[] = [
      {
        employeeProfileId: 1,
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
      {
        employeeProfileId: 2,
        user: {
          userId: 2,
          username: 'jane.smith',
          email: 'jane.smith@company.com',
          fullName: 'Jane Smith',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+1-555-0002',
          password: 'password123',
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
      }
    ];

    this.employeeProfiles = mockProfiles;
    this.cdr.markForCheck();
    console.log('Loaded mock employee profiles:', mockProfiles);
  }

  loadAppraisals() {
    this.appraisalService.getAllAppraisals().subscribe({
      next: (data: any) => {
        this.appraisals = data;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading appraisals, using mock data:', error);
        this.loadMockAppraisals();
      }
    });
  }

  loadMockAppraisals() {
    // Mock appraisal data for development
    const mockAppraisals: any[] = [
      {
        appraisalId: 1,
        employee: {
          employeeProfileId: 1,
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
    ];

    this.appraisals = mockAppraisals;
    this.cdr.markForCheck();
    console.log('Loaded mock appraisals:', mockAppraisals);
  }

  applyFilters() {
    this.filteredGoals = this.goals.filter(goal => {
      const matchesSearch = !this.searchTerm ||
        goal.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        goal.employee.user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        goal.employee.user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        goal.employee.designation.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || goal.status === this.statusFilter;
      const matchesEmployee = !this.employeeFilter || goal.employee.employeeProfileId.toString() === this.employeeFilter;

      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onEmployeeFilterChange() {
    this.applyFilters();
  }


  openCreateModal() {
    this.goalForm.reset();
    this.goalForm.patchValue({
      status: 'PENDING'
    });
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(goal: Goal) {
    this.selectedGoal = goal;
    this.goalForm.patchValue({
      employeeId: goal.employee.employeeProfileId,
      title: goal.title,
      description: goal.description,
      category: goal.category || '',
      startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '',
      endDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      managerComments: goal.managerComments || '',
      status: goal.status
    });
    this.showEditModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openDeleteModal(goal: Goal) {
    this.selectedGoal = goal;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedGoal = null;
    this.goalForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  createGoal() {
    console.log('createGoal called');
    console.log('Form valid:', this.goalForm.valid);
    console.log('Form value:', this.goalForm.value);
    console.log('Form errors:', this.getFormErrors());
    
    if (this.goalForm.valid) {
      const formData = this.goalForm.value;
      const selectedEmployee = this.employeeProfiles.find(emp => emp.employeeProfileId === formData.employeeId);
      
      const goal: Goal = {
        goalId: 0, // Will be set by backend
        title: formData.title,
        description: formData.description,
        status: formData.status,
        category: formData.category,
        startDate: new Date(formData.startDate),
        targetDate: new Date(formData.endDate),
        managerComments: formData.managerComments,
        createdBy: 'manager',
        employee: selectedEmployee || {
          employeeProfileId: formData.employeeId,
          department: '',
          designation: '',
          dateOfJoining: '',
          reportingManager: '',
          currentProject: '',
          currentTeam: '',
          skills: [],
          lastAppraisalRating: 0,
          currentGoals: [],
          user: {
            userId: 0,
            username: '',
            email: '',
            fullName: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            password: '',
            role: ''
          }
        },
        appraisal: undefined
      };

      // Add to local list immediately
      this.goals.unshift(goal);
      this.applyFilters();
      this.cdr.markForCheck();

      // Add to shared service
      this.sharedGoalService.addGoal(goal);
      
      this.goalService.createGoal(goal).subscribe({
        next: (response: any) => {
          this.successMessage = 'Goal created successfully!';
          // Update with real ID from backend
          if (response && response.goalId) {
            const index = this.goals.findIndex(g => g.goalId === goal.goalId);
            if (index !== -1) {
              this.goals[index] = { ...goal, goalId: response.goalId };
              this.applyFilters();
              this.cdr.markForCheck();
            }
          }
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error creating goal, using mock response:', error);
          // Mock successful creation for development
          this.successMessage = 'Goal created successfully! (Mock)';
          this.closeModals();
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  updateGoal() {
    if (this.goalForm.valid && this.selectedGoal) {
      const formData = this.goalForm.value;
      const selectedEmployee = this.employeeProfiles.find(emp => emp.employeeProfileId === formData.employeeId);
      
      const goal: Goal = {
        ...this.selectedGoal,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        category: formData.category,
        startDate: new Date(formData.startDate),
        targetDate: new Date(formData.endDate),
        managerComments: formData.managerComments,
        employee: selectedEmployee || this.selectedGoal.employee,
        appraisal: undefined
      };

      this.goalService.updateGoal(goal).subscribe({
        next: (response: any) => {
          this.successMessage = 'Goal updated successfully!';
          this.loadGoals();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to update goal. Please try again.';
          console.error('Error updating goal:', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  deleteGoal() {
    if (this.selectedGoal) {
      this.goalService.deleteGoal(this.selectedGoal.goalId).subscribe({
        next: () => {
          this.successMessage = 'Goal deleted successfully!';
          this.loadGoals();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to delete goal. Please try again.';
          console.error('Error deleting goal:', error);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }

  getSourceClass(createdBy: string | undefined): string {
    switch (createdBy) {
      case 'self': return 'source-self';
      case 'manager': return 'source-manager';
      default: return 'source-manager'; // Default to manager for existing goals
    }
  }

  getStatuses(): string[] {
    return ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  }

  getCategories(): string[] {
    return ['Technical', 'Behavioral', 'Leadership', 'Learning & Development'];
  }

  getFormErrors() {
    const errors: any = {};
    Object.keys(this.goalForm.controls).forEach(key => {
      const control = this.goalForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }
}