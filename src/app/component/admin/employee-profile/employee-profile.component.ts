import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { UserService } from '../../../service/user.service';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { User } from '../../../model/user.model';

@Component({
  selector: 'app-employee-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css',
})
export class EmployeeProfileComponent implements OnInit {
  menuItems = [
    { title: 'Dashboard', route: '/dashboard', icon: 'fa-tachometer-alt' },
    { title: 'Appraisal', route: '/appraisal', icon: 'fa-clipboard-check' },
    { title: 'Employee Profile', route: '/employee-profile', icon: 'fa-user' },
    { title: 'Feedback', route: '/feedback', icon: 'fa-comments' },
    { title: 'Goal', route: '/goal', icon: 'fa-bullseye' },
    { title: 'Review Cycle', route: '/review-cycle', icon: 'fa-calendar-alt' }
  ];

  employeeProfiles: EmployeeProfile[] = [];
  filteredEmployeeProfiles: EmployeeProfile[] = [];
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedEmployeeProfile: EmployeeProfile | null = null;

  // Forms
  employeeProfileForm: FormGroup;

  // Filters
  searchTerm = '';
  departmentFilter = '';

  constructor(
    public router: Router,
    private employeeProfileService: EmployeeProfileService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.employeeProfileForm = this.fb.group({
      userId: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadEmployeeProfiles();
    this.loadUsers();
  }

  loadEmployeeProfiles() {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (data: any) => {
        this.employeeProfiles = data;
        this.filteredEmployeeProfiles = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load employee profiles. Please try again.';
        this.isLoading = false;
        console.error('Error loading employee profiles:', error);
      }
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
  }

  applyFilters() {
    this.filteredEmployeeProfiles = this.employeeProfiles.filter(profile => {
      const matchesSearch = !this.searchTerm ||
        profile.user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        profile.user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        profile.user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
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

  openCreateModal() {
    this.employeeProfileForm.reset();
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(employeeProfile: EmployeeProfile) {
    this.selectedEmployeeProfile = employeeProfile;
    this.employeeProfileForm.patchValue({
      userId: employeeProfile.user.userId,
      department: employeeProfile.department,
      designation: employeeProfile.designation
    });
    this.showEditModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openDeleteModal(employeeProfile: EmployeeProfile) {
    this.selectedEmployeeProfile = employeeProfile;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedEmployeeProfile = null;
    this.employeeProfileForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  createEmployeeProfile() {
    if (this.employeeProfileForm.valid) {
      const formData = this.employeeProfileForm.value;
      const selectedUser = this.users.find(u => u.userId === formData.userId);
      
      const employeeProfile: EmployeeProfile = {
        employeeProfileId: 0, // Will be set by backend
        department: formData.department,
        designation: formData.designation,
        user: selectedUser || {
          userId: formData.userId,
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          role: ''
        }
      };

      this.employeeProfileService.createEmployeeProfile(employeeProfile).subscribe({
        next: (response: any) => {
          this.successMessage = 'Employee profile created successfully!';
          this.loadEmployeeProfiles();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to create employee profile. Please try again.';
          console.error('Error creating employee profile:', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  updateEmployeeProfile() {
    if (this.employeeProfileForm.valid && this.selectedEmployeeProfile) {
      const formData = this.employeeProfileForm.value;
      const selectedUser = this.users.find(u => u.userId === formData.userId);
      
      const employeeProfile: EmployeeProfile = {
        ...this.selectedEmployeeProfile,
        department: formData.department,
        designation: formData.designation,
        user: selectedUser || this.selectedEmployeeProfile.user
      };

      this.employeeProfileService.updateEmployeeProfile(employeeProfile).subscribe({
        next: (response: any) => {
          this.successMessage = 'Employee profile updated successfully!';
          this.loadEmployeeProfiles();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to update employee profile. Please try again.';
          console.error('Error updating employee profile:', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  deleteEmployeeProfile() {
    if (this.selectedEmployeeProfile) {
      this.employeeProfileService.deleteEmployeeProfile(this.selectedEmployeeProfile.employeeProfileId).subscribe({
        next: () => {
          this.successMessage = 'Employee profile deleted successfully!';
          this.loadEmployeeProfiles();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to delete employee profile. Please try again.';
          console.error('Error deleting employee profile:', error);
        }
      });
    }
  }

  getDepartments(): string[] {
    const departments = [...new Set(this.employeeProfiles.map(profile => profile.department))];
    return departments.sort();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }
}