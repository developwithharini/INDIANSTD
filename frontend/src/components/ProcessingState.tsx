import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const ProcessingState: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-bold text-navy-900 font-mono">
          {t('input.analyzingButton')}
        </h3>
        <div className="space-y-1 text-xs text-slate-500 font-mono">
          <p className="text-slate-700 font-medium">✓ {t('processing.step1')}</p>
          <p className="text-slate-600">{t('processing.step2')}</p>
          <p className="text-slate-400">{t('processing.step3')}</p>
        </div>
      </div>
    </div>
  );
};
