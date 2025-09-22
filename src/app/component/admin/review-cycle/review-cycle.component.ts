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
  selectedReviewCycle: ReviewCycle | null = null;

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
        this.errorMessage = 'Failed to load review cycles. Please try again.';
        this.isLoading = false;
        console.error('Error loading review cycles:', error);
      }
    });
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
    this.selectedReviewCycle = null;
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
          this.errorMessage = 'Failed to create review cycle. Please try again.';
          console.error('Error creating review cycle:', error);
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
          this.errorMessage = 'Failed to update review cycle. Please try again.';
          console.error('Error updating review cycle:', error);
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
          this.errorMessage = 'Failed to delete review cycle. Please try again.';
          console.error('Error deleting review cycle:', error);
        }
      });
    }
  }

  getAppraisalCount(reviewCycle: ReviewCycle): number {
    return reviewCycle.appraisals ? reviewCycle.appraisals.length : 0;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }
}