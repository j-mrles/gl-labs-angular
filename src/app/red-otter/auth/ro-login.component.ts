import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoAuthService } from '../ro-auth.service';

@Component({
  selector: 'app-ro-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ro-login.component.html',
  styleUrls: ['./ro-auth.css']
})
export class RoLoginComponent {
  private readonly auth = inject(RoAuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  error = '';
  success = false;
  loading = false;

  async handleSubmit(): Promise<void> {
    this.error = '';
    this.loading = true;

    try {
      await this.auth.login(this.email, this.password);
      this.success = true;
      setTimeout(() => this.router.navigate(['/red-otter/dashboard']), 1200);
    } catch {
      this.error = 'Invalid email or password';
    }
    this.loading = false;
  }
}
