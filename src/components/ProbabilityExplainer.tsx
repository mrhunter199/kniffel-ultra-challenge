import React from 'react';
import { BookOpen, Calculator, Clock, Dices } from 'lucide-react';
import { Language } from '../types/kniffel';
import { translations } from '../i18n/translations';

interface ProbabilityExplainerProps {
  lang: Language;
}

export const ProbabilityExplainer: React.FC<ProbabilityExplainerProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div
      id="explainer"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-amber-500" />
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {t.explainer.title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Greedy Strategy */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Dices className="w-4 h-4" />
            <span>{t.explainer.strategyHeading}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.explainer.strategyText}
          </p>
        </div>

        {/* 2. Theory & Odds */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>{t.explainer.theoryHeading}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.explainer.theoryText}
          </p>
        </div>

        {/* 3. Human Playtime */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>{t.explainer.humanHeading}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.explainer.humanText}
          </p>
        </div>
      </div>
    </div>
  );
};
