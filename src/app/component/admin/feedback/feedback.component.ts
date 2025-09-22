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
  managerFilter = '';

  constructor(
    public router: Router,
    private feedbackService: FeedbackService,
    private employeeProfileService: EmployeeProfileService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.feedbackForm = this.fb.group({
      employeeId: ['', Validators.required],
      managerId: ['', Validators.required],
      comments: ['', Validators.required]
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
      next: (data: any) => {
        this.feedbacks = data;
        this.filteredFeedbacks = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load feedbacks. Please try again.';
        this.isLoading = false;
        console.error('Error loading feedbacks:', error);
      }
    });
  }

  loadEmployeeProfiles() {
    this.employeeProfileService.getAllEmployeeProfiles().subscribe({
      next: (data: any) => {
        this.employeeProfiles = data;
      },
      error: (error: any) => {
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
    this.filteredFeedbacks = this.feedbacks.filter(feedback => {
      const matchesSearch = !this.searchTerm ||
        feedback.employee.user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.employee.user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.employee.user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.manager.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.manager.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        feedback.comments.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesEmployee = !this.employeeFilter || feedback.employee.employeeProfileId.toString() === this.employeeFilter;
      const matchesManager = !this.managerFilter || feedback.manager.userId.toString() === this.managerFilter;

      return matchesSearch && matchesEmployee && matchesManager;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onEmployeeFilterChange() {
    this.applyFilters();
  }

  onManagerFilterChange() {
    this.applyFilters();
  }

  openCreateModal() {
    this.feedbackForm.reset();
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(feedback: Feedback) {
    this.selectedFeedback = feedback;
    this.feedbackForm.patchValue({
      employeeId: feedback.employee.employeeProfileId,
      managerId: feedback.manager.userId,
      comments: feedback.comments
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
      const selectedManager = this.users.find(user => user.userId === formData.managerId);
      
      const feedback: Feedback = {
        feedbackId: 0, // Will be set by backend
        comments: formData.comments,
        employee: selectedEmployee || {
          employeeProfileId: formData.employeeId,
          department: '',
          designation: '',
          user: {
            userId: 0,
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            role: ''
          }
        },
        manager: selectedManager || {
          userId: formData.managerId,
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          role: ''
        }
      };

      this.feedbackService.createFeedback(feedback).subscribe({
        next: (response: any) => {
          this.successMessage = 'Feedback created successfully!';
          this.loadFeedbacks();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to create feedback. Please try again.';
          console.error('Error creating feedback:', error);
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
      const selectedManager = this.users.find(user => user.userId === formData.managerId);
      
      const feedback: Feedback = {
        ...this.selectedFeedback,
        comments: formData.comments,
        employee: selectedEmployee || this.selectedFeedback.employee,
        manager: selectedManager || this.selectedFeedback.manager
      };

      this.feedbackService.updateFeedback(feedback).subscribe({
        next: (response: any) => {
          this.successMessage = 'Feedback updated successfully!';
          this.loadFeedbacks();
          this.closeModals();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to update feedback. Please try again.';
          console.error('Error updating feedback:', error);
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
          this.errorMessage = 'Failed to delete feedback. Please try again.';
          console.error('Error deleting feedback:', error);
        }
      });
    }
  }

  getManagers(): User[] {
    return this.users.filter(user => user.role === 'MANAGER' || user.role === 'ADMIN');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Add logout logic here
    console.log('Logout clicked');
  }
}