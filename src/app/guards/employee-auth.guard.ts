import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeAuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      if (user && (user.role === 'Employee' || user.role === 'Admin')) {
        return true;
      }
    }
    
    // Redirect to login if not authenticated or not an employee
    this.router.navigate(['/login']);
    return false;
  }
}
