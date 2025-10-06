import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { AuthService } from '../../../service/auth.service';

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
  lastAppraisalRating: string; // keep as string for UI
}

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeProfileComponent implements OnInit {
  menuItems = [
    { title: 'Admin Dashboard', route: '/admin-dashboard', icon: 'fa-tachometer-alt' },
    { title: 'Appraisal', route: '/appraisal', icon: 'fa-clipboard-check' },
    { title: 'Employee Profile', route: '/employee-profile', icon: 'fa-user' },
    { title: 'Feedback', route: '/feedback', icon: 'fa-comments' },
    { title: 'Goal', route: '/goal', icon: 'fa-bullseye' },
    { title: 'Review Cycle', route: '/review-cycle', icon: 'fa-calendar-alt' }
  ];

  employeeProfiles: EmployeeProfileDisplay[] = [];
  filteredEmployeeProfiles: EmployeeProfileDisplay[] = [];
  selectedEmployeeProfile: EmployeeProfileDisplay | null = null;
  isLoading = false;
  errorMessage = '';
  showDetailView = false;

  // Filters
  searchTerm = '';
  departmentFilter = '';

  constructor(
    private router: Router,
    private employeeProfileService: EmployeeProfileService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadEmployeeProfiles();
  }

  loadEmployeeProfiles() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (data: EmployeeProfile[]) => {
        console.log('Employee profiles loaded from database:', data);
        console.log('First profile user data:', data[0]?.user);
        this.employeeProfiles = data.map(profile => {
          console.log('Processing profile:', profile.employeeProfileId, 'User:', profile.user);
          return {
            employeeId: profile.employeeProfileId ?? 0,
            fullName: profile.user?.fullName ?? 'Unknown',
            email: profile.user?.email ?? 'Not provided',
            phoneNumber: profile.user?.phoneNumber ?? 'Not provided',
            department: profile.department ?? 'Not provided',
            designation: profile.designation ?? 'Not provided',
            dateOfJoining: profile.dateOfJoining ?? '',
            currentProject: profile.currentProject ?? 'Not provided',
            currentTeam: profile.currentTeam ?? 'Not provided',
            skills: profile.skills ?? 'Not provided',
            reportingManager: profile.reportingManager ?? 'Not provided',
            lastAppraisalRating: profile.lastAppraisalRating != null 
              ? profile.lastAppraisalRating.toString() 
              : 'N/A'
          };
        });

        this.filteredEmployeeProfiles = [...this.employeeProfiles];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading employee profiles:', error);
        this.errorMessage = 'Unable to load employee profiles. Please try again later.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters() {
    this.filteredEmployeeProfiles = this.employeeProfiles.filter(profile => {
      const matchesSearch = !this.searchTerm ||
        profile.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        profile.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        profile.designation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        profile.department.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesDepartment = !this.departmentFilter || profile.department === this.departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onDepartmentFilterChange() {
    this.applyFilters();
  }

  refreshProfiles() {
    this.loadEmployeeProfiles();
  }

  viewEmployeeDetails(employeeProfile: EmployeeProfileDisplay) {
    this.selectedEmployeeProfile = employeeProfile;
    this.showDetailView = true;
  }

  closeDetailView() {
    this.showDetailView = false;
    this.selectedEmployeeProfile = null;
  }

  getDepartments(): string[] {
    const departments = [...new Set(this.employeeProfiles.map(profile => profile.department))];
    return departments.sort();
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
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  }

  getRatingClass(rating: string): string {
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return 'rating-na';
    if (numRating >= 4) return 'rating-excellent';
    if (numRating >= 3) return 'rating-good';
    if (numRating >= 2) return 'rating-average';
    return 'rating-poor';
  }
}
