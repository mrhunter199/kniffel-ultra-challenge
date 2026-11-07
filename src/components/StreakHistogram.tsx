import React, { useState } from 'react';
import { BarChart3, HelpCircle } from 'lucide-react';
import { Language } from '../types/kniffel';
import { translations } from '../i18n/translations';
import { THEORETICAL_STREAK_PROBABILITIES, formatNumber } from '../core/kniffelEngine';

interface StreakHistogramProps {
  histogram: number[];
  totalGames: number;
  lang: Language;
}

export const StreakHistogram: React.FC<StreakHistogramProps> = ({
  histogram,
  totalGames,
  lang,
}) => {
  const t = translations[lang];
  const [scaleMode, setScaleMode] = useState<'log' | 'linear'>('log');
  const [hoveredStreak, setHoveredStreak] = useState<number | null>(null);

  // Maximum value for scaling
  const maxLinear = Math.max(1, ...histogram);
  const maxLog = Math.max(1, Math.log10(maxLinear + 1));

  const getBarHeightPercent = (count: number): number => {
    if (count === 0) return 0;
    if (scaleMode === 'linear') {
      return (count / maxLinear) * 100;
    }
    // Logarithmic scale
    const val = Math.log10(count + 1);
    return Math.max(4, (val / maxLog) * 100);
  };

  return (
    <div
      id="histogram"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
    >
      {/* Title & Scale Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.histogram.title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.histogram.subtitle}
          </p>
        </div>

        {/* Scale Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">{t.histogram.scaleLabel}</span>
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setScaleMode('log')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                scaleMode === 'log'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.histogram.scaleLog}
            </button>
            <button
              onClick={() => setScaleMode('linear')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                scaleMode === 'linear'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.histogram.scaleLinear}
            </button>
          </div>
        </div>
      </div>

      {/* Main Histogram Area */}
      {totalGames === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">{t.histogram.emptyHint}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-64 flex items-end gap-1.5 sm:gap-2.5 pt-8 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
            {histogram.map((count, streak) => {
              const heightPct = getBarHeightPercent(count);
              const empiricalPct = totalGames > 0 ? (count / totalGames) * 100 : 0;
              const theoreticalP = THEORETICAL_STREAK_PROBABILITIES[streak];
              const theoreticalPct = theoreticalP * 100;
              const isHovered = hoveredStreak === streak;

              return (
                <div
                  key={streak}
                  onMouseEnter={() => setHoveredStreak(streak)}
                  onMouseLeave={() => setHoveredStreak(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-2 z-20 w-48 p-2.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-700 shadow-xl text-left text-xs pointer-events-none">
                      <div className="font-bold text-amber-400 mb-1">
                        {t.histogram.streakLabel} {streak} {streak === 13 ? '🏆 (Ziel!)' : ''}
                      </div>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t.histogram.gamesCount}:</span>
                          <span className="font-mono font-semibold">{formatNumber(count, lang)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t.histogram.frequency}:</span>
                          <span className="font-mono font-semibold">
                            {empiricalPct < 0.001 && empiricalPct > 0
                              ? `${empiricalPct.toExponential(2)}%`
                              : `${empiricalPct.toFixed(3)}%`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t.histogram.theoretical}:</span>
                          <span className="font-mono text-amber-300">
                            {theoreticalPct < 0.0001
                              ? `${theoreticalPct.toExponential(2)}%`
                              : `${theoreticalPct.toFixed(3)}%`}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800">
                          <span className="text-slate-400">{t.histogram.odds}:</span>
                          <span className="font-mono text-emerald-400">
                            {theoreticalP > 0 ? `1 : ${Math.round(1 / theoreticalP).toLocaleString()}` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Count indicator on top of bar */}
                  <div
                    className={`text-[10px] font-mono tabular-nums mb-1 transition-opacity ${
                      count > 0 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 opacity-40'
                    }`}
                  >
                    {count >= 1000000
                      ? `${(count / 1000000).toFixed(1)}M`
                      : count >= 1000
                      ? `${(count / 1000).toFixed(0)}k`
                      : count}
                  </div>

                  {/* Histogram Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-150 ${
                      streak === 13
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20'
                        : count > 0
                        ? isHovered
                          ? 'bg-amber-400 dark:bg-amber-400'
                          : 'bg-amber-500 dark:bg-amber-500/90'
                        : 'bg-slate-200 dark:bg-slate-800/60 min-h-[2px]'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels: 0 through 13 */}
          <div className="flex gap-1.5 sm:gap-2.5 px-2">
            {histogram.map((_, streak) => (
              <div
                key={streak}
                className={`flex-1 text-center font-mono text-xs font-semibold ${
                  hoveredStreak === streak
                    ? 'text-amber-500 font-bold scale-110'
                    : streak === 13
                    ? 'text-emerald-500'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {streak}
              </div>
            ))}
          </div>

          {/* Legend & Explanatory Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span>Empirisch simulierte Partien</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span>Zielserie (13 Kniffel in Folge)</span>
              </div>
            </div>
            <div className="text-[11px] italic">
              {t.histogram.scaleDesc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
