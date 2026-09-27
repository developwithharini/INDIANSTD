import React, { useState } from 'react';
import { AnalysisResponse, RecommendationItem, RequirementItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Info, ArrowLeft,
  SlidersHorizontal, Scale, Eye, AlertTriangle, Layers, FileText
} from 'lucide-react';
import { StandardDetailDrawer } from './StandardDetailDrawer';
import { CompareModal } from './CompareModal';
import { EvidenceDrawer } from './EvidenceDrawer';
import { RequirementCoverage } from './RequirementCoverage';
import { DiagnosticTraceView } from './DiagnosticTraceView';
import { InnerChapterRail } from './cinematic/InnerChapterRail';
import { ScoreMeterRadial } from './cinematic/ScoreMeterRadial';
import { StandardCardSpotlight } from './cinematic/StandardCardSpotlight';

interface ResultsViewProps {
  data: AnalysisResponse;
  onNewAnalysis: () => void;
  onRefine: (text: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, onNewAnalysis, onRefine }) => {
  const { t } = useLanguage();
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<RecommendationItem | null>(null);
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<RecommendationItem | null>(null);
  const [activeRequirement, setActiveRequirement] = useState<RequirementItem | undefined>(undefined);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [compareItems, setCompareItems] = useState<RecommendationItem[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [expandedWhyMatched, setExpandedWhyMatched] = useState<Record<string, boolean>>({});
  const [showTraceModal, setShowTraceModal] = useState(false);

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
      {/* Sticky Inner Chapter Navigation Rail */}
      <InnerChapterRail />

      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-900 hover:text-navy-700 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('nav.newAnalysis')}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTraceModal(!showTraceModal)}
            className="bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-mono font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors border border-slate-700 shadow-2xs"
          >
            <span>🔬 {t('nav.retrievalTrace')}</span>
          </button>
          {compareItems.length === 2 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-2xs font-mono"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t('results.compare')} ({compareItems.length})</span>
            </button>
          )}
          <span className="text-[11px] font-mono text-slate-400">
            {t('processing.completedWithTime', {
              time: data.processing_time_ms,
              mode: data.execution_mode === 'LOCAL_FALLBACK' ? t('processing.localFallbackMode') : t('processing.liveModelMode')
            })}
          </span>
        </div>
      </div>

      {/* Developer Retrieval Trace View Modal/Section */}
      {showTraceModal && (
        <DiagnosticTraceView
          analysisId={data.analysis_id}
          onClose={() => setShowTraceModal(false)}
          onViewEvidence={handleViewEvidenceClick}
        />
      )}

      {/* 1. Procurement Requirement Summary */}
      <div id="section-understand" className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {t('requirement.summaryTitle')}
          </span>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            {t('input.inputType')}: {data.input_type === 'DESCRIBE' ? t('input.describe') : t('input.upload')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">{t('requirement.product')}:</span>
            <span className="font-bold text-slate-900">{data.requirement.product}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">{t('requirement.application')}:</span>
            <span className="font-semibold text-slate-800">{data.requirement.application || 'General'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">{t('requirement.environment')}:</span>
            <span className="font-semibold text-slate-800">{data.requirement.environment || 'General'}</span>
          </div>
        </div>

        {data.requirement.performance_requirements.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 font-mono">{t('requirement.performance')}:</span>
            {data.requirement.performance_requirements.map((req, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200 font-mono">
                • {req}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Priority 2 Requirement Coverage Mapping Component */}
      {data.recommendations.length > 0 && (data.requirement_coverage || data.coverage_items) && (
        <div id="section-coverage">
          <RequirementCoverage
            coverageItems={data.requirement_coverage || data.coverage_items || []}
            coverageSummary={data.coverage_summary}
            recommendations={data.recommendations}
            onSelectRequirement={handleSelectRequirement}
          />
        </div>
      )}

      {/* Decision State Review Banner (POSSIBLE_MATCH_REVIEW_REQUIRED) */}
      {data.decision_state === 'POSSIBLE_MATCH_REVIEW_REQUIRED' && !data.is_abstained && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono text-amber-900 uppercase tracking-wider">
              {t('results.reviewBannerTitle')}
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {t('results.reviewBannerText')}
            </p>
          </div>
        </div>
      )}

      {/* 2. Recommended Indian Standards */}
      <div id="section-recommend" className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center justify-between">
          <span>{t('results.recommendedTitle')}</span>
          {(data.is_abstained || data.recommendations.length === 0) && (
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              {t('results.matchAbstain')}
            </span>
          )}
        </h2>

        {data.is_abstained || data.recommendations.length === 0 ? (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-900 font-mono uppercase tracking-wider">
                    {t('results.abstentionTitle')}
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                    Score &lt; 45.0
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {data.abstention_reason || t('results.abstentionText')}
                </p>
              </div>
            </div>

            {/* Closest Candidate Standard Card if available */}
            {data.closest_candidate && (
              <div className="bg-white rounded-lg border border-amber-200 p-4 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-500">
                    {t('results.whyOtherCandidatesLower')}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-700">
                    {data.closest_candidate.applicability_score} / 100
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-navy-900 bg-navy-50 border border-navy-200 px-2 py-0.5 rounded">
                    {data.closest_candidate.standard_number}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {data.closest_candidate.title}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {data.recommendations.map((item, index) => {
              const isWhyExpanded = !!expandedWhyMatched[item.standard_id];
              const isCompared = !!compareItems.find(c => c.standard_id === item.standard_id);
              const getStatusText = (status: string) => {
                switch (status) {
                  case 'CURRENT': return t('status.current');
                  case 'SUPERSEDED': return t('status.superseded');
                  case 'WITHDRAWN': return t('status.withdrawn');
                  default: return t('status.unknown');
                }
              };

              return (
                <StandardCardSpotlight key={item.standard_id} isPrimary={index === 0} className="p-5">
                  <div className="space-y-3">
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
                            {getStatusText(item.status)}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                      </div>

                      <ScoreMeterRadial score={item.applicability_score} label={t('results.applicabilityScore')} />
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
                        {t('results.whyMatched')}:
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
                  <div className="flex items-center justify-between pt-1 text-xs font-mono">
                    <button
                      onClick={() => toggleWhyMatched(item.standard_id)}
                      className="text-slate-600 hover:text-navy-900 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>{t('results.whyMatched')}</span>
                      {isWhyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewEvidenceClick(item)}
                        className="inline-flex items-center gap-1 text-navy-900 hover:text-navy-700 font-bold hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('results.viewEvidence')}</span>
                      </button>

                      <button
                        onClick={() => setSelectedDrawerItem(item)}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>{t('results.details')}</span>
                      </button>

                      <button
                        onClick={() => handleCompareClick(item)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                          isCompared
                            ? 'bg-navy-900 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Scale className="w-3 h-3" />
                        <span>{isCompared ? `✓ ${t('results.compare')}` : t('results.compare')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </StandardCardSpotlight>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawers and Modals */}
      {selectedDrawerItem && (
        <StandardDetailDrawer
          item={selectedDrawerItem}
          onClose={() => setSelectedDrawerItem(null)}
        />
      )}

      {selectedEvidenceItem && (
        <EvidenceDrawer
          isOpen={isEvidenceDrawerOpen}
          item={selectedEvidenceItem}
          activeRequirement={activeRequirement}
          onClose={() => {
            setIsEvidenceDrawerOpen(false);
            setSelectedEvidenceItem(null);
            setActiveRequirement(undefined);
          }}
        />
      )}

      {isCompareOpen && (
        <CompareModal
          items={compareItems}
          onClose={() => setIsCompareOpen(false)}
        />
      )}
    </div>
  );
};
