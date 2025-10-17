import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    // Initialize any component logic here
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkPasswordMatch() {
    this.passwordMismatch = this.signupData.password !== this.signupData.confirmPassword && 
                           this.signupData.confirmPassword.length > 0;
  }


  isFormValid(): boolean {
    const phoneDigits = this.signupData.phone.replace(/\D/g, ''); // Remove non-digits
    return this.signupData.fullName.trim().length > 0 &&
           this.signupData.email.trim().length > 0 &&
           phoneDigits.length === 10 &&
           this.signupData.role.trim().length > 0 &&
           this.signupData.password.length >= 6 &&
           this.signupData.confirmPassword.length > 0 &&
           !this.passwordMismatch;
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    // Check if passwords match
    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.isLoading = true;

    // Prepare user data for backend
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

    // Call backend API with timeout
    this.http.post('http://localhost:8080/api/users', userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageTitle = 'Account Created Successfully!';
        this.messageText = `Welcome ${this.signupData.fullName}! Your account has been created and saved to the database. You can now log in with your credentials.`;
        this.showMessage = true;
        
        // Store user data in localStorage for login fallback
        this.storeUserData(userData);
        
        form.resetForm();
        this.passwordMismatch = false;
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Signup error:', error);
        
        if (error.status === 0) {
          this.messageTitle = 'Connection Error';
          this.messageText = 'Cannot connect to the server. Please make sure the backend is running.';
        } else if (error.status === 409) {
          this.messageTitle = 'Account Already Exists';
          this.messageText = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (error.status === 400) {
          this.messageTitle = 'Invalid Data';
          this.messageText = this.getErrorMessage(error.error) || 'Please check your information and try again.';
        } else {
          this.messageTitle = 'Account Creation Failed';
          this.messageText = this.getErrorMessage(error.error) || this.getErrorMessage(error.message) || 'Please try again with different information.';
        }
        this.showMessage = true;
      }
    });

    // Add timeout fallback
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.messageTitle = 'Request Timeout';
        this.messageText = 'The request is taking too long. Please check your internet connection and try again.';
        this.showMessage = true;
      }
    }, 10000); // 10 second timeout
  }

  closeMessage() {
    this.showMessage = false;
  }

  private getErrorMessage(error: any): string {
    if (!error) return '';
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (typeof error === 'object') {
      // Try to extract meaningful error message from object
      if (error.message) {
        return error.message;
      }
      if (error.error) {
        return this.getErrorMessage(error.error);
      }
      if (error.details) {
        return error.details;
      }
      if (error.statusText) {
        return error.statusText;
      }
      // If it's an object with no clear message, stringify it safely
      try {
        return JSON.stringify(error);
      } catch {
        return 'An error occurred';
      }
    }
    
    return String(error);
  }


  private storeUserData(userData: any) {
    try {
      // Get existing stored users
      const existingUsers = this.getStoredUsers();
      
      // Check if user already exists (by email or phone)
      const existingUserIndex = existingUsers.findIndex(user => 
        user.email === userData.email || user.phoneNumber === userData.phoneNumber
      );
      
      // Add new user to the list
      const newUser = {
        userId: Math.floor(Math.random() * 1000) + 1, // Generate ID
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        role: userData.role
      };
      
      if (existingUserIndex >= 0) {
        // Update existing user
        existingUsers[existingUserIndex] = newUser;
        console.log('Updated existing user data:', newUser);
      } else {
        // Add new user
        existingUsers.push(newUser);
        console.log('Added new user data:', newUser);
      }
      
      // Store updated list
      localStorage.setItem('signedUpUsers', JSON.stringify(existingUsers));
      console.log('Total stored users:', existingUsers.length);
    } catch (error) {
      console.error('Error storing user data:', error);
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
