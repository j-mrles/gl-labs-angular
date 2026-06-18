import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { AnalyticsTrackerService } from './analytics-tracker.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    style: 'display: flex; flex-direction: column; min-height: 100dvh;'
  }
})
export class AppComponent implements OnInit {
  title = 'galaxylabs';
  isRedOtter = false;
  private readonly tracker = inject(AnalyticsTrackerService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.tracker.trackVisit();
    this.tracker.trackPageView();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        this.tracker.trackPageView(url);
        this.isRedOtter = url.startsWith('/red-otter');
      });
  }
}

