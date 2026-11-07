import React from 'react';
import { Lock, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DiceValue, Language, RollStep } from '../types/kniffel';
import { translations } from '../i18n/translations';

interface DiceArenaProps {
  rollStep?: RollStep;
  speed: number;
  isRunning: boolean;
  lang: Language;
}

// 3x3 pip positions for standard dice faces
const PIP_CONFIG: Record<DiceValue, boolean[][]> = {
  1: [
    [false, false, false],
    [false, true, false],
    [false, false, false],
  ],
  2: [
    [true, false, false],
    [false, false, false],
    [false, false, true],
  ],
  3: [
    [true, false, false],
    [false, true, false],
    [false, false, true],
  ],
  4: [
    [true, false, true],
    [false, false, false],
    [true, false, true],
  ],
  5: [
    [true, false, true],
    [false, true, false],
    [true, false, true],
  ],
  6: [
    [true, false, true],
    [true, false, true],
    [true, false, true],
  ],
};

const DieFace: React.FC<{
  value: DiceValue;
  isKept: boolean;
  isTarget: boolean;
  rollNumber: number;
  keptBadgeText: string;
  rolledBadgeText: string;
}> = ({ value, isKept, keptBadgeText, rolledBadgeText }) => {
  const pips = PIP_CONFIG[value] || PIP_CONFIG[1];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 select-none shadow-md ${
          isKept
            ? 'bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/60 dark:to-amber-900/60 border-2 border-amber-500 shadow-amber-500/20 scale-105'
            : 'bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-300 dark:border-slate-700'
        }`}
      >
        {/* Subtle 3D top shine */}
        <div className="absolute inset-x-2 top-1 h-2 rounded-t-xl bg-white/40 pointer-events-none" />

        {/* 3x3 Grid of Pips */}
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-1 items-center justify-items-center">
          {pips.map((row, rIdx) =>
            row.map((active, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-transform ${
                  active
                    ? isKept
                      ? 'bg-amber-600 dark:bg-amber-400 shadow-inner'
                      : 'bg-slate-800 dark:bg-slate-200 shadow-inner'
                    : 'opacity-0'
                }`}
              />
            ))
          )}
        </div>

        {/* Kept Lock Badge */}
        {isKept && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1 shadow-sm">
            <Lock className="w-3 h-3" />
          </div>
        )}
      </div>

      <div className="text-center">
        <span
          className={`text-[11px] font-semibold tracking-wide ${
            isKept
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {isKept ? keptBadgeText : rolledBadgeText}
        </span>
      </div>
    </div>
  );
};

export const DiceArena: React.FC<DiceArenaProps> = ({
  rollStep,
  speed,
  isRunning,
  lang,
}) => {
  const t = translations[lang];

  // Default fallback dice if not started
  const dice = rollStep?.dice || [1, 2, 3, 4, 5];
  const keptIndices = new Set(rollStep?.keptIndices || []);
  const targetValue = rollStep?.targetValue || 6;
  const rollNumber = rollStep?.rollNumber || 1;
  const isKniffel = rollStep?.isKniffel || false;
  const roundNumber = rollStep?.roundNumber || 1;
  const currentStreak = rollStep?.currentStreak || 0;
  const valLabel = t.arena.targetDice;

  return (
    <div
      id="arena"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden relative"
    >
      {/* Header bar of Arena */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold font-mono">
            {roundNumber}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t.arena.activeGame}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                · {t.arena.round} {roundNumber} / 13
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.arena.greedyNotice}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Roll Counter Indicator (1, 2, 3) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {t.arena.roll}:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((r) => (
                <div
                  key={r}
                  className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                    rollNumber === r
                      ? 'bg-amber-500 text-white shadow-sm'
                      : rollNumber > r
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      : 'text-slate-400'
                  }`}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* Parallel Active Games in Batch */}
          {rollStep?.activeGamesCount !== undefined && (rollStep?.batchSize ?? 1) > 1 && (
            <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center gap-1.5">
              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
                {lang === 'de' ? 'Aktiv im Batch:' : 'Active in Batch:'}
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300">
                {rollStep.activeGamesCount} / {rollStep.batchSize}
              </span>
            </div>
          )}

          {/* Current Streak Badge */}
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5">
            <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Streak:</span>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-300">
              {currentStreak}
            </span>
          </div>
        </div>
      </div>

      {/* Dice Table Stage */}
      <div className="py-8 px-4 flex flex-col items-center justify-center min-h-[180px] bg-slate-50 dark:bg-slate-950/50 rounded-xl my-4 border border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {dice.map((val, idx) => (
            <DieFace
              key={idx}
              value={val}
              isKept={keptIndices.has(idx)}
              isTarget={val === targetValue}
              rollNumber={rollNumber}
              keptBadgeText={t.arena.keptBadge}
              rolledBadgeText={t.arena.rolledBadge}
            />
          ))}
        </div>

        {/* Outcome Notification */}
        <div className="mt-6 flex items-center justify-center">
          {isKniffel ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span>{t.arena.kniffelSuccess} ({valLabel}: [{targetValue}])</span>
            </div>
          ) : rollNumber === 3 ? (
            <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{t.arena.roundFailed}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{t.arena.targetDice}:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
                [{targetValue}]
              </span>
              <span>· {t.arena.keptRollSummary(keptIndices.size, 5 - keptIndices.size)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status note for Speed 4 & 5 */}
      {speed >= 4 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t.arena.turboNotice}</span>
        </div>
      )}
    </div>
  );
};
