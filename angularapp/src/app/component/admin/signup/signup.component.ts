import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupData = {
    fullName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: ''
  };

  showPassword = false;
  showConfirmPassword = false;
  showMessage = false;
  messageTitle = '';
  messageText = '';
  isScrolled = false;
  passwordMismatch = false;
  isLoading = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // Removed health check to improve performance
    // Health check will be done only when signup is attempted
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkPasswordMatch() {
    this.passwordMismatch =
      this.signupData.password !== this.signupData.confirmPassword &&
      this.signupData.confirmPassword.length > 0;
  }

  isFormValid(): boolean {
    const phoneDigits = this.signupData.phone.replace(/\D/g, '');
    return (
      this.signupData.fullName.trim().length > 0 &&
      this.signupData.email.trim().length > 0 &&
      phoneDigits.length === 10 &&
      this.signupData.role.trim().length > 0 &&
      this.signupData.password.length >= 6 &&
      this.signupData.confirmPassword.length > 0 &&
      !this.passwordMismatch
    );
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.isLoading = true;

    const nameParts = this.signupData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const username = this.signupData.email.split('@')[0];

    const userData = {
      fullName: this.signupData.fullName.trim(),
      email: this.signupData.email.trim(),
      phoneNumber: this.signupData.phone.trim(),
      password: this.signupData.password,
      role: this.signupData.role || 'Employee',
      username: username,
      firstName: firstName,
      lastName: lastName
    };

    // ✅ Send signup data to backend
    this.http.post('http://localhost:8080/api/users', userData, { responseType: 'text' }).subscribe({
      next: (responseText) => {
        this.isLoading = false;

        // Some backends send plain text — try parsing if it's JSON
        let response: any;
        try {
          response = JSON.parse(responseText);
        } catch {
          response = { message: responseText };
        }

        this.messageTitle = 'Account Created Successfully!';
        this.messageText = response.message
          ? response.message
          : `Welcome ${this.signupData.fullName}! Your account has been created successfully.`;
        this.showMessage = true;

        // Store locally for fallback login
        this.storeUserData(userData);
        form.resetForm();
        this.passwordMismatch = false;

        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Signup error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));

        if (error.status === 0) {
          this.messageTitle = 'Connection Error';
          this.messageText = 'Cannot connect to the server. Please make sure the backend is running on port 8080.';
        } else if (error.status === 409) {
          this.messageTitle = 'Account Already Exists';
          this.messageText = 'An account with this email already exists. Please try logging in.';
        } else if (error.status === 400) {
          this.messageTitle = 'Invalid Data';
          this.messageText = this.extractErrorMessage(error) || 'Please check your inputs and try again.';
        } else if (error.status === 500) {
          this.messageTitle = 'Server Error';
          this.messageText = 'There was a server error. This might be due to database connection issues. Please try again or contact support.';
        } else {
          this.messageTitle = 'Account Creation Failed';
          this.messageText =
            this.extractErrorMessage(error) ||
            `Unexpected error occurred (Status: ${error.status}). Please try again later.`;
        }

        this.showMessage = true;
      }
    });

    // Timeout fallback - reduced from 10s to 5s for better UX
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.messageTitle = 'Request Timeout';
        this.messageText = 'The request is taking too long. Please try again.';
        this.showMessage = true;
      }
    }, 5000);
  }

  closeMessage() {
    this.showMessage = false;
  }

  private extractErrorMessage(error: any): string {
    if (!error) return '';

    if (error.error) {
      if (typeof error.error === 'string') return error.error;
      if (typeof error.error === 'object') {
        return error.error.message || JSON.stringify(error.error);
      }
    }

    if (error.message) return error.message;
    return 'Unexpected error';
  }

  private storeUserData(userData: any) {
    try {
      const existingUsers = this.getStoredUsers();
      const exists = existingUsers.some(
        (u) => u.email === userData.email || u.phoneNumber === userData.phoneNumber
      );
      if (!exists) {
        userData.userId = Math.floor(Math.random() * 1000) + 1;
        existingUsers.push(userData);
        localStorage.setItem('signedUpUsers', JSON.stringify(existingUsers));
      }
    } catch (err) {
      console.error('Error storing user data:', err);
    }
  }

  private getStoredUsers(): any[] {
    try {
      const stored = localStorage.getItem('signedUpUsers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
