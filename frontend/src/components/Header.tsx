import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGE_OPTIONS, SupportedLocale } from '../i18n/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const Header: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = LANGUAGE_OPTIONS.find(opt => opt.code === locale) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="max-w-4xl mx-auto flex items-center justify-between pb-6 mb-4 border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-navy-900 text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs">
          M
        </div>
        <div>
          <span className="text-sm font-bold text-navy-900 tracking-tight font-mono">
            {t('app.title')}
          </span>
          <span className="text-xs text-slate-500 block">
            {t('app.subtitle')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Compact Native Language Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition-colors font-mono"
            aria-label={t('nav.language')}
          >
            <Globe className="w-3.5 h-3.5 text-navy-900" />
            <span className="font-semibold">{currentOption.nativeName}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {t('nav.language')}
              </div>
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLocale(opt.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-left transition-colors ${
                    locale === opt.code
                      ? 'bg-navy-50 text-navy-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.nativeName}</span>
                  {locale === opt.code && <Check className="w-3.5 h-3.5 text-navy-900" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:block text-xs font-mono text-slate-400 border-l border-slate-200 pl-4">
          {t('app.version')} • {t('app.corpus')}
        </div>
      </div>
    </header>
  );
};
