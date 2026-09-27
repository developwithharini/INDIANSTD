import React, { useState } from 'react';
import { RecommendationItem, EvidenceItem, RequirementItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { formatRequirementType } from '../i18n/formatters';
import { HighlightText } from './HighlightText';
import {
  FileText,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  ExternalLink,
  Info,
  Check,
  Target
} from 'lucide-react';

interface EvidenceDrawerProps {
  item: RecommendationItem;
  isOpen: boolean;
  onClose: () => void;
  activeRequirement?: RequirementItem;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ item, isOpen, onClose, activeRequirement }) => {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [copiedSpec, setCopiedSpec] = useState<boolean>(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // When activeRequirement changes, select the best matching evidence index
  React.useEffect(() => {
    if (activeRequirement && item?.evidence) {
      const idx = item.evidence.findIndex(ev =>
        ev.excerpt.toLowerCase().includes(activeRequirement.value.toLowerCase()) ||
        ev.matched_terms.some(t => t.toLowerCase() === activeRequirement.value.toLowerCase()) ||
        (ev.requirement_signal && ev.requirement_signal.toLowerCase().includes(activeRequirement.value.toLowerCase()))
      );
      if (idx !== -1) {
        setSelectedIndex(idx);
      }
    }
  }, [activeRequirement, item]);

  if (!isOpen || !item) return null;

  const evidenceList: EvidenceItem[] = item.evidence || [];
  const currentEvidence: EvidenceItem | undefined = evidenceList[selectedIndex] || evidenceList[0];

  const handleNext = () => {
    if (selectedIndex < evidenceList.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleCopyToSpec = () => {
    const specText = `Mandatory Compliance Standard: ${item.standard_number} — ${item.title}\nApplicability Score: ${item.applicability_score}/100\nEvidence Provenance: ${currentEvidence?.source_file || 'standards.xlsx'} (Sheet: ${currentEvidence?.source_sheet || 'Standards'}, Row: ${currentEvidence?.source_row || 'N/A'})\nSupporting Scope Excerpt: "${currentEvidence?.excerpt || ''}"`;
    navigator.clipboard.writeText(specText);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const getStrengthBadgeClass = (strength: string) => {
    switch (strength) {
      case 'STRONG':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'MODERATE':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'LIMITED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getReasonLabel = (code: string) => {
    switch (code) {
      case 'SCOPE_MATCH':
        return 'Scope Match';
      case 'PRODUCT_MATCH':
        return 'Product Title Match';
      case 'DOMAIN_MATCH':
        return 'Category & Domain Match';
      case 'VERSION_VALID':
        return 'Active Version';
      default:
        return code.replace('_', ' ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end" role="dialog" aria-modal="true" aria-label={t('evidence.title')}>
      {/* Background click overlay */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      {/* Slide-over Drawer Panel */}
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="space-y-1.5 pr-4 font-mono">
            <div className="flex items-center gap-2">
              {/* UNMUTATED Official Standard Number */}
              <span className="text-xs font-bold bg-navy-900 text-white px-2 py-0.5 rounded">
                {item.standard_number}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getStrengthBadgeClass(currentEvidence?.evidence_strength || 'STRONG')}`}>
                {t('evidence.strength')}: {currentEvidence?.evidence_strength || 'STRONG'}
              </span>
            </div>
            {/* UNMUTATED Official Standard Title */}
            <h2 className="text-base font-bold text-slate-900 leading-snug font-sans">
              {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Requirement Banner */}
          {activeRequirement && (
            <div className="bg-navy-900 border border-navy-700 rounded-xl p-3.5 text-white flex items-start gap-3 shadow-2xs font-mono">
              <Target className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {t('evidence.requirementLinked')}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {formatRequirementType(activeRequirement.category_label || activeRequirement.type, t)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-sans">
                  "{activeRequirement.value}"
                </h4>
              </div>
            </div>
          )}

          {/* Applicability & Score Header */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between font-mono">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                {t('results.applicabilityScore')}
              </span>
              <div className="text-2xl font-bold text-emerald-400">
                {item.applicability_score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs text-slate-300 block">
                {t('evidence.relationship')}: <strong className="text-white">{item.relationship === 'PRIMARY' ? t('results.primary') : t('results.related')}</strong>
              </span>
              <span className="text-[11px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                ✓ {t('status.verified')}
              </span>
            </div>
          </div>

          {/* Matched Because Summary Checks */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              {t('results.matchedBecause')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {evidenceList.map((ev, idx) => (
                <button
                  key={ev.evidence_id || idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-left transition-colors ${
                    selectedIndex === idx
                      ? 'bg-navy-900 text-white border-navy-900 font-bold shadow-2xs'
                      : 'bg-emerald-50/70 text-emerald-950 border-emerald-200 hover:bg-emerald-100/70'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${selectedIndex === idx ? 'text-emerald-400' : 'text-emerald-700'}`} />
                  <span className="truncate">{getReasonLabel(ev.reason_code)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Evidence Navigation Selector */}
          {evidenceList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-900 uppercase">
                  {t('evidence.title')} ({evidenceList.length})
                </span>
                <span className="text-slate-500">
                  {t('common.itemOfTotal', { current: selectedIndex + 1, total: evidenceList.length })}
                </span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {evidenceList.map((ev, idx) => (
                  <button
                    key={ev.evidence_id || idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`text-xs font-mono px-3 py-1.5 rounded-lg border shrink-0 transition-colors ${
                      selectedIndex === idx
                        ? 'bg-navy-900 text-white border-navy-900 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {getReasonLabel(ev.reason_code)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Source Evidence Panel */}
          {currentEvidence ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Database className="w-4 h-4 text-navy-900 shrink-0" />
                  <span className="font-bold uppercase">{getReasonLabel(currentEvidence.reason_code)}</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {t('evidence.sourceField')}: <strong className="text-slate-800 uppercase">{currentEvidence.source_field}</strong>
                </span>
              </div>

              {/* Requirement Signal & Concept Match */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('evidence.requirementSignal')}
                </div>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="text-navy-900 font-bold">↳</span>
                  <span>"{currentEvidence.requirement_signal || 'Procurement Requirement Match'}"</span>
                </div>
              </div>

              {/* Provenance Metadata Badges */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-4 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block">{t('evidence.workbook')}:</span>
                  <span className="font-bold text-slate-900 truncate block">{currentEvidence.source_file || 'standards.xlsx'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('evidence.sheet')}:</span>
                  <span className="font-bold text-slate-900 truncate block">{currentEvidence.source_sheet || 'Standards'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('evidence.row')}:</span>
                  <span className="font-bold text-slate-900">{currentEvidence.source_row ? `${t('evidence.row')} ${currentEvidence.source_row}` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('evidence.field')}:</span>
                  <span className="font-bold text-slate-900 uppercase">{currentEvidence.source_field}</span>
                </div>
              </div>

              {/* Source Text Excerpt with Highlighted Matching Terms (UNMUTATED OFFICIAL SOURCE EXCERPT) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{t('evidence.supportingExcerpt')}</span>
                  {currentEvidence.matched_terms.length > 0 && (
                    <span className="text-amber-900 font-bold bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded text-[11px]">
                      Matched terms: {currentEvidence.matched_terms.join(', ')}
                    </span>
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs leading-relaxed font-sans">
                  <HighlightText
                    text={currentEvidence.excerpt}
                    matchedTerms={currentEvidence.matched_terms}
                  />
                </div>
              </div>

              {/* Deterministic Why This Matches Explanation */}
              {currentEvidence.explanation && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 font-mono">
                    <Info className="w-3.5 h-3.5 text-blue-700" />
                    <span>{t('evidence.whySupports')}</span>
                  </div>
                  <p className="text-blue-800 leading-relaxed font-sans">
                    {currentEvidence.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs font-mono text-amber-800">
              Evidence unavailable in current BIS dataset snapshot.
            </div>
          )}
        </div>

        {/* Drawer Footer Actions & Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={selectedIndex === 0}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={selectedIndex === evidenceList.length - 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors text-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCopyToSpec}
            className="inline-flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-2xs"
          >
            {copiedSpec ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedSpec ? t('evidence.copied') : t('evidence.copySpec')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
