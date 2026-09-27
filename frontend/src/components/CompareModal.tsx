import React from 'react';
import { RecommendationItem } from '../types';

interface CompareModalProps {
  itemA: RecommendationItem | null;
  itemB: RecommendationItem | null;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ itemA, itemB, onClose }) => {
  if (!itemA || !itemB) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-navy-900 font-mono">Compare Standards</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Item A */}
          <div className="space-y-4 border-r border-slate-100 pr-6">
            <div>
              <span className="text-xs font-mono font-bold text-navy-900 bg-navy-50 border border-navy-200 px-2 py-0.5 rounded">
                {itemA.standard_number}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{itemA.title}</h3>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono">
              <span className="text-slate-500">Applicability Score:</span>
              <div className="text-lg font-bold text-navy-900">{itemA.applicability_score} / 100</div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Scope:</span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">{itemA.scope_preview || 'Scope specifications recorded.'}</p>
            </div>
          </div>

          {/* Item B */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-navy-900 bg-navy-50 border border-navy-200 px-2 py-0.5 rounded">
                {itemB.standard_number}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{itemB.title}</h3>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono">
              <span className="text-slate-500">Applicability Score:</span>
              <div className="text-lg font-bold text-navy-900">{itemB.applicability_score} / 100</div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Scope:</span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">{itemB.scope_preview || 'Scope specifications recorded.'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
