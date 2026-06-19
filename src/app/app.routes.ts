import { Routes } from '@angular/router';
import { staffAuthGuard } from './staff-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./homepage/homepage.component').then(m => m.HomepageComponent)
  },
  {
    path: 'staff-login',
    loadComponent: () => import('./staff-login/staff-login.component').then(m => m.StaffLoginComponent)
  },
  {
    path: 'staff-dashboard',
    canActivate: [staffAuthGuard],
    loadComponent: () => import('./staff-dashboard/staff-dashboard.component').then(m => m.StaffDashboardComponent)
  },
  {
    path: 'staff-dashboard/inquiries',
    canActivate: [staffAuthGuard],
    loadComponent: () => import('./staff-inquiries/staff-inquiries.component').then(m => m.StaffInquiriesComponent)
  },
  {
    path: 'staff-dashboard/content',
    canActivate: [staffAuthGuard],
    loadComponent: () => import('./staff-content/staff-content.component').then(m => m.StaffContentComponent)
  },
  {
    path: 'staff-dashboard/analytics',
    canActivate: [staffAuthGuard],
    loadComponent: () => import('./staff-analytics/staff-analytics.component').then(m => m.StaffAnalyticsComponent)
  },
  {
    path: 'staff-dashboard/settings',
    canActivate: [staffAuthGuard],
    loadComponent: () => import('./staff-settings/staff-settings.component').then(m => m.StaffSettingsComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./discover/discover.component').then(m => m.DiscoverComponent)
  },
  {
    path: 'about-us',
    loadComponent: () => import('./about-us/about-us.component').then(m => m.AboutUsComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./our-products/our-products.component').then(m => m.OurProductsComponent)
  },
  {
    path: 'red-otter',
    loadComponent: () => import('./red-otter/red-otter.component').then(m => m.RedOtterComponent)
  },
  {
    path: 'red-otter/login',
    loadComponent: () => import('./red-otter/auth/ro-login.component').then(m => m.RoLoginComponent)
  },
  {
    path: 'red-otter/signup',
    loadComponent: () => import('./red-otter/auth/ro-signup.component').then(m => m.RoSignupComponent)
  },
  {
    path: 'red-otter/dashboard',
    canActivate: [() => import('./red-otter/ro-auth.guard').then(m => m.roAuthGuard)],
    loadComponent: () => import('./red-otter/dashboard/ro-dashboard.component').then(m => m.RoDashboardComponent)
  },
  {
    path: 'red-otter/analyze',
    canActivate: [() => import('./red-otter/ro-auth.guard').then(m => m.roAuthGuard)],
    loadComponent: () => import('./red-otter/analyze/ro-analyze.component').then(m => m.RoAnalyzeComponent)
  },
  {
    path: 'red-otter/report/:id',
    canActivate: [() => import('./red-otter/ro-auth.guard').then(m => m.roAuthGuard)],
    loadComponent: () => import('./red-otter/report/ro-report.component').then(m => m.RoReportComponent)
  },
  {
    path: 'red-otter/chat',
    canActivate: [() => import('./red-otter/ro-auth.guard').then(m => m.roAuthGuard)],
    loadComponent: () => import('./red-otter/chat/ro-chat.component').then(m => m.RoChatComponent)
  },
  {
    path: 'red-otter/reports',
    canActivate: [() => import('./red-otter/ro-auth.guard').then(m => m.roAuthGuard)],
    loadComponent: () => import('./red-otter/reports/ro-reports.component').then(m => m.RoReportsComponent)
  },
  {
    path: 'red-otter/compare',
    canActivate: [() => import('./red-otter/ro-auth.guard').then(m => m.roAuthGuard)],
    loadComponent: () => import('./red-otter/compare/ro-compare.component').then(m => m.RoCompareComponent)
  },
  {
    path: 'red-otter/settings',
    canActivate: [() => import('./red-otter/ro-auth.guard').then(m => m.roAuthGuard)],
    loadComponent: () => import('./red-otter/settings/ro-settings.component').then(m => m.RoSettingsComponent)
  }

];
