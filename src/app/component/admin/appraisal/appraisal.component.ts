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
      selfRating: [0, [Validators.min(0), Validators.max(5)]], // Optional, 0 means not submitted
      managerRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      status: ['Submitted', Validators.required]
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
        console.error('Error loading appraisals, using mock data:', error);
        // Load mock data for development
        this.loadMockAppraisals();
      }
    });
  }

  loadMockAppraisals() {
    // Mock appraisal data for development
    const mockAppraisals: Appraisal[] = [
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
        },
        reviewCycle: {
          cycleId: 1,
          cycleName: 'Q3 2024 Review',
          appraisals: []
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
        },
        reviewCycle: {
          cycleId: 1,
          cycleName: 'Q3 2024 Review',
          appraisals: []
        }
      },
      {
        appraisalId: 3,
        selfRating: 0,
        managerRating: 4.8,
        status: 'Submitted',
        employee: {
          employeeProfileId: 3,
          department: 'Sales',
          designation: 'Sales Manager',
          dateOfJoining: '2022-11-10',
          reportingManager: 'Mike Johnson',
          currentProject: 'Q4 Sales Target',
          currentTeam: 'Sales Team',
          skills: ['Sales Management', 'Client Relations'],
          lastAppraisalRating: 4.8,
          currentGoals: ['Achieve Q4 targets'],
          user: {
            userId: 3,
            username: 'mike.wilson',
            email: 'mike.wilson@company.com',
            firstName: 'Mike',
            lastName: 'Wilson',
            role: 'Employee'
          }
        },
        reviewCycle: {
          cycleId: 1,
          cycleName: 'Q3 2024 Review',
          appraisals: []
        }
      }
    ];

    this.appraisals = mockAppraisals;
    this.filteredAppraisals = mockAppraisals;
    this.isLoading = false;
    console.log('Loaded mock appraisals:', mockAppraisals);
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
      status: 'Submitted',
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

  onSubmitClick() {
    console.log('Submit button clicked');
    console.log('showCreateModal:', this.showCreateModal);
    console.log('Form valid:', this.appraisalForm.valid);
  }

  createAppraisal() {
    console.log('createAppraisal called');
    console.log('Form valid:', this.appraisalForm.valid);
    console.log('Form value:', this.appraisalForm.value);
    
    if (this.appraisalForm.valid) {
      const formData = this.appraisalForm.value;
      console.log('Creating appraisal with data:', formData);
      
      const appraisal: Appraisal = {
        appraisalId: 0, // Will be set by backend
        selfRating: formData.selfRating,
        managerRating: formData.managerRating,
        status: formData.status,
        employee: {
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
        reviewCycle: {
          cycleId: formData.cycleId,
          cycleName: '',
          appraisals: []
        }
      };

      console.log('Calling appraisal service with:', appraisal);
      this.appraisalService.createAppraisal(appraisal).subscribe({
        next: (response: any) => {
          console.log('Appraisal created successfully:', response);
          this.successMessage = 'Appraisal created successfully!';
          this.loadAppraisals();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error creating appraisal, trying mock service:', error);
          // Fallback to mock service for development
          this.appraisalService.mockCreateAppraisal(appraisal).subscribe({
            next: (response: any) => {
              console.log('Mock appraisal created successfully:', response);
              this.successMessage = 'Appraisal created successfully! (Mock)';
              this.loadAppraisals();
              this.closeModals();
            },
            error: (mockError: any) => {
              console.error('Mock service also failed:', mockError);
              this.errorMessage = 'Failed to create appraisal. Please try again.';
            }
          });
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
      case 'submitted': return 'status-submitted';
      case 'in review': return 'status-in-review';
      case 'completed': return 'status-completed';
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
