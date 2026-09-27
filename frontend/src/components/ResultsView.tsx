import React, { useState } from 'react';
import { AnalysisResponse, RecommendationItem, RequirementItem } from '../types';
import { 
  ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Info, ArrowLeft,
  SlidersHorizontal, Scale, Eye, AlertTriangle, Layers, FileText
} from 'lucide-react';
import { StandardDetailDrawer } from './StandardDetailDrawer';
import { CompareModal } from './CompareModal';
import { EvidenceDrawer } from './EvidenceDrawer';
import { RequirementCoverage } from './RequirementCoverage';

interface ResultsViewProps {
  data: AnalysisResponse;
  onNewAnalysis: () => void;
  onRefine: (text: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, onNewAnalysis, onRefine }) => {
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<RecommendationItem | null>(null);
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<RecommendationItem | null>(null);
  const [activeRequirement, setActiveRequirement] = useState<RequirementItem | undefined>(undefined);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [compareItems, setCompareItems] = useState<RecommendationItem[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [expandedWhyMatched, setExpandedWhyMatched] = useState<Record<string, boolean>>({});
  const [isWhyNotExpanded, setIsWhyNotExpanded] = useState(false);

  const toggleWhyMatched = (id: string) => {
    setExpandedWhyMatched(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleViewEvidenceClick = (item: RecommendationItem) => {
    setActiveRequirement(undefined);
    setSelectedEvidenceItem(item);
    setIsEvidenceDrawerOpen(true);
  };

  const handleSelectRequirement = (req: RequirementItem, primaryStd?: RecommendationItem) => {
    setActiveRequirement(req);
    const targetItem = primaryStd || data.recommendations[0];
    if (targetItem) {
      setSelectedEvidenceItem(targetItem);
      setIsEvidenceDrawerOpen(true);
    }
  };

  const handleCompareClick = (item: RecommendationItem) => {
    if (compareItems.find(i => i.standard_id === item.standard_id)) {
      setCompareItems(prev => prev.filter(i => i.standard_id !== item.standard_id));
    } else {
      if (compareItems.length >= 2) {
        setCompareItems([compareItems[1], item]);
      } else {
        setCompareItems(prev => [...prev, item]);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-900 hover:text-navy-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>New analysis</span>
        </button>

        <div className="flex items-center gap-3">
          {compareItems.length === 2 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({compareItems.length})</span>
            </button>
          )}
          <span className="text-[11px] font-mono text-slate-400">
            Processed in {data.processing_time_ms}ms ({data.execution_mode})
          </span>
        </div>
      </div>

      {/* 1. Procurement Requirement Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            UNDERSTOOD AS
          </span>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            Input: {data.input_type}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">Product:</span>
            <span className="font-bold text-slate-900">{data.requirement.product}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">Application:</span>
            <span className="font-semibold text-slate-800">{data.requirement.application || 'General Municipal'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">Environment:</span>
            <span className="font-semibold text-slate-800">{data.requirement.environment || 'General'}</span>
          </div>
        </div>

        {data.requirement.performance_requirements.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 font-mono">Detected Requirements:</span>
            {data.requirement.performance_requirements.map((req, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200">
                • {req}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Requirement Coverage Breakdown */}
      {data.requirement_coverage && data.requirement_coverage.length > 0 && (
        <RequirementCoverage
          coverageItems={data.requirement_coverage}
          coverageSummary={data.coverage_summary}
          recommendations={data.recommendations}
          onSelectRequirement={handleSelectRequirement}
        />
      )}

      {/* Outdated Version Warning Banner if signals present */}
      {data.version_signals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-1">
          {data.version_signals.map((sig, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-amber-900 font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{sig.message}</span>
                {sig.current_recommendation && <p className="text-[11px] text-amber-800">{sig.current_recommendation}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Recommended Indian Standards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center justify-between">
          <span>RECOMMENDED STANDARDS</span>
          {data.recommendations.length === 0 && (
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              NO SUFFICIENT MATCH
            </span>
          )}
        </h2>

        {data.recommendations.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-900 font-mono uppercase tracking-wider">
                  No Sufficient Match Found (Deterministic Abstention)
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  No Indian Standard in the current 2,631-record BIS corpus met the minimum applicability threshold (45.0/100) for high-confidence recommendation.
                </p>
                <p className="text-[11px] text-amber-700 pt-1">
                  The system has intentionally abstained from making a mandatory recommendation to avoid false compliance mapping. Candidate standards with lower scores are listed below for expert review.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
          {data.recommendations.map((item) => {
            const isWhyExpanded = expandedWhyMatched[item.standard_id];
            const isCompared = !!compareItems.find(i => i.standard_id === item.standard_id);

            return (
              <div key={item.standard_id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all">
                {/* Standard Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
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
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.relationship}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                  </div>

                  {/* Applicability Score Badge */}
                  <div className="flex items-center sm:flex-col justify-between sm:items-end shrink-0">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Applicability Score
                    </span>
                    <span className="text-xl font-extrabold text-navy-900 font-mono">
                      {item.applicability_score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </span>
                  </div>
                </div>

                {/* Scope Preview */}
                {item.scope_preview && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.scope_preview}
                  </p>
                )}

                {/* Expandable Why Matched Breakdown */}
                {isWhyExpanded && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs pt-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                      Why matched:
                    </span>
                    <div className="space-y-1.5">
                      {item.reasons.map((reason, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-1.5 text-slate-800 text-[11px]">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <div>
                            <span className="font-semibold">{reason.label}:</span> {reason.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => toggleWhyMatched(item.standard_id)}
                    className="text-slate-600 hover:text-navy-900 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Why this matched</span>
                    {isWhyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewEvidenceClick(item)}
                      className="bg-navy-900 hover:bg-navy-800 text-white font-semibold px-3 py-1 rounded shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View Evidence</span>
                    </button>
                    <button
                      onClick={() => handleCompareClick(item)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                        isCompared ? 'bg-navy-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isCompared ? 'Selected for Compare' : 'Compare'}
                    </button>
                    <button
                      onClick={() => setSelectedDrawerItem(item)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1 rounded border border-slate-200 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* 3. Why Not (Lower Candidate Comparison) */}
      {data.why_not.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <button
            onClick={() => setIsWhyNotExpanded(!isWhyNotExpanded)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider font-mono"
          >
            <span>Why other candidates ranked lower ({data.why_not.length})</span>
            {isWhyNotExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isWhyNotExpanded && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {data.why_not.map((wn) => (
                <div key={wn.standard_id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900 font-mono">{wn.standard_number} — {wn.title}</div>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                    {wn.reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Refine Search Button */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
        <button
          onClick={() => onRefine(data.requirement.product)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Refine search requirement</span>
        </button>

        <button
          onClick={onNewAnalysis}
          className="bg-navy-900 hover:bg-navy-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Start New Analysis
        </button>
      </div>

      {/* Side Detail Drawer */}
      <StandardDetailDrawer
        item={selectedDrawerItem}
        onClose={() => setSelectedDrawerItem(null)}
      />

      {/* Slide-over Evidence Drawer */}
      {selectedEvidenceItem && (
        <EvidenceDrawer
          item={selectedEvidenceItem}
          isOpen={isEvidenceDrawerOpen}
          onClose={() => setIsEvidenceDrawerOpen(false)}
          activeRequirement={activeRequirement}
        />
      )}

      {/* Side-by-Side Compare Modal */}
      {isCompareOpen && (
        <CompareModal
          itemA={compareItems[0] || null}
          itemB={compareItems[1] || null}
          onClose={() => setIsCompareOpen(false)}
        />
      )}
    </div>
  );
};
