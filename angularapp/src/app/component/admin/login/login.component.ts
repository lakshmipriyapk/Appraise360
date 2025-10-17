import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { User } from '../../../model/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  showPassword = false;
  isScrolled = false;
  showForgotPassword = false;
  resetEmail = '';
  isLoading = false;
  errorMessage = '';

  // Forgot Password properties
  showNewPassword = false;
  showConfirmNewPassword = false;
  newPasswordMismatch = false;
  isForgotPasswordLoading = false;
  forgotPasswordData = {
    email: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  loginData = {
    email: '',
    phone: '',
    password: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

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

  onLogin() {
    // Simple validation
    if ((!this.loginData.phone && !this.loginData.email) || !this.loginData.password) {
      this.errorMessage = 'Please fill in phone/email and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Add small delay to show loading state
    setTimeout(() => {
      this.performRealAuthentication();
    }, 100);
  }

  private performRealAuthentication() {
    console.log('=== REAL AUTHENTICATION START ===');
    console.log('Login data:', this.loginData);
    
    // Check for admin credentials first
    if (this.loginData.email === 'admin123@gmail.com' && this.loginData.password === 'Admin@123') {
      console.log('✅ ADMIN CREDENTIALS DETECTED');
      const adminUser: User = {
        userId: 24,
        username: 'admin123',
        email: 'admin123@gmail.com',
        password: 'Admin@123',
        firstName: 'admin',
        lastName: 'admin',
        fullName: 'admin',
        phoneNumber: '9999999999',
        role: 'Admin'
      };
      
      this.isLoading = false;
      this.errorMessage = '';
      this.authService.setCurrentUser(adminUser);
      this.redirectBasedOnRole('Admin');
      return;
    }
    
    // First, try to find user in localStorage (from signup) - only for valid credentials
    const storedUsers = this.getStoredUsers();
    const matchingUser = storedUsers.find(user => 
      (user.email === this.loginData.email || user.phoneNumber === this.loginData.phone) &&
      user.password === this.loginData.password
    );
    
    if (matchingUser) {
      console.log('Found valid user in localStorage:', matchingUser);
      this.isLoading = false;
      this.errorMessage = '';
      this.authService.setCurrentUser(matchingUser);
      this.redirectBasedOnRole(matchingUser.role || '');
      return;
    }
    
    console.log('User not found in localStorage, trying backend authentication...');
    
    // Show immediate feedback
    this.errorMessage = 'Authenticating...';
    
    // Try backend authentication with immediate timeout handling
    const loginObservable = this.loginData.phone 
      ? this.authService.loginWithPhone(this.loginData.phone, this.loginData.password)
      : this.authService.login(this.loginData.email, this.loginData.password);

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (this.isLoading) {
        console.log('Login timeout - clearing loading state');
        this.isLoading = false;
        this.errorMessage = 'Login request timed out. Please try again.';
      }
    }, 3000);

    loginObservable.subscribe({
      next: (user: User) => {
        clearTimeout(timeoutId);
        console.log('Backend authentication successful:', user);
        this.isLoading = false;
        this.errorMessage = '';
        this.redirectBasedOnRole(user.role || '');
      },
      error: (error: any) => {
        clearTimeout(timeoutId);
        console.log('Backend authentication failed:', error);
        this.isLoading = false;
        
        // Show appropriate error message
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Invalid email/phone or password. Please check your credentials and try again.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
        } else if (error.name === 'TimeoutError') {
          this.errorMessage = 'Login request timed out. Please try again.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
        
        // NO FALLBACK LOGIN - Only allow valid credentials
        console.log('Authentication failed - no fallback login allowed');
      }
    });
  }

  // Removed old tryRealLogin method - replaced with performRealAuthentication

  // Removed fallback login methods - only allow valid credentials

  private getStoredUsers(): User[] {
    // Try to get stored users from localStorage (from signup)
    try {
      const stored = localStorage.getItem('signedUpUsers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  closeForgotPassword() {
    this.showForgotPassword = false;
    this.resetEmail = '';
    this.forgotPasswordData = {
      email: '',
      newPassword: '',
      confirmNewPassword: ''
    };
    this.newPasswordMismatch = false;
    this.showNewPassword = false;
    this.showConfirmNewPassword = false;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmNewPassword() {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }

  checkNewPasswordMatch() {
    this.newPasswordMismatch = this.forgotPasswordData.newPassword !== this.forgotPasswordData.confirmNewPassword;
  }

  isForgotPasswordFormValid() {
    return this.forgotPasswordData.email && 
           this.forgotPasswordData.newPassword && 
           this.forgotPasswordData.confirmNewPassword &&
           !this.newPasswordMismatch &&
           this.forgotPasswordData.newPassword.length >= 6;
  }

  onForgotPasswordSubmit(form: NgForm) {
    if (form.invalid || this.newPasswordMismatch) {
      return;
    }

    this.isForgotPasswordLoading = true;

    const resetData = {
      email: this.forgotPasswordData.email,
      newPassword: this.forgotPasswordData.newPassword
    };

    // Call backend API to reset password
    this.http.put('http://localhost:8080/api/users/reset-password', resetData).subscribe({
      next: (response) => {
        this.isForgotPasswordLoading = false;
        this.closeForgotPassword();
        alert('Password reset successfully! You can now log in with your new password.');
      },
      error: (error) => {
        this.isForgotPasswordLoading = false;
        console.error('Password reset error:', error);
        
        if (error.status === 0) {
          alert('Cannot connect to the server. Please make sure the backend is running.');
        } else if (error.status === 404) {
          alert('No account found with this email address. Please check your email and try again.');
        } else if (error.status === 400) {
          alert('Invalid data. Please check your information and try again.');
        } else {
          alert('Password reset failed. Please try again.');
        }
      }
    });
  }

  private redirectBasedOnRole(role: string) {
    console.log('=== ROLE-BASED REDIRECTION ===');
    console.log('User role received:', role);
    console.log('Role type:', typeof role);
    console.log('Role comparison with Admin:', role === 'Admin');
    console.log('Role comparison with Admin (trimmed):', role?.trim() === 'Admin');
    
    if (role === 'Admin' || role?.trim() === 'Admin') {
      console.log('✅ Redirecting to MANAGER dashboard (/admin-dashboard)');
      this.router.navigate(['/admin-dashboard']);
    } else {
      console.log('✅ Redirecting to EMPLOYEE dashboard (/employee-dashboard)');
      this.router.navigate(['/employee-dashboard']);
    }
  }

  // Removed hardcoded name extraction - only use real user data from database
}
