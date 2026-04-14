import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_FORM_ENDPOINT } from '../contact.config';

@Component({
  selector: 'app-staff-inquiries',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="staff-subpage">
      <div class="staff-subpage__inner">
        <header class="staff-subpage__header">
          <a class="btn btn--secondary btn--small" routerLink="/staff-dashboard">← Back to Dashboard</a>
          <h1>Contact Inquiries</h1>
          <p>Form submissions sent through the site contact form.</p>
        </header>

        <section class="staff-subpage__section">
          <div class="info-card">
            <div class="info-card__icon">✉</div>
            <div class="info-card__body">
              <h2>Submissions delivered via Formspree</h2>
              <p>All contact form submissions are forwarded directly to your email through Formspree. Log in to the Formspree dashboard to view submission history, manage notifications, and export data.</p>
              <p class="info-card__meta">Endpoint: <code>{{ endpoint }}</code></p>
              <a class="btn btn--primary" href="https://formspree.io/forms" target="_blank" rel="noopener noreferrer">Open Formspree Dashboard</a>
            </div>
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
    .info-card__meta { font-size: 0.85rem; }
    .info-card__meta code { background: rgba(255,255,255,0.1); padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.8rem; word-break: break-all; }
    .btn { display: inline-block; padding: 0.6rem 1.4rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
    .btn--primary { background: #fff; color: #000; margin-top: 0.5rem; }
    .btn--secondary { background: rgba(255,255,255,0.1); color: #fff; }
    .btn--small { padding: 0.4rem 0.9rem; font-size: 0.8rem; }
  `]
})
export class StaffInquiriesComponent {
  readonly endpoint = CONTACT_FORM_ENDPOINT;
}
