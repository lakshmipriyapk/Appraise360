import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  loginData = {
    email: '',
    phone: '',
    password: '',
  };

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
    if (this.loginData.email && this.loginData.password) {
      console.log('Login Data:', this.loginData);
      alert('Login successful!');
    } else {
      alert('Please fill in all fields.');
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
}
