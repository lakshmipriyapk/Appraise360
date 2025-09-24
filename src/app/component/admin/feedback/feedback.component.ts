import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService } from '../../../service/feedback.service';
import { EmployeeProfileService } from '../../../service/employee-profile.service';
import { UserService } from '../../../service/user.service';
import { Feedback } from '../../../model/feedback.model';
import { EmployeeProfile } from '../../../model/employee-profile.model';
import { User } from '../../../model/user.model';

@Component({
  selector: 'app-feedback',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit {
  menuItems = [
    { title: 'Dashboard', route: '/dashboard', icon: 'fa-tachometer-alt' },
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

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedFeedback: Feedback | null = null;

  // Forms
  feedbackForm: FormGroup;

  // Filters
  searchTerm = '';
  employeeFilter = '';
  reviewerFilter = '';
  feedbackTypeFilter = '';

  // Feedback types
  feedbackTypes = [
    { value: 'Peer Feedback', label: 'Peer Feedback' },
    { value: 'Manager Feedback', label: 'Manager Feedback' },
    { value: 'Self-Feedback', label: 'Self-Feedback' }
  ];

  constructor(
    public router: Router,
    private feedbackService: FeedbackService,
    private employeeProfileService: EmployeeProfileService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.feedbackForm = this.fb.group({
      employeeId: ['', Validators.required],
      reviewerId: ['', Validators.required],
      feedbackType: ['', Validators.required],
      comments: ['', Validators.required],
      rating: [null, [Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit() {
    this.loadFeedbacks();
    this.loadEmployeeProfiles();
    this.loadUsers();
    
    // Ensure mock data is loaded for development
    setTimeout(() => {
      if (this.employeeProfiles.length === 0) {
        console.log('Loading mock employee profiles as fallback');
        this.loadMockEmployeeProfiles();
      }
      if (this.users.length === 0) {
        console.log('Loading mock users as fallback');
        this.loadMockUsers();
      }
    }, 1000);
  }

  loadFeedbacks() {
    this.isLoading = true;
    this.errorMessage = '';

    this.feedbackService.getAllFeedbacks().subscribe({
      next: (data: any) => {
        this.feedbacks = data;
        this.filteredFeedbacks = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading feedbacks, using mock data:', error);
        // Load mock data for development
        this.loadMockFeedbacks();
      }
    });
  }

  loadMockFeedbacks() {
    // Mock feedback data for development
    const mockFeedbacks: Feedback[] = [
      {
        feedbackId: 1,
        comments: 'Excellent work on the Angular project! Your code quality has improved significantly.',
        feedbackType: 'Peer Feedback',
        rating: 5,
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
        reviewer: {
          userId: 2,
          username: 'jane.smith',
          email: 'jane.smith@company.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'Employee'
        }
      },
      {
        feedbackId: 2,
        comments: 'Good progress on the marketing campaign. Consider improving the social media engagement metrics.',
        feedbackType: 'Manager Feedback',
        rating: 4,
        employee: {
          employeeProfileId: 3,
          department: 'Marketing',
          designation: 'Marketing Specialist',
          dateOfJoining: '2023-03-20',
          reportingManager: 'Sarah Davis',
          currentProject: 'Brand Campaign',
          currentTeam: 'Marketing Team',
          skills: ['Digital Marketing', 'Content Creation'],
          lastAppraisalRating: 3.5,
          currentGoals: ['Increase brand awareness'],
          user: {
            userId: 3,
            username: 'mike.wilson',
            email: 'mike.wilson@company.com',
            firstName: 'Mike',
            lastName: 'Wilson',
            role: 'Employee'
          }
        },
        reviewer: {
          userId: 4,
          username: 'sarah.jones',
          email: 'sarah.jones@company.com',
          firstName: 'Sarah',
          lastName: 'Jones',
          role: 'Employee'
        }
      },
      {
        feedbackId: 3,
        comments: 'Outstanding performance in Q3! Exceeded all sales targets and maintained excellent client relationships.',
        feedbackType: 'Self-Feedback',
        rating: 5,
        employee: {
          employeeProfileId: 5,
          department: 'Sales',
          designation: 'Sales Manager',
          dateOfJoining: '2022-11-10',
          reportingManager: 'Lisa Anderson',
          currentProject: 'Q4 Sales Target',
          currentTeam: 'Sales Team',
          skills: ['Sales Management', 'Client Relations'],
          lastAppraisalRating: 4.8,
          currentGoals: ['Achieve Q4 targets'],
          user: {
            userId: 5,
            username: 'david.miller',
            email: 'david.miller@company.com',
            firstName: 'David',
            lastName: 'Miller',
            role: 'Employee'
          }
        },
        reviewer: {
          userId: 6,
          username: 'lisa.anderson',
          email: 'lisa.anderson@company.com',
          firstName: 'Lisa',
          lastName: 'Anderson',
          role: 'Employee'
        }
      }
    ];

    this.feedbacks = mockFeedbacks;
    this.filteredFeedbacks = mockFeedbacks;
    this.isLoading = false;
    console.log('Loaded mock feedbacks:', mockFeedbacks);
  }

  loadEmployeeProfiles() {
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (data: any) => {
        this.employeeProfiles = data;
      },
      error: (error: any) => {
        console.error('Error loading employee profiles, using mock data:', error);
        // Load mock employee profiles for development
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
      {
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
      }
    ];

    this.employeeProfiles = mockProfiles;
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
    this.filteredFeedbacks = this.feedbacks.filter(feedback => {
      const matchesSearch = !this.searchTerm ||
        feedback.employee.user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.employee.user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.employee.user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.reviewer.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.reviewer.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.comments.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.feedbackType.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesEmployee = !this.employeeFilter || feedback.employee.employeeProfileId.toString() === this.employeeFilter;
      const matchesReviewer = !this.reviewerFilter || feedback.reviewer.userId.toString() === this.reviewerFilter;
      const matchesFeedbackType = !this.feedbackTypeFilter || feedback.feedbackType === this.feedbackTypeFilter;

      return matchesSearch && matchesEmployee && matchesReviewer && matchesFeedbackType;
    });
  }

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

  openCreateModal() {
    this.feedbackForm.reset();
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Debug: Check if data is loaded
    console.log('Employee profiles available:', this.employeeProfiles.length);
    console.log('Users available:', this.users.length);
    
    // Ensure data is loaded
    if (this.employeeProfiles.length === 0) {
      this.loadMockEmployeeProfiles();
    }
    if (this.users.length === 0) {
      this.loadMockUsers();
    }
  }

  openEditModal(feedback: Feedback) {
    this.selectedFeedback = feedback;
    this.feedbackForm.patchValue({
      employeeId: feedback.employee.employeeProfileId,
      reviewerId: feedback.reviewer.userId,
      feedbackType: feedback.feedbackType,
      comments: feedback.comments,
      rating: feedback.rating
    });
    this.showEditModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openDeleteModal(feedback: Feedback) {
    this.selectedFeedback = feedback;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedFeedback = null;
    this.feedbackForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  createFeedback() {
    if (this.feedbackForm.valid) {
      const formData = this.feedbackForm.value;
      const selectedEmployee = this.employeeProfiles.find(emp => emp.employeeProfileId === formData.employeeId);
      const selectedReviewer = this.users.find(user => user.userId === formData.reviewerId);
      
      const feedback: Feedback = {
        feedbackId: 0, // Will be set by backend
        feedbackType: formData.feedbackType,
        comments: formData.comments,
        rating: formData.rating,
        employee: selectedEmployee || {
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
        reviewer: selectedReviewer || {
          userId: formData.reviewerId,
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          role: ''
        }
      };

      this.feedbackService.createFeedback(formData.employeeId, formData.reviewerId, feedback).subscribe({
        next: (response: any) => {
          this.successMessage = 'Feedback created successfully!';
          this.loadFeedbacks();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error creating feedback, using mock response:', error);
          // Mock successful creation for development
          this.successMessage = 'Feedback created successfully! (Mock)';
          this.loadFeedbacks();
          this.closeModals();
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  updateFeedback() {
    if (this.feedbackForm.valid && this.selectedFeedback) {
      const formData = this.feedbackForm.value;
      const selectedEmployee = this.employeeProfiles.find(emp => emp.employeeProfileId === formData.employeeId);
      const selectedReviewer = this.users.find(user => user.userId === formData.reviewerId);
      
      const feedback: Feedback = {
        ...this.selectedFeedback,
        feedbackType: formData.feedbackType,
        comments: formData.comments,
        rating: formData.rating,
        employee: selectedEmployee || this.selectedFeedback.employee,
        reviewer: selectedReviewer || this.selectedFeedback.reviewer
      };

      this.feedbackService.updateFeedback(feedback).subscribe({
        next: (response: any) => {
          this.successMessage = 'Feedback updated successfully!';
          this.loadFeedbacks();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error updating feedback, using mock response:', error);
          // Mock successful update for development
          this.successMessage = 'Feedback updated successfully! (Mock)';
          this.loadFeedbacks();
          this.closeModals();
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  deleteFeedback() {
    if (this.selectedFeedback) {
      this.feedbackService.deleteFeedback(this.selectedFeedback.feedbackId).subscribe({
        next: () => {
          this.successMessage = 'Feedback deleted successfully!';
          this.loadFeedbacks();
          this.closeModals();
        },
        error: (error: any) => {
          console.error('Error deleting feedback, using mock response:', error);
          // Mock successful deletion for development
          this.successMessage = 'Feedback deleted successfully! (Mock)';
          this.loadFeedbacks();
          this.closeModals();
        }
      });
    }
  }

  getManagers(): User[] {
    return this.users.filter(user => user.role === 'MANAGER' || user.role === 'ADMIN');
  }

  getFeedbackTypeClass(feedbackType: string): string {
    switch (feedbackType.toLowerCase()) {
      case 'peer feedback': return 'type-peer';
      case 'manager feedback': return 'type-manager';
      case 'self-feedback': return 'type-self';
      default: return 'type-default';
    }
  }

  getRatingClass(rating: number): string {
    if (rating >= 4) return 'rating-excellent';
    if (rating >= 3) return 'rating-good';
    if (rating >= 2) return 'rating-average';
    return 'rating-poor';
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }
}