import { Injectable } from '@angular/core';
import { SHEETS_APPS_SCRIPT_URL } from './sheets-analytics.config';

@Injectable({ providedIn: 'root' })
export class AnalyticsTrackerService {
  private sessionId = this.generateSessionId();
  private visitTracked = false;

  private generateSessionId(): string {
    if (typeof window === 'undefined') return '';
    let id = sessionStorage.getItem('analytics_session_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('analytics_session_id', id);
    }
    return id;
  }

  private send(event: string, page?: string): void {
    if (typeof window === 'undefined') return;
    const body = JSON.stringify({
      event,
      page: page ?? window.location.pathname,
      sessionId: this.sessionId,
    });
    fetch(SHEETS_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    }).catch(() => {});
  }

  trackPageView(page?: string): void {
    this.send('page_view', page);
  }

  trackVisit(): void {
    if (this.visitTracked) return;
    this.visitTracked = true;
    this.send('visit');
  }

  trackContactSubmission(): void {
    this.send('contact_submit');
  }

  trackProductView(page?: string): void {
    this.send('product_view', page);
  }
}
