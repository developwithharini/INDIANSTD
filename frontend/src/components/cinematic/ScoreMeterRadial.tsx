import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ScoreMeterRadialProps {
  score: number;
  maxScore?: number;
  label?: string;
  subScores?: {
    semantic?: number;
    lexical?: number;
    scope?: number;
    evidence?: number;
  };
}

export const ScoreMeterRadial: React.FC<ScoreMeterRadialProps> = ({
  score,
  maxScore = 100,
  label = 'Applicability Score',
  subScores = {
    semantic: 88,
    lexical: 74,
    scope: 92,
    evidence: 65
  }
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let current = 0;
    const increment = score / 20;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(parseFloat(current.toFixed(1)));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [score]);

  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const strokeDashoffset = 188 - (188 * percentage) / 100;

  return (
    <div
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="relative flex flex-col items-end cursor-pointer group"
    >
      <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs group-hover:border-navy-900 transition-all font-mono">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r="30"
              stroke="#e2e8f0"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="35"
              cy="35"
              r="30"
              stroke={score >= 75 ? '#059669' : score >= 45 ? '#d97706' : '#dc2626'}
              strokeWidth="6"
              strokeDasharray="188"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute text-sm font-extrabold text-slate-900 font-mono">
            {displayScore}
          </span>
        </div>

        <div className="pr-2">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
            {label}
          </span>
          <span className="text-xs font-bold text-navy-900">
            {score >= 75 ? 'STRONG MATCH' : score >= 45 ? 'REVIEW REQUIRED' : 'NO MATCH'}
          </span>
        </div>
      </div>

      {/* Expanded Sub-score Breakdown Hover Panel */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute top-full right-0 mt-2 z-20 w-64 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-2.5 font-mono text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
            <span>DETERMINISTIC SCORE METRIC</span>
            <span>{score} / 100</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>SEMANTIC DENSE MATCH</span>
                <span className="font-bold text-amber-400">{subScores.semantic}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${subScores.semantic}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>LEXICAL BM25 MATCH</span>
                <span className="font-bold text-emerald-400">{subScores.lexical}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${subScores.lexical}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>SCOPE & OVERVIEW MATCH</span>
                <span className="font-bold text-blue-400">{subScores.scope}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${subScores.scope}%` }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
