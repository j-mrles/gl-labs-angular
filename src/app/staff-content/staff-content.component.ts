import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-staff-content',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="staff-subpage">
      <div class="staff-subpage__inner">
        <header class="staff-subpage__header">
          <a class="btn btn--secondary btn--small" routerLink="/staff-dashboard">← Back to Dashboard</a>
          <h1>Site Content</h1>
          <p>Manage and update public-facing site content.</p>
        </header>

        <section class="staff-subpage__section">
          <div class="coming-soon">
            <div class="coming-soon__icon">✎</div>
            <h2>Coming Soon</h2>
            <p>Site content management is being developed. This will allow you to update homepage text, service descriptions, product listings, and more — without touching code.</p>
            <ul class="coming-soon__list">
              <li>Homepage announcement banner</li>
              <li>Service descriptions</li>
              <li>Product listings</li>
              <li>Case study entries</li>
            </ul>
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
    .coming-soon { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 3rem 2rem; text-align: center; }
    .coming-soon__icon { font-size: 3rem; margin-bottom: 1rem; }
    .coming-soon h2 { margin: 0 0 0.75rem; font-size: 1.5rem; }
    .coming-soon p { margin: 0 0 1.5rem; opacity: 0.7; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto; }
    .coming-soon__list { list-style: none; padding: 0; margin: 0; display: inline-flex; flex-direction: column; gap: 0.5rem; text-align: left; }
    .coming-soon__list li { padding: 0.4rem 0.75rem; background: rgba(255,255,255,0.08); border-radius: 6px; font-size: 0.9rem; opacity: 0.8; }
    .coming-soon__list li::before { content: '— '; opacity: 0.5; }
    .btn { display: inline-block; padding: 0.6rem 1.4rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
    .btn--secondary { background: rgba(255,255,255,0.1); color: #fff; }
    .btn--small { padding: 0.4rem 0.9rem; font-size: 0.8rem; }
  `]
})
export class StaffContentComponent {}
