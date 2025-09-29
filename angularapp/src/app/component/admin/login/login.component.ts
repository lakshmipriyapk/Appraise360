import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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

  loginData = {
    email: '',
    phone: '',
    password: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router
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
      this.redirectBasedOnRole(matchingUser.role);
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
        this.redirectBasedOnRole(user.role);
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
  }

  onForgotPassword() {
    if (this.resetEmail) {
      console.log('Reset password for:', this.resetEmail);
      alert('Password reset link sent to your email!');
      this.closeForgotPassword();
    } else {
      alert('Please enter your email address.');
    }
  }

  private redirectBasedOnRole(role: string) {
    console.log('=== ROLE-BASED REDIRECTION ===');
    console.log('User role received:', role);
    console.log('Role type:', typeof role);
    console.log('Role comparison with Admin:', role === 'Admin');
    console.log('Role comparison with Admin (trimmed):', role?.trim() === 'Admin');
    
    if (role === 'Admin' || role?.trim() === 'Admin') {
      console.log('✅ Redirecting to MANAGER dashboard (/dashboard)');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('✅ Redirecting to EMPLOYEE dashboard (/employee-dashboard)');
      this.router.navigate(['/employee-dashboard']);
    }
  }

  // Removed hardcoded name extraction - only use real user data from database
}
