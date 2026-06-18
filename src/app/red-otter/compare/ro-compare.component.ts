import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RoAuthService } from '../ro-auth.service';
import { RoApiService, PropertyReport } from '../ro-api.service';

@Component({
  selector: 'app-ro-compare',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ro-compare.component.html',
  styleUrls: ['../ro-dashboard.css']
})
export class RoCompareComponent implements OnInit {
  private readonly api = inject(RoApiService);
  private readonly authService = inject(RoAuthService);
  private readonly router = inject(Router);

  user = this.api.getUserInfo();
  saved: PropertyReport[] = [];
  loading = true;

  get initials(): string {
    return (this.user.name || this.user.email).substring(0, 2).toUpperCase();
  }

  ngOnInit(): void { this.load(); }

  async load(): Promise<void> {
    this.loading = true;
    try { this.saved = await this.api.getSavedReports(); } catch { /* empty */ }
    this.loading = false;
  }

  scoreClass(s: number): string {
    if (s >= 70) return 'ro-badge-score--green';
    if (s >= 40) return 'ro-badge-score--amber';
    return 'ro-badge-score--red';
  }

  verdictClass(s: number): string {
    if (s >= 70) return 'ro-badge-verdict--green';
    if (s >= 40) return 'ro-badge-verdict--amber';
    return 'ro-badge-verdict--red';
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigate(['/red-otter']);
  }
}
