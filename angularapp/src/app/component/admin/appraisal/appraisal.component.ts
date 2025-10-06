import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppraisalService } from '../../../service/appraisal.service';
import { ReviewCycleService } from '../../../service/review-cycle.service';
import { Appraisal } from '../../../model/appraisal.model';
import { ReviewCycle } from '../../../model/review-cycle.model';
import { AuthService } from '../../../service/auth.service';

interface EmployeeInfo {
  employeeId: number;
  fullName: string;
  department: string;
  designation: string;
}

@Component({
  selector: 'app-manager-appraisal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './appraisal.component.html',
  styleUrls: ['./appraisal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppraisalComponent implements OnInit {
  menuItems = [
    { label: 'Admin Dashboard', route: '/admin-dashboard', icon: 'fas fa-tachometer-alt' },
    { label: 'Appraisal', route: '/appraisal', icon: 'fas fa-clipboard-check' },
    { label: 'Employee Profile', route: '/employee-profile', icon: 'fas fa-user' },
    { label: 'Feedback', route: '/feedback', icon: 'fas fa-comments' },
    { label: 'Goal', route: '/goal', icon: 'fas fa-bullseye' },
    { label: 'Review Cycle', route: '/review-cycle', icon: 'fas fa-calendar-alt' }
  ];

  currentRoute = '/appraisal';

  appraisals: Appraisal[] = [];
  filteredAppraisals: Appraisal[] = [];
  selectedAppraisal: Appraisal | null = null;
  reviewCycles: ReviewCycle[] = [];
  appraisalForm!: FormGroup;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Force black text styles
  blackTextStyle = { 'color': '#000000 !important' };
  blackLabelStyle = { 'color': '#000000 !important', 'font-weight': 'bold !important' };
  blackValueStyle = { 'color': '#000000 !important', 'background-color': '#ffffff !important', 'border': '1px solid #000000 !important' };
  blackFormControlStyle = { 'color': '#000000 !important', 'background-color': '#ffffff !important', 'border': '2px solid #000000 !important' };

  searchTerm = '';
  statusFilter = '';

  currentUser: any = null;

  constructor(
    private router: Router,
    private appraisalService: AppraisalService,
    private reviewCycleService: ReviewCycleService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadAppraisals();
    this.loadReviewCycles();
  }

  private initializeForm(): void {
    this.appraisalForm = this.fb.group({
      employeeId: [''],
      employeeName: [''],
      department: [''],
      designation: [''],
      selfRating: [''],
      selfComments: [''],
      managerRating: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      managerComments: ['', [Validators.required, Validators.minLength(5)]],
      status: ['Submitted', [Validators.required]],
      reviewerRole: ['Manager'],
      managerName: [''],
      reviewCycleId: [1, Validators.required],
      appraisalDate: [''],
      periodStart: [''],
      periodEnd: [''],
      reviewDate: [''],
      cycleName: ['']
    });
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.appraisalForm.patchValue({
          managerName: user.fullName,
          reviewerRole: 'Manager'
        });
      }
      this.cdr.markForCheck();
    });
  }

  loadAppraisals(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    console.log('Loading appraisals...');
    this.appraisalService.getAllAppraisals().subscribe({
      next: (appraisals) => {
        console.log('Appraisals loaded from database:', appraisals);
        console.log('Number of appraisals:', appraisals.length);
        this.appraisals = appraisals;
        this.filteredAppraisals = appraisals;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading appraisals:', error);
        this.errorMessage = 'Unable to load appraisals from database. Please check your connection.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadReviewCycles(): void {
    this.reviewCycleService.getAllReviewCycles().subscribe({
      next: (cycles: ReviewCycle[]) => {
        this.reviewCycles = cycles;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading review cycles:', error);
      }
    });
  }

  selectAppraisal(appraisal: Appraisal): void {
    this.selectedAppraisal = appraisal;
    this.populateForm(appraisal);
  }

  private populateForm(appraisal: Appraisal): void {
    const employeeInfo = this.getEmployeeInfoFromAppraisal(appraisal);

    this.appraisalForm.patchValue({
      employeeId: appraisal.employee?.employeeProfileId || '',
      employeeName: employeeInfo.fullName,
      department: employeeInfo.department,
      designation: employeeInfo.designation,
      selfRating: appraisal.selfRating || 1,
      selfComments: appraisal.selfComments || '',
      managerRating: appraisal.managerRating || 1,
      managerComments: appraisal.managerComments || 'No comments provided',
      status: appraisal.status || 'Submitted',
      reviewerRole: appraisal.reviewerRole || 'Manager',
      managerName: appraisal.managerName || this.currentUser?.fullName || 'Manager',
      reviewCycleId: appraisal.reviewCycle?.cycleId || 1,
      appraisalDate: appraisal.appraisalDate || '',
      periodStart: appraisal.periodStart || '',
      periodEnd: appraisal.periodEnd || '',
      reviewDate: appraisal.reviewDate || '',
      cycleName: appraisal.cycleName || ''
    });
  }

  getEmployeeInfoFromAppraisal(appraisal: Appraisal): EmployeeInfo {
    return {
      employeeId: appraisal.employee?.employeeProfileId || 0,
      fullName: appraisal.employee?.user?.fullName || 'Unknown Employee',
      department: appraisal.employee?.department || 'Unknown',
      designation: appraisal.employee?.designation || 'Unknown'
    };
  }

  submitManagerReview(): void {
    console.log('🚀 SUBMIT MANAGER REVIEW CLICKED');
    console.log('Form valid:', this.appraisalForm.valid);
    console.log('Form errors:', this.appraisalForm.errors);
    console.log('Selected appraisal:', this.selectedAppraisal);
    console.log('Form value:', this.appraisalForm.value);
    
    if (this.appraisalForm.valid && this.selectedAppraisal) {
      const formData = this.appraisalForm.value;
      console.log('Form data to submit:', formData);

      const updatedAppraisal: Appraisal = {
        ...this.selectedAppraisal,
        managerRating: formData.managerRating,
        managerComments: formData.managerComments,
        status: formData.status,
        reviewerRole: formData.reviewerRole,
        managerName: formData.managerName,
        reviewCycle: { cycleId: formData.reviewCycleId } as ReviewCycle
      };

      console.log('Updated appraisal to send:', updatedAppraisal);

      this.isLoading = true;
      this.appraisalService.updateAppraisal(this.selectedAppraisal.appraisalId!, updatedAppraisal).subscribe({
        next: (response) => {
          console.log('✅ Manager review submitted successfully:', response);
          this.successMessage = 'Manager review submitted successfully!';
          this.isLoading = false;

          const index = this.appraisals.findIndex(a => a.appraisalId === this.selectedAppraisal!.appraisalId);
          if (index !== -1) {
            this.appraisals[index] = updatedAppraisal;
            this.applyFilters();
          }

          this.appraisalForm.reset();
          this.selectedAppraisal = null;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('❌ Error submitting manager review:', error);
          this.errorMessage = 'Error submitting manager review. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      console.log('❌ Form validation failed');
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  applyFilters(): void {
    this.filteredAppraisals = this.appraisals.filter(appraisal => {
      const employeeInfo = this.getEmployeeInfoFromAppraisal(appraisal);
      const matchesSearch = !this.searchTerm ||
        employeeInfo.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employeeInfo.department.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employeeInfo.designation.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || appraisal.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
    this.cdr.markForCheck();
  }

  onSearchChange(event: any): void { 
    this.searchTerm = event.target.value;
    this.applyFilters(); 
  }
  
  onStatusFilterChange(event: any): void { 
    this.statusFilter = event.target.value;
    this.applyFilters(); 
  }

  canEditAppraisal(appraisal: Appraisal): boolean {
    console.log('🔍 Checking if can edit appraisal:', appraisal);
    console.log('Appraisal status:', appraisal.status);
    console.log('Can edit:', appraisal.status === 'In Review' || appraisal.status === 'Submitted' || appraisal.status === 'Draft');
    
    // Allow editing for most statuses except 'Completed'
    return appraisal.status !== 'Completed';
  }

  clearSelectedAppraisal(): void {
    console.log('Clearing selected appraisal');
    this.selectedAppraisal = null;
    this.appraisalForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  getStatusClass(status?: string): string {
    if (!status) return 'status-default';
    switch (status.toLowerCase()) {
      case 'submitted': return 'status-submitted';
      case 'in review': return 'status-in-review';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }

  getRatingClass(rating?: number): string {
    if (!rating) return 'rating-default';
    if (rating >= 4) return 'rating-excellent';
    if (rating >= 3) return 'rating-good';
    if (rating >= 2) return 'rating-average';
    return 'rating-poor';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  }

  // New methods for the appraisal list
  createNewAppraisal(): void {
    // Implementation for creating new appraisal
    console.log('Create new appraisal clicked');
  }

  viewAppraisal(appraisal: Appraisal): void {
    console.log('🔍 VIEW APPRAISAL CLICKED:', appraisal);
    this.selectedAppraisal = appraisal;
    this.populateForm(appraisal);
    this.successMessage = `Viewing appraisal for ${appraisal.employee?.user?.fullName || 'Unknown Employee'}`;
    this.errorMessage = '';
    this.cdr.markForCheck();
    
    // Scroll to form after a short delay
    setTimeout(() => {
      const formSection = document.querySelector('.appraisal-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }

  editAppraisal(appraisal: Appraisal): void {
    console.log('✏️ EDIT APPRAISAL CLICKED:', appraisal);
    this.selectedAppraisal = appraisal;
    this.populateForm(appraisal);
    this.successMessage = `Editing appraisal for ${appraisal.employee?.user?.fullName || 'Unknown Employee'}`;
    this.errorMessage = '';
    this.cdr.markForCheck();
    
    // Scroll to form after a short delay
    setTimeout(() => {
      const formSection = document.querySelector('.appraisal-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }


  navigateTo(route: string) { this.router.navigate([route]); }

  filterAppraisals(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  refreshAppraisals(): void {
    this.loadAppraisals();
  }

  getAppraisalsByStatus(status: string): Appraisal[] {
    return this.appraisals.filter(appraisal => appraisal.status === status);
  }

  getAverageRating(): string {
    const ratings = this.appraisals
      .filter(appraisal => appraisal.managerRating && appraisal.managerRating > 0)
      .map(appraisal => appraisal.managerRating!);
    
    if (ratings.length === 0) return 'N/A';
    
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return average.toFixed(1);
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/website/landing']);
  }
}