import React, { useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Upload, FileText, ArrowRight, Sparkles } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (text?: string, title?: string, file?: File) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze }) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Script-aware Language Detector
  const detectLanguage = (text: string): { code: string; name: string } | null => {
    if (!text.trim()) return null;

    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const hasTamil = /[\u0B80-\u0BFF]/.test(text);
    const hasLatin = /[a-zA-Z]/.test(text);

    if (hasDevanagari && !hasTamil && !hasLatin) return { code: 'hi', name: 'हिन्दी (Hindi)' };
    if (hasTamil && !hasDevanagari && !hasLatin) return { code: 'ta', name: 'தமிழ் (Tamil)' };
    if (hasLatin && !hasDevanagari && !hasTamil) return { code: 'en', name: 'English' };
    if ((hasDevanagari && hasLatin) || (hasTamil && hasLatin) || (hasDevanagari && hasTamil)) {
      return { code: 'mixed', name: 'Mixed Script' };
    }

    return { code: 'unknown', name: 'Standard Text' };
  };

  const detected = detectLanguage(inputText);

  const sampleQueries = [
    { labelKey: 'input.preset1', query: 'Procurement of 500 outdoor LED streetlight luminaires for municipal roads. They should be weather resistant (IP66), energy efficient and suitable for outdoor use with 10kV surge protection.' },
    { labelKey: 'input.preset2', query: 'Procurement of 150 ergonomic executive work chairs with metal base, lumbar support, and durability compliance.' },
    { labelKey: 'input.preset3', query: 'Procurement of 1,000 industrial safety helmets with shock absorption, chin strap tension testing, and penetration resistance.' },
    { labelKey: 'input.preset4', query: 'IS 10322' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onAnalyze(undefined, selectedFile.name, selectedFile);
    } else if (inputText.trim()) {
      onAnalyze(inputText.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          {t('input.title')}
        </h1>
        <p className="text-sm font-semibold text-slate-500 font-mono tracking-wide">
          {t('app.subtitle')}
        </p>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (selectedFile) setSelectedFile(null);
              }}
              placeholder={t('input.placeholder')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-all font-sans leading-relaxed"
            />

            {/* Detected Input Language Badge */}
            {detected && (
              <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-navy-50 border border-navy-200 text-navy-900 text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-2xs">
                <Sparkles className="w-3 h-3 text-navy-700" />
                <span>{t('input.detectedLanguage')}: {detected.name}</span>
              </div>
            )}
          </div>

          {/* Selected File Indicator */}
          {selectedFile && (
            <div className="flex items-center justify-between bg-navy-50 border border-navy-200 rounded-lg px-3.5 py-2.5 text-xs text-navy-900 font-mono">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-navy-700" />
                <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors border border-slate-200 font-mono"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t('input.dragDropText')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() && !selectedFile}
              className="bg-navy-900 hover:bg-navy-800 disabled:opacity-40 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-2xs shrink-0 font-mono"
            >
              <span>{t('input.analyzeButton')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Select Preset */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          {t('input.presetsTitle')}:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample.query);
                setSelectedFile(null);
                onAnalyze(sample.query, t(sample.labelKey));
              }}
              className="bg-white hover:bg-slate-50 hover:border-navy-900 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition-all shadow-2xs font-mono"
            >
              {t(sample.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
