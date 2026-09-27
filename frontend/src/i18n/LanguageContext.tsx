import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './locales/en/common.json';
import hi from './locales/hi/common.json';
import ta from './locales/ta/common.json';

export type SupportedLocale = 'en' | 'hi' | 'ta';

export interface LanguageOption {
  code: SupportedLocale;
  label: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' }
];

const bundles: Record<SupportedLocale, any> = { en, hi, ta };

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (keyPath: string, optionsOrFallback?: Record<string, any> | string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key
});

const STORAGE_KEY = 'manak_locale';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'ta')) {
        return saved;
      }
    } catch (e) {
      console.warn('Unable to read locale from localStorage:', e);
    }
    return 'en';
  });

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch (e) {
      console.warn('Unable to save locale to localStorage:', e);
    }
  };

  const t = (keyPath: string, optionsOrFallback?: Record<string, any> | string): string => {
    let fallback: string | undefined;
    let options: Record<string, any> | undefined;

    if (typeof optionsOrFallback === 'string') {
      fallback = optionsOrFallback;
    } else if (typeof optionsOrFallback === 'object') {
      options = optionsOrFallback;
    }

    const keys = keyPath.split('.');
    let current: any = bundles[locale] || bundles['en'];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English bundle if key missing in selected locale
        let enCurrent: any = bundles['en'];
        for (const ek of keys) {
          if (enCurrent && typeof enCurrent === 'object' && ek in enCurrent) {
            enCurrent = enCurrent[ek];
          } else {
            enCurrent = null;
            break;
          }
        }
        if (typeof enCurrent === 'string') {
          current = enCurrent;
          break;
        }
        return fallback || keyPath;
      }
    }

    let result = typeof current === 'string' ? current : fallback || keyPath;

    if (options && typeof result === 'string') {
      Object.keys(options).forEach(key => {
        const value = options![key];
        result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
