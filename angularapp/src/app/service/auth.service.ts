import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    this.loadStoredUser();
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(user => {
          this.setCurrentUser(user);
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
          firstName: email === 'admin@company.com' ? 'Admin' : 'John',
          lastName: email === 'admin@company.com' ? 'User' : 'Doe',
          role: email === 'admin@company.com' ? 'Admin' : 'Employee'
        };
        
        this.setCurrentUser(mockUser);
        observer.next(mockUser);
        observer.complete();
      }, 1000);
    });
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
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
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }
}
