import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  FIREBASE_FUNCTIONS_REGION,
  FIREBASE_PROJECT_ID,
  FIREBASE_WEB_API_KEY,
  STAFF_LOGIN_MODE,
  STAFF_USERNAME_EMAIL_DOMAIN
} from '../firebase-auth.config';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="auth" aria-label="Staff login">
      <section class="auth__panel" aria-label="Login panel">
        <div class="auth__brand">
          <div class="auth__kicker">StockBoss</div>
          <h1 class="auth__title">Login</h1>
          <p class="auth__subtitle">Sign in to your account.</p>
        </div>

        <form class="auth__form" autocomplete="on" (ngSubmit)="login()">
          <label class="field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              placeholder="admin"
              autocomplete="username"
              [(ngModel)]="username"
              required
            >
          </label>

          <label class="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              autocomplete="current-password"
              [(ngModel)]="password"
              required
            >
          </label>

          <div class="error" *ngIf="error">{{ error }}</div>

          <button class="btn btn--primary" type="submit" [disabled]="loading">
            {{ loading ? 'Signing in…' : 'Continue' }}
          </button>

          <a class="btn btn--secondary" routerLink="/" [class.is-disabled]="loading">Back to home</a>
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
    .error {
      text-align: left;
      font-size: 0.9rem;
      line-height: 1.35;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.35);
      border-radius: 12px;
      padding: 10px 12px;
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
    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }
    .is-disabled {
      pointer-events: none;
      opacity: 0.65;
    }
    .auth__fineprint { font-size: 0.85rem; color: rgba(255,255,255,0.6); text-align: center; }
    @media (prefers-reduced-motion: reduce) { .btn { transition: none; } .btn:hover { transform: none; } }
  `]
})
export class StaffLoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private readonly router: Router) {}

  private resolveEmailFromUsername(username: string): string {
    // Firebase Email/Password requires an email address; UI uses "username" only.
    // This keeps the experience username-based while staying compatible with Spark plan.
    return username.includes('@') ? username : `${username}@${STAFF_USERNAME_EMAIL_DOMAIN}`;
  }

  async login(): Promise<void> {
    this.error = '';

    if (!FIREBASE_WEB_API_KEY) {
      this.error = 'Missing Firebase configuration. Set FIREBASE_WEB_API_KEY in src/app/firebase-auth.config.ts.';
      return;
    }

    const username = this.username.trim();
    const password = this.password;

    if (!username || !password) return;

    this.loading = true;
    try {
      if (STAFF_LOGIN_MODE === 'customToken') {
        // Paid (Blaze) path: Cloud Function verifies username/password server-side.
        const functionUrl =
          `https://${FIREBASE_FUNCTIONS_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/staffLogin`;

        const loginResp = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const loginData = (await loginResp.json()) as any;
        if (!loginResp.ok || !loginData?.token) {
          this.error = 'Invalid credentials.';
          return;
        }

        const exchangeResp = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: String(loginData.token), returnSecureToken: true })
          }
        );

        const exchangeData = (await exchangeResp.json()) as any;
        if (!exchangeResp.ok || !exchangeData?.idToken) {
          this.error = 'Login failed. Please try again.';
          return;
        }

        sessionStorage.setItem('staff_id_token', String(exchangeData.idToken));
        sessionStorage.setItem('staff_uid', String(exchangeData.localId ?? ''));
        sessionStorage.setItem('staff_username', username);

        // eslint-disable-next-line no-console
        console.info('StockBoss: signed in.');
      } else {
        // Free (Spark) path: Firebase Auth email/password.
        // UI stays "Username", we map internally to an email.
        const email = this.resolveEmailFromUsername(username);

        const resp = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true })
          }
        );

        const data = (await resp.json()) as any;
        if (!resp.ok || !data?.idToken) {
          this.error = 'Invalid credentials.';
          return;
        }

        sessionStorage.setItem('staff_id_token', String(data.idToken));
        sessionStorage.setItem('staff_uid', String(data.localId ?? ''));
        sessionStorage.setItem('staff_username', username);

        // eslint-disable-next-line no-console
        console.info('StockBoss: signed in.');
      }

      // For now, just return home. (We can add /staff dashboard later.)
      await this.router.navigateByUrl('/');
    } catch {
      this.error = 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}

