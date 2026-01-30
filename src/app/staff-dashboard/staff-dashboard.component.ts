import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../locale.service';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent {
  private readonly locale = inject(LocaleService);

  get stats() {
    const t = (k: string) => this.locale.t(k);
    return [
      { label: t('dashboard.pageViews'), value: '—', trend: null },
      { label: t('dashboard.visitsWeek'), value: '—', trend: null },
      { label: t('dashboard.contactSubmissions'), value: '—', trend: null },
      { label: t('dashboard.productsViewed'), value: '—', trend: null }
    ];
  }

  get tools() {
    const t = (k: string) => this.locale.t(k);
    return [
      { label: t('dashboard.contactInquiries'), description: t('dashboard.contactInquiriesDesc'), route: '/staff-dashboard', icon: 'mail' },
      { label: t('dashboard.siteContent'), description: t('dashboard.siteContentDesc'), route: '/staff-dashboard', icon: 'edit' },
      { label: t('dashboard.analytics'), description: t('dashboard.analyticsDesc'), route: '/staff-dashboard', icon: 'chart' },
      { label: t('dashboard.settings'), description: t('dashboard.settingsDesc'), route: '/staff-dashboard', icon: 'settings' }
    ];
  }
}
