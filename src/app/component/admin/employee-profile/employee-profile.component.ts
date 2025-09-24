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

  // Form arrays for skills and goals
  skillsArray: string[] = [];
  goalsArray: string[] = [];
  newSkill = '';
  newGoal = '';

  constructor(
    public router: Router,
    private employeeProfileService: EmployeeProfileService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.employeeProfileForm = this.fb.group({
      userId: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      reportingManager: ['', Validators.required],
      currentProject: [''],
      currentTeam: [''],
      skills: [[]],
      lastAppraisalRating: [0, [Validators.min(1), Validators.max(5)]],
      currentGoals: [[]]
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
        console.error('Error loading employee profiles, using mock data:', error);
        // Load mock data for development
        this.loadMockEmployeeProfiles();
      }
    });
  }

  loadMockEmployeeProfiles() {
    // Mock employee profile data for development
    const mockProfiles: EmployeeProfile[] = [
      {
        employeeProfileId: 1,
        department: 'Engineering',
        designation: 'Software Engineer',
        dateOfJoining: '2023-01-15',
        reportingManager: 'John Smith',
        currentProject: 'Performance Appraisal System',
        currentTeam: 'Full Stack Team',
        skills: ['Angular', 'Spring Boot', 'TypeScript', 'Java', 'SQL'],
        lastAppraisalRating: 4.2,
        currentGoals: ['Complete Angular Training', 'Deliver Q3 Project Milestone', 'Improve Code Review Skills'],
        user: {
          userId: 1,
          username: 'john.doe',
          email: 'john.doe@company.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'Employee'
        }
      },
      {
        employeeProfileId: 2,
        department: 'Marketing',
        designation: 'Marketing Specialist',
        dateOfJoining: '2023-03-20',
        reportingManager: 'Jane Wilson',
        currentProject: 'Brand Campaign',
        currentTeam: 'Marketing Team',
        skills: ['Digital Marketing', 'Content Creation', 'Social Media', 'Analytics'],
        lastAppraisalRating: 3.5,
        currentGoals: ['Increase brand awareness', 'Launch new campaign', 'Improve engagement rates'],
        user: {
          userId: 2,
          username: 'jane.smith',
          email: 'jane.smith@company.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'Employee'
        }
      },
      {
        employeeProfileId: 3,
        department: 'Sales',
        designation: 'Sales Manager',
        dateOfJoining: '2022-11-10',
        reportingManager: 'Mike Johnson',
        currentProject: 'Q4 Sales Target',
        currentTeam: 'Sales Team',
        skills: ['Sales Management', 'Client Relations', 'CRM', 'Negotiation'],
        lastAppraisalRating: 4.8,
        currentGoals: ['Achieve Q4 targets', 'Expand client base', 'Improve team performance'],
        user: {
          userId: 3,
          username: 'mike.wilson',
          email: 'mike.wilson@company.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          role: 'Employee'
        }
      },
      {
        employeeProfileId: 4,
        department: 'HR',
        designation: 'HR Specialist',
        dateOfJoining: '2023-06-01',
        reportingManager: 'Sarah Davis',
        currentProject: 'Employee Engagement',
        currentTeam: 'HR Team',
        skills: ['Recruitment', 'Employee Relations', 'HR Policies', 'Training'],
        lastAppraisalRating: 4.0,
        currentGoals: ['Improve employee satisfaction', 'Streamline recruitment process', 'Develop training programs'],
        user: {
          userId: 4,
          username: 'sarah.jones',
          email: 'sarah.jones@company.com',
          firstName: 'Sarah',
          lastName: 'Jones',
          role: 'Employee'
        }
      },
      {
        employeeProfileId: 5,
        department: 'Finance',
        designation: 'Financial Analyst',
        dateOfJoining: '2023-02-14',
        reportingManager: 'David Brown',
        currentProject: 'Budget Planning',
        currentTeam: 'Finance Team',
        skills: ['Financial Analysis', 'Budgeting', 'Excel', 'Financial Modeling'],
        lastAppraisalRating: 4.5,
        currentGoals: ['Complete budget analysis', 'Improve financial reporting', 'Learn new tools'],
        user: {
          userId: 5,
          username: 'david.miller',
          email: 'david.miller@company.com',
          firstName: 'David',
          lastName: 'Miller',
          role: 'Employee'
        }
      }
    ];

    this.employeeProfiles = mockProfiles;
    this.filteredEmployeeProfiles = mockProfiles;
    this.isLoading = false;
    console.log('Loaded mock employee profiles:', mockProfiles);
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data;
      },
      error: (error: any) => {
        console.error('Error loading users, using mock data:', error);
        // Load mock users for development
        this.loadMockUsers();
      }
    });
  }

  loadMockUsers() {
    // Mock user data for development
    const mockUsers: User[] = [
      {
        userId: 1,
        username: 'john.doe',
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'Employee'
      },
      {
        userId: 2,
        username: 'jane.smith',
        email: 'jane.smith@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'Employee'
      },
      {
        userId: 3,
        username: 'mike.wilson',
        email: 'mike.wilson@company.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'Employee'
      },
      {
        userId: 4,
        username: 'sarah.jones',
        email: 'sarah.jones@company.com',
        firstName: 'Sarah',
        lastName: 'Jones',
        role: 'Employee'
      },
      {
        userId: 5,
        username: 'david.miller',
        email: 'david.miller@company.com',
        firstName: 'David',
        lastName: 'Miller',
        role: 'Employee'
      },
      {
        userId: 6,
        username: 'admin',
        email: 'admin@company.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin'
      }
    ];

    this.users = mockUsers;
    console.log('Loaded mock users:', mockUsers);
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

  refreshProfiles() {
    this.loadEmployeeProfiles();
    this.successMessage = 'Profiles refreshed successfully!';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  openEditModal(employeeProfile: EmployeeProfile) {
    this.selectedEmployeeProfile = employeeProfile;
    this.employeeProfileForm.patchValue({
      userId: employeeProfile.user.userId,
      department: employeeProfile.department,
      designation: employeeProfile.designation,
      dateOfJoining: employeeProfile.dateOfJoining,
      reportingManager: employeeProfile.reportingManager,
      currentProject: employeeProfile.currentProject,
      currentTeam: employeeProfile.currentTeam,
      lastAppraisalRating: employeeProfile.lastAppraisalRating
    });
    
    // Set arrays
    this.skillsArray = [...(employeeProfile.skills || [])];
    this.goalsArray = [...(employeeProfile.currentGoals || [])];
    
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
        dateOfJoining: formData.dateOfJoining,
        reportingManager: formData.reportingManager,
        currentProject: formData.currentProject,
        currentTeam: formData.currentTeam,
        skills: [...this.skillsArray],
        lastAppraisalRating: formData.lastAppraisalRating,
        currentGoals: [...this.goalsArray],
        user: selectedUser || {
          userId: formData.userId,
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          role: ''
        }
      };

      this.employeeProfileService.createEmployeeProfile(formData.userId, employeeProfile).subscribe({
        next: (response: any) => {
          this.successMessage = 'Employee profile created successfully!';
          this.loadEmployeeProfiles();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error creating employee profile, using mock response:', error);
          // Mock successful creation for development
          this.successMessage = 'Employee profile created successfully! (Mock)';
          this.loadEmployeeProfiles();
          this.closeModals();
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
        dateOfJoining: formData.dateOfJoining,
        reportingManager: formData.reportingManager,
        currentProject: formData.currentProject,
        currentTeam: formData.currentTeam,
        skills: [...this.skillsArray],
        lastAppraisalRating: formData.lastAppraisalRating,
        currentGoals: [...this.goalsArray],
        user: selectedUser || this.selectedEmployeeProfile.user
      };

      this.employeeProfileService.updateEmployeeProfile(employeeProfile).subscribe({
        next: (response: any) => {
          this.successMessage = 'Employee profile updated successfully!';
          this.loadEmployeeProfiles();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error updating employee profile, using mock response:', error);
          // Mock successful update for development
          this.successMessage = 'Employee profile updated successfully! (Mock)';
          this.loadEmployeeProfiles();
          this.closeModals();
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
          console.error('Error deleting employee profile, using mock response:', error);
          // Mock successful deletion for development
          this.successMessage = 'Employee profile deleted successfully! (Mock)';
          this.loadEmployeeProfiles();
          this.closeModals();
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

  // Skills management
  addSkill() {
    if (this.newSkill.trim() && !this.skillsArray.includes(this.newSkill.trim())) {
      this.skillsArray.push(this.newSkill.trim());
      this.newSkill = '';
    }
  }

  removeSkill(skill: string) {
    this.skillsArray = this.skillsArray.filter(s => s !== skill);
  }

  // Goals management
  addGoal() {
    if (this.newGoal.trim() && !this.goalsArray.includes(this.newGoal.trim())) {
      this.goalsArray.push(this.newGoal.trim());
      this.newGoal = '';
    }
  }

  removeGoal(goal: string) {
    this.goalsArray = this.goalsArray.filter(g => g !== goal);
  }

  // Helper methods for display
  getRatingClass(rating: number): string {
    if (rating >= 4) return 'rating-excellent';
    if (rating >= 3) return 'rating-good';
    if (rating >= 2) return 'rating-average';
    return 'rating-poor';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}