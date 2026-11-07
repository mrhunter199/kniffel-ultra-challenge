import React from 'react';
import { Dice5, Moon, Sun, Globe } from 'lucide-react';
import { Language } from '../types/kniffel';
import { translations } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  isDark,
  onToggleTheme,
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand: Logo + Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Dice5 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <a
              href="/"
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {t.title}
            </a>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
              Monte-Carlo · 13 Kniffel-Streak
            </span>
          </div>
        </div>

        {/* Actions: Sprachwahl + Light-/Darkmode */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            aria-label="Toggle language"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="uppercase font-mono">{lang}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};

