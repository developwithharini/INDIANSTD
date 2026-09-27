import React, { useState } from 'react';
import { RecommendationItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Scale, CheckCircle2, Shield, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompareModalProps {
  items?: RecommendationItem[];
  itemA?: RecommendationItem | null;
  itemB?: RecommendationItem | null;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ items, itemA, itemB, onClose }) => {
  const { t } = useLanguage();
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  const stdA = itemA || items?.[0];
  const stdB = itemB || items?.[1];

  if (!stdA || !stdB) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-5xl w-full border-2 border-navy-900 shadow-2xl overflow-hidden space-y-0"
      >
        {/* Header Bar */}
        <div className="bg-navy-900 text-white p-5 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold tracking-wider uppercase font-mono">{t('compare.title')}</h2>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <span>HIGHLIGHT DIFFERENCES</span>
            </label>

            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-base px-2">
              ✕
            </button>
          </div>
        </div>

        {/* Side-by-Side Standard Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          {/* Standard A */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-navy-900 bg-navy-50 border border-navy-200 px-2.5 py-1 rounded">
                {stdA.standard_number}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 font-sans leading-snug">{stdA.title}</h3>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500">{t('results.applicabilityScore')}:</span>
              <strong className="text-lg font-extrabold text-navy-900">{stdA.applicability_score} / 100</strong>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('compare.scope')}:</span>
              <p className={`text-xs text-slate-700 p-3 rounded-lg border font-sans leading-relaxed ${
                highlightDifferences ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
                {stdA.scope_preview || 'Official BIS scope specifications recorded in corpus index.'}
              </p>
            </div>
          </div>

          {/* Standard B */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-navy-900 bg-navy-50 border border-navy-200 px-2.5 py-1 rounded">
                {stdB.standard_number}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 font-sans leading-snug">{stdB.title}</h3>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500">{t('results.applicabilityScore')}:</span>
              <strong className="text-lg font-extrabold text-navy-900">{stdB.applicability_score} / 100</strong>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('compare.scope')}:</span>
              <p className={`text-xs text-slate-700 p-3 rounded-lg border font-sans leading-relaxed ${
                highlightDifferences ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
                {stdB.scope_preview || 'Official BIS scope specifications recorded in corpus index.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400">MANAK COMPARATIVE INSPECTION MODE</span>
          <button
            onClick={onClose}
            className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-5 py-2 rounded-lg transition-colors"
          >
            {t('compare.close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
