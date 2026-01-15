import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="auth" aria-label="Staff login">
      <section class="auth__panel" aria-label="Login panel">
        <div class="auth__brand">
          <div class="auth__kicker">GalaxyLabs</div>
          <h1 class="auth__title">Staff Login</h1>
          <p class="auth__subtitle">Access internal tools and dashboards.</p>
        </div>

        <!-- UI-only (no auth wired yet) -->
        <form class="auth__form" autocomplete="on">
          <label class="field">
            <span>Email</span>
            <input type="email" name="email" placeholder="name@galaxylabsusa.com" autocomplete="email">
          </label>

          <label class="field">
            <span>Password</span>
            <input type="password" name="password" placeholder="••••••••" autocomplete="current-password">
          </label>

          <button class="btn btn--primary" type="button">Continue</button>
          <a class="btn btn--secondary" routerLink="/">Back to home</a>
        </form>

        <div class="auth__fineprint">
          By continuing, you agree to use this system responsibly.
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; background: #000; color: #fff; min-height: calc(100svh - 0px); }
    .auth {
      min-height: calc(100svh - 56px);
      padding: calc(56px + 32px) 16px 48px;
      display: grid;
      place-items: center;
      background:
        radial-gradient(1200px 600px at 50% 0%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 60%),
        linear-gradient(180deg, #000 0%, #050b18 35%, #000 100%);
    }
    .auth__panel {
      width: min(440px, 100%);
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(12px);
      padding: 22px 18px;
      display: grid;
      gap: 16px;
    }
    .auth__kicker {
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.7);
    }
    .auth__title {
      margin: 6px 0 0;
      font-size: 2rem;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .auth__subtitle {
      margin: 8px 0 0;
      color: rgba(255,255,255,0.78);
      line-height: 1.4;
    }
    .auth__form {
      display: grid;
      gap: 12px;
      margin-top: 6px;
    }
    .field { display: grid; gap: 6px; text-align: left; }
    .field span { font-size: 0.9rem; color: rgba(255,255,255,0.82); }
    .field input {
      width: 100%;
      padding: 12px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(255,255,255,0.06);
      color: #fff;
      outline: none;
    }
    .field input:focus {
      border-color: rgba(255,255,255,0.32);
      background: rgba(255,255,255,0.08);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.85rem 1.25rem;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 650;
      letter-spacing: 0.01em;
      border: 1px solid transparent;
      cursor: pointer;
      user-select: none;
      transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease, color 160ms ease;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn--primary { background: #fff; color: #111; }
    .btn--secondary { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.22); }
    .btn--secondary:hover { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.3); }
    .auth__fineprint { font-size: 0.85rem; color: rgba(255,255,255,0.6); text-align: center; }
    @media (prefers-reduced-motion: reduce) { .btn { transition: none; } .btn:hover { transform: none; } }
  `]
})
export class StaffLoginComponent {}

