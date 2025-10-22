import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewCycleService } from '../../../service/review-cycle.service';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { AppraisalService } from '../../../service/appraisal.service';
import { AuthService } from '../../../service/auth.service';
import { ReviewCycle } from '../../../model/review-cycle.model';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { Appraisal } from '../../../model/appraisal.model';

@Component({
  selector: 'app-review-cycle',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './review-cycle.component.html',
  styleUrl: './review-cycle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewCycleComponent implements OnInit {
  menuItems = [
    { title: 'Admin Dashboard', route: '/admin-dashboard', icon: 'fa-tachometer-alt' },
    { title: 'Appraisal', route: '/appraisal', icon: 'fa-clipboard-check' },
    { title: 'Employee Profile', route: '/employee-profile', icon: 'fa-user' },
    { title: 'Feedback', route: '/feedback', icon: 'fa-comments' },
    { title: 'Goal', route: '/goal', icon: 'fa-bullseye' },
    { title: 'Review Cycle', route: '/review-cycle', icon: 'fa-calendar-alt' }
  ];

  reviewCycles: ReviewCycle[] = [];
  filteredReviewCycles: ReviewCycle[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showEmployeesModal = false;
  showAddEmployeesModal = false;
  selectedReviewCycle: ReviewCycle | null = null;
  employeesInCycle: any[] = [];
  allEmployees: any[] = [];
  selectedEmployees: number[] = [];

  // Forms
  reviewCycleForm: FormGroup;

  // Filters
  searchTerm = '';

  constructor(
    public router: Router,
    private reviewCycleService: ReviewCycleService,
    private employeeProfileService: EmployeeProfileService,
    private appraisalService: AppraisalService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.reviewCycleForm = this.fb.group({
      cycleName: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      deadline: [''],
      status: ['Scheduled', Validators.required]
    });
  }

  ngOnInit() {
    this.loadReviewCycles();
  }

  loadReviewCycles() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.reviewCycleService.getAllReviewCycles().subscribe({
      next: (data: ReviewCycle[]) => {
        console.log('Review cycles loaded from database:', data);
        this.reviewCycles = data;
        this.filteredReviewCycles = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading review cycles:', error);
        this.errorMessage = 'Unable to load review cycles from database. Please check your connection.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadMockReviewCycles() {
    // Mock review cycle data for development
    const mockCycles: ReviewCycle[] = [
      {
        cycleId: 1,
        cycleName: 'Q1 2024 Performance Review',
        status: 'Completed',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        deadline: '2024-03-25',
        description: 'First quarter performance review cycle for 2024. Focus on goal achievement and skill development.'
      },
      {
        cycleId: 2,
        cycleName: 'Q2 2024 Performance Review',
        status: 'Completed',
        startDate: '2024-04-01',
        endDate: '2024-06-30',
        deadline: '2024-06-25',
        description: 'Second quarter performance review cycle for 2024. Emphasis on mid-year objectives and team collaboration.'
      },
      {
        cycleId: 3,
        cycleName: 'Q3 2024 Performance Review',
        status: 'In Progress',
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        deadline: '2024-09-25',
        description: 'Third quarter performance review cycle for 2024. Focus on project completion and leadership development.'
      },
      {
        cycleId: 4,
        cycleName: 'Annual 2024 Review',
        status: 'Scheduled',
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        deadline: '2024-12-20',
        description: 'Annual comprehensive performance review for 2024. Complete evaluation of yearly goals and career development.'
      },
      {
        cycleId: 5,
        cycleName: 'Mid-Year 2024 Review',
        status: 'Completed',
        startDate: '2024-04-01',
        endDate: '2024-06-15',
        deadline: '2024-06-10',
        description: 'Mid-year performance check-in for 2024. Quick assessment of progress and goal adjustments.'
      }
    ];

    this.reviewCycles = mockCycles;
    this.filteredReviewCycles = mockCycles;
    this.isLoading = false;
    this.cdr.markForCheck();
    console.log('Loaded mock review cycles:', mockCycles);
  }

  applyFilters() {
    this.filteredReviewCycles = this.reviewCycles.filter(cycle => {
      const matchesSearch = !this.searchTerm ||
        cycle.cycleName.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  openCreateModal() {
    this.reviewCycleForm.reset();
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(reviewCycle: ReviewCycle) {
    this.selectedReviewCycle = reviewCycle;
    this.reviewCycleForm.patchValue({
      cycleName: reviewCycle.cycleName,
      description: reviewCycle.description || '',
      startDate: reviewCycle.startDate,
      endDate: reviewCycle.endDate,
      deadline: reviewCycle.deadline || '',
      status: reviewCycle.status
    });
    this.showEditModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openDeleteModal(reviewCycle: ReviewCycle) {
    this.selectedReviewCycle = reviewCycle;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showEmployeesModal = false;
    this.showAddEmployeesModal = false;
    this.selectedReviewCycle = null;
    this.employeesInCycle = [];
    this.selectedEmployees = [];
    this.reviewCycleForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeAddEmployeesModal() {
    this.showAddEmployeesModal = false;
    this.selectedEmployees = [];
    // Refresh the employees list when closing the add employees modal
    if (this.selectedReviewCycle) {
      this.loadEmployeesInCycle(this.selectedReviewCycle);
    }
  }

  createReviewCycle() {
    if (this.reviewCycleForm.valid) {
      const formData = this.reviewCycleForm.value;
      
      const newReviewCycle: ReviewCycle = {
        cycleId: Date.now(), // Generate temporary ID
        cycleName: formData.cycleName,
        description: formData.description || '',
        startDate: formData.startDate,
        endDate: formData.endDate,
        deadline: formData.deadline || '',
        status: formData.status
      };

      // Add to local list immediately
      this.reviewCycles.unshift(newReviewCycle);
      this.applyFilters();
      this.cdr.markForCheck();

      this.reviewCycleService.createReviewCycle(newReviewCycle).subscribe({
        next: (response: any) => {
          this.successMessage = 'Review cycle created successfully!';
          // Update with real ID from backend
          if (response && response.cycleId) {
            const index = this.reviewCycles.findIndex(rc => rc.cycleId === newReviewCycle.cycleId);
            if (index !== -1) {
              this.reviewCycles[index] = { ...newReviewCycle, cycleId: response.cycleId };
              this.applyFilters();
              this.cdr.markForCheck();
            }
          }
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error creating review cycle, using mock response:', error);
          // Mock successful creation for development
          this.successMessage = 'Review cycle created successfully! (Mock)';
          this.closeModals();
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  updateReviewCycle() {
    if (this.reviewCycleForm.valid && this.selectedReviewCycle) {
      const formData = this.reviewCycleForm.value;
      
      const reviewCycle: ReviewCycle = {
        ...this.selectedReviewCycle,
        cycleName: formData.cycleName,
        description: formData.description || '',
        startDate: formData.startDate,
        endDate: formData.endDate,
        deadline: formData.deadline || '',
        status: formData.status
      };

      this.reviewCycleService.updateReviewCycle(this.selectedReviewCycle.cycleId || 0, reviewCycle).subscribe({
        next: (response: any) => {
          this.successMessage = 'Review cycle updated successfully!';
          this.loadReviewCycles();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error updating review cycle, using mock response:', error);
          // Mock successful update for development
          this.successMessage = 'Review cycle updated successfully! (Mock)';
          this.loadReviewCycles();
          this.closeModals();
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  deleteReviewCycle() {
    if (this.selectedReviewCycle) {
      this.reviewCycleService.deleteReviewCycle(this.selectedReviewCycle.cycleId || 0).subscribe({
        next: () => {
          this.successMessage = 'Review cycle deleted successfully!';
          this.loadReviewCycles();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error deleting review cycle, using mock response:', error);
          // Mock successful deletion for development
          this.successMessage = 'Review cycle deleted successfully! (Mock)';
          this.loadReviewCycles();
          this.closeModals();
        }
      });
    }
  }

  getAppraisalCount(reviewCycle: ReviewCycle): number {
    return 0; // No appraisals field in ReviewCycle model
  }

  viewEmployeesInCycle(reviewCycle: ReviewCycle) {
    this.selectedReviewCycle = reviewCycle;
    this.loadEmployeesInCycle(reviewCycle);
    this.showEmployeesModal = true;
  }

  loadEmployeesInCycle(reviewCycle: ReviewCycle) {
    if (!reviewCycle.cycleId) {
      console.error('Review cycle ID is required');
      this.employeesInCycle = [];
      return;
    }

    this.appraisalService.getAppraisalsByCycle(reviewCycle.cycleId).subscribe({
      next: (appraisals: Appraisal[]) => {
        console.log(`Loaded ${appraisals.length} appraisals for cycle ${reviewCycle.cycleName}:`, appraisals);
        this.employeesInCycle = appraisals;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading employees in cycle:', error);
        this.employeesInCycle = [];
        this.cdr.markForCheck();
      }
    });
  }

  openAddEmployeesModal() {
    this.loadAllEmployees();
    this.showAddEmployeesModal = true;
    this.selectedEmployees = [];
  }

  loadAllEmployees() {
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (employees: EmployeeProfile[]) => {
        console.log('Loaded all employees:', employees);
        this.allEmployees = employees;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading all employees:', error);
        this.allEmployees = [];
        this.cdr.markForCheck();
      }
    });
  }

  toggleEmployeeSelection(employeeId: number) {
    const index = this.selectedEmployees.indexOf(employeeId);
    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
    } else {
      this.selectedEmployees.push(employeeId);
    }
  }

  isEmployeeSelected(employeeId: number): boolean {
    return this.selectedEmployees.includes(employeeId);
  }

  isEmployeeInCycle(employeeId: number): boolean {
    return this.employeesInCycle.some(emp => emp.employee.employeeProfileId === employeeId);
  }

  addSelectedEmployees() {
    if (this.selectedEmployees.length === 0) {
      this.errorMessage = 'Please select at least one employee to add.';
      return;
    }

    if (!this.selectedReviewCycle?.cycleId) {
      this.errorMessage = 'No review cycle selected.';
      return;
    }

    // Create appraisals for the selected employees
    const employeesToAdd = this.allEmployees.filter(emp => 
      this.selectedEmployees.includes(emp.employeeProfileId || 0)
    );

    let successCount = 0;
    let errorCount = 0;

    // Add each employee to the review cycle using the correct API endpoint
    employeesToAdd.forEach(employee => {
      const appraisalData: Appraisal = {
        status: 'Draft',
        selfRating: 0,
        managerRating: 0,
        cycleName: this.selectedReviewCycle!.cycleName,
        periodStart: this.selectedReviewCycle!.startDate,
        periodEnd: this.selectedReviewCycle!.endDate,
        managerComments: '',
        reviewerRole: 'Manager'
      };

      console.log(`Adding employee ${employee.user?.fullName} (ID: ${employee.employeeProfileId}) to cycle ${this.selectedReviewCycle!.cycleName} (ID: ${this.selectedReviewCycle!.cycleId})`);

      // Use the createAppraisalWithIds method which takes employeeId and cycleId as path parameters
      this.appraisalService.createAppraisalWithIds(
        employee.employeeProfileId!, 
        this.selectedReviewCycle!.cycleId!, 
        appraisalData
      ).subscribe({
        next: (response: Appraisal) => {
          successCount++;
          console.log(`Successfully added employee ${employee.user?.fullName} to cycle ${this.selectedReviewCycle!.cycleName}`, response);
          
          if (successCount + errorCount === employeesToAdd.length) {
            if (errorCount === 0) {
              this.successMessage = `Successfully added ${successCount} employee(s) to the review cycle.`;
            } else {
              this.successMessage = `Added ${successCount} employee(s) successfully. ${errorCount} failed.`;
            }
            // Refresh the employees in cycle list
            this.loadEmployeesInCycle(this.selectedReviewCycle!);
            this.closeAddEmployeesModal();
          }
        },
        error: (error: any) => {
          errorCount++;
          console.error(`Error adding employee ${employee.user?.fullName} to cycle:`, error);
          
          if (successCount + errorCount === employeesToAdd.length) {
            if (successCount > 0) {
              this.successMessage = `Added ${successCount} employee(s) successfully. ${errorCount} failed.`;
            } else {
              this.errorMessage = `Failed to add employees to the review cycle.`;
            }
            this.closeAddEmployeesModal();
          }
        }
      });
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/website/landing']);
  }
}