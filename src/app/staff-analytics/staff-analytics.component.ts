import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-staff-analytics',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="staff-subpage">
      <div class="staff-subpage__inner">
        <header class="staff-subpage__header">
          <a class="btn btn--secondary btn--small" routerLink="/staff-dashboard">← Back to Dashboard</a>
          <h1>Analytics</h1>
          <p>Track site traffic, user behavior, and conversion metrics.</p>
        </header>

        <section class="staff-subpage__section">
          <div class="info-card">
            <div class="info-card__icon">▣</div>
            <div class="info-card__body">
              <h2>Analytics via Firebase</h2>
              <p>Site analytics are currently tracked through Firebase. View real-time traffic, session data, and user flows in the Firebase console.</p>
              <a class="btn btn--primary" href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">Open Firebase Console</a>
            </div>
          </div>

          <div class="coming-soon" style="margin-top:1.5rem">
            <div class="coming-soon__icon">📊</div>
            <h2>Embedded Dashboard — Coming Soon</h2>
            <p>An in-app analytics view is planned — page views, weekly visits, contact submissions, and product engagement, all without leaving this dashboard.</p>
          </div>
        </section>

        <div class="staff-subpage__footer">
          <a class="btn btn--secondary" routerLink="/staff-dashboard">← Back to Dashboard</a>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .staff-subpage { padding: 2rem 1rem; min-height: 100vh; background: #0a0a0a; color: #fff; }
    .staff-subpage__inner { max-width: 760px; margin: 0 auto; }
    .staff-subpage__header { margin-bottom: 2rem; }
    .staff-subpage__header h1 { margin: 0.75rem 0 0.25rem; font-size: 2rem; }
    .staff-subpage__header p { margin: 0; opacity: 0.6; }
    .staff-subpage__section { margin-bottom: 2rem; }
    .staff-subpage__footer { padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
    .info-card { display: flex; gap: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 2rem; }
    .info-card__icon { font-size: 2.5rem; flex-shrink: 0; }
    .info-card__body h2 { margin: 0 0 0.75rem; font-size: 1.2rem; }
    .info-card__body p { margin: 0 0 0.75rem; opacity: 0.75; line-height: 1.6; }
    .coming-soon { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 2rem; text-align: center; }
    .coming-soon__icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .coming-soon h2 { margin: 0 0 0.5rem; font-size: 1.1rem; }
    .coming-soon p { margin: 0; opacity: 0.7; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto; }
    .btn { display: inline-block; padding: 0.6rem 1.4rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
    .btn--primary { background: #fff; color: #000; margin-top: 0.5rem; }
    .btn--secondary { background: rgba(255,255,255,0.1); color: #fff; }
    .btn--small { padding: 0.4rem 0.9rem; font-size: 0.8rem; }
  `]
})
export class StaffAnalyticsComponent {}
