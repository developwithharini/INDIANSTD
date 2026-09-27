import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, FileText, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { StandardDossier } from './StandardDossier';

interface CinematicHeroProps {
  onAnalyze: (text: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  onAnalyze,
  onFileUpload,
  isLoading
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');

  const presets = [
    { key: 'preset1', label: t('hero.preset1') },
    { key: 'preset2', label: t('hero.preset2') },
    { key: 'preset3', label: t('hero.preset3') },
    { key: 'preset4', label: t('hero.preset4') }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onAnalyze(inputText.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-dot-grid">
      {/* Background Subtle Gradient Blobs (Restrained Navy/Ivory) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-navy-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Hero Copy & Main Interactive Input */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs font-mono text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-navy-900" />
            <span className="font-bold uppercase tracking-wider">{t('hero.subtitle')}</span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-sans">
            {t('hero.title')}{' '}
            <span className="text-navy-900 underline decoration-amber-500/80 decoration-4 underline-offset-4">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          <p className="text-lg text-slate-600 font-sans max-w-xl leading-relaxed">
            {t('hero.description')}
          </p>

          {/* Primary Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="relative flex items-center bg-white border-2 border-navy-900 rounded-2xl shadow-lg focus-within:ring-4 focus-within:ring-navy-900/20 transition-all p-2">
              <Search className="w-6 h-6 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('hero.inputPlaceholder')}
                disabled={isLoading}
                className="w-full px-4 py-3 text-base text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none font-sans"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-navy-900 hover:bg-navy-950 disabled:bg-slate-300 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all flex items-center gap-2 shrink-0 font-mono shadow-md"
              >
                <span>{isLoading ? t('common.analyzing') : t('hero.analyzeButton')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Presets & File Upload Secondary Actions */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="font-bold uppercase tracking-wider">{t('hero.presetsLabel')}:</span>
              <label className="cursor-pointer text-navy-900 hover:text-navy-950 font-bold flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{t('hero.uploadDoc')} (PDF/DOCX)</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => {
                    setInputText(preset.label);
                    onAnalyze(preset.label);
                  }}
                  disabled={isLoading}
                  className="text-xs font-mono bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Standard Dossier Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5"
        >
          <StandardDossier />
        </motion.div>
      </div>
    </div>
  );
};
