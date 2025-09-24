import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

    this.messageTitle = 'Account Created';
    this.messageText = `Account for ${this.signupData.fullName} (${this.signupData.email}) created successfully.`;
    this.showMessage = true;
    form.resetForm();
    this.passwordMismatch = false;
  }

  closeMessage() {
    this.showMessage = false;
  }
}
