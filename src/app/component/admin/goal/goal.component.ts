import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoalService } from '../../../service/goal.service';
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
  appraisalFilter = '';

  constructor(
    public router: Router,
    private goalService: GoalService,
    private employeeProfileService: EmployeeProfileService,
    private appraisalService: AppraisalService,
    private fb: FormBuilder
  ) {
    this.goalForm = this.fb.group({
      employeeId: ['', Validators.required],
      appraisalId: [''],
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['PENDING', Validators.required]
    });
  }

  ngOnInit() {
    this.loadGoals();
    this.loadEmployeeProfiles();
    this.loadAppraisals();
  }

  loadGoals() {
    this.isLoading = true;
    this.errorMessage = '';

    this.goalService.getAllGoals().subscribe({
      next: (data: any) => {
        this.goals = data;
        this.filteredGoals = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load goals. Please try again.';
        this.isLoading = false;
        console.error('Error loading goals:', error);
      }
    });
  }

  loadEmployeeProfiles() {
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (data: any) => {
        this.employeeProfiles = data;
      },
      error: (error: any) => {
        console.error('Error loading employee profiles:', error);
      }
    });
  }

  loadAppraisals() {
    this.appraisalService.getAllAppraisals().subscribe({
      next: (data: any) => {
        this.appraisals = data;
      },
      error: (error: any) => {
        console.error('Error loading appraisals:', error);
      }
    });
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
      const matchesAppraisal = !this.appraisalFilter || (goal.appraisal && goal.appraisal.appraisalId.toString() === this.appraisalFilter);

      return matchesSearch && matchesStatus && matchesEmployee && matchesAppraisal;
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

  onAppraisalFilterChange() {
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
      appraisalId: goal.appraisal?.appraisalId || '',
      title: goal.title,
      description: goal.description,
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
    if (this.goalForm.valid) {
      const formData = this.goalForm.value;
      const selectedEmployee = this.employeeProfiles.find(emp => emp.employeeProfileId === formData.employeeId);
      const selectedAppraisal = formData.appraisalId ? this.appraisals.find(app => app.appraisalId === formData.appraisalId) : null;
      
      const goal: Goal = {
        goalId: 0, // Will be set by backend
        title: formData.title,
        description: formData.description,
        status: formData.status,
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
            firstName: '',
            lastName: '',
            role: ''
          }
        },
        appraisal: selectedAppraisal || undefined
      };

      this.goalService.createGoal(goal).subscribe({
        next: (response: any) => {
          this.successMessage = 'Goal created successfully!';
          this.loadGoals();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to create goal. Please try again.';
          console.error('Error creating goal:', error);
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
      const selectedAppraisal = formData.appraisalId ? this.appraisals.find(app => app.appraisalId === formData.appraisalId) : null;
      
      const goal: Goal = {
        ...this.selectedGoal,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        employee: selectedEmployee || this.selectedGoal.employee,
        appraisal: selectedAppraisal || undefined
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

  getStatuses(): string[] {
    return ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }
}