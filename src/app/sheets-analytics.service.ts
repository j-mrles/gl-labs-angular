import { Injectable } from '@angular/core';
import { SHEETS_API_KEY, SHEETS_SPREADSHEET_ID, SHEETS_RANGE } from './sheets-analytics.config';

export interface AnalyticsData {
  pageViews30d: string;
  visitsWeek: string;
  contactSubmissions: string;
  productsViewed: string;
}

@Injectable({ providedIn: 'root' })
export class SheetsAnalyticsService {
  private cache: AnalyticsData | null = null;

  async fetch(): Promise<AnalyticsData> {
    if (this.cache) return this.cache;

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_SPREADSHEET_ID}/values/${encodeURIComponent(SHEETS_RANGE)}?key=${encodeURIComponent(SHEETS_API_KEY)}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch analytics');

    const data = await resp.json();
    const values: string[][] = data.values ?? [];

    if (values.length < 2) throw new Error('No data in sheet');

    const row = values[1];
    this.cache = {
      pageViews30d: row[0] ?? '—',
      visitsWeek: row[1] ?? '—',
      contactSubmissions: row[2] ?? '—',
      productsViewed: row[3] ?? '—',
    };

    return this.cache;
  }

  clearCache(): void {
    this.cache = null;
  }
}
