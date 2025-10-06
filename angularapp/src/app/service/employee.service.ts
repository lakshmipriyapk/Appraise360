import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeProfile } from '../model/employee-profile.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employeeProfiles`; // Maps to /api/employeeProfiles for employees list

  constructor(private http: HttpClient) { }

  /**
   * Get all employees (employeeProfiles) - alternative to "/api/employees" mentioned in requirements
   * Uses /api/employeeProfiles endpoint from backend
   */
  getAllEmployees(): Observable<EmployeeProfile[]> {
    return this.http.get<EmployeeProfile[]>(this.apiUrl);
  }

  /**
   * Get employee by ID - equivalent to "/api/employees/{id}" mentioned in requirements
   * Uses /api/employeeProfiles/{id} endpoint from backend
   */
  getEmployeeById(id: number): Observable<EmployeeProfile> {
    return this.http.get<EmployeeProfile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get employees by department filter
   */
  getEmployeesByDepartment(department: string): Observable<EmployeeProfile[]> {
    return this.http.get<EmployeeProfile[]>(`${this.apiUrl}/department/${department}`);
  }

  /**
   * Get employees by designation filter
   */
  getEmployeesByDesignation(designation: string): Observable<EmployeeProfile[]> {
    return this.http.get<EmployeeProfile[]>(`${this.apiUrl}/designation/${designation}`);
  }

  /**
   * Search employees by name or other criteria
   */
  searchEmployees(searchTerm: string): Observable<EmployeeProfile[]> {
    // Backend doesn't have search endpoint, so we'll filter on frontend
    return this.getAllEmployees();
  }
}

