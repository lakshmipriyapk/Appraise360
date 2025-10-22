import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoalService } from '../../../service/goal.service';
import { SharedGoalService } from '../../../service/shared-goal.service';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { AppraisalService } from '../../../service/appraisal.service';
import { AuthService } from '../../../service/auth.service';
import { Goal } from '../../../model/goal.model';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { Appraisal } from '../../../model/appraisal.model';

@Component({
  selector: 'app-goal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalComponent implements OnInit {

  menuItems = [
    { title: 'Admin Dashboard', route: '/admin-dashboard', icon: 'fa-tachometer-alt' },
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
  selfCreatedGoals: Goal[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedGoal: Goal | null = null;

  // Form
  goalForm: FormGroup;

  // Filters
  searchTerm = '';
  statusFilter = '';
  employeeFilter = '';

  constructor(
    private router: Router,
    private goalService: GoalService,
    private sharedGoalService: SharedGoalService,
    private employeeProfileService: EmployeeProfileService,
    private appraisalService: AppraisalService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.goalForm = this.fb.group({
      employeeId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['Medium', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      managerComments: [''],
      status: ['PENDING', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadGoals();
    this.loadEmployeeProfiles();
    this.loadAppraisals();

    this.sharedGoalService.goals$.subscribe(goals => {
      if (goals?.length) {
        this.goals = goals;
        this.combineAllGoals();
        this.cdr.markForCheck();
      }
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

  navigateTo(route: string) { 
    this.router.navigate([route]); 
  }
  
  logout() { 
    this.authService.logout(); 
    this.router.navigate(['/website/landing']); 
  }

  loadGoals() {
    this.isLoading = true;
    this.goalService.getAllGoals().subscribe({
      next: (data: Goal[]) => {
        console.log('Goals loaded from database:', data);
        this.goals = data || [];
        this.loadSelfCreatedGoals();
        this.combineAllGoals();
        this.sharedGoalService.setGoals(this.goals);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        this.errorMessage = 'Unable to load goals from database. Please check your connection.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadSelfCreatedGoals() {
    this.selfCreatedGoals = [
      {
        goalId: 1001,
        title: 'Learn React Advanced Concepts',
        description: 'Master advanced React patterns',
        status: 'IN_PROGRESS',
        category: 'Learning & Development',
        startDate: '2024-01-15',
        targetDate: '2024-06-30',
        employee: this.employeeProfiles[0] || null,
        createdBy: 'self'
      } as Goal
    ];
  }

  loadEmployeeProfiles() {
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (data: EmployeeProfile[]) => { this.employeeProfiles = data; this.cdr.markForCheck(); }
    });
  }

  loadAppraisals() {
    this.appraisalService.getAllAppraisals().subscribe({
      next: (data: Appraisal[]) => { this.appraisals = data; this.cdr.markForCheck(); }
    });
  }

  combineAllGoals() { this.filteredGoals = [...this.goals, ...this.selfCreatedGoals]; }

  applyFilters() {
    this.filteredGoals = this.goals.filter(goal => {
      const search = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm ||
        goal.title?.toLowerCase().includes(search) ||
        goal.description?.toLowerCase().includes(search) ||
        goal.employee?.user?.firstName?.toLowerCase().includes(search) ||
        goal.employee?.user?.lastName?.toLowerCase().includes(search);
      const matchesStatus = !this.statusFilter || goal.status === this.statusFilter;
      const matchesEmployee = !this.employeeFilter || goal.employee?.employeeProfileId?.toString() === this.employeeFilter;
      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }

  getStatuses(): string[] { return ['PENDING', 'IN_PROGRESS', 'COMPLETED']; }
  getCategories(): string[] { return ['Technical', 'Behavioral', 'Leadership', 'Learning & Development']; }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }
  getSourceClass(createdBy?: string): string { return createdBy === 'self' ? 'source-self' : 'source-manager'; }

  openCreateModal() { this.goalForm.reset({ status: 'PENDING' }); this.showCreateModal = true; }
  openEditModal(goal: Goal) {
    this.selectedGoal = goal;
    this.goalForm.patchValue({
      employeeId: goal.employee?.employeeProfileId || '',
      title: goal.title,
      description: goal.description,
      category: goal.category || '',
      startDate: goal.startDate,
      endDate: goal.targetDate,
      managerComments: goal.managerComments || '',
      status: goal.status
    });
    this.showEditModal = true;
  }
  openDeleteModal(goal: Goal) { this.selectedGoal = goal; this.showDeleteModal = true; }
  closeModals() { this.showCreateModal = this.showEditModal = this.showDeleteModal = false; this.selectedGoal = null; this.goalForm.reset(); }

  createGoal() {
    console.log('Form validity:', this.goalForm.valid);
    console.log('Form errors:', this.goalForm.errors);
    console.log('Form value:', this.goalForm.value);
    console.log('Available employees:', this.employeeProfiles);
    
    if (!this.goalForm.valid) {
      this.errorMessage = 'Please fill in all required fields';
      this.goalForm.markAllAsTouched();
      
      // Log specific field errors
      Object.keys(this.goalForm.controls).forEach(key => {
        const control = this.goalForm.get(key);
        if (control && control.invalid) {
          console.log(`Field ${key} is invalid:`, control.errors);
        }
      });
      return;
    }
    
    const formData = this.goalForm.value;
    console.log('Creating goal with form data:', formData);
    console.log('Selected employee ID:', formData.employeeId);
    
    // Find the selected employee
    const employee = this.employeeProfiles.find(emp => emp.employeeProfileId === formData.employeeId);
    console.log('Found employee:', employee);
    
    if (!employee) {
      this.errorMessage = 'Please select an employee';
      this.goalForm.get('employeeId')?.markAsTouched();
      return;
    }
    
    // Create goal data with proper field mapping for backend
    const goalData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: formData.status || 'Pending',
      priority: formData.priority || 'Medium',
      start_date: formData.startDate,
      target_date: formData.endDate,
      manager_comments: formData.managerComments || '',
      employee_id: employee.employeeProfileId,
      created_by: 'manager',
      progress: 0
    };
    
    console.log('Sending goal data to backend:', goalData);
    
    this.goalService.createGoal(goalData as any).subscribe({
      next: (res: Goal) => { 
        console.log('Goal created successfully:', res);
        this.goals.unshift(res); 
        this.applyFilters(); 
        this.successMessage = 'Goal created successfully'; 
        this.closeModals(); 
      },
      error: (error) => { 
        console.error('Error creating goal:', error);
        this.errorMessage = 'Failed to create goal. Please try again.';
      }
    });
  }

  updateGoal() {
    if (!this.goalForm.valid || !this.selectedGoal) return;
    const formData = this.goalForm.value;
    const employee = this.employeeProfiles.find(emp => emp.employeeProfileId === formData.employeeId);
    const goal: Goal = { ...this.selectedGoal, ...formData, targetDate: formData.endDate, employee: employee || this.selectedGoal.employee };
    this.goalService.updateGoal(this.selectedGoal.goalId || 0, goal).subscribe({
      next: () => { this.successMessage = 'Goal updated'; this.loadGoals(); this.closeModals(); },
      error: () => { this.errorMessage = 'Failed to update goal'; }
    });
  }

  deleteGoal() {
    if (!this.selectedGoal) return;   // ✅ null guard
    this.goalService.deleteGoal(this.selectedGoal.goalId || 0).subscribe({
      next: () => { this.successMessage = 'Goal deleted'; this.loadGoals(); this.closeModals(); },
      error: () => { this.errorMessage = 'Failed to delete goal'; }
    });
  }
}