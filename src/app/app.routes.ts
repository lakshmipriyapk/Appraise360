import { Routes } from '@angular/router';

// Admin
import { AppraisalComponent } from './component/admin/appraisal/appraisal.component';

import { GoalComponent } from './component/admin/goal/goal.component';
import { LoginComponent } from './component/admin/login/login.component';
import { ReviewCycleComponent } from './component/admin/review-cycle/review-cycle.component';
import { SignupComponent } from './component/admin/signup/signup.component';
import { DashboardComponent } from './component/admin/dashboard/dashboard.component';
import { EmployeeProfileComponent } from './component/admin/employee-profile/employee-profile.component';
import { FeedbackComponent } from './component/admin/feedback/feedback.component';

// Website
import { LandingComponent } from './component/website/landing/landing.component';

// User
import { UserComponent } from './component/admin/user/user.component';
import { EmployeeDashboardComponent } from './component/admin/employee-dashboard/employee-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'website/landing', pathMatch: 'full' },

  {
    path: 'website',
    children: [
      { path: 'landing', component: LandingComponent }
    ]
  },

  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'appraisal', component: AppraisalComponent },
  { path: 'employee-profile', component: EmployeeProfileComponent },
  { path: 'goal', component: GoalComponent },
  { path: 'review-cycle', component: ReviewCycleComponent },
  { path: 'user', component: UserComponent },
  

  { path: 'employee-dashboard', component: EmployeeDashboardComponent },
  { path: 'feedback', component: FeedbackComponent },

  { path: '**', redirectTo: 'website/landing' }
];
