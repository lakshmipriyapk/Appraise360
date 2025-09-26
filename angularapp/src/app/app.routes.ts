import { Routes } from '@angular/router';

// Website (keep these as they're needed for initial load)
import { LandingComponent } from './component/website/landing/landing.component';
import { PerformComponent } from './component/website/perform/perform';
import { EngageComponent } from './component/website/engage/engage';
import { ManagerProductsComponent } from './component/website/manager-products/manager-products';
import { BenefitsComponent } from './component/website/benefits/benefits';

// Auth components (keep these as they're needed for initial load)
import { LoginComponent } from './component/admin/login/login.component';
import { SignupComponent } from './component/admin/signup/signup.component';

export const routes: Routes = [
  { path: '', redirectTo: 'website/landing', pathMatch: 'full' },

  {
    path: 'website',
    children: [
      { path: 'landing', component: LandingComponent },
      { path: 'perform', component: PerformComponent },
      { path: 'engage', component: EngageComponent },
      { path: 'manager-products', component: ManagerProductsComponent },
      { path: 'benefits', component: BenefitsComponent }
    ]
  },

  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  
  // Lazy loaded dashboard components for better performance
  { 
    path: 'dashboard', 
    loadComponent: () => import('./component/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'appraisal', 
    loadComponent: () => import('./component/admin/appraisal/appraisal.component').then(m => m.AppraisalComponent)
  },
  { 
    path: 'employee-profile', 
    loadComponent: () => import('./component/admin/employee-profile/employee-profile.component').then(m => m.EmployeeProfileComponent)
  },
  { 
    path: 'goal', 
    loadComponent: () => import('./component/admin/goal/goal.component').then(m => m.GoalComponent)
  },
  { 
    path: 'review-cycle', 
    loadComponent: () => import('./component/admin/review-cycle/review-cycle.component').then(m => m.ReviewCycleComponent)
  },
  { 
    path: 'user', 
    loadComponent: () => import('./component/admin/user/user.component').then(m => m.UserComponent)
  },
  { 
    path: 'employee-dashboard', 
    loadComponent: () => import('./component/admin/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
  },
  { 
    path: 'feedback', 
    loadComponent: () => import('./component/admin/feedback/feedback.component').then(m => m.FeedbackComponent)
  },

  { path: '**', redirectTo: 'website/landing' }
];
