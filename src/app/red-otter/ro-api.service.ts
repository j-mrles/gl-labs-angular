import { Injectable, inject } from '@angular/core';
import { RoAuthService } from './ro-auth.service';

export interface ReportAnalysis {
  otisScore: number;
  verdict: 'Strong Buy' | 'Proceed With Caution' | 'High Risk';
  valueSummary: string;
  valueVerdict: 'Underpriced' | 'Fair' | 'Overpriced';
  neighborhoodGrade: string;
  neighborhoodNotes: string;
  monthlyCost: {
    mortgage: number;
    propertyTax: number;
    insurance: number;
    hoa: number;
    maintenance: number;
  };
  redFlags: string[];
  negotiationTips: string[];
  otisTake: string;
}

export interface PropertyReport {
  id: string;
  userId: string;
  url: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  analysis: ReportAnalysis;
  createdAt: Date;
  saved: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class RoApiService {
  private readonly auth = inject(RoAuthService);

  // In-memory store (replace with Firestore/backend later)
  private reports: PropertyReport[] = [];
  private chats: Map<string, ChatMessage[]> = new Map();

  getUserInfo() {
    const user = this.auth.currentUser;
    return {
      uid: user?.uid ?? '',
      email: user?.email ?? '',
      name: user?.displayName ?? ''
    };
  }

  // ─── Reports ────────────────────────────────────────────────
  async analyzeProperty(url: string): Promise<PropertyReport> {
    const report: PropertyReport = {
      id: this.genId(),
      userId: this.auth.currentUser?.uid ?? '',
      url,
      address: this.extractAddress(url),
      price: this.mockPrice(),
      beds: Math.floor(Math.random() * 4) + 2,
      baths: Math.floor(Math.random() * 3) + 1,
      sqft: Math.floor(Math.random() * 2000) + 1200,
      analysis: this.generateMockAnalysis(),
      createdAt: new Date(),
      saved: false
    };
    this.reports.unshift(report);
    return report;
  }

  async getReport(id: string): Promise<PropertyReport | null> {
    return this.reports.find(r => r.id === id) ?? null;
  }

  async getUserReports(): Promise<PropertyReport[]> {
    return [...this.reports];
  }

  async toggleSave(reportId: string, saved: boolean): Promise<void> {
    const r = this.reports.find(rpt => rpt.id === reportId);
    if (r) r.saved = saved;
  }

  async getSavedReports(): Promise<PropertyReport[]> {
    return this.reports.filter(r => r.saved);
  }

  // ─── Chat ───────────────────────────────────────────────────
  async sendChat(_reportId: string | null, _message: string): Promise<string> {
    const responses = [
      'Based on the market data, this property appears to be fairly priced for the neighborhood. The recent comparable sales support the listing price within a 5% margin.',
      'I\'d recommend negotiating on the closing costs rather than the asking price. Sellers in this market are more willing to cover closing costs than reduce the price.',
      'The property tax history shows a steady increase of about 3% per year. Factor that into your long-term budget planning.',
      'Looking at the neighborhood trends, this area has seen 8% appreciation over the last 2 years. It\'s a solid investment from a growth perspective.',
      'One thing to watch: the HOA has a special assessment pending. I\'d ask the seller\'s agent for details on the reserve fund before making an offer.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async getChatHistory(reportId: string): Promise<ChatMessage[]> {
    return this.chats.get(reportId) ?? [];
  }

  async saveChatMessage(reportId: string | null, role: 'user' | 'assistant', content: string): Promise<void> {
    const key = reportId ?? 'portfolio';
    if (!this.chats.has(key)) this.chats.set(key, []);
    this.chats.get(key)!.push({ role, content, timestamp: new Date() });
  }

  // ─── Helpers ────────────────────────────────────────────────
  private genId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private extractAddress(url: string): string {
    try {
      const path = new URL(url).pathname;
      const parts = path.split('/').filter(Boolean);
      const addr = parts.find(p => p.includes('-')) ?? parts[parts.length - 1] ?? 'Unknown';
      return addr.replace(/-/g, ' ').replace(/_/g, ' ')
        .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } catch {
      return 'Property Analysis';
    }
  }

  private mockPrice(): number {
    return Math.floor(Math.random() * 500000) + 200000;
  }

  private generateMockAnalysis(): ReportAnalysis {
    const score = Math.floor(Math.random() * 60) + 30;
    return {
      otisScore: score,
      verdict: score >= 70 ? 'Strong Buy' : score >= 40 ? 'Proceed With Caution' : 'High Risk',
      valueSummary: 'Based on comparable sales and market conditions, this property presents a reasonable value proposition for the area.',
      valueVerdict: score >= 70 ? 'Underpriced' : score >= 40 ? 'Fair' : 'Overpriced',
      neighborhoodGrade: score >= 70 ? 'A' : score >= 50 ? 'B+' : 'B-',
      neighborhoodNotes: 'Growing area with good schools and amenities within walking distance.',
      monthlyCost: {
        mortgage: Math.floor(Math.random() * 1500) + 1200,
        propertyTax: Math.floor(Math.random() * 400) + 200,
        insurance: Math.floor(Math.random() * 200) + 100,
        hoa: Math.floor(Math.random() * 300),
        maintenance: Math.floor(Math.random() * 200) + 100
      },
      redFlags: score < 60
        ? ['Days on market exceeds area average', 'Price reduced twice in 30 days']
        : [],
      negotiationTips: [
        'Request a home warranty as part of the deal',
        'Ask for seller credits toward closing costs',
        'Negotiate based on comparable sales data'
      ],
      otisTake: 'This property offers solid fundamentals with room for appreciation. The neighborhood is trending upward and the asking price aligns with recent comparables.'
    };
  }
}
