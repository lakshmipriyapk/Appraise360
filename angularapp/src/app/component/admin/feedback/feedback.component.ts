import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService } from '../../../service/feedback.service';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { UserService } from '../../../service/user.service';
import { Feedback } from '../../../model/feedback.model';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { User } from '../../../model/user.model';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FeedbackComponent implements OnInit {
  menuItems = [
    { title: 'Admin Dashboard', route: '/admin-dashboard', icon: 'fa-tachometer-alt' },
    { title: 'Appraisal', route: '/appraisal', icon: 'fa-clipboard-check' },
    { title: 'Employee Profile', route: '/employee-profile', icon: 'fa-user' },
    { title: 'Feedback', route: '/feedback', icon: 'fa-comments' },
    { title: 'Goal', route: '/goal', icon: 'fa-bullseye' },
    { title: 'Review Cycle', route: '/review-cycle', icon: 'fa-calendar-alt' }
  ];

  feedbacks: Feedback[] = [];
  filteredFeedbacks: Feedback[] = [];
  employeeProfiles: EmployeeProfile[] = [];
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedFeedback: Feedback | null = null;

  feedbackForm: FormGroup;
  searchTerm = '';
  employeeFilter = '';
  reviewerFilter = '';
  feedbackTypeFilter = '';
  
  // Employee name lookup
  employeeSuggestions: EmployeeProfile[] = [];
  employeeNameError = '';
  selectedEmployee: EmployeeProfile | null = null;

  feedbackTypes = [
    { value: 'Peer Feedback', label: 'Peer Feedback' },
    { value: 'Manager Feedback', label: 'Manager Feedback' },
    { value: 'Self-Feedback', label: 'Self-Feedback' }
  ];

  constructor(
    private router: Router,
    private feedbackService: FeedbackService,
    private employeeProfileService: EmployeeProfileService,
    private userService: UserService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.feedbackForm = this.fb.group({
      employeeName: ['', Validators.required],
      feedbackType: ['', Validators.required],
      comments: ['', Validators.required],
      rating: [null, [Validators.min(1), Validators.max(5)]],
      achievements: [''],
      challenges: [''],
      improvements: ['']
    });
  }

  ngOnInit() {
    this.loadFeedbacks();
    this.loadEmployeeProfiles();
    this.loadUsers();
  }

  loadFeedbacks() {
    this.isLoading = true;
    this.errorMessage = '';
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (data: Feedback[]) => { 
        console.log('Feedbacks loaded from database:', data);
        console.log('Sample feedback comments:', data.map(f => ({ id: f.feedbackId, employee: f.employee?.user?.fullName, comments: f.comments })));
        this.feedbacks = data; 
        this.filteredFeedbacks = [...data]; 
        this.isLoading = false; 
      },
      error: (error) => { 
        console.error('Error loading feedbacks:', error);
        if (error.status === 0 || error.status === undefined) {
          this.errorMessage = 'Backend server is not running. Please start the Spring Boot application.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please check the backend logs.';
        } else {
          this.errorMessage = 'Unable to load feedbacks from database. Please check your connection.';
        }
        this.isLoading = false;
      }
    });
  }

  loadMockFeedbacks() {
    this.feedbacks = [{
      feedbackId: 1,
      comments: 'Excellent work on the Angular project!',
      feedbackType: 'Peer Feedback',
      rating: 5,
      employee: this.employeeProfiles[0],
      reviewer: this.users[0]
    }];
    this.filteredFeedbacks = [...this.feedbacks];
    this.isLoading = false;
  }

  loadEmployeeProfiles() {
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (data: EmployeeProfile[]) => { 
        console.log('Employee profiles loaded from database:', data);
        this.employeeProfiles = data; 
      },
      error: (error) => { 
        console.error('Error loading employee profiles:', error);
        if (error.status === 0 || error.status === undefined) {
          console.log('Backend not available, using mock data for employee profiles');
          this.loadMockEmployeeProfiles();
        } else {
          console.log('Server error, using mock data for employee profiles');
          this.loadMockEmployeeProfiles();
        }
      }
    });
  }

  loadMockEmployeeProfiles() {
    this.employeeProfiles = [
      {
        employeeProfileId: 1,
        designation: 'Software Engineer',
        department: 'IT',
        dateOfJoining: '2023-01-15',
        reportingManager: 'John Doe',
        currentProject: 'Performance Appraisal System',
        currentTeam: 'Development Team',
        skills: 'Angular, Spring Boot, MySQL, JavaScript',
        currentGoals: 'Complete project modules, Improve code quality',
        user: { userId: 1, fullName: 'Lakshmipriya P K', firstName: 'Lakshmipriya', lastName: 'P K', username: 'lakshmi', email: 'lakshmi@example.com', role: 'Employee' }
      },
      {
        employeeProfileId: 2,
        designation: 'Software Engineer',
        department: 'IT',
        dateOfJoining: '2023-02-20',
        reportingManager: 'John Doe',
        currentProject: 'Performance Appraisal System',
        currentTeam: 'Development Team',
        skills: 'Angular, Spring Boot, MySQL, TypeScript',
        currentGoals: 'Learn new technologies, Complete assigned tasks',
        user: { userId: 2, fullName: 'Nandhini S Y', firstName: 'Nandhini', lastName: 'S Y', username: 'nandhini', email: 'nandhini@example.com', role: 'Employee' }
      },
      {
        employeeProfileId: 3,
        designation: 'Senior Developer',
        department: 'IT',
        dateOfJoining: '2022-11-10',
        reportingManager: 'John Doe',
        currentProject: 'Performance Appraisal System',
        currentTeam: 'Development Team',
        skills: 'Angular, Spring Boot, MySQL, Java, Leadership',
        currentGoals: 'Mentor junior developers, Lead technical initiatives',
        user: { userId: 3, fullName: 'Priya M', firstName: 'Priya', lastName: 'M', username: 'priya', email: 'priya@example.com', role: 'Employee' }
      }
    ];
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => { this.users = data; }
    });
  }

  applyFilters() {
    this.filteredFeedbacks = this.feedbacks.filter(feedback => {
      const search = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm ||
        feedback.employee?.user?.fullName?.toLowerCase().includes(search) ||
        feedback.reviewer?.fullName?.toLowerCase().includes(search) ||
        feedback.comments?.toLowerCase().includes(search) ||
        feedback.feedbackType?.toLowerCase().includes(search);
      const matchesEmployee = !this.employeeFilter || feedback.employee?.employeeProfileId?.toString() === this.employeeFilter;
      const matchesReviewer = !this.reviewerFilter || feedback.reviewer?.userId?.toString() === this.reviewerFilter;
      const matchesType = !this.feedbackTypeFilter || feedback.feedbackType === this.feedbackTypeFilter;
      return matchesSearch && matchesEmployee && matchesReviewer && matchesType;
    });
  }

  openCreateModal() { 
    this.feedbackForm.reset(); 
    this.selectedEmployee = null;
    this.employeeSuggestions = [];
    this.employeeNameError = '';
    this.showCreateModal = true; 
    // Set default feedback type to Manager Feedback for manager
    setTimeout(() => {
      this.feedbackForm.patchValue({ feedbackType: 'Manager Feedback' });
    }, 100);
  }
  
  openEditModal(feedback: Feedback) { 
    console.log('Opening edit modal for feedback:', feedback);
    console.log('Employee data:', feedback.employee);
    console.log('Employee user data:', feedback.employee?.user);
    console.log('Employee name:', feedback.employee?.user?.fullName);
    
    this.selectedFeedback = feedback; 
    this.selectedEmployee = feedback.employee || null;
    this.employeeSuggestions = [];
    this.employeeNameError = '';
    this.showEditModal = true; 
    
    // Reset form first, then set values
    this.feedbackForm.reset();
    
    // Set form values immediately after reset
    setTimeout(() => {
      // Use the employee name (the person being reviewed) - this should be in the employee name field
      let employeeName = '';
      if (feedback.employee?.user?.fullName) {
        employeeName = feedback.employee.user.fullName;
      } else if (feedback.employee?.user?.firstName && feedback.employee?.user?.lastName) {
        employeeName = `${feedback.employee.user.firstName} ${feedback.employee.user.lastName}`;
      } else if (feedback.employee?.user?.username) {
        employeeName = feedback.employee.user.username;
      } else {
        employeeName = 'Employee Name Not Available';
      }
      
      this.feedbackForm.patchValue({ 
        employeeName: employeeName, // This should be the employee name (the person being reviewed)
        feedbackType: 'Manager Feedback', // Always Manager Feedback for manager reviews
        comments: feedback.comments, 
        rating: feedback.rating,
        achievements: feedback.achievements || '',
        challenges: feedback.challenges || '',
        improvements: feedback.improvements || ''
      }); 
      
      // Clear any validation errors after setting values
      this.feedbackForm.markAsUntouched();
      this.feedbackForm.updateValueAndValidity();
      
      console.log('Form values set:', this.feedbackForm.value);
      console.log('Form valid:', this.feedbackForm.valid);
      console.log('Form errors:', this.feedbackForm.errors);
    }, 50);
  }
  
  openDeleteModal(feedback: Feedback) { this.selectedFeedback = feedback; this.showDeleteModal = true; }
  
  closeModals() { 
    this.showCreateModal = this.showEditModal = this.showDeleteModal = false; 
    this.selectedFeedback = null; 
    this.selectedEmployee = null;
    this.employeeSuggestions = [];
    this.employeeNameError = '';
    this.feedbackForm.reset(); 
  }

  onEmployeeSelectionChange(event: any) {
    const selectedEmployeeName = event.target.value;
    if (selectedEmployeeName) {
      // Find the selected employee from the list
      this.selectedEmployee = this.employeeProfiles.find(emp => 
        emp.user?.fullName === selectedEmployeeName
      ) || null;
      
      if (this.selectedEmployee) {
        this.employeeNameError = '';
        console.log('Selected employee:', this.selectedEmployee);
      } else {
        this.employeeNameError = 'Selected employee not found';
      }
    } else {
      this.selectedEmployee = null;
      this.employeeNameError = '';
    }
  }

  selectEmployee(employee: EmployeeProfile) {
    this.selectedEmployee = employee;
    this.feedbackForm.patchValue({ employeeName: employee.user?.fullName });
    this.employeeSuggestions = [];
    this.employeeNameError = '';
  }

  createFeedback() {
    if (!this.feedbackForm.valid) {
      return;
    }
    
    const formData = this.feedbackForm.value;
    
    // Use the selected employee from dropdown
    let selectedEmployee = this.selectedEmployee;
    
    // If no employee selected, try to find by the form value
    if (!selectedEmployee && formData.employeeName) {
      selectedEmployee = this.employeeProfiles.find(emp => 
        emp.user?.fullName === formData.employeeName
      ) || null;
    }
    
    if (!selectedEmployee) {
      this.employeeNameError = 'Please select an employee from the dropdown';
      return;
    }
    
    // Get current user or use a default admin user
    const currentUser = this.authService.getCurrentUser();
    const reviewer = currentUser || { userId: 1, fullName: 'Admin User', role: 'Admin' };
    
    // Create a flat feedback object for the backend
    const feedbackData = {
      feedback_type: formData.feedbackType,
      comments: formData.comments,
      rating: formData.rating,
      achievements: formData.achievements || '',
      challenges: formData.challenges || '',
      improvements: formData.improvements || '',
      employee_id: selectedEmployee.employeeProfileId,
      reviewer_id: reviewer.userId
    };
    
    console.log('Creating feedback with data:', feedbackData);
    
    this.feedbackService.createFeedback(feedbackData).subscribe({
      next: () => { 
        this.successMessage = 'Feedback created successfully'; 
        this.loadFeedbacks(); 
        this.closeModals(); 
      },
      error: (error) => { 
        console.error('Error creating feedback:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        this.errorMessage = `Failed to create feedback: ${error.error?.message || error.message || 'Unknown error'}`;
      }
    });
  }

  updateFeedback() {
    console.log('Update feedback called');
    console.log('Form valid:', this.feedbackForm.valid);
    console.log('Form errors:', this.feedbackForm.errors);
    console.log('Selected feedback:', this.selectedFeedback);
    
    if (!this.selectedFeedback) {
      console.log('No selected feedback');
      this.errorMessage = 'No feedback selected for update';
      return;
    }
    
    // Check individual field validity instead of overall form validity
    const formData = this.feedbackForm.value;
    console.log('Form data:', formData);
    
    if (!formData.feedbackType || !formData.comments) {
      console.log('Required fields missing');
      this.feedbackForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    
    // Create a minimal feedback object for update - only send what we need to update
    // DO NOT include employeeName as it's not part of the Feedback model
    const feedback: any = { 
      feedbackType: formData.feedbackType, 
      comments: formData.comments, 
      rating: formData.rating || null,
      achievements: formData.achievements || '',
      challenges: formData.challenges || '',
      improvements: formData.improvements || ''
    };
    
    console.log('Updating feedback:', feedback);
    console.log('Original employee ID:', this.selectedFeedback.employee?.employeeProfileId);
    console.log('Original reviewer ID:', this.selectedFeedback.reviewer?.userId);
    
    this.feedbackService.updateFeedback(this.selectedFeedback.feedbackId || 0, feedback).subscribe({
      next: (response) => { 
        console.log('Update successful:', response);
        console.log('Updated comments in response:', response.comments);
        this.successMessage = 'Feedback updated successfully'; 
        this.loadFeedbacks(); 
        this.closeModals(); 
      },
      error: (error) => { 
        console.error('Error updating feedback:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        this.errorMessage = `Failed to update feedback: ${error.error?.message || error.message || 'Unknown error'}`;
      }
    });
  }

  deleteFeedback() {
    if (!this.selectedFeedback) return;   // ✅ null guard
    this.feedbackService.deleteFeedback(this.selectedFeedback.feedbackId || 0).subscribe({
      next: () => { this.successMessage = 'Feedback deleted'; this.loadFeedbacks(); this.closeModals(); },
      error: (error) => { 
        console.error('Error deleting feedback:', error);
        this.errorMessage = 'Failed to delete feedback. Please try again.';
      }
    });
  }

  getManagers(): User[] { return this.users.filter(u => u.role?.toUpperCase() === 'MANAGER' || u.role?.toUpperCase() === 'ADMIN'); }
  getFeedbackTypeClass(feedbackType: string): string { switch (feedbackType?.toLowerCase()) { case 'peer feedback': return 'type-peer'; case 'manager feedback': return 'type-manager'; case 'self-feedback': return 'type-self'; default: return 'type-default'; } }
  getRatingClass(rating: number): string { if (rating >= 4) return 'rating-excellent'; if (rating >= 3) return 'rating-good'; if (rating >= 2) return 'rating-average'; return 'rating-poor'; }

  onSearchChange() {
    this.applyFilters();
  }

  onEmployeeFilterChange() {
    this.applyFilters();
  }

  onReviewerFilterChange() {
    this.applyFilters();
  }

  onFeedbackTypeFilterChange() {
    this.applyFilters();
  }

  navigateTo(route: string) { 
    this.router.navigate([route]); 
  }
  
  logout() { 
    this.authService.logout(); 
    this.router.navigate(['/website/landing']); 
  }
}