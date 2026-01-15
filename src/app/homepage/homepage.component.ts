import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink],
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
export class HomepageComponent implements OnInit {
  bannerVisible = true;
  bgLoaded = false;
  readonly heroBackgroundUrl =
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2400&q=70';
  readonly heroBackgroundCss = `url('${this.heroBackgroundUrl}')`;

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
  }

  dismissBanner() {
    this.bannerVisible = false;
  }
}
