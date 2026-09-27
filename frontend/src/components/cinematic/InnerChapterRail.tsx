import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Layers, ShieldCheck, Database, Scale, BarChart2 } from 'lucide-react';

interface Chapter {
  id: string;
  num: string;
  name: string;
  icon: React.ElementType;
}

export const InnerChapterRail: React.FC = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('understand');

  const chapters: Chapter[] = [
    { id: 'understand', num: '01', name: t('chapters.c2Name'), icon: Layers },
    { id: 'recommend', num: '02', name: t('chapters.c6Name'), icon: ShieldCheck },
    { id: 'evidence', num: '03', name: t('chapters.c5Name'), icon: Database },
    { id: 'coverage', num: '04', name: t('coverage.title'), icon: BarChart2 },
    { id: 'compare', num: '05', name: t('results.compare'), icon: Scale }
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sticky top-4 z-30 mb-6 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2 shadow-xl flex items-center justify-between font-mono text-xs">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] text-amber-500 font-bold px-2 py-1 bg-amber-950/60 rounded border border-amber-800/80 uppercase tracking-widest shrink-0">
          MANAK DOSSIER
        </span>
        {chapters.map((ch) => {
          const Icon = ch.icon;
          const isActive = activeSection === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => scrollToSection(ch.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] opacity-75">{ch.num}</span>
              <Icon className="w-3.5 h-3.5" />
              <span>{ch.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
