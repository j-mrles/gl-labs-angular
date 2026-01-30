import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CONTACT_FORM_ENDPOINT } from '../contact.config';
import { LocaleService } from '../locale.service';
import { TranslatePipe } from '../translate.pipe';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(60px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFade', [
      transition(':enter', [
        query('.stagger-child', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(150, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ])
  ]
})
export class HomepageComponent implements OnInit, OnDestroy {
  private readonly locale = inject(LocaleService);
  bannerVisible = true;
  bgLoaded = false;
  readonly heroBackgroundUrl =
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2400&q=70';
  readonly heroBackgroundCss = `url('${this.heroBackgroundUrl}')`;
  contactName = '';
  contactEmail = '';
  contactMessage = '';
  // simple bot trap (should stay empty)
  contactWebsite = '';
  contactStatus = '';
  contactSending = false;

  get serviceSlides() {
    const t = (k: string) => this.locale.t(k);
    return [
      { title: t('home.slideWeb'), items: [t('home.slideWeb1'), t('home.slideWeb2'), t('home.slideWeb3')] },
      { title: t('home.slideMobile'), items: [t('home.slideMobile1'), t('home.slideMobile2'), t('home.slideMobile3')] },
      { title: t('home.slideAI'), items: [t('home.slideAI1'), t('home.slideAI2'), t('home.slideAI3')] },
    ];
  }
  activeServiceIndex = 0;
  private servicesTimer: number | null = null;

  ngOnInit(): void {
    // Preload the background image, but never block rendering on it.
    const img = new Image();
    img.src = this.heroBackgroundUrl;

    if (img.complete) {
      this.bgLoaded = true;
    } else {
      img.onload = () => (this.bgLoaded = true);
      img.onerror = () => (this.bgLoaded = true);
    }

    this.startServicesAutoplay();
  }

  ngOnDestroy(): void {
    this.stopServicesAutoplay();
  }

  dismissBanner() {
    this.bannerVisible = false;
  }

  private startServicesAutoplay(): void {
    this.stopServicesAutoplay();
    this.servicesTimer = window.setInterval(() => {
      this.activeServiceIndex = (this.activeServiceIndex + 1) % 3;
    }, 4000);
  }

  private stopServicesAutoplay(): void {
    if (this.servicesTimer != null) {
      window.clearInterval(this.servicesTimer);
      this.servicesTimer = null;
    }
  }

  pauseServices(): void {
    this.stopServicesAutoplay();
  }

  resumeServices(): void {
    this.startServicesAutoplay();
  }

  setActiveService(index: number): void {
    this.activeServiceIndex = index;
    this.startServicesAutoplay();
  }

  async submitContact(): Promise<void> {
    this.contactStatus = '';

    if (this.contactWebsite) {
      // silently ignore bot submissions
      return;
    }

    const name = this.contactName.trim();
    const email = this.contactEmail.trim();
    const message = this.contactMessage.trim();

    if (!name || !email || !message) {
      this.contactStatus = 'Please fill out all fields.';
      return;
    }

    if (!CONTACT_FORM_ENDPOINT || CONTACT_FORM_ENDPOINT.includes('YOUR_FORM_ID')) {
      this.contactStatus = 'Contact form is not configured yet.';
      return;
    }

    this.contactSending = true;
    try {
      const resp = await fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          message,
          page: typeof window !== 'undefined' ? window.location.href : ''
        })
      });

      if (!resp.ok) {
        this.contactStatus = 'Unable to send right now. Please try again.';
        return;
      }

      this.contactName = '';
      this.contactEmail = '';
      this.contactMessage = '';
      this.contactWebsite = '';
      this.contactStatus = 'Sent. Thank you!';
    } catch {
      this.contactStatus = 'Unable to send right now. Please try again.';
    } finally {
      this.contactSending = false;
    }
  }
}
