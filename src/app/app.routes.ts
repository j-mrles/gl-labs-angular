import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./homepage/homepage.component').then(m => m.HomepageComponent)
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
