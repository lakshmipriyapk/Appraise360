import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { AuthService } from '../../../service/auth.service';
import { EmployeeProfile } from '../../../model/employee-profile.model';

interface EmployeeProfileDisplay {
  employeeId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  currentProject: string;
  currentTeam: string;
  skills: string;
  reportingManager: string;
  lastAppraisalRating: string;
}

@Component({
  selector: 'app-employee-profile',
  imports: [CommonModule],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeProfileComponent implements OnInit {
  employeeProfile: EmployeeProfileDisplay | null = null;
  isLoading = false;
  errorMessage = '';
  
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
    private employeeProfileService: EmployeeProfileService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadEmployeeProfile();
  }

  loadEmployeeProfile() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    // Get current user from AuthService
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Get employee profile by user ID
        this.employeeProfileService.getEmployeeProfileById(user.userId || 0).subscribe({
          next: (profile: EmployeeProfile) => {
            // Map the profile to the expected format
            this.employeeProfile = {
              employeeId: profile.employeeProfileId || 0,
              fullName: profile.user?.fullName || 'Unknown',
              email: profile.user?.email || '',
              phoneNumber: profile.user?.phoneNumber || '',
              department: profile.department,
              designation: profile.designation,
              dateOfJoining: profile.dateOfJoining,
              currentProject: profile.currentProject,
              currentTeam: profile.currentTeam,
              skills: profile.skills,
              reportingManager: profile.reportingManager,
              lastAppraisalRating: profile.lastAppraisalRating?.toString() || 'Not rated'
            };
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (error: any) => {
            console.error('Error loading employee profile:', error);
            this.errorMessage = 'Unable to load your profile. Please try again later.';
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
      } else {
        this.errorMessage = 'Please log in to view your profile.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/website/landing']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  }

  getRatingClass(rating: string): string {
    const numRating = parseFloat(rating);
    if (numRating >= 4) return 'rating-excellent';
    if (numRating >= 3) return 'rating-good';
    if (numRating >= 2) return 'rating-average';
    return 'rating-poor';
  }
}