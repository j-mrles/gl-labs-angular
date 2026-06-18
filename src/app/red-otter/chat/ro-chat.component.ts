import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoAuthService } from '../ro-auth.service';
import { RoApiService, ChatMessage } from '../ro-api.service';

@Component({
  selector: 'app-ro-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ro-chat.component.html',
  styleUrls: ['../ro-dashboard.css']
})
export class RoChatComponent {
  private readonly api = inject(RoApiService);
  private readonly authService = inject(RoAuthService);
  private readonly router = inject(Router);

  user = this.api.getUserInfo();
  messages: ChatMessage[] = [];
  input = '';
  loading = false;

  get initials(): string {
    return (this.user.name || this.user.email).substring(0, 2).toUpperCase();
  }

  suggestions = [
    'What should I look for in a first home?',
    'How do I compare two properties?',
    'What red flags should I watch for?',
    'How does the Otis Score work?'
  ];

  async send(msg?: string): Promise<void> {
    const text = (msg ?? this.input).trim();
    if (!text) return;
    this.input = '';
    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.loading = true;

    try {
      const reply = await this.api.sendChat(null, text);
      this.messages.push({ role: 'assistant', content: reply, timestamp: new Date() });
    } catch {
      this.messages.push({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date() });
    }
    this.loading = false;
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigate(['/red-otter']);
  }
}
