import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, CheckCircle, Database, Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface StandardDossierProps {
  standardNumber?: string;
  title?: string;
  score?: number;
  requirementText?: string;
  evidenceExcerpt?: string;
  onViewEvidence?: () => void;
}

export const StandardDossier: React.FC<StandardDossierProps> = ({
  standardNumber = 'IS 10322 (Part 5/Sec 3): 2012',
  title = 'Luminaires - Particular Requirements - Luminaires for Road and Street Lighting',
  score = 67.1,
  requirementText = 'Procurement of 500 outdoor LED streetlight luminaires for municipal roads...',
  evidenceExcerpt = '...requirements for luminaires for road and street lighting using electrical light sources on supply voltages not exceeding 1 000 V...',
  onViewEvidence
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'req' | 'std' | 'ev'>('std');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-xl mx-auto font-mono"
    >
      {/* Layered Document Stack Effect */}
      <div className="absolute inset-0 bg-navy-950/20 translate-y-3 translate-x-3 rounded-2xl border border-navy-900/30" />
      <div className="absolute inset-0 bg-slate-900/40 translate-y-1.5 translate-x-1.5 rounded-2xl border border-slate-800/40" />

      {/* Main Dossier Container */}
      <div className="relative bg-white border-2 border-navy-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Dossier Header Bar */}
        <div className="bg-navy-900 text-white px-5 py-3 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-200">
              MANAK STANDARDS DOSSIER
            </span>
          </div>
          <span className="text-[10px] text-slate-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
            REF. REV: 2026
          </span>
        </div>

        {/* 3-Stage Chapter Tab Navigation */}
        <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 text-xs text-center font-bold">
          <button
            onClick={() => setActiveTab('req')}
            className={`py-2.5 transition-colors border-r border-slate-200 ${
              activeTab === 'req'
                ? 'bg-white text-navy-900 border-b-2 border-b-navy-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            01. REQUIREMENT
          </button>
          <button
            onClick={() => setActiveTab('std')}
            className={`py-2.5 transition-colors border-r border-slate-200 ${
              activeTab === 'std'
                ? 'bg-white text-navy-900 border-b-2 border-b-navy-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            02. STANDARD
          </button>
          <button
            onClick={() => setActiveTab('ev')}
            className={`py-2.5 transition-colors ${
              activeTab === 'ev'
                ? 'bg-white text-navy-900 border-b-2 border-b-navy-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            03. EVIDENCE
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="p-6 space-y-4">
          {activeTab === 'req' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                EXTRACTED PROCUREMENT REQUIREMENT
              </span>
              <p className="text-sm font-sans font-medium text-slate-800 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                "{requirementText}"
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle className="w-4 h-4" />
                <span>Extracted product, environment, and protection parameters</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'std' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 bg-navy-50 px-2.5 py-1 rounded border border-navy-200">
                  {standardNumber}
                </span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {score} / 100
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-sans leading-snug">
                {title}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block">JURISDICTION:</span>
                  <strong className="text-slate-800">BIS (INDIA)</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block">STATUS:</span>
                  <strong className="text-emerald-700">ACTIVE STANDARD</strong>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ev' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SOURCE EVIDENCE EXCERPT
              </span>
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed">
                {evidenceExcerpt}
              </div>
              {onViewEvidence && (
                <button
                  onClick={onViewEvidence}
                  className="w-full py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>INSPECT SOURCE EVIDENCE DRAWER</span>
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer Technical Rule */}
        <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>BIS CORPUS INDEX: #10322</span>
          <span className="text-navy-900 font-bold">VERIFIED PROCURABLE</span>
        </div>
      </div>
    </motion.div>
  );
};
