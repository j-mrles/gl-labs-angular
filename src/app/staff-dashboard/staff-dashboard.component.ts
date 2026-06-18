import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../locale.service';
import { TranslatePipe } from '../translate.pipe';
import { SheetsAnalyticsService } from '../sheets-analytics.service';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent implements OnInit {
  private readonly locale = inject(LocaleService);
  private readonly analytics = inject(SheetsAnalyticsService);

  statsData = {
    pageViews30d: '—',
    visitsWeek: '—',
    contactSubmissions: '—',
    productsViewed: '—',
  };
  statsError = '';

  ngOnInit(): void {
    this.analytics.clearCache();
    this.analytics.fetch().then(data => {
      this.statsData = data;
    }).catch(() => {
      this.statsError = 'Unable to load stats.';
    });
  }

  get stats() {
    const t = (k: string) => this.locale.t(k);
    return [
      { label: t('dashboard.pageViews'), value: this.statsData.pageViews30d, trend: null },
      { label: t('dashboard.visitsWeek'), value: this.statsData.visitsWeek, trend: null },
      { label: t('dashboard.contactSubmissions'), value: this.statsData.contactSubmissions, trend: null },
      { label: t('dashboard.productsViewed'), value: this.statsData.productsViewed, trend: null }
    ];
  }

  get tools() {
    const t = (k: string) => this.locale.t(k);
    return [
      { label: t('dashboard.contactInquiries'), description: t('dashboard.contactInquiriesDesc'), route: '/staff-dashboard/inquiries', icon: 'mail' },
      { label: t('dashboard.siteContent'), description: t('dashboard.siteContentDesc'), route: '/staff-dashboard/content', icon: 'edit' },
      { label: t('dashboard.analytics'), description: t('dashboard.analyticsDesc'), route: '/staff-dashboard/analytics', icon: 'chart' },
      { label: t('dashboard.settings'), description: t('dashboard.settingsDesc'), route: '/staff-dashboard/settings', icon: 'settings' }
    ];
  }
}
