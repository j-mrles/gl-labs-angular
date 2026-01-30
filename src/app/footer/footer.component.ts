import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LocaleService } from '../locale.service';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {
  isSignedIn = false;
  private routerSub: Subscription | null = null;

  constructor(
    private readonly router: Router,
    readonly locale: LocaleService
  ) {}

  ngOnInit(): void {
    this.refreshAuthState();
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.refreshAuthState());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.routerSub = null;
  }

  private refreshAuthState(): void {
    try {
      this.isSignedIn = typeof window !== 'undefined' && !!sessionStorage.getItem('staff_id_token');
    } catch {
      this.isSignedIn = false;
    }
  }
}
