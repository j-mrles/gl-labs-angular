import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsTrackerService } from '../analytics-tracker.service';

@Component({
  selector: 'app-red-otter',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './red-otter.component.html',
  styleUrls: ['./red-otter.component.css']
})
export class RedOtterComponent implements OnInit {
  private readonly tracker = inject(AnalyticsTrackerService);

  ngOnInit(): void {
    this.tracker.trackProductView('/red-otter');
  }

  scoreBadges = [
    { score: 87, label: 'Strong Buy', color: '#15803D' },
    { score: 52, label: 'Caution', color: '#B45309' },
    { score: 23, label: 'High Risk', color: '#DC2626' }
  ];

  highlights = [
    {
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&fit=crop',
      title: 'Instant Otis Score',
      subtitle: 'Know in seconds if a listing is worth your time.',
      description: 'Every listing gets a 0–100 score based on price, condition, location, and market trends. No more guessing — just data-backed confidence.',
      badge: { score: 92, label: 'Strong Buy' },
      reverse: false
    },
    {
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&fit=crop',
      title: 'True Cost Calculator',
      subtitle: 'The real monthly number, not the fantasy one.',
      description: 'Beyond the sticker price: mortgage, taxes, insurance, HOA, maintenance, and commute costs rolled into one honest monthly number.',
      badge: { score: 78, label: 'Strong Buy' },
      reverse: true
    },
    {
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fit=crop',
      title: 'Red Flag Detection',
      subtitle: 'Spot what the listing photos don\'t show you.',
      description: 'Otis scans listing history, price drops, days on market, and disclosure patterns to surface the warning signs agents hope you miss.',
      badge: { score: 41, label: 'Caution' },
      reverse: false
    }
  ];

  moreFeatures = [
    { icon: '💬', title: 'Chat with Otis', description: 'Ask anything about a listing in plain English. Otis answers with data, not opinions.' },
    { icon: '📊', title: 'Save & Compare', description: 'Pin favorites and view them side-by-side across every metric that matters.' },
    { icon: '🤝', title: 'Negotiation Tips', description: 'Data-backed talking points to negotiate a better deal every time.' }
  ];

  pricingFeatures = [
    'Otis Score on every listing',
    'True Cost Calculator',
    'Red Flag Detection',
    'Unlimited chat with Otis',
    'Save & Compare up to 50 listings',
    'Negotiation Tips',
    'Email summaries',
    'Cancel anytime'
  ];

  getBadgeColor(score: number): string {
    if (score >= 70) return '#15803D';
    if (score >= 40) return '#B45309';
    return '#DC2626';
  }

  currentYear = new Date().getFullYear();

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
