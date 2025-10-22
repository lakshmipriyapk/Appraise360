import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { AuthService } from '../../../service/auth.service';
import { UserService } from '../../../service/user.service';

interface EmployeeProfileDisplay {
  employeeId: number;
  userId?: number; // Add userId to link to User entity
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
  currentGoals?: string; // Add currentGoals field
}

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
  successMessage = '';
  showDetailView = false;
  showEditForm = false;
  isSaving = false;
  editForm!: FormGroup;

  // Filters
  searchTerm = '';
  departmentFilter = '';

  constructor(
    private router: Router,
    private employeeProfileService: EmployeeProfileService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.initializeEditForm();
  }

  ngOnInit() {
    this.loadEmployeeProfiles();
  }

  private initializeEditForm(): void {
    this.editForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      department: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      dateOfJoining: [''],
      currentProject: [''],
      currentTeam: [''],
      reportingManager: [''],
      skills: ['']
    });
  }

  loadEmployeeProfiles() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (data: EmployeeProfile[]) => {
        console.log('Employee profiles loaded from database:', data);
        console.log('First profile user data:', data[0]?.user);
        
        // Filter only employees (exclude admins)
        const employeeProfiles = data.filter(profile => 
          profile.user?.role === 'Employee' || profile.user?.role === 'employee'
        );
        
        this.employeeProfiles = employeeProfiles.map(profile => {
          console.log('Processing profile:', profile.employeeProfileId, 'User:', profile.user);
          return {
            employeeId: profile.employeeProfileId ?? 0,
            userId: profile.user?.userId,
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
              : 'N/A',
            currentGoals: profile.currentGoals ?? ''
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
    this.showEditForm = false; // Ensure edit form is not shown
  }

  closeDetailView() {
    this.showDetailView = false;
    this.showEditForm = false;
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

  // Edit functionality
  editEmployeeDetails(profile: EmployeeProfileDisplay): void {
    this.selectedEmployeeProfile = profile;
    this.showEditForm = true;
    this.showDetailView = false;
    
    // Populate form with current values
    this.editForm.patchValue({
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      department: profile.department,
      designation: profile.designation,
      dateOfJoining: profile.dateOfJoining,
      currentProject: profile.currentProject,
      currentTeam: profile.currentTeam,
      reportingManager: profile.reportingManager,
      skills: profile.skills
    });
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.showDetailView = true;
    this.editForm.reset();
  }

  saveEmployeeProfile(): void {
    if (this.editForm.valid && this.selectedEmployeeProfile) {
      this.isSaving = true;
      const formData = this.editForm.value;
      
      // Find the original employee profile to update
      const originalProfile = this.employeeProfiles.find(p => p.employeeId === this.selectedEmployeeProfile!.employeeId);
      if (!originalProfile) {
        this.errorMessage = 'Employee profile not found';
        this.isSaving = false;
        return;
      }

      // Create the updated profile data for backend
      const updatedProfileData = {
        department: formData.department,
        designation: formData.designation,
        dateOfJoining: formData.dateOfJoining,
        currentProject: formData.currentProject,
        currentTeam: formData.currentTeam,
        reportingManager: formData.reportingManager,
        skills: formData.skills,
        currentGoals: originalProfile.currentGoals || '', // Include required field
        lastAppraisalRating: originalProfile.lastAppraisalRating || 0 // Include optional field
      };

      console.log('Updating employee profile:', updatedProfileData);

      // Update employee profile
      this.employeeProfileService.updateEmployeeProfilePartial(this.selectedEmployeeProfile.employeeId, updatedProfileData).subscribe({
        next: (response: any) => {
          console.log('Employee profile updated successfully:', response);
          
          // Update local data
          const updatedProfile: EmployeeProfileDisplay = {
            ...originalProfile,
            department: formData.department,
            designation: formData.designation,
            dateOfJoining: formData.dateOfJoining,
            currentProject: formData.currentProject,
            currentTeam: formData.currentTeam,
            reportingManager: formData.reportingManager,
            skills: formData.skills,
            fullName: formData.fullName,
            email: formData.email,
            phoneNumber: formData.phoneNumber
          };

          const index = this.employeeProfiles.findIndex(p => p.employeeId === updatedProfile.employeeId);
          if (index !== -1) {
            this.employeeProfiles[index] = updatedProfile;
            this.filteredEmployeeProfiles = [...this.employeeProfiles];
            this.selectedEmployeeProfile = updatedProfile;
          }

          this.errorMessage = '';
          this.successMessage = 'Employee profile updated successfully!';
          this.showEditForm = false;
          this.showDetailView = true;
          this.isSaving = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          console.error('Error updating employee profile:', error);
          this.errorMessage = 'Failed to update employee profile. Please try again.';
          this.isSaving = false;
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.editForm.markAllAsTouched();
    }
  }
}
