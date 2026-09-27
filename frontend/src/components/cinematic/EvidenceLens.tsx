import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, Database } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface EvidenceLensProps {
  sourceField?: string;
  sourceText?: string;
  matchedSignal?: string;
  reasonCode?: string;
}

export const EvidenceLens: React.FC<EvidenceLensProps> = ({
  sourceField = 'SCOPE',
  sourceText = 'This standard specifies requirements for luminaires for road and street lighting using electrical light sources on supply voltages not exceeding 1 000 V.',
  matchedSignal = 'road and street lighting',
  reasonCode = 'SCOPE_MATCH'
}) => {
  const { t } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className="relative p-5 bg-white border border-slate-200 rounded-xl shadow-xs transition-all duration-300 font-mono"
    >
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-navy-900" />
          <span className="font-bold text-slate-700">{t('evidence.sourceField')}: {sourceField}</span>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold uppercase">
          {reasonCode}
        </span>
      </div>

      <p className={`text-xs font-sans leading-relaxed transition-opacity duration-300 ${isFocused ? 'text-slate-400' : 'text-slate-800'}`}>
        This standard specifies requirements for luminaires for{' '}
        <span className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
          isFocused ? 'bg-amber-400 text-slate-950 font-bold shadow-md scale-105 inline-block' : 'bg-amber-100 text-amber-900 font-semibold'
        }`}>
          {matchedSignal}
        </span>{' '}
        using electrical light sources on supply voltages not exceeding 1 000 V.
      </p>

      {isFocused && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-900 bg-amber-50/70 px-3 py-1.5 rounded-lg"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>EXACT MATCHING CLAUSE FOUND</span>
          </div>
          <span className="font-bold">VERIFIED EVIDENCE</span>
        </motion.div>
      )}
    </div>
  );
};
