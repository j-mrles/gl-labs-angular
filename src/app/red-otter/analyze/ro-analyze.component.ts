import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoAuthService } from '../ro-auth.service';
import { RoApiService } from '../ro-api.service';

@Component({
  selector: 'app-ro-analyze',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ro-analyze.component.html',
  styleUrls: ['../ro-dashboard.css']
})
export class RoAnalyzeComponent {
  private readonly api = inject(RoApiService);
  private readonly authService = inject(RoAuthService);
  private readonly router = inject(Router);

  user = this.api.getUserInfo();
  url = '';
  loading = false;
  error = '';

  get initials(): string {
    return (this.user.name || this.user.email).substring(0, 2).toUpperCase();
  }

  async analyze(): Promise<void> {
    if (!this.url.trim()) return;
    this.loading = true;
    this.error = '';
    try {
      const report = await this.api.analyzeProperty(this.url);
      this.router.navigate(['/red-otter/report', report.id]);
    } catch {
      this.error = 'Failed to analyze this listing. Please check the URL and try again.';
    }
    this.loading = false;
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigate(['/red-otter']);
  }
}
