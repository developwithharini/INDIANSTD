import React, { useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { Header } from './components/Header';
import { CinematicHero } from './components/cinematic/CinematicHero';
import { ScrollStory } from './components/cinematic/ScrollStory';
import { InputSection } from './components/InputSection';
import { ProcessingState } from './components/ProcessingState';
import { ResultsView } from './components/ResultsView';
import { analyzeRequirement } from './services/api';
import { AnalysisResponse } from './types';

type UIState = 'INPUT' | 'PROCESSING' | 'RESULTS';

export function AppContent() {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Brand Navbar with Language Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Header />
      </div>

      {/* Main Content Area */}
      <main className="w-full">
        {errorMsg && (
          <div className="max-w-4xl mx-auto my-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-xs font-mono flex items-center justify-between">
            <span>⚠ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold">✕</button>
          </div>
        )}

        {uiState === 'INPUT' && (
          <div className="space-y-8 pb-12">
            <CinematicHero
              onAnalyze={(text) => handleAnalyze(text)}
              onFileUpload={(file) => handleAnalyze(undefined, undefined, file)}
              isLoading={false}
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <InputSection onAnalyze={handleAnalyze} />
            </div>
            <ScrollStory />
          </div>
        )}

        {uiState === 'PROCESSING' && (
          <div className="max-w-4xl mx-auto py-12 px-4">
            <ProcessingState />
          </div>
        )}

        {uiState === 'RESULTS' && analysisData && (
          <div className="max-w-6xl mx-auto py-8 px-4">
            <ResultsView
              data={analysisData}
              onNewAnalysis={handleNewAnalysis}
              onRefine={handleRefine}
            />
          </div>
        )}
      </main>

      {/* Quiet Technical Footer */}
      <footer className="max-w-7xl mx-auto py-8 px-4 border-t border-slate-200 text-center text-xs font-mono text-slate-400">
        MANAK Procurement Workspace • Department of Consumer Affairs (DoCA) • Bureau of Indian Standards (BIS)
      </footer>
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
