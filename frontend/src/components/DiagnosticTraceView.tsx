import React, { useState, useEffect } from 'react';
import { DiagnosticTrace, RecommendationItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface DiagnosticTraceViewProps {
  analysisId: string;
  onClose?: () => void;
  onViewEvidence?: (item: RecommendationItem) => void;
}

export const DiagnosticTraceView: React.FC<DiagnosticTraceViewProps> = ({
  analysisId,
  onClose,
  onViewEvidence
}) => {
  const { t } = useLanguage();
  const [trace, setTrace] = useState<DiagnosticTrace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'QUERY' | 'EXTRACTION' | 'BM25' | 'BGE-M3' | 'FUSION' | 'RERANKER' | 'APPLICABILITY' | 'DECISION'>('DECISION');

  useEffect(() => {
    fetchTrace();
  }, [analysisId]);

  const fetchTrace = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/analyses/${analysisId}/trace?debug=true`);
      if (!res.ok) {
        throw new Error(`Failed to load diagnostic trace (${res.status})`);
      }
      const data = await res.json();
      setTrace(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching diagnostic trace');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTrace = () => {
    if (!trace) return;
    const blob = new Blob([JSON.stringify(trace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manak_trace_${analysisId}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-slate-100 rounded-xl p-8 border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-300">Loading Diagnostic Trace for {analysisId}...</span>
        </div>
      </div>
    );
  }

  if (error || !trace) {
    return (
      <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-amber-950 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-400">{t('trace.title')}</h3>
          {onClose && (
            <button onClick={onClose} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
          )}
        </div>
        <p className="text-xs text-amber-300/80">{error || t('errors.traceUnavailable')}</p>
        <button onClick={fetchTrace} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded">{t('common.retry')}</button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl overflow-hidden font-mono space-y-0">
      {/* Dev Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase bg-indigo-900/80 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded">
              {t('trace.title')}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              ID: {trace.analysis_id}
            </span>
            <span className="text-[10px] text-slate-500">
              {trace.timestamp}
            </span>
          </div>
          <h3 className="text-xs text-slate-300 font-bold truncate max-w-xl font-sans">
            Query: "{trace.query}"
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTrace}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 px-3 py-1.5 rounded transition-all"
          >
            [{t('trace.export')}]
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Latency & Metadata Summary Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
        <div>{t('trace.totalTime')}: <span className="text-emerald-400 font-bold">{trace.timing.total_ms}ms</span></div>
        <div>Extraction: <span className="text-slate-200">{trace.timing.extraction_ms}ms</span></div>
        <div>BM25: <span className="text-slate-200">{trace.timing.bm25_ms}ms</span></div>
        <div>Dense ({trace.dense.model}): <span className="text-slate-200">{trace.timing.dense_ms}ms</span></div>
        <div>Reranker ({trace.reranker.model}): <span className="text-slate-200">{trace.timing.reranker_ms}ms</span></div>
        <div>Applicability: <span className="text-slate-200">{trace.timing.applicability_ms}ms</span></div>
      </div>

      {/* Diagnostic Stage Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 overflow-x-auto">
        {(['DECISION', 'QUERY', 'EXTRACTION', 'BM25', 'BGE-M3', 'FUSION', 'RERANKER', 'APPLICABILITY'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panel Content */}
      <div className="p-5 max-h-[500px] overflow-y-auto space-y-4">
        {/* DECISION TAB */}
        {activeTab === 'DECISION' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-slate-500">{t('trace.decisionState')}</span>
                <div className="text-xs font-bold text-emerald-400">
                  {trace.decision.decision_state}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-slate-500">{t('trace.scoreMargin')}</span>
                <div className="text-xs font-bold text-indigo-300">
                  {trace.decision.top_score} / {trace.decision.second_best_score} (Margin: {trace.decision.score_margin})
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-slate-500">{t('trace.primaryFailure')}</span>
                <div className={`text-xs font-bold ${
                  trace.decision.primary_suspected_failure_stage === 'NO_FAILURE_OBSERVED' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {trace.decision.primary_suspected_failure_stage}
                </div>
              </div>
            </div>

            {trace.decision.is_abstained && (
              <div className="bg-amber-950/40 border border-amber-800/80 p-4 rounded-lg space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400">{t('trace.abstentionReason')}</span>
                <p className="text-xs text-amber-200/90 font-sans">{trace.decision.abstention_reason}</p>
              </div>
            )}

            {trace.decision.diagnostic_flags.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-slate-500">{t('trace.heuristicFlags')}</span>
                <div className="flex flex-wrap gap-2">
                  {trace.decision.diagnostic_flags.map((flag, idx) => (
                    <span key={idx} className="text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700 px-2 py-0.5 rounded">
                      ⚠️ {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUERY TAB */}
        {activeTab === 'QUERY' && (
          <div className="space-y-3 text-xs">
            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">{t('trace.inputQuery')}</span>
              <div className="text-slate-200 font-bold font-sans">{trace.query}</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">{t('trace.normalizedFocus')}</span>
              <div className="text-indigo-300 font-bold font-sans">{trace.normalized_query}</div>
            </div>
          </div>
        )}

        {/* EXTRACTION TAB */}
        {activeTab === 'EXTRACTION' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">{t('requirement.product')}</span>
                <div className="text-slate-200 font-bold font-sans">{trace.requirement_extraction.product}</div>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">{t('requirement.category')}</span>
                <div className="text-slate-200 font-bold font-sans">{trace.requirement_extraction.category || 'N/A'}</div>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">{t('requirement.application')}</span>
                <div className="text-slate-200 font-bold font-sans">{trace.requirement_extraction.application || 'N/A'}</div>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">{t('requirement.environment')}</span>
                <div className="text-slate-200 font-bold font-sans">{trace.requirement_extraction.environment || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* BM25 TAB */}
        {activeTab === 'BM25' && (
          <div className="space-y-2 text-xs">
            <div className="text-[10px] text-slate-500">{t('trace.bm25Candidates')}</div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                  <th className="py-1">{t('trace.rank')}</th>
                  <th className="py-1">{t('trace.standard')}</th>
                  <th className="py-1">{t('trace.titleCol')}</th>
                  <th className="py-1">{t('trace.bm25Score')}</th>
                </tr>
              </thead>
              <tbody>
                {trace.bm25.results.map((c) => (
                  <tr key={c.standard_id} className="border-b border-slate-900 hover:bg-slate-900/60">
                    <td className="py-1.5 text-slate-400">#{c.rank}</td>
                    <td className="py-1.5 font-bold text-indigo-300">{c.standard_number}</td>
                    <td className="py-1.5 text-slate-300 truncate max-w-xs font-sans">{c.title}</td>
                    <td className="py-1.5 text-emerald-400">{c.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BGE-M3 TAB */}
        {activeTab === 'BGE-M3' && (
          <div className="space-y-2 text-xs">
            <div className="text-[10px] text-slate-500">{t('trace.denseCandidates')}</div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                  <th className="py-1">{t('trace.rank')}</th>
                  <th className="py-1">{t('trace.standard')}</th>
                  <th className="py-1">{t('trace.titleCol')}</th>
                  <th className="py-1">{t('trace.similarity')}</th>
                </tr>
              </thead>
              <tbody>
                {trace.dense.results.map((c) => (
                  <tr key={c.standard_id} className="border-b border-slate-900 hover:bg-slate-900/60">
                    <td className="py-1.5 text-slate-400">#{c.rank}</td>
                    <td className="py-1.5 font-bold text-indigo-300">{c.standard_number}</td>
                    <td className="py-1.5 text-slate-300 truncate max-w-xs font-sans">{c.title}</td>
                    <td className="py-1.5 text-emerald-400">{c.similarity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FUSION TAB */}
        {activeTab === 'FUSION' && (
          <div className="space-y-2 text-xs">
            <div className="text-[10px] text-slate-500">Reciprocal Rank Fusion (RRF) Candidates</div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                  <th className="py-1">{t('trace.fusedRank')}</th>
                  <th className="py-1">{t('trace.standard')}</th>
                  <th className="py-1">BM25 {t('trace.rank')}</th>
                  <th className="py-1">Dense {t('trace.rank')}</th>
                  <th className="py-1">{t('evidence.source')}</th>
                </tr>
              </thead>
              <tbody>
                {trace.fusion.results.map((c) => (
                  <tr key={c.standard_id} className="border-b border-slate-900 hover:bg-slate-900/60">
                    <td className="py-1.5 text-slate-400">#{c.fusion_rank}</td>
                    <td className="py-1.5 font-bold text-indigo-300">{c.standard_number}</td>
                    <td className="py-1.5 text-slate-400">{c.bm25_rank ? `#${c.bm25_rank}` : '-'}</td>
                    <td className="py-1.5 text-slate-400">{c.dense_rank ? `#${c.dense_rank}` : '-'}</td>
                    <td className="py-1.5">
                      {c.retrieved_by.map(s => (
                        <span key={s} className="text-[9px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded mr-1 uppercase">
                          {s}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RERANKER TAB */}
        {activeTab === 'RERANKER' && (
          <div className="space-y-2 text-xs">
            <div className="text-[10px] text-slate-500">{t('trace.rerankerMovements')}</div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                  <th className="py-1">{t('trace.postRank')}</th>
                  <th className="py-1">{t('trace.preRank')}</th>
                  <th className="py-1">{t('trace.standard')}</th>
                  <th className="py-1">{t('trace.rerankScore')}</th>
                  <th className="py-1">{t('trace.delta')}</th>
                </tr>
              </thead>
              <tbody>
                {trace.reranker.results.map((c) => (
                  <tr key={c.standard_id} className="border-b border-slate-900 hover:bg-slate-900/60">
                    <td className="py-1.5 font-bold text-slate-200">#{c.reranker_rank}</td>
                    <td className="py-1.5 text-slate-500">#{c.pre_rerank_rank}</td>
                    <td className="py-1.5 font-bold text-indigo-300">{c.standard_number}</td>
                    <td className="py-1.5 text-emerald-400">{c.reranker_score}</td>
                    <td className="py-1.5 font-bold">
                      {c.rank_change > 0 ? (
                        <span className="text-emerald-400">+{c.rank_change} ↑</span>
                      ) : c.rank_change < 0 ? (
                        <span className="text-rose-400">{c.rank_change} ↓</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* APPLICABILITY TAB */}
        {activeTab === 'APPLICABILITY' && (
          <div className="space-y-3 text-xs">
            {trace.applicability.results.map((c) => (
              <div key={c.standard_id} className="bg-slate-900 p-3 rounded border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-300">{c.standard_number}</span>
                    <span className="text-slate-400 truncate max-w-xs font-sans">{c.title}</span>
                  </div>
                  <span className="font-bold text-emerald-400">{t('results.applicabilityScore')}: {c.calibrated_score} / 100</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 bg-slate-950 p-2 rounded">
                  <div>Semantic: <span className="text-slate-200">{c.semantic_similarity}</span></div>
                  <div>Lexical: <span className="text-slate-200">{c.lexical_relevance}</span></div>
                  <div>Product: <span className="text-slate-200">{c.product_match}</span></div>
                  <div>Scope: <span className="text-slate-200">{c.scope_match}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
