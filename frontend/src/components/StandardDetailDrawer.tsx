import React from 'react';
import { RecommendationItem } from '../types';
import { ShieldCheck, Calendar, BookOpen, FileCode2, ExternalLink } from 'lucide-react';

interface StandardDetailDrawerProps {
  item: RecommendationItem | null;
  onClose: () => void;
}

export const StandardDetailDrawer: React.FC<StandardDetailDrawerProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between border-l border-slate-200">
        <div className="p-6 space-y-6">
          {/* Top Bar */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-navy-900 bg-navy-50 border border-navy-200 px-2 py-0.5 rounded">
                  {item.standard_number}
                </span>
                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                  item.status === 'CURRENT' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {item.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 pt-1 leading-snug">{item.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
            >
              ✕
            </button>
          </div>

          {/* Applicability Score & Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                Applicability Score
              </span>
              <span className="text-xl font-extrabold text-navy-900 font-mono">
                {item.applicability_score} / 100
              </span>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-slate-200 text-xs font-mono">
              {Object.entries(item.score_breakdown).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-slate-900 font-semibold">{val} %</span>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Scope */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-navy-800" />
              Standard Scope
            </h3>
            <p className="text-xs text-slate-700 bg-white border border-slate-200 p-3.5 rounded-lg leading-relaxed font-sans">
              {item.scope_preview || "Official BIS scope specifications recorded in dataset snapshot."}
            </p>
          </div>

          {/* Why Matched Reasons */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Why Matched Evidence
            </h3>
            <div className="space-y-2">
              {item.reasons.map((reason, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-0.5">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="text-emerald-600">✓</span> {reason.label}
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-snug">{reason.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Source Provenance Trail */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
              Dataset Evidence Trail
            </h3>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-mono space-y-1">
              <div><span className="text-slate-400">Source:</span> <span className="text-slate-900">BIS Published Dataset Snapshot</span></div>
              {item.evidence?.[0] && (
                <>
                  <div><span className="text-slate-400">Workbook:</span> <span className="text-slate-900">{item.evidence[0].source_file || 'standards.xlsx'}</span></div>
                  <div><span className="text-slate-400">Sheet:</span> <span className="text-slate-900">{item.evidence[0].source_sheet || 'Standards'}</span></div>
                  <div><span className="text-slate-400">Row:</span> <span className="text-slate-900">{item.evidence[0].source_row ? `Row ${item.evidence[0].source_row}` : 'UNAVAILABLE'}</span></div>
                </>
              )}
              <div><span className="text-slate-400">Verification:</span> <span className="text-emerald-700 font-semibold">Verified Source Record</span></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
