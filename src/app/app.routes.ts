import { Routes } from '@angular/router';
import { DiscoverComponent } from './discover/discover.component';
import { HomepageComponent } from './homepage/homepage.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { OurProductsComponent } from './our-products/our-products.component';
export const routes: Routes = [
  { path: '', component: HomepageComponent }, // Default route (Home)
  { path: 'discover', component: DiscoverComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'our-products', component: OurProductsComponent }

];
