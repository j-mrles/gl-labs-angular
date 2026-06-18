import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoAuthService } from '../ro-auth.service';
import { RoApiService } from '../ro-api.service';

@Component({
  selector: 'app-ro-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ro-settings.component.html',
  styleUrls: ['../ro-dashboard.css']
})
export class RoSettingsComponent {
  private readonly api = inject(RoApiService);
  private readonly authService = inject(RoAuthService);
  private readonly router = inject(Router);

  user = this.api.getUserInfo();

  // Profile
  profileName = this.user.name;
  profileSaving = false;
  profileStatus = '';

  // Password
  currentPassword = '';
  newPassword = '';
  passwordSaving = false;
  passwordStatus = '';
  passwordError = '';

  // Notifications
  emailReportReady = true;
  emailWeeklyDigest = true;
  emailPriceAlerts = false;

  get initials(): string {
    return (this.user.name || this.user.email).substring(0, 2).toUpperCase();
  }

  async saveProfile(): Promise<void> {
    this.profileSaving = true;
    this.profileStatus = '';
    try {
      await this.authService.updateProfile(this.profileName);
      this.profileStatus = 'Profile updated.';
    } catch {
      this.profileStatus = 'Failed to update profile.';
    }
    this.profileSaving = false;
  }

  async changePassword(): Promise<void> {
    this.passwordSaving = true;
    this.passwordError = '';
    this.passwordStatus = '';
    try {
      await this.authService.changePassword(this.newPassword);
      this.passwordStatus = 'Password changed.';
      this.currentPassword = '';
      this.newPassword = '';
    } catch {
      this.passwordError = 'Failed to change password. Check your current password.';
    }
    this.passwordSaving = false;
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigate(['/red-otter']);
  }
}
