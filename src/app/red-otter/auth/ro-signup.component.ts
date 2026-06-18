import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoAuthService } from '../ro-auth.service';

@Component({
  selector: 'app-ro-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ro-signup.component.html',
  styleUrls: ['./ro-auth.css']
})
export class RoSignupComponent {
  private readonly auth = inject(RoAuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  async handleSubmit(): Promise<void> {
    this.error = '';
    this.loading = true;

    try {
      await this.auth.signup(this.email, this.password, this.name);
      this.router.navigate(['/red-otter/dashboard']);
    } catch (e: any) {
      this.error = e?.message || 'Failed to create account';
    }
    this.loading = false;
  }
}
