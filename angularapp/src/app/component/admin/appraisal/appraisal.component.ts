import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppraisalService } from '../../../service/appraisal.service';
import { SharedAppraisalService } from '../../../service/shared-appraisal.service';
import { Appraisal } from '../../../model/appraisal.model';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-appraisal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appraisal.component.html',
  styleUrl: './appraisal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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
    private sharedAppraisalService: SharedAppraisalService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.appraisalForm = this.fb.group({
      // Employee Details
      employeeName: ['', [Validators.required, Validators.minLength(2)]],
      employeeId: ['', Validators.required],
      
      // Appraisal Cycle Details
      cycleName: ['', Validators.required],
      appraisalDate: ['', Validators.required],
      periodStart: ['', Validators.required],
      periodEnd: ['', Validators.required],
      
      // Reviewer Details
      managerName: ['', Validators.required],
      reviewerRole: ['', Validators.required],
      reviewDate: ['', Validators.required],
      
      // Performance Ratings
      managerRating: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      status: ['Submitted', Validators.required],
      
      // Admin Comments
      managerComments: ['']
    });
  }

  ngOnInit() {
    // Subscribe to shared appraisal data
    this.sharedAppraisalService.appraisals$.subscribe(appraisals => {
      this.appraisals = appraisals;
      this.applyFilters();
      this.cdr.markForCheck();
    });
    
    this.loadAppraisals();
  }

  loadAppraisals() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    // First check if we have data in shared service
    const sharedAppraisals = this.sharedAppraisalService.getAllAppraisals();
    if (sharedAppraisals && sharedAppraisals.length > 0) {
      this.appraisals = sharedAppraisals;
      this.filteredAppraisals = sharedAppraisals;
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    // Use setTimeout to simulate async loading and prevent blocking
    setTimeout(() => {
      this.appraisalService.getAllAppraisals().subscribe({
        next: (data: any) => {
          this.appraisals = data;
          this.filteredAppraisals = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading appraisals, using mock data:', error);
          // Load mock data for development
          this.loadMockAppraisals();
        }
      });
    }, 100); // Small delay to prevent blocking
  }

  loadMockAppraisals() {
    // Mock appraisal data for development
    const mockAppraisals: Appraisal[] = [
      {
        appraisalId: 1,
        selfRating: 4,
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
            fullName: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1-555-0001',
            password: 'password123',
            role: 'Employee'
          }
        },
        reviewCycle: {
          cycleId: 1,
          cycleName: 'Q3 2024 Review',
          status: 'Completed',
          deadline: new Date('2024-09-30'),
          appraisals: []
        }
      },
      {
        appraisalId: 2,
        selfRating: 3,
        managerRating: 3.5,
        status: 'In Review',
        cycleName: 'Q3 2024 Review',
        appraisalDate: '2024-09-10',
        periodStart: '2024-07-01',
        periodEnd: '2024-09-30',
        managerName: 'Jane Wilson',
        reviewerRole: 'Admin',
        reviewDate: '2024-09-25',
        managerComments: 'Good progress on marketing initiatives. Needs improvement in analytics reporting.',
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
            fullName: 'Jane Smith',
            firstName: 'Jane',
            lastName: 'Smith',
            phoneNumber: '+1-555-0002',
            password: 'password123',
            role: 'Employee'
          }
        },
        reviewCycle: {
          cycleId: 1,
          cycleName: 'Q3 2024 Review',
          status: 'Completed',
          deadline: new Date('2024-09-30'),
          appraisals: []
        }
      },
      {
        appraisalId: 3,
        selfRating: 0,
        managerRating: 4.8,
        status: 'Submitted',
        cycleName: 'Q3 2024 Review',
        appraisalDate: '2024-09-05',
        periodStart: '2024-07-01',
        periodEnd: '2024-09-30',
        managerName: 'Mike Johnson',
        reviewerRole: 'Admin',
        reviewDate: '2024-09-30',
        managerComments: 'Outstanding sales performance. Exceeded all targets and showed excellent leadership.',
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
            fullName: 'Mike Wilson',
            firstName: 'Mike',
            lastName: 'Wilson',
            phoneNumber: '+1-555-0003',
            password: 'password123',
            role: 'Employee'
          }
        },
        reviewCycle: {
          cycleId: 1,
          cycleName: 'Q3 2024 Review',
          status: 'Completed',
          deadline: new Date('2024-09-30'),
          appraisals: []
        }
      }
    ];

    this.appraisals = mockAppraisals;
    this.filteredAppraisals = mockAppraisals;
    this.isLoading = false;
    this.cdr.markForCheck();
    console.log('Loaded mock appraisals:', mockAppraisals);
  }

  applyFilters() {
    this.filteredAppraisals = this.appraisals.filter(appraisal => {
      const matchesSearch = !this.searchTerm ||
        appraisal.employee.user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appraisal.employee.user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appraisal.employee.designation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appraisal.employee.department.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || appraisal.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
    this.cdr.markForCheck();
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
      managerRating: 1,
      reviewerRole: 'Admin',
      appraisalDate: new Date().toISOString().split('T')[0],
      reviewDate: new Date().toISOString().split('T')[0]
    });
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(appraisal: Appraisal) {
    this.selectedAppraisal = appraisal;
    this.appraisalForm.patchValue({
      // Employee Details
      employeeName: appraisal.employee.user.fullName,
      employeeId: appraisal.employee.employeeProfileId.toString(),
      
      // Appraisal Cycle Details
      cycleName: appraisal.reviewCycle.cycleName,
      appraisalDate: new Date().toISOString().split('T')[0], // Current date
      periodStart: new Date(appraisal.reviewCycle.deadline.getTime() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months before deadline
      periodEnd: appraisal.reviewCycle.deadline.toISOString().split('T')[0],
      
      // Reviewer Details
      managerName: appraisal.employee.reportingManager,
      reviewerRole: 'Admin',
      reviewDate: new Date().toISOString().split('T')[0],
      
      // Performance Ratings
      managerRating: appraisal.managerRating,
      status: appraisal.status,
      
      // Admin Comments
      managerComments: ''
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

  getFormErrors() {
    const errors: any = {};
    Object.keys(this.appraisalForm.controls).forEach(key => {
      const control = this.appraisalForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }


  createAppraisal() {
    console.log('createAppraisal called');
    console.log('Form valid:', this.appraisalForm.valid);
    console.log('Form value:', this.appraisalForm.value);
    console.log('Form errors:', this.getFormErrors());
    
    if (this.appraisalForm.valid) {
      const formData = this.appraisalForm.value;
      console.log('Creating appraisal with data:', formData);
      
      // Use employee name as fullName
      const fullName = formData.employeeName;
      
      const appraisal: Appraisal = {
        appraisalId: 0, // Will be set by backend
        selfRating: 0, // Default value since self rating is removed
        managerRating: formData.managerRating,
        status: formData.status,
        cycleName: formData.cycleName,
        appraisalDate: formData.appraisalDate,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        managerName: formData.managerName,
        reviewerRole: formData.reviewerRole,
        reviewDate: formData.reviewDate,
        managerComments: formData.managerComments,
        employee: {
          employeeProfileId: parseInt(formData.employeeId),
          department: '', // Default value since removed from form
          designation: '', // Default value since removed from form
          dateOfJoining: '', // Default value since removed from form
          reportingManager: formData.managerName,
          currentProject: '',
          currentTeam: '',
          skills: [],
          lastAppraisalRating: 0,
          currentGoals: [],
          user: {
            userId: parseInt(formData.employeeId),
            username: `${fullName.toLowerCase().replace(' ', '.')}`,
            email: `${fullName.toLowerCase().replace(' ', '.')}@company.com`,
            fullName: fullName,
            firstName: fullName.split(' ')[0] || '',
            lastName: fullName.split(' ').slice(1).join(' ') || '',
            phoneNumber: '+1-555-0000',
            password: 'password123',
            role: 'Employee'
          }
        },
        reviewCycle: {
          cycleId: 0,
          cycleName: formData.cycleName,
          status: 'Active',
          deadline: new Date(formData.periodEnd),
          appraisals: []
        }
      };

      console.log('Calling appraisal service with:', appraisal);
      
      // Add the new appraisal to the local list immediately
      const newAppraisal = {
        ...appraisal,
        appraisalId: Date.now() // Generate a temporary ID
      };
      this.appraisals.unshift(newAppraisal);
      this.applyFilters(); // Update the filtered list
      this.cdr.markForCheck();

      // Add to shared service
      this.sharedAppraisalService.addAppraisal(newAppraisal);
      
      this.appraisalService.createAppraisal(appraisal).subscribe({
        next: (response: any) => {
          console.log('Appraisal created successfully:', response);
          this.successMessage = 'Appraisal created successfully!';
          // Update the appraisal with the real ID from backend
          if (response && response.appraisalId) {
            const index = this.appraisals.findIndex(a => a.appraisalId === newAppraisal.appraisalId);
            if (index !== -1) {
              this.appraisals[index] = { ...newAppraisal, appraisalId: response.appraisalId };
              this.applyFilters();
              this.cdr.markForCheck();
            }
          }
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error creating appraisal, trying mock service:', error);
          // Fallback to mock service for development
          this.appraisalService.mockCreateAppraisal(appraisal).subscribe({
            next: (response: any) => {
              console.log('Mock appraisal created successfully:', response);
              this.successMessage = 'Appraisal created successfully! (Mock)';
              // Update the appraisal with the mock response
              if (response && response.appraisalId) {
                const index = this.appraisals.findIndex(a => a.appraisalId === newAppraisal.appraisalId);
                if (index !== -1) {
                  this.appraisals[index] = { ...newAppraisal, appraisalId: response.appraisalId };
                  this.applyFilters();
                  this.cdr.markForCheck();
                }
              }
              this.closeModals();
            },
            error: (mockError: any) => {
              console.error('Mock service also failed:', mockError);
              this.errorMessage = 'Failed to create appraisal. Please try again.';
              // Remove the temporarily added appraisal on error
              const index = this.appraisals.findIndex(a => a.appraisalId === newAppraisal.appraisalId);
              if (index !== -1) {
                this.appraisals.splice(index, 1);
                this.applyFilters();
                this.cdr.markForCheck();
              }
            }
          });
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  updateAppraisal() {
    console.log('updateAppraisal called');
    console.log('Form valid:', this.appraisalForm.valid);
    console.log('Form value:', this.appraisalForm.value);
    console.log('Form errors:', this.getFormErrors());
    console.log('Selected appraisal:', this.selectedAppraisal);
    
    if (this.appraisalForm.valid && this.selectedAppraisal) {
      const formData = this.appraisalForm.value;
      
      // Use employee name as fullName
      const fullName = formData.employeeName;
      
      const updatedAppraisal: Appraisal = {
        ...this.selectedAppraisal,
        selfRating: 0, // Default value since self rating is removed
        managerRating: formData.managerRating,
        status: formData.status,
        employee: {
          ...this.selectedAppraisal.employee,
          employeeProfileId: parseInt(formData.employeeId),
          reportingManager: formData.managerName,
          user: {
            ...this.selectedAppraisal.employee.user,
            userId: parseInt(formData.employeeId),
            username: `${fullName.toLowerCase().replace(' ', '.')}`,
            email: `${fullName.toLowerCase().replace(' ', '.')}@company.com`,
            fullName: fullName,
            firstName: fullName.split(' ')[0] || '',
            lastName: fullName.split(' ').slice(1).join(' ') || '',
            phoneNumber: '+1-555-0000',
            password: 'password123'
          }
        },
        reviewCycle: {
          ...this.selectedAppraisal.reviewCycle,
          cycleName: formData.cycleName,
          deadline: new Date(formData.periodEnd)
        }
      };

      // Update the local list immediately
      const index = this.appraisals.findIndex(a => a.appraisalId === this.selectedAppraisal!.appraisalId);
      if (index !== -1) {
        this.appraisals[index] = updatedAppraisal;
        this.applyFilters();
        this.cdr.markForCheck();
      }

      this.appraisalService.updateAppraisal(updatedAppraisal).subscribe({
        next: (response: any) => {
          this.successMessage = 'Appraisal updated successfully!';
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to update appraisal. Please try again.';
          console.error('Error updating appraisal:', error);
          // Revert the local change on error
          if (index !== -1) {
            this.appraisals[index] = this.selectedAppraisal!;
            this.applyFilters();
            this.cdr.markForCheck();
          }
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  deleteAppraisal() {
    if (this.selectedAppraisal) {
      const appraisalToDelete = this.selectedAppraisal;
      
      // Remove from local list immediately
      const index = this.appraisals.findIndex(a => a.appraisalId === appraisalToDelete.appraisalId);
      if (index !== -1) {
        this.appraisals.splice(index, 1);
        this.applyFilters();
        this.cdr.markForCheck();
      }
      
      this.appraisalService.deleteAppraisal(appraisalToDelete.appraisalId).subscribe({
        next: () => {
          this.successMessage = 'Appraisal deleted successfully!';
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to delete appraisal. Please try again.';
          console.error('Error deleting appraisal:', error);
          // Restore the appraisal on error
          if (index !== -1) {
            this.appraisals.splice(index, 0, appraisalToDelete);
            this.applyFilters();
            this.cdr.markForCheck();
          }
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
    this.authService.logout();
    this.router.navigate(['/website/landing']);
  }
}
