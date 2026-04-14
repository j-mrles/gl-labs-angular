import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staff-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="staff-subpage">
      <div class="staff-subpage__inner">
        <header class="staff-subpage__header">
          <a class="btn btn--secondary btn--small" routerLink="/staff-dashboard">← Back to Dashboard</a>
          <h1>Settings</h1>
          <p>Account information and configuration.</p>
        </header>

        <section class="staff-subpage__section">
          <div class="info-card">
            <div class="info-card__icon">⚙</div>
            <div class="info-card__body">
              <h2>Account</h2>
              <div class="info-row" *ngIf="username">
                <span class="info-row__label">Signed in as</span>
                <span class="info-row__value">{{ username }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">Role</span>
                <span class="info-row__value">Staff</span>
              </div>
            </div>
          </div>

          <div class="coming-soon" style="margin-top:1.5rem">
            <div class="coming-soon__icon">⚙</div>
            <h2>Advanced Settings — Coming Soon</h2>
            <p>Password management, notification preferences, and staff account controls are planned for a future update.</p>
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
    .info-card__body h2 { margin: 0 0 1rem; font-size: 1.2rem; }
    .info-row { display: flex; gap: 1rem; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .info-row:last-child { border-bottom: none; }
    .info-row__label { opacity: 0.5; font-size: 0.85rem; min-width: 110px; }
    .info-row__value { font-weight: 600; }
    .coming-soon { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 2rem; text-align: center; }
    .coming-soon__icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .coming-soon h2 { margin: 0 0 0.5rem; font-size: 1.1rem; }
    .coming-soon p { margin: 0; opacity: 0.7; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto; }
    .btn { display: inline-block; padding: 0.6rem 1.4rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
    .btn--secondary { background: rgba(255,255,255,0.1); color: #fff; }
    .btn--small { padding: 0.4rem 0.9rem; font-size: 0.8rem; }
  `]
})
export class StaffSettingsComponent {
  readonly username = typeof window !== 'undefined'
    ? sessionStorage.getItem('staff_username') ?? ''
    : '';
}
