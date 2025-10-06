import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timeout, catchError, throwError } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User } from '../model/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    this.loadStoredUser();
  }

  login(email: string, password: string): Observable<User> {
    console.log('AuthService: Attempting email login with:', { email, password });
    console.log('AuthService: Making request to:', `${this.apiUrl}/login`);
    
    const loginRequest = {
      email: email,
      phoneNumber: null,
      password: password
    };
    
    return this.http.post<any>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        timeout(1500), // 1.5 second timeout for faster response
        catchError(error => {
          console.error('AuthService: Email login error:', error);
          return throwError(() => error);
        }),
        map(response => {
          console.log('AuthService: Email login response received:', response);
          // Extract user data from the response
          const user: User = {
            userId: response.userId,
            username: response.username,
            email: response.email,
            fullName: response.fullName,
            firstName: response.firstName,
            lastName: response.lastName,
            phoneNumber: response.phoneNumber,
            password: response.password,
            role: response.role,
            employeeProfiles: response.employeeProfiles
          };
          console.log('AuthService: Email login successful, processed user:', user);
          this.setCurrentUser(user);
          return user;
        })
      );
  }

  loginWithPhone(phoneNumber: string, password: string): Observable<User> {
    console.log('=== AUTH SERVICE DEBUG START ===');
    console.log('AuthService: loginWithPhone() called');
    console.log('AuthService: Attempting phone login with:', { phoneNumber, password });
    console.log('AuthService: Making request to:', `${this.apiUrl}/login`);
    
    const loginRequest = {
      email: null,
      phoneNumber: phoneNumber,
      password: password
    };
    console.log('AuthService: Request body:', loginRequest);
    
    return this.http.post<any>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        timeout(1500), // 1.5 second timeout for faster response
        catchError(error => {
          console.error('AuthService: Phone login error:', error);
          console.error('AuthService: Error details:', JSON.stringify(error, null, 2));
          return throwError(() => error);
        }),
        map(response => {
          console.log('AuthService: Phone login response received:', response);
          // Extract user data from the response
          const user: User = {
            userId: response.userId,
            username: response.username,
            email: response.email,
            fullName: response.fullName,
            firstName: response.firstName,
            lastName: response.lastName,
            phoneNumber: response.phoneNumber,
            password: response.password,
            role: response.role,
            employeeProfiles: response.employeeProfiles
          };
          console.log('AuthService: Phone login successful, processed user:', user);
          this.setCurrentUser(user);
          return user;
        })
      );
  }

  // For development/testing - simulate login with mock data
  mockLogin(email: string, password: string): Observable<User> {
    // Simulate API call delay
    return new Observable(observer => {
      setTimeout(() => {
        // Mock user data based on email
        const mockUser: User = {
          userId: email === 'admin@company.com' ? 1 : 2,
          username: email.split('@')[0],
          email: email,
          fullName: email === 'admin@company.com' ? 'Admin User' : 'John Doe',
          firstName: email === 'admin@company.com' ? 'Admin' : 'John',
          lastName: email === 'admin@company.com' ? 'User' : 'Doe',
          phoneNumber: '+1-555-0000',
          password: 'password123',
          role: email === 'admin@company.com' ? 'Admin' : 'Employee'
        };
        
        this.setCurrentUser(mockUser);
        observer.next(mockUser);
        observer.complete();
      }, 1000);
    });
  }

  setCurrentUser(user: User): void {
    console.log('AuthService: Setting current user:', user);
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    console.log('AuthService: Getting current user:', user);
    return user;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'Admin' : false;
  }

  isEmployee(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'Employee' : false;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('AuthService: Loading stored user:', user);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  clearStoredUser(): void {
    console.log('AuthService: Clearing stored user data');
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }
}
