import { Routes } from '@angular/router';
import { DiscoverComponent } from './discover/discover.component';
import { HomepageComponent } from './homepage/homepage.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent }, // Default route (Home)
  { path: 'discover', component: DiscoverComponent },
];
