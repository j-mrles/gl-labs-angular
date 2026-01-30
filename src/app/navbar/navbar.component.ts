import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isSignedIn = false;
  private routerSub: Subscription | null = null;

  constructor(private readonly router: Router) {}

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

  // Toggle side menu visibility
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    // Prevent body scroll when menu is open
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Close menu when a link is clicked
  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  signOut() {
    try {
      sessionStorage.removeItem('staff_id_token');
      sessionStorage.removeItem('staff_uid');
      sessionStorage.removeItem('staff_username');
    } catch {
      // ignore
    }
    this.refreshAuthState();
    this.closeMenu();
    void this.router.navigateByUrl('/staff-login');
  }
}
