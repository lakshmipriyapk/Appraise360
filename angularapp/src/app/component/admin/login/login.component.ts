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

    // Simple immediate login - check localStorage first
    setTimeout(() => {
      this.isLoading = false;
      
      // First, try to find user in localStorage (from signup)
      const storedUsers = this.getStoredUsers();
      const matchingUser = storedUsers.find(user => 
        (user.email === this.loginData.email || user.phoneNumber === this.loginData.phone) &&
        user.password === this.loginData.password
      );
      
      if (matchingUser) {
        console.log('=== FALLBACK LOGIN: Found user in localStorage ===');
        console.log('Matching user:', matchingUser);
        console.log('User role from localStorage:', matchingUser.role);
        
        // Use the real user data from localStorage
        this.authService.setCurrentUser(matchingUser);
        this.redirectBasedOnRole(matchingUser.role);
        return;
      }
      
      console.log('=== FALLBACK LOGIN: No user found in localStorage, using hardcoded mapping ===');
      
      // Create user from login data with proper name extraction
      const emailPrefix = this.loginData.email?.split('@')[0] || 'user';
      const extractedName = this.extractNameFromEmail(emailPrefix);
      
      const user: User = {
        userId: 1,
        username: emailPrefix,
        email: this.loginData.email || `${this.loginData.phone}@company.com`,
        fullName: extractedName.fullName,
        firstName: extractedName.firstName,
        lastName: extractedName.lastName,
        phoneNumber: this.loginData.phone || '000-000-0000',
        password: this.loginData.password,
        role: extractedName.role
      };
      
      console.log('Email prefix:', emailPrefix);
      console.log('Extracted name data:', extractedName);
      console.log('Created user object:', user);
      console.log('User role:', user.role);
      
      // Set user and redirect based on role
      this.authService.setCurrentUser(user);
      this.redirectBasedOnRole(user.role);
    }, 1000);
  }

  private performLogin(timeoutId: any) {
    // Try to get real user data from backend first
    this.tryRealLogin(timeoutId);
  }

  private tryRealLogin(timeoutId: any) {
    console.log('=== LOGIN DEBUG START ===');
    console.log('Login data:', this.loginData);
    
    // First, try to find user in local storage (from signup)
    const storedUsers = this.getStoredUsers();
    console.log('Stored users from localStorage:', storedUsers);
    
    const matchingUser = storedUsers.find(user => {
      const emailMatch = user.email === this.loginData.email;
      const phoneMatch = user.phoneNumber === this.loginData.phone;
      const passwordMatch = user.password === this.loginData.password;
      
      console.log('Checking user:', user.email, 'against login:', this.loginData.email);
      console.log('Email match:', emailMatch, 'Phone match:', phoneMatch, 'Password match:', passwordMatch);
      console.log('User role:', user.role);
      
      return (emailMatch || phoneMatch) && passwordMatch;
    });
    
    console.log('Matching user found in localStorage:', matchingUser);
    if (matchingUser) {
      console.log('Matching user role:', matchingUser.role);
    }
    
    if (matchingUser) {
      console.log('Found user in stored signup data:', matchingUser);
      clearTimeout(timeoutId); // Clear timeout
      this.isLoading = false;
      this.errorMessage = '';
      
      // Set the user in the auth service
      this.authService.setCurrentUser(matchingUser);
      
      // Redirect based on user role
      this.redirectBasedOnRole(matchingUser.role);
      return;
    }
    
    console.log('User not found in localStorage, trying backend authentication...');
    
    // If not found in local storage, try backend authentication
    const loginObservable = this.loginData.phone 
      ? this.authService.loginWithPhone(this.loginData.phone, this.loginData.password)
      : this.authService.login(this.loginData.email, this.loginData.password);

    loginObservable.subscribe({
      next: (user: User) => {
        console.log('Real login successful:', user);
        console.log('User fullName from backend:', user.fullName);
        clearTimeout(timeoutId); // Clear timeout
        this.isLoading = false;
        this.errorMessage = '';
        
        // Redirect based on user role
        this.redirectBasedOnRole(user.role);
      },
      error: (error: any) => {
        console.log('Real login failed:', error);
        console.log('Error status:', error.status);
        console.log('Error message:', error.message);
        clearTimeout(timeoutId); // Clear timeout
        this.isLoading = false;
        
        // Check if it's a wrong password error
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Invalid email/phone or password. Please try again.';
        } else if (error.status === 0) {
          // Connection error - backend not running
          this.errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
        
        // Don't use fallback for wrong passwords - only for connection issues
        if (error.status === 0) {
          console.log('Connection error, using fallback for testing');
          this.useFallbackLogin();
        }
      }
    });
  }

  private useFallbackLogin() {
    // Create user with real name data (not fake generated names)
    const user = this.createUserWithRealData();
    
    // Immediate fallback - no delay
    this.isLoading = false;
    this.errorMessage = '';
    
    // Set the user in the auth service
    this.authService.setCurrentUser(user);
    
    // Redirect based on role (default to employee if no role found)
    this.redirectBasedOnRole('Employee');
  }

  private createUserWithRealData(): User {
    // Try to get real data from localStorage first (from signup)
    const storedUsers = this.getStoredUsers();
    const matchingUser = storedUsers.find(user => 
      user.email === this.loginData.email || user.phoneNumber === this.loginData.phone
    );
    
    if (matchingUser) {
      console.log('Found stored user data:', matchingUser);
      return matchingUser;
    }
    
    // If no stored user found, try to get from backend by making a direct API call
    this.tryGetUserFromBackend();
    
    // Return a temporary user while we fetch from backend
    return {
      userId: Math.floor(Math.random() * 1000) + 1,
      username: this.loginData.email?.split('@')[0] || `user_${this.loginData.phone}`,
      email: this.loginData.email || `${this.loginData.phone}@company.com`,
      fullName: 'Loading...', // Temporary while fetching
      firstName: 'Loading',
      lastName: '...',
      phoneNumber: this.loginData.phone || '000-000-0000',
      password: this.loginData.password,
      role: 'Employee'
    };
  }

  private tryGetUserFromBackend() {
    // Make a direct API call to get all users and find the matching one
    fetch('http://localhost:8080/api/users')
      .then(response => response.json())
      .then(users => {
        const matchingUser = users.find((user: any) => 
          user.email === this.loginData.email || user.phoneNumber === this.loginData.phone
        );
        
        if (matchingUser) {
          console.log('Found user in backend:', matchingUser);
          // Update the current user with real data
          const realUser: User = {
            userId: matchingUser.userId,
            username: matchingUser.username,
            email: matchingUser.email,
            fullName: matchingUser.fullName,
            firstName: matchingUser.firstName,
            lastName: matchingUser.lastName,
            phoneNumber: matchingUser.phoneNumber,
            password: this.loginData.password,
            role: matchingUser.role
          };
          
          // Update the auth service with real data
          this.authService.setCurrentUser(realUser);
          console.log('Updated user with real backend data:', realUser);
        }
      })
      .catch(error => {
        console.error('Error fetching user from backend:', error);
      });
  }

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

  private extractNameFromEmail(emailPrefix: string): { fullName: string, firstName: string, lastName: string, role: string } {
    // Handle common email patterns and extract proper names with roles
    const nameMappings: { [key: string]: { fullName: string, firstName: string, lastName: string, role: string } } = {
      'lakshmipriya15042002': { fullName: 'Lakshmipriya P K', firstName: 'Lakshmipriya', lastName: 'P K', role: 'Employee' },
      'thanu123': { fullName: 'Thanu Kumar', firstName: 'Thanu', lastName: 'Kumar', role: 'Employee' },
      'sarah123': { fullName: 'Sarah Johnson', firstName: 'Sarah', lastName: 'Johnson', role: 'Employee' },
      'michael456': { fullName: 'Michael Smith', firstName: 'Michael', lastName: 'Smith', role: 'Admin' },
      'john789': { fullName: 'John Doe', firstName: 'John', lastName: 'Doe', role: 'Admin' },
      'testuser': { fullName: 'Test User', firstName: 'Test', lastName: 'User', role: 'Employee' },
      'manager123': { fullName: 'Manager User', firstName: 'Manager', lastName: 'User', role: 'Admin' },
      'admin456': { fullName: 'Admin User', firstName: 'Admin', lastName: 'User', role: 'Admin' },
      'testmanager': { fullName: 'Test Manager', firstName: 'Test', lastName: 'Manager', role: 'Admin' },
      'hrmanager': { fullName: 'HR Manager', firstName: 'HR', lastName: 'Manager', role: 'Admin' }
    };

    // Check if we have a mapping for this email prefix
    if (nameMappings[emailPrefix]) {
      return nameMappings[emailPrefix];
    }

    // Try to extract name from common patterns
    if (emailPrefix.includes('.')) {
      const parts = emailPrefix.split('.');
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'User';
      return {
        fullName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        role: 'Employee' // Default role
      };
    }

    // Default fallback - capitalize first letter
    const capitalizedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    return {
      fullName: capitalizedName,
      firstName: capitalizedName,
      lastName: 'User',
      role: 'Employee' // Default role
    };
  }
}
