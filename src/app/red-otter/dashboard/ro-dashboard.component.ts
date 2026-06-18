import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoAuthService } from '../ro-auth.service';
import { RoApiService, PropertyReport } from '../ro-api.service';

@Component({
  selector: 'app-ro-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ro-dashboard.component.html',
  styleUrls: ['../ro-dashboard.css']
})
export class RoDashboardComponent implements OnInit {
  private readonly api = inject(RoApiService);
  private readonly authService = inject(RoAuthService);
  private readonly router = inject(Router);

  user = { email: '', name: '', initials: '' };
  reports: PropertyReport[] = [];
  savedReports: PropertyReport[] = [];
  loading = true;

  analyzeUrl = '';
  analyzing = false;
  analyzeError = '';

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  get avgScore(): number {
    if (!this.reports.length) return 0;
    return Math.round(this.reports.reduce((s, r) => s + r.analysis.otisScore, 0) / this.reports.length);
  }

  get bestDeal(): PropertyReport | null {
    if (!this.reports.length) return null;
    return this.reports.reduce((best, r) => r.analysis.otisScore > best.analysis.otisScore ? r : best);
  }

  ngOnInit(): void {
    const info = this.api.getUserInfo();
    this.user.email = info.email;
    this.user.name = info.name;
    this.user.initials = (info.name || info.email).substring(0, 2).toUpperCase();
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      [this.reports, this.savedReports] = await Promise.all([
        this.api.getUserReports(),
        this.api.getSavedReports()
      ]);
    } catch { /* empty */ }
    this.loading = false;
  }

  async quickAnalyze(): Promise<void> {
    if (!this.analyzeUrl.trim()) return;
    this.analyzing = true;
    this.analyzeError = '';
    try {
      const report = await this.api.analyzeProperty(this.analyzeUrl);
      this.router.navigate(['/red-otter/report', report.id]);
    } catch {
      this.analyzeError = 'Failed to analyze. Please try again.';
    }
    this.analyzing = false;
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigate(['/red-otter']);
  }

  scoreClass(score: number): string {
    if (score >= 70) return 'ro-badge-score--green';
    if (score >= 40) return 'ro-badge-score--amber';
    return 'ro-badge-score--red';
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  }
}
