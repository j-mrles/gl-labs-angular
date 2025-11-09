import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
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
  heroLoaded = false;
  private readonly heroBackgroundUrl = 'images/nightsky.png';

  ngOnInit(): void {
    const heroImage = new Image();
    heroImage.src = this.heroBackgroundUrl;

    if (heroImage.complete) {
      this.heroLoaded = true;
    } else {
      heroImage.onload = () => (this.heroLoaded = true);
      heroImage.onerror = () => (this.heroLoaded = true);
    }
  }

  dismissBanner() {
    this.bannerVisible = false;
  }
}
