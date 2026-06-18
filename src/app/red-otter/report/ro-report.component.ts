import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoAuthService } from '../ro-auth.service';
import { RoApiService, PropertyReport, ChatMessage } from '../ro-api.service';

@Component({
  selector: 'app-ro-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ro-report.component.html',
  styleUrls: ['../ro-dashboard.css']
})
export class RoReportComponent implements OnInit {
  private readonly api = inject(RoApiService);
  private readonly authService = inject(RoAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  user = this.api.getUserInfo();
  report: PropertyReport | null = null;
  loading = true;

  chatMessages: ChatMessage[] = [];
  chatInput = '';
  chatLoading = false;

  get initials(): string {
    return (this.user.name || this.user.email).substring(0, 2).toUpperCase();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadReport(id);
  }

  async loadReport(id: string): Promise<void> {
    this.loading = true;
    try {
      this.report = await this.api.getReport(id);
      if (this.report) {
        this.chatMessages = await this.api.getChatHistory(id);
      }
    } catch { /* empty */ }
    this.loading = false;
  }

  async toggleSave(): Promise<void> {
    if (!this.report) return;
    const newState = !this.report.saved;
    await this.api.toggleSave(this.report.id, newState);
    this.report.saved = newState;
  }

  async sendChat(): Promise<void> {
    if (!this.chatInput.trim() || !this.report) return;
    const msg = this.chatInput.trim();
    this.chatInput = '';
    this.chatMessages.push({ role: 'user', content: msg, timestamp: new Date() });
    this.chatLoading = true;

    try {
      await this.api.saveChatMessage(this.report.id, 'user', msg);
      const reply = await this.api.sendChat(this.report.id, msg);
      this.chatMessages.push({ role: 'assistant', content: reply, timestamp: new Date() });
      await this.api.saveChatMessage(this.report.id, 'assistant', reply);
    } catch {
      this.chatMessages.push({ role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.', timestamp: new Date() });
    }
    this.chatLoading = false;
  }

  scoreClass(score: number): string {
    if (score >= 70) return 'ro-badge-score--green';
    if (score >= 40) return 'ro-badge-score--amber';
    return 'ro-badge-score--red';
  }

  verdictClass(score: number): string {
    if (score >= 70) return 'ro-badge-verdict--green';
    if (score >= 40) return 'ro-badge-verdict--amber';
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
