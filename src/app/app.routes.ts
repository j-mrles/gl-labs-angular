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
    path: 'discover',
    loadComponent: () => import('./discover/discover.component').then(m => m.DiscoverComponent)
  },
  {
    path: 'about-us',
    loadComponent: () => import('./about-us/about-us.component').then(m => m.AboutUsComponent)
  },
  {
    path: 'our-products',
    loadComponent: () => import('./our-products/our-products.component').then(m => m.OurProductsComponent)
  }

];
