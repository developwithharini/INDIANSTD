import React, { useState } from 'react';
import { RequirementCoverageItem, RequirementItem, RecommendationItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { formatRequirementType } from '../i18n/formatters';
import { CheckCircle2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, ArrowRight } from 'lucide-react';

interface RequirementCoverageProps {
  coverageItems: RequirementCoverageItem[];
  coverageSummary?: {
    total_requirements: number;
    supported_count: number;
    partially_supported_count: number;
    unsupported_count: number;
    coverage_percentage: number;
  };
  recommendations: RecommendationItem[];
  onSelectRequirement: (requirement: RequirementItem, primaryStandard?: RecommendationItem) => void;
}

export const RequirementCoverage: React.FC<RequirementCoverageProps> = ({
  coverageItems,
  coverageSummary,
  recommendations,
  onSelectRequirement
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!coverageItems || coverageItems.length === 0) return null;

  const total = coverageSummary?.total_requirements || coverageItems.length;
  const supported = coverageSummary?.supported_count || coverageItems.filter(c => c.status === 'SUPPORTED').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-navy-900" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight font-mono">{t('coverage.title')}</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
            {supported} of {total} {t('coverage.supported')}
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center gap-1 transition-colors font-mono"
        >
          <span>{isExpanded ? t('common.collapse') : t('common.expand')}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Coverage Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 font-mono">
          {coverageItems.map((cov) => {
            const req = cov.requirement;
            const primaryStdInfo = cov.supporting_standards?.[0];
            const primaryStdObj = primaryStdInfo
              ? recommendations.find(r => r.standard_id === primaryStdInfo.standard_id)
              : undefined;

            let statusBadge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{t('coverage.supported')}</span>
              </span>
            );

            if (cov.status === 'PARTIALLY_SUPPORTED') {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>{t('coverage.partial')}</span>
                </span>
              );
            } else if (cov.status === 'NO_EVIDENCE') {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                  <span>{t('coverage.noEvidence')}</span>
                </span>
              );
            }

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequirement(req, primaryStdObj)}
                className="group cursor-pointer bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-navy-300 p-3 rounded-lg transition-all duration-150 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {formatRequirementType(req.category_label || req.type, t)}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-navy-900 transition-colors font-sans">
                      {req.value}
                    </h4>
                  </div>
                  {statusBadge}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  {primaryStdInfo ? (
                    <span className="text-slate-600 font-medium truncate max-w-[220px]">
                      {t('coverage.mappedStandard')}: <strong className="text-navy-900 font-bold">{primaryStdInfo.standard_number}</strong>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic font-sans">{t('coverage.noEvidence')}</span>
                  )}

                  <span className="text-navy-900 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                    <span>{t('results.viewEvidence')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
