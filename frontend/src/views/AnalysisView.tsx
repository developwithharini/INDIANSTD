import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, FileText, ChevronRight, 
  Layers, ExternalLink, Bookmark, Sparkles, Filter, SlidersHorizontal, Info, XCircle
} from 'lucide-react';
import { ProcurementAnalysisResponse, Recommendation } from '../types';

interface AnalysisViewProps {
  analysis: ProcurementAnalysisResponse;
  onNavigate: (view: string) => void;
  onGenerateSpec: () => void;
  onAddToWatchlist: (stdId: string) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  analysis, onNavigate, onGenerateSpec, onAddToWatchlist
}) => {
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(
    analysis.recommendations[0] || null
  );
  const [filterType, setFilterType] = useState<string>('ALL');

  const primaryCount = analysis.recommendations.filter(r => r.relationship_type === 'PRIMARY').length;
  const testCount = analysis.recommendations.filter(r => r.relationship_type === 'TEST').length;
  const safetyCount = analysis.recommendations.filter(r => r.relationship_type === 'SAFETY').length;
  const qcoCount = analysis.recommendations.filter(r => r.regulatory_status === 'REQUIRED').length;

  const filteredRecs = analysis.recommendations.filter(r => {
    if (filterType === 'PRIMARY') return r.relationship_type === 'PRIMARY';
    if (filterType === 'TEST') return r.relationship_type === 'TEST';
    if (filterType === 'SAFETY') return r.relationship_type === 'SAFETY';
    if (filterType === 'REQUIRED') return r.regulatory_status === 'REQUIRED';
    return true;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Status Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-navy-900">{analysis.title}</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {analysis.execution_mode}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate max-w-xl">
            Input Query: "{analysis.raw_input_text}"
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-center">
            <div className="text-xs font-bold text-navy-900 font-mono">{analysis.readiness.overall_score}/100</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Readiness</div>
          </div>

          <button
            onClick={onGenerateSpec}
            className="bg-navy-900 hover:bg-navy-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Specification Document</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="text-slate-400 font-mono text-[11px]">Analysis Summary:</span>
        <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700">
          <strong>{analysis.recommendations.length}</strong> Candidates
        </span>
        <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-navy-900">
          <strong>{primaryCount}</strong> Primary Product Standards
        </span>
        <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700">
          <strong>{testCount}</strong> Test Methods
        </span>
        <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700">
          <strong>{safetyCount}</strong> Safety Standards
        </span>
        <span className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-amber-800 font-semibold">
          <strong>{qcoCount}</strong> QCO Mandatory Flags
        </span>
        <span className="bg-red-50 border border-red-200 px-2.5 py-1 rounded-md text-red-700 font-semibold">
          <strong>{analysis.findings.length}</strong> Audit Findings
        </span>
      </div>

      {/* THREE-PANE WORKBENCH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT PANE: Extracted Requirement Model (Col 3) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-navy-900 uppercase tracking-wider font-mono">
              Extracted Requirement Profile
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono uppercase">
              {analysis.requirement_model.language}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Product</span>
              <div className="font-bold text-slate-900">{analysis.requirement_model.product}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Category</span>
              <div className="font-semibold text-slate-800">{analysis.requirement_model.category}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Environment</span>
              <div className="text-slate-700">{analysis.requirement_model.environment}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Technical Attributes</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.requirement_model.attributes.map((attr, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-mono">
                    {attr}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Testing Requirements</span>
              <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5 mt-0.5">
                {analysis.requirement_model.testing_requirements.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Explicit Standards Mentioned</span>
              <div className="text-slate-700 font-mono text-[11px]">
                {analysis.requirement_model.mentioned_standards.length > 0 
                  ? analysis.requirement_model.mentioned_standards.join(', ')
                  : 'None specified in prompt'}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANE: Recommendation Cards List (Col 5) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filters Bar */}
          <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterType === 'ALL' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                All ({analysis.recommendations.length})
              </button>
              <button
                onClick={() => setFilterType('PRIMARY')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterType === 'PRIMARY' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Primary
              </button>
              <button
                onClick={() => setFilterType('TEST')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterType === 'TEST' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Test
              </button>
              <button
                onClick={() => setFilterType('REQUIRED')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterType === 'REQUIRED' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                QCO Mandatory
              </button>
            </div>
          </div>

          {/* List of Recommendation Cards */}
          <div className="space-y-2.5">
            {filteredRecs.map((rec) => {
              const isSelected = selectedRec?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRec(rec)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                    isSelected 
                      ? 'border-navy-900 ring-2 ring-navy-900/10 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-navy-900 font-mono">{rec.standard_number}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          rec.status === 'CURRENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rec.status}
                        </span>
                        {rec.regulatory_status === 'REQUIRED' && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">
                            QCO REQUIRED
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-semibold text-slate-800 leading-snug">{rec.title}</h3>
                    </div>

                    {/* Score Badge */}
                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-navy-900 font-mono">
                        {rec.applicability_score}
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </div>
                      <div className="text-[9px] uppercase font-mono text-slate-400">Applicability</div>
                    </div>
                  </div>

                  {/* Primary matched reasons preview */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-600 truncate max-w-xs font-medium">
                      ✓ {rec.reasons[0] || 'Matched by domain similarity'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToWatchlist(rec.standard_id);
                      }}
                      className="text-slate-400 hover:text-navy-900 transition-colors p-1"
                      title="Add to Watchlist"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Evidence & Explainability Panel (Col 4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4 h-fit sticky top-20">
          {selectedRec ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Evidence & Explainability</span>
                  <h3 className="text-sm font-bold text-navy-900 font-mono">{selectedRec.standard_number}</h3>
                </div>
                <span className="text-xl font-extrabold text-navy-900 font-mono">
                  {selectedRec.applicability_score}<span className="text-xs font-normal text-slate-400">/100</span>
                </span>
              </div>

              {/* Why it matched */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Why This Standard Matched
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedRec.reasons.map((reason, idx) => (
                    <li key={idx} className="bg-slate-50 p-2 rounded border border-slate-100 leading-snug">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why Not / Rejection Reasons (if applicable) */}
              {selectedRec.rejection_reasons && selectedRec.rejection_reasons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Conflicting Scope / Rejection Factors
                  </h4>
                  <ul className="space-y-1 text-xs text-red-800">
                    {selectedRec.rejection_reasons.map((rej, idx) => (
                      <li key={idx} className="bg-red-50 p-2 rounded border border-red-100 leading-snug">
                        • {rej}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Score Breakdown Bars */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                  Transparent Score Breakdown
                </h4>
                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-600">
                      <span>Product/Category Match (20%)</span>
                      <span className="font-mono font-bold">{selectedRec.score_breakdown.product_category_match}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-navy-900 h-full" style={{ width: `${selectedRec.score_breakdown.product_category_match}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600">
                      <span>Scope Alignment (15%)</span>
                      <span className="font-mono font-bold">{selectedRec.score_breakdown.scope_match}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-navy-900 h-full" style={{ width: `${selectedRec.score_breakdown.scope_match}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600">
                      <span>Graph & References (10%)</span>
                      <span className="font-mono font-bold">{selectedRec.score_breakdown.graph_support}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-navy-900 h-full" style={{ width: `${selectedRec.score_breakdown.graph_support}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600">
                      <span>Regulatory Order (5%)</span>
                      <span className="font-mono font-bold">{selectedRec.score_breakdown.regulatory_relevance}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-navy-900 h-full" style={{ width: `${selectedRec.score_breakdown.regulatory_relevance}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Verification Link */}
              {selectedRec.source_url && (
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={selectedRec.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:underline"
                  >
                    <span>Verify from Official BIS Metadata Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select a standard recommendation to inspect evidence and explainability details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
