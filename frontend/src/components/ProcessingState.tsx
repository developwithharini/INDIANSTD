import React from 'react';

export const ProcessingState: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-bold text-navy-900 font-mono">Analyzing requirement…</h3>
        <div className="space-y-1 text-xs text-slate-500 font-mono">
          <p className="text-slate-700 font-medium">✓ Understanding requirement structure</p>
          <p className="text-slate-600">Finding relevant standards in corpus…</p>
          <p className="text-slate-400">Ranking matches & scoring applicability…</p>
        </div>
      </div>
    </div>
  );
};
