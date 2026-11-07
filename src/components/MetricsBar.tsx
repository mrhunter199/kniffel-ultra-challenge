import React from 'react';
import { Clock, Flame, Hourglass, PlayCircle, Zap, Dna } from 'lucide-react';
import { Language, SimulationStats } from '../types/kniffel';
import { translations } from '../i18n/translations';
import { formatHumanTime, formatNumber, formatRealTime } from '../core/kniffelEngine';

interface MetricsBarProps {
  stats: SimulationStats;
  lang: Language;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ stats, lang }) => {
  const t = translations[lang];

  const humanTimeStr = formatHumanTime(stats.totalRolls * 6, lang);
  const realTimeStr = formatRealTime(stats.realElapsedMs);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 items-stretch">
      {/* 1. Total Games */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[112px]">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider truncate">{t.metrics.totalGames}</span>
          <PlayCircle className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white whitespace-nowrap truncate">
            {formatNumber(stats.totalGames, lang)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap truncate">
            {stats.gamesPerSec > 0 ? `+${formatNumber(stats.gamesPerSec, lang)} /s` : '—'}
          </div>
        </div>
      </div>

      {/* 2. Total Rolls */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[112px]">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider truncate">{t.metrics.totalRolls}</span>
          <Dna className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white whitespace-nowrap truncate">
            {formatNumber(stats.totalRolls, lang)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap truncate">
            {stats.rollsPerSec > 0 ? `+${formatNumber(stats.rollsPerSec, lang)} /s` : '—'}
          </div>
        </div>
      </div>

      {/* 3. Human Playtime (@ 6s / Roll) */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-amber-500/10 dark:from-amber-950/20 dark:to-slate-900 border border-amber-200 dark:border-amber-900/40 shadow-sm flex flex-col justify-between h-full min-h-[112px] relative overflow-hidden">
        <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider truncate">{t.metrics.humanTime}</span>
          <Hourglass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 ml-1" />
        </div>
        <div>
          <div
            title={`${stats.totalRolls * 6} Sekunden`}
            className="text-base sm:text-lg font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 leading-snug whitespace-nowrap truncate"
          >
            {humanTimeStr}
          </div>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-400/70 mt-0.5 whitespace-nowrap truncate" title={t.metrics.humanTimeSub}>
            {t.metrics.humanTimeSub}
          </div>
        </div>
      </div>

      {/* 4. Real Simulation Elapsed Time */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[112px]">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider truncate">{t.metrics.realTime}</span>
          <Clock className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white whitespace-nowrap truncate">
            {realTimeStr}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap truncate">
            Stoppuhr
          </div>
        </div>
      </div>

      {/* 5. Highest Streak */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[112px]">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider truncate">{t.metrics.highestStreak}</span>
          <Flame className="w-4 h-4 text-rose-500 shrink-0 ml-1" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {stats.highestStreak}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 13</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap truncate">
            {stats.highestStreak === 13 ? (
              <span className="text-emerald-500 font-semibold">13/13 Geknackt!</span>
            ) : (
              `Ziel: 13 Kniffel in Serie`
            )}
          </div>
        </div>
      </div>

      {/* 6. Live Throughput */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[112px]">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider truncate">{t.metrics.throughput}</span>
          <Zap className="w-4 h-4 text-amber-500 shrink-0 ml-1" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white whitespace-nowrap truncate">
            {formatNumber(stats.rollsPerSec, lang)}
            <span className="text-xs font-normal text-slate-400 ml-1">W/s</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap truncate">
            {formatNumber(stats.gamesPerSec, lang)} Spiele/s
          </div>
        </div>
      </div>
    </div>
  );
};
