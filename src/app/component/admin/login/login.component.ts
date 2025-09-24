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
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // For development, use mock login
    this.authService.mockLogin(this.loginData.email, this.loginData.password).subscribe({
      next: (user: User) => {
        this.isLoading = false;
        console.log('Login successful:', user);
        
        // Redirect based on user role
        if (user.role === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else if (user.role === 'Employee') {
          this.router.navigate(['/employee-dashboard']);
        } else {
          this.router.navigate(['/employee-dashboard']); // Default to employee dashboard
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      }
    });
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
}
