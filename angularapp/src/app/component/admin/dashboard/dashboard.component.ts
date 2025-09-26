import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgClass } from '@angular/common';


interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
  status: string;
  employeeName: string;
  employeeId: number;
}

interface EmployeeStats {
  totalEmployees: number;
  newlyJoined: number;
  activeEmployees: number;
  employeesOnLeave: number;
  totalDepartments: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Sidebar menu
  menuItems = [
    { title: 'Dashboard', icon: 'fa-tachometer-alt', route: '/dashboard' },
    { title: 'Appraisal', icon: 'fa-clipboard-check', route: '/appraisal' },
    { title: 'Employee Profile', icon: 'fa-user', route: '/employee-profile' },
    { title: 'Feedback', icon: 'fa-comments', route: '/feedback' },
    { title: 'Goal', icon: 'fa-bullseye', route: '/goal' },
    { title: 'Review Cycle', icon: 'fa-calendar-alt', route: '/review-cycle' }
  ];

  cards: any;
  performanceMetrics: PerformanceMetric[] = [];
  recentActivities: RecentActivity[] = [];
  employeeStats: EmployeeStats = {
    totalEmployees: 0,
    newlyJoined: 0,
    activeEmployees: 0,
    employeesOnLeave: 0,
    totalDepartments: 0
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMockData();
  }

  loadMockData() {
    // Mock employee statistics
    this.employeeStats = {
      totalEmployees: 156,
      newlyJoined: 12,
      activeEmployees: 142,
      employeesOnLeave: 14,
      totalDepartments: 8
    };

    // Mock performance metrics
    this.performanceMetrics = [
      { label: 'Review Completion Rate', value: 87, target: 90, unit: '%' },
      { label: 'Employee Satisfaction', value: 4.2, target: 4.5, unit: '/5' },
      { label: 'Goal Achievement', value: 78, target: 80, unit: '%' }
    ];

    // Mock recent activities
    this.recentActivities = [
      {
        id: 1,
        type: 'review',
        description: 'John Doe completed annual review',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        employeeName: 'John Doe',
        employeeId: 101
      },
      {
        id: 2,
        type: 'goal',
        description: 'Sarah Johnson set new quarterly goals',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'pending',
        employeeName: 'Sarah Johnson',
        employeeId: 102
      },
      {
        id: 3,
        type: 'review',
        description: 'Lisa Brown started mid-year review',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        status: 'in-progress',
        employeeName: 'Lisa Brown',
        employeeId: 103
      }
    ];
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours < 1) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'review': return 'fa-clipboard-check';
      case 'goal': return 'fa-bullseye';
      case 'appraisal': return 'fa-star';
      case 'user': return 'fa-user';
      default: return 'fa-circle';
    }
  }

  getMetricStatus(metric: PerformanceMetric): string {
    const percentage = (metric.value / metric.target) * 100;
    if (percentage >= 100) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
  }

  getMetricProgress(metric: PerformanceMetric): number {
    return Math.min((metric.value / metric.target) * 100, 100);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
