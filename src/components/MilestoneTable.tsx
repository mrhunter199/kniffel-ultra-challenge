import React from 'react';
import { Trophy, CheckCircle2, CircleDashed, Sparkles, Clock, Calendar } from 'lucide-react';
import { Language, MilestoneRecord } from '../types/kniffel';
import { translations } from '../i18n/translations';
import {
  THEORETICAL_STREAK_PROBABILITIES,
  formatHumanTime,
  formatNumber,
  formatRealTime,
} from '../core/kniffelEngine';

interface MilestoneTableProps {
  milestones: Record<number, MilestoneRecord>;
  lang: Language;
}

export const MilestoneTable: React.FC<MilestoneTableProps> = ({ milestones, lang }) => {
  const t = translations[lang];

  // Streaks 1 through 13
  const streakTargets = Array.from({ length: 13 }, (_, i) => i + 1);
  const goalAchieved = Boolean(milestones[13]);

  return (
    <div
      id="milestones"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
    >
      {/* Goal Banner if 13 achieved */}
      {goalAchieved && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 flex items-center gap-4">
          <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h4 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
              {t.milestones.goalBannerTitle}
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              {t.milestones.goalBannerDesc}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.milestones.title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.milestones.subtitle}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 font-semibold">{t.milestones.streakCol}</th>
              <th className="py-3 px-3 font-semibold">{t.milestones.statusCol}</th>
              <th className="py-3 px-3 font-semibold text-right">{t.milestones.gameNumCol}</th>
              <th className="py-3 px-3 font-semibold text-right">{t.milestones.realTimeCol}</th>
              <th className="py-3 px-3 font-semibold text-right">{t.milestones.humanTimeCol}</th>
              <th className="py-3 px-3 font-semibold text-right">{t.milestones.rollsCol}</th>
              <th className="py-3 px-3 font-semibold text-right">{t.milestones.oddsCol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {streakTargets.map((streak) => {
              const record = milestones[streak];
              const isAchieved = Boolean(record);
              const theoreticalP = THEORETICAL_STREAK_PROBABILITIES[streak];
              const oddsText =
                theoreticalP > 0
                  ? `1 : ${Math.round(1 / theoreticalP).toLocaleString()}`
                  : '—';

              return (
                <tr
                  key={streak}
                  className={`transition-colors ${
                    isAchieved
                      ? streak === 13
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/30'
                        : 'bg-amber-500/5 dark:bg-amber-950/10'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {/* Streak Target */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-sans font-bold">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                          isAchieved
                            ? streak === 13
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {streak}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {t.milestones.streakName(streak)} {streak === 13 ? '🏆' : ''}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap font-sans">
                    {isAchieved ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.milestones.achieved}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                        <CircleDashed className="w-3.5 h-3.5" />
                        <span>{t.milestones.pending}</span>
                      </span>
                    )}
                  </td>

                  {/* Exact Game Number */}
                  <td className="py-3 px-3 text-right tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {isAchieved ? `#${formatNumber(record.gameNumber, lang)}` : '—'}
                  </td>

                  {/* Real Stopwatch Time */}
                  <td className="py-3 px-3 text-right tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {isAchieved ? (
                      <span className="flex items-center justify-end gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatRealTime(record.realElapsedMs)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Human Playtime */}
                  <td className="py-3 px-3 text-right tabular-nums text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">
                    {isAchieved ? (
                      <span className="flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        {formatHumanTime(record.humanTimeSeconds, lang)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Rolls to Record */}
                  <td className="py-3 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {isAchieved ? formatNumber(record.totalRolls, lang) : '—'}
                  </td>

                  {/* Theoretical Odds */}
                  <td className="py-3 px-3 text-right tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {oddsText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
