import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Ensure this file exists

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)] // Ensure router is provided
}).catch(err => console.error(err));

