import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppraisalService } from '../../../service/appraisal.service';
import { Appraisal } from '../../../model/appraisal.model';

@Component({
  selector: 'app-appraisal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appraisal.component.html',
  styleUrl: './appraisal.component.css',
})
export class AppraisalComponent implements OnInit {
  menuItems = [
    { title: 'Dashboard', route: '/dashboard', icon: 'fa-tachometer-alt' },
    { title: 'Appraisal', route: '/appraisal', icon: 'fa-clipboard-check' },
    { title: 'Employee Profile', route: '/employee-profile', icon: 'fa-user' },
    { title: 'Feedback', route: '/feedback', icon: 'fa-comments' },
    { title: 'Goal', route: '/goal', icon: 'fa-bullseye' },
    { title: 'Review Cycle', route: '/review-cycle', icon: 'fa-calendar-alt' }
  ];

  appraisals: Appraisal[] = [];
  filteredAppraisals: Appraisal[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedAppraisal: Appraisal | null = null;

  // Forms
  appraisalForm: FormGroup;

  // Filters
  searchTerm = '';
  statusFilter = '';
  employeeFilter = '';

  constructor(
    private router: Router,
    private appraisalService: AppraisalService,
    private fb: FormBuilder
  ) {
    this.appraisalForm = this.fb.group({
      employeeId: ['', Validators.required],
      cycleId: ['', Validators.required],
      selfRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      managerRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      status: ['DRAFT', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAppraisals();
  }

  loadAppraisals() {
    this.isLoading = true;
    this.errorMessage = '';

    this.appraisalService.getAllAppraisals().subscribe({
      next: (data: any) => {
        this.appraisals = data;
        this.filteredAppraisals = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load appraisals. Please try again.';
        this.isLoading = false;
        console.error('Error loading appraisals:', error);
      }
    });
  }

  applyFilters() {
    this.filteredAppraisals = this.appraisals.filter(appraisal => {
      const matchesSearch = !this.searchTerm ||
        appraisal.employee.user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appraisal.employee.user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appraisal.employee.user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appraisal.employee.designation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appraisal.employee.department.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || appraisal.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  openCreateModal() {
    this.appraisalForm.reset();
    this.appraisalForm.patchValue({
      status: 'DRAFT',
      selfRating: 0,
      managerRating: 0
    });
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(appraisal: Appraisal) {
    this.selectedAppraisal = appraisal;
    this.appraisalForm.patchValue({
      employeeId: appraisal.employee.employeeProfileId,
      cycleId: appraisal.reviewCycle.cycleId,
      selfRating: appraisal.selfRating,
      managerRating: appraisal.managerRating,
      status: appraisal.status
    });
    this.showEditModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openDeleteModal(appraisal: Appraisal) {
    this.selectedAppraisal = appraisal;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedAppraisal = null;
    this.appraisalForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  createAppraisal() {
    if (this.appraisalForm.valid) {
      const formData = this.appraisalForm.value;
      const appraisal: Appraisal = {
        appraisalId: 0, // Will be set by backend
        employee: {
          employeeProfileId: formData.employeeId,
          department: '',
          designation: '',
          user: {
            userId: 0,
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            role: ''
          }
        },
        reviewCycle: {
          cycleId: formData.cycleId,
          cycleName: '',
          appraisals: []
        },
        selfRating: formData.selfRating,
        managerRating: formData.managerRating,
        status: formData.status
      };

      this.appraisalService.createAppraisal(appraisal).subscribe({
        next: (response: any) => {
          this.successMessage = 'Appraisal created successfully!';
          this.loadAppraisals();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to create appraisal. Please try again.';
          console.error('Error creating appraisal:', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  updateAppraisal() {
    if (this.appraisalForm.valid && this.selectedAppraisal) {
      const formData = this.appraisalForm.value;
      const appraisal: Appraisal = {
        ...this.selectedAppraisal,
        selfRating: formData.selfRating,
        managerRating: formData.managerRating,
        status: formData.status
      };

      this.appraisalService.updateAppraisal(appraisal).subscribe({
        next: (response: any) => {
          this.successMessage = 'Appraisal updated successfully!';
          this.loadAppraisals();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to update appraisal. Please try again.';
          console.error('Error updating appraisal:', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  deleteAppraisal() {
    if (this.selectedAppraisal) {
      this.appraisalService.deleteAppraisal(this.selectedAppraisal.appraisalId).subscribe({
        next: () => {
          this.successMessage = 'Appraisal deleted successfully!';
          this.loadAppraisals();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to delete appraisal. Please try again.';
          console.error('Error deleting appraisal:', error);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'draft': return 'status-draft';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'approved': return 'status-approved';
      default: return 'status-default';
    }
  }

  getRatingClass(rating: number): string {
    if (rating >= 4) return 'rating-excellent';
    if (rating >= 3) return 'rating-good';
    if (rating >= 2) return 'rating-average';
    return 'rating-poor';
  }

  getAverageRating(appraisal: Appraisal): number {
    return (appraisal.selfRating + appraisal.managerRating) / 2;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }
}
