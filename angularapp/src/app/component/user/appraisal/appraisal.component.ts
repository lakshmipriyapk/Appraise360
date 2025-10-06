import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppraisalService } from '../../../service/appraisal.service';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { Appraisal } from '../../../model/appraisal.model';
import { AuthService } from '../../../service/auth.service';

interface EmployeeInfo {
  employeeId: number;
  fullName: string;
  department: string;
  designation: string;
}

@Component({
  selector: 'app-employee-appraisal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appraisal.component.html',
  styleUrl: './appraisal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeAppraisalComponent implements OnInit {
  appraisalForm!: FormGroup;
  employeeInfo: EmployeeInfo | null = null;
  appraisals: Appraisal[] = [];
  selectedAppraisal: Appraisal | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Menu items for employee navigation
  menuItems = [
    { title: 'Overview', route: '/employee-dashboard', icon: 'fa-tachometer-alt' },
    { title: 'My Goals', route: '/employee-dashboard/goals', icon: 'fa-bullseye' },
    { title: 'Feedback', route: '/employee-dashboard/feedback', icon: 'fa-comments' },
    { title: 'Appraisals', route: '/employee-dashboard/appraisals', icon: 'fa-clipboard-check' },
    { title: 'Profile', route: '/employee-dashboard/profile', icon: 'fa-user' }
  ];

  constructor(
    private router: Router,
    private appraisalService: AppraisalService,
    private employeeProfileService: EmployeeProfileService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadEmployeeInfo();
    this.loadEmployeeAppraisals();
  }

  private initializeForm(): void {
    this.appraisalForm = this.fb.group({
      // Employee can only edit these fields
      selfRating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      selfComments: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadEmployeeInfo(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.employeeProfileService.getEmployeeProfileById(user.userId || 0).subscribe({
          next: (profile) => {
            this.employeeInfo = {
              employeeId: profile.employeeProfileId || 0,
              fullName: profile.user?.fullName || 'Unknown',
              department: profile.department,
              designation: profile.designation
            };
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error loading employee info:', error);
            this.errorMessage = 'Unable to load employee information';
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  loadEmployeeAppraisals(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.appraisalService.getAppraisalsByEmployee(user.userId || 0).subscribe({
          next: (appraisals) => {
            this.appraisals = appraisals;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error loading appraisals:', error);
            this.errorMessage = 'Unable to load appraisals. Please try again later.';
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  selectAppraisal(appraisal: Appraisal): void {
    this.selectedAppraisal = appraisal;
    this.populateForm(appraisal);
  }

  private populateForm(appraisal: Appraisal): void {
    this.appraisalForm.patchValue({
      selfRating: appraisal.selfRating || '',
      selfComments: appraisal.selfComments || ''
    });
  }

  submitSelfAppraisal(): void {
    if (this.appraisalForm.valid && this.selectedAppraisal) {
      const formData = this.appraisalForm.value;
      
      const updatedAppraisal: Appraisal = {
        ...this.selectedAppraisal,
        selfRating: formData.selfRating,
        selfComments: formData.selfComments,
        status: 'In Review' // Move to review stage
      };

      this.isLoading = true;
      this.appraisalService.updateAppraisal(this.selectedAppraisal.appraisalId || 0, updatedAppraisal).subscribe({
        next: (response) => {
          this.successMessage = 'Self-appraisal submitted successfully!';
          this.isLoading = false;
          
          // Update local data
          const index = this.appraisals.findIndex(a => a.appraisalId === this.selectedAppraisal!.appraisalId);
          if (index !== -1) {
            this.appraisals[index] = updatedAppraisal;
          }
          
          this.appraisalForm.reset();
          this.selectedAppraisal = null;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error submitting self-appraisal:', error);
          this.errorMessage = 'Error submitting self-appraisal. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  canEditAppraisal(appraisal: Appraisal): boolean {
    return appraisal.status === 'Submitted' && !appraisal.selfRating;
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

  formatDate(dateString: string): string {
    if (!dateString) return 'Not provided';
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
