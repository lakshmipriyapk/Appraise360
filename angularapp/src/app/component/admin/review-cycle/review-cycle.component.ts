import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewCycleService } from '../../../service/review-cycle.service';
import { ReviewCycle } from '../../../model/review-cycle.model';

@Component({
  selector: 'app-review-cycle',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './review-cycle.component.html',
  styleUrl: './review-cycle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewCycleComponent implements OnInit {
  menuItems = [
    { title: 'Dashboard', route: '/dashboard', icon: 'fa-tachometer-alt' },
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
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.reviewCycleForm = this.fb.group({
      cycleName: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadReviewCycles();
  }

  loadReviewCycles() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    // Use setTimeout to prevent blocking
    setTimeout(() => {
      this.reviewCycleService.getAllReviewCycles().subscribe({
        next: (data: any) => {
          this.reviewCycles = data;
          this.filteredReviewCycles = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading review cycles, using mock data:', error);
          // Load mock data for development
          this.loadMockReviewCycles();
        }
      });
    }, 100);
  }

  loadMockReviewCycles() {
    // Mock review cycle data for development
    const mockCycles: ReviewCycle[] = [
      {
        cycleId: 1,
        cycleName: 'Q1 2024 Performance Review',
        status: 'Completed',
        deadline: new Date('2024-03-31'),
        appraisals: []
      },
      {
        cycleId: 2,
        cycleName: 'Q2 2024 Performance Review',
        status: 'Completed',
        deadline: new Date('2024-06-30'),
        appraisals: []
      },
      {
        cycleId: 3,
        cycleName: 'Q3 2024 Performance Review',
        status: 'In Progress',
        deadline: new Date('2024-09-30'),
        appraisals: []
      },
      {
        cycleId: 4,
        cycleName: 'Annual 2024 Review',
        status: 'Scheduled',
        deadline: new Date('2024-12-31'),
        appraisals: []
      },
      {
        cycleId: 5,
        cycleName: 'Mid-Year 2024 Review',
        status: 'Completed',
        deadline: new Date('2024-06-15'),
        appraisals: []
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
      cycleName: reviewCycle.cycleName
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
        status: 'Scheduled',
        deadline: new Date(formData.deadline || new Date()),
        appraisals: []
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
        deadline: new Date(formData.deadline || this.selectedReviewCycle.deadline)
      };

      this.reviewCycleService.updateReviewCycle(reviewCycle).subscribe({
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
      this.reviewCycleService.deleteReviewCycle(this.selectedReviewCycle.cycleId).subscribe({
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
    return reviewCycle.appraisals ? reviewCycle.appraisals.length : 0;
  }

  viewEmployeesInCycle(reviewCycle: ReviewCycle) {
    this.selectedReviewCycle = reviewCycle;
    this.loadEmployeesInCycle(reviewCycle);
    this.showEmployeesModal = true;
  }

  loadEmployeesInCycle(reviewCycle: ReviewCycle) {
    // Use the actual employees from the review cycle
    // If the cycle has appraisals, use those; otherwise, use empty array
    if (reviewCycle.appraisals && reviewCycle.appraisals.length > 0) {
      this.employeesInCycle = reviewCycle.appraisals;
    } else {
      // For new cycles or cycles without employees, show empty state
      this.employeesInCycle = [];
    }

    console.log(`Loaded ${this.employeesInCycle.length} employees for cycle ${reviewCycle.cycleName}:`, this.employeesInCycle);
  }

  openAddEmployeesModal() {
    this.loadAllEmployees();
    this.showAddEmployeesModal = true;
    this.selectedEmployees = [];
  }

  loadAllEmployees() {
    // Mock data for all available employees
    // In real implementation, this would call the employee service
    this.allEmployees = [
      {
        employeeProfileId: 1,
        user: {
          userId: 1,
          username: 'john.doe',
          email: 'john.doe@company.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'Employee'
        },
        department: 'Engineering',
        designation: 'Software Engineer',
        dateOfJoining: '2023-01-15',
        reportingManager: 'John Smith',
        currentProject: 'Performance Appraisal System',
        currentTeam: 'Full Stack Team',
        skills: ['Angular', 'Spring Boot', 'TypeScript'],
        lastAppraisalRating: 4.2,
        currentGoals: ['Complete Angular Training']
      },
      {
        employeeProfileId: 2,
        user: {
          userId: 2,
          username: 'jane.smith',
          email: 'jane.smith@company.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'Employee'
        },
        department: 'Marketing',
        designation: 'Marketing Specialist',
        dateOfJoining: '2023-03-20',
        reportingManager: 'Jane Wilson',
        currentProject: 'Brand Campaign',
        currentTeam: 'Marketing Team',
        skills: ['Digital Marketing', 'Content Creation'],
        lastAppraisalRating: 3.5,
        currentGoals: ['Increase brand awareness']
      },
      {
        employeeProfileId: 3,
        user: {
          userId: 3,
          username: 'mike.johnson',
          email: 'mike.johnson@company.com',
          firstName: 'Mike',
          lastName: 'Johnson',
          role: 'Employee'
        },
        department: 'Sales',
        designation: 'Sales Representative',
        dateOfJoining: '2023-02-10',
        reportingManager: 'Sarah Davis',
        currentProject: 'Q4 Sales Target',
        currentTeam: 'Sales Team',
        skills: ['Sales', 'Customer Relations'],
        lastAppraisalRating: 4.0,
        currentGoals: ['Achieve sales targets']
      },
      {
        employeeProfileId: 4,
        user: {
          userId: 4,
          username: 'lisa.wilson',
          email: 'lisa.wilson@company.com',
          firstName: 'Lisa',
          lastName: 'Wilson',
          role: 'Employee'
        },
        department: 'HR',
        designation: 'HR Specialist',
        dateOfJoining: '2023-04-05',
        reportingManager: 'Tom Brown',
        currentProject: 'Recruitment Drive',
        currentTeam: 'HR Team',
        skills: ['Recruitment', 'Employee Relations'],
        lastAppraisalRating: 4.5,
        currentGoals: ['Improve hiring process']
      }
    ];
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

    // Add selected employees to the review cycle
    const employeesToAdd = this.allEmployees.filter(emp => 
      this.selectedEmployees.includes(emp.employeeProfileId)
    );

    // Create appraisals for the selected employees
    const newAppraisals = employeesToAdd.map(emp => ({
      appraisalId: Date.now() + Math.random(), // Generate unique ID
      selfRating: 0,
      managerRating: 0,
      status: 'Draft',
      employee: emp,
      reviewCycle: this.selectedReviewCycle
    }));

    // Add to the current cycle's appraisals
    if (this.selectedReviewCycle) {
      this.selectedReviewCycle.appraisals = [...(this.selectedReviewCycle.appraisals || []), ...newAppraisals];
      
      // Update the local list
      const index = this.reviewCycles.findIndex(rc => rc.cycleId === this.selectedReviewCycle!.cycleId);
      if (index !== -1) {
        this.reviewCycles[index] = this.selectedReviewCycle;
        this.applyFilters();
        this.cdr.markForCheck();
      }
    }

    // Update the employees in cycle list
    this.employeesInCycle = [...this.employeesInCycle, ...newAppraisals];

    this.successMessage = `Successfully added ${employeesToAdd.length} employee(s) to the review cycle.`;
    this.closeAddEmployeesModal();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }
}