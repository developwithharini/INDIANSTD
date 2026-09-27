import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { StandardsCorpusCanvas } from './StandardsCorpusCanvas';
import { EvidenceLens } from './EvidenceLens';

export const ScrollStory: React.FC = () => {
  const { t } = useLanguage();
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    {
      num: t('chapters.c1Num'),
      name: t('chapters.c1Name'),
      desc: t('chapters.c1Desc'),
      icon: FileText
    },
    {
      num: t('chapters.c2Num'),
      name: t('chapters.c2Name'),
      desc: t('chapters.c2Desc'),
      icon: Layers
    },
    {
      num: t('chapters.c3Num'),
      name: t('chapters.c3Name'),
      desc: t('chapters.c3Desc'),
      icon: Search
    },
    {
      num: t('chapters.c4Num'),
      name: t('chapters.c4Name'),
      desc: t('chapters.c4Desc'),
      icon: BarChart3
    },
    {
      num: t('chapters.c5Num'),
      name: t('chapters.c5Name'),
      desc: t('chapters.c5Desc'),
      icon: Database
    },
    {
      num: t('chapters.c6Num'),
      name: t('chapters.c6Name'),
      desc: t('chapters.c6Desc'),
      icon: ShieldCheck
    },
    {
      num: t('chapters.c7Num'),
      name: t('chapters.c7Name'),
      desc: t('chapters.c7Desc'),
      icon: CheckCircle2
    }
  ];

  return (
    <section className="py-20 bg-slate-900 text-white overflow-hidden relative font-mono">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 bg-micro-grid opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded border border-amber-800">
            FROM REQUIREMENT TO VERIFIED STANDARD
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            The MANAK Procurement Intelligence Lifecycle
          </h2>
        </div>

        {/* Chapter Stepper Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar justify-start md:justify-center border-b border-slate-800">
          {chapters.map((ch, idx) => {
            const Icon = ch.icon;
            const isActive = activeChapter === idx;
            return (
              <button
                key={ch.num}
                onClick={() => setActiveChapter(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-xs shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg scale-105'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] opacity-75">{ch.num}</span>
                <Icon className="w-3.5 h-3.5" />
                <span>{ch.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Chapter Visual Stage */}
        <motion.div
          key={activeChapter}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 shadow-2xl relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Chapter Details */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                <span>CHAPTER {chapters[activeChapter].num}</span>
                <span>•</span>
                <span>STAGE {activeChapter + 1} OF 7</span>
              </div>
              <h3 className="text-2xl font-bold font-sans text-white">
                {chapters[activeChapter].name}
              </h3>
              <p className="text-sm font-sans text-slate-400 leading-relaxed">
                {chapters[activeChapter].desc}
              </p>

              <div className="pt-4 flex items-center gap-3 text-xs text-slate-300">
                <button
                  onClick={() => setActiveChapter((prev) => Math.max(0, prev - 1))}
                  disabled={activeChapter === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-40 hover:bg-slate-800"
                >
                  ← PREVIOUS STAGE
                </button>
                <button
                  onClick={() => setActiveChapter((prev) => Math.min(chapters.length - 1, prev + 1))}
                  disabled={activeChapter === chapters.length - 1}
                  className="px-3 py-1.5 rounded-lg border border-amber-500 bg-amber-500 text-slate-950 font-bold disabled:opacity-40 hover:bg-amber-400"
                >
                  NEXT STAGE →
                </button>
              </div>
            </div>

            {/* Chapter Visual Element */}
            <div className="lg:col-span-7">
              {activeChapter === 0 && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 font-sans">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">
                    INPUT QUERY TEXT
                  </span>
                  <p className="text-sm text-slate-200 italic">
                    "Procurement of 500 outdoor LED streetlight luminaires for municipal roads with IP66 weather resistance and 10kV surge protection."
                  </p>
                </div>
              )}

              {activeChapter === 1 && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">PRODUCT:</span>
                    <strong className="text-amber-400">Outdoor LED Streetlights</strong>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ENVIRONMENT:</span>
                    <strong className="text-emerald-400">Municipal Roads</strong>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">PROTECTION:</span>
                    <strong className="text-blue-400">IP66 Ingress Rating</strong>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">PERFORMANCE:</span>
                    <strong className="text-purple-400">10kV Surge Protection</strong>
                  </div>
                </div>
              )}

              {activeChapter === 2 && (
                <StandardsCorpusCanvas isSearching={true} totalStandards={2631} />
              )}

              {activeChapter === 3 && (
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-900 border-2 border-amber-500 p-3 rounded-xl flex justify-between items-center text-white font-bold">
                    <span>1. IS 10322 (Part 5/Sec 3)</span>
                    <span className="text-amber-400">67.1 / 100 (PRIMARY MATCH)</span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-slate-400">
                    <span>2. IS 16102 (Part 1/Sec 2)</span>
                    <span>42.0 / 100 (RELATED)</span>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-slate-500">
                    <span>3. IS 10322 (Part 1)</span>
                    <span>38.5 / 100 (RELATED)</span>
                  </div>
                </div>
              )}

              {activeChapter >= 4 && (
                <EvidenceLens
                  sourceField="SCOPE"
                  sourceText="This standard specifies requirements for luminaires for road and street lighting..."
                  matchedSignal="road and street lighting"
                  reasonCode="SCOPE_MATCH"
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
