import { Injectable } from '@angular/core';
import { FIREBASE_WEB_API_KEY } from '../firebase-auth.config';

export interface RoUser {
  uid: string;
  email: string;
  displayName: string;
  idToken: string;
}

@Injectable({ providedIn: 'root' })
export class RoAuthService {

  private readonly STORAGE_KEY = 'ro_user';

  get currentUser(): RoUser | null {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  private saveUser(user: RoUser): void {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  async login(email: string, password: string): Promise<RoUser> {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );

    const data = await resp.json();
    if (!resp.ok || !data?.idToken) {
      throw new Error(data?.error?.message || 'Invalid email or password');
    }

    const user: RoUser = {
      uid: data.localId,
      email: data.email,
      displayName: data.displayName || '',
      idToken: data.idToken
    };
    this.saveUser(user);
    return user;
  }

  async signup(email: string, password: string, name: string): Promise<RoUser> {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName: name, returnSecureToken: true })
      }
    );

    const data = await resp.json();
    if (!resp.ok || !data?.idToken) {
      const msg = data?.error?.message || 'Signup failed';
      throw new Error(msg.includes('EMAIL_EXISTS') ? 'An account with this email already exists' : msg);
    }

    // Update display name
    if (name) {
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: data.idToken, displayName: name, returnSecureToken: false })
        }
      );
    }

    const user: RoUser = {
      uid: data.localId,
      email: data.email,
      displayName: name,
      idToken: data.idToken
    };
    this.saveUser(user);
    return user;
  }

  async updateProfile(name: string): Promise<void> {
    const user = this.currentUser;
    if (!user) throw new Error('Not logged in');

    await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: user.idToken, displayName: name, returnSecureToken: false })
      }
    );

    user.displayName = name;
    this.saveUser(user);
  }

  async changePassword(newPassword: string): Promise<void> {
    const user = this.currentUser;
    if (!user) throw new Error('Not logged in');

    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: user.idToken, password: newPassword, returnSecureToken: true })
      }
    );

    const data = await resp.json();
    if (!resp.ok) throw new Error('Failed to change password');

    user.idToken = data.idToken;
    this.saveUser(user);
  }

  signOut(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}
