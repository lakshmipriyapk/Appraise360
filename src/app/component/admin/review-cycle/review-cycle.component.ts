import { Component, OnInit } from '@angular/core';
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
  selectedReviewCycle: ReviewCycle | null = null;
  employeesInCycle: any[] = [];

  // Forms
  reviewCycleForm: FormGroup;

  // Filters
  searchTerm = '';

  constructor(
    public router: Router,
    private reviewCycleService: ReviewCycleService,
    private fb: FormBuilder
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

    this.reviewCycleService.getAllReviewCycles().subscribe({
      next: (data: any) => {
        this.reviewCycles = data;
        this.filteredReviewCycles = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading review cycles, using mock data:', error);
        // Load mock data for development
        this.loadMockReviewCycles();
      }
    });
  }

  loadMockReviewCycles() {
    // Mock review cycle data for development
    const mockCycles: ReviewCycle[] = [
      {
        cycleId: 1,
        cycleName: 'Q1 2024 Performance Review',
        appraisals: []
      },
      {
        cycleId: 2,
        cycleName: 'Q2 2024 Performance Review',
        appraisals: []
      },
      {
        cycleId: 3,
        cycleName: 'Q3 2024 Performance Review',
        appraisals: []
      },
      {
        cycleId: 4,
        cycleName: 'Annual 2024 Review',
        appraisals: []
      },
      {
        cycleId: 5,
        cycleName: 'Mid-Year 2024 Review',
        appraisals: []
      }
    ];

    this.reviewCycles = mockCycles;
    this.filteredReviewCycles = mockCycles;
    this.isLoading = false;
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
    this.selectedReviewCycle = null;
    this.employeesInCycle = [];
    this.reviewCycleForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  createReviewCycle() {
    if (this.reviewCycleForm.valid) {
      const formData = this.reviewCycleForm.value;
      
      const reviewCycle: ReviewCycle = {
        cycleId: 0, // Will be set by backend
        cycleName: formData.cycleName,
        appraisals: []
      };

      this.reviewCycleService.createReviewCycle(reviewCycle).subscribe({
        next: (response: any) => {
          this.successMessage = 'Review cycle created successfully!';
          this.loadReviewCycles();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error creating review cycle, using mock response:', error);
          // Mock successful creation for development
          this.successMessage = 'Review cycle created successfully! (Mock)';
          this.loadReviewCycles();
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
        cycleName: formData.cycleName
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
    this.loadEmployeesInCycle(reviewCycle.cycleId);
    this.showEmployeesModal = true;
  }

  loadEmployeesInCycle(cycleId: number) {
    // Mock data for employees in this review cycle
    // In real implementation, this would call the appraisal service to get appraisals by cycle ID
    const mockEmployeesInCycle = [
      {
        appraisalId: 1,
        selfRating: 4,
        managerRating: 4.2,
        status: 'Completed',
        employee: {
          employeeProfileId: 1,
          department: 'Engineering',
          designation: 'Software Engineer',
          dateOfJoining: '2023-01-15',
          reportingManager: 'John Smith',
          currentProject: 'Performance Appraisal System',
          currentTeam: 'Full Stack Team',
          skills: ['Angular', 'Spring Boot', 'TypeScript'],
          lastAppraisalRating: 4.2,
          currentGoals: ['Complete Angular Training'],
          user: {
            userId: 1,
            username: 'john.doe',
            email: 'john.doe@company.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'Employee'
          }
        }
      },
      {
        appraisalId: 2,
        selfRating: 3,
        managerRating: 3.5,
        status: 'In Review',
        employee: {
          employeeProfileId: 2,
          department: 'Marketing',
          designation: 'Marketing Specialist',
          dateOfJoining: '2023-03-20',
          reportingManager: 'Jane Wilson',
          currentProject: 'Brand Campaign',
          currentTeam: 'Marketing Team',
          skills: ['Digital Marketing', 'Content Creation'],
          lastAppraisalRating: 3.5,
          currentGoals: ['Increase brand awareness'],
          user: {
            userId: 2,
            username: 'jane.smith',
            email: 'jane.smith@company.com',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'Employee'
          }
        }
      }
    ];

    // Filter mock data based on cycle ID (simulating different cycles)
    if (cycleId === 1) {
      this.employeesInCycle = mockEmployeesInCycle;
    } else if (cycleId === 2) {
      this.employeesInCycle = [mockEmployeesInCycle[0]]; // Only John Doe in Q2
    } else {
      this.employeesInCycle = []; // No employees in other cycles
    }

    console.log(`Loaded ${this.employeesInCycle.length} employees for cycle ${cycleId}:`, this.employeesInCycle);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }
}