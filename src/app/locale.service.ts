import { Injectable, signal, computed } from '@angular/core';
import { TRANSLATIONS, Lang } from './translations';

const STORAGE_KEY = 'galaxylabs_lang';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly currentLangSignal = signal<Lang>(this.loadStoredLang());

  readonly currentLang = this.currentLangSignal.asReadonly();

  private loadStoredLang(): Lang {
    if (typeof window === 'undefined') return 'en';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'es') return stored;
    } catch {
      // ignore
    }
    return 'en';
  }

  setLang(lang: Lang): void {
    this.currentLangSignal.set(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }

  t(key: string): string {
    const lang = this.currentLangSignal();
    const map = TRANSLATIONS[lang];
    return map?.[key] ?? TRANSLATIONS.en?.[key] ?? key;
  }
}
