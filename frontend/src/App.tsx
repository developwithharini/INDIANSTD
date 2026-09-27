import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { ProcessingState } from './components/ProcessingState';
import { ResultsView } from './components/ResultsView';
import { analyzeRequirement } from './services/api';
import { AnalysisResponse } from './types';

type UIState = 'INPUT' | 'PROCESSING' | 'RESULTS';

export function App() {
  const [uiState, setUiState] = useState<UIState>('INPUT');
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async (text?: string, title?: string, file?: File) => {
    setUiState('PROCESSING');
    setErrorMsg(null);

    try {
      const data = await analyzeRequirement(text, title, file);
      setAnalysisData(data);
      setUiState('RESULTS');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Analysis failed. Please check backend connection.');
      setUiState('INPUT');
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setErrorMsg(null);
    setUiState('INPUT');
  };

  const handleRefine = (refinedText: string) => {
    setAnalysisData(null);
    setUiState('INPUT');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* Top Brand Navbar */}
      <header className="max-w-4xl mx-auto flex items-center justify-between pb-6 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-navy-900 text-white font-mono font-bold text-xs flex items-center justify-center">
            M
          </div>
          <div>
            <span className="text-sm font-bold text-navy-900 tracking-tight font-mono">MANAK</span>
            <span className="text-xs text-slate-500 block">Indian Standards Recommendation Engine</span>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-400">
          v1.0 • BIS Corpus Snapshot
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto">
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-xs font-mono flex items-center justify-between">
            <span>⚠ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold">✕</button>
          </div>
        )}

        {uiState === 'INPUT' && <InputSection onAnalyze={handleAnalyze} />}
        {uiState === 'PROCESSING' && <ProcessingState />}
        {uiState === 'RESULTS' && analysisData && (
          <ResultsView
            data={analysisData}
            onNewAnalysis={handleNewAnalysis}
            onRefine={handleRefine}
          />
        )}
      </main>

      {/* Quiet Technical Footer */}
      <footer className="max-w-4xl mx-auto mt-16 pt-6 border-t border-slate-200 text-center text-xs font-mono text-slate-400">
        MANAK Procurement Workspace • Hybrid Lexical + Dense Standards Search
      </footer>
    </div>
  );
}

export default App;
