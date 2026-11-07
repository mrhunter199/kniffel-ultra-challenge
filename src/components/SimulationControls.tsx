import React from 'react';
import { Play, Pause, RotateCcw, StepForward, Gauge, Layers, Info } from 'lucide-react';
import { Language } from '../types/kniffel';
import { translations } from '../i18n/translations';

interface SimulationControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onSingleStep: () => void;
  batchSize: number;
  onChangeBatchSize: (val: number) => void;
  speed: number;
  onChangeSpeed: (val: number) => void;
  lang: Language;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  onSingleStep,
  batchSize,
  onChangeBatchSize,
  speed,
  onChangeSpeed,
  lang,
}) => {
  const t = translations[lang];

  const batchPresets = [1, 25, 100, 500, 1000];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-5">
        {/* Left: Execution Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onTogglePlay}
            className={`px-4 sm:px-5 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white shrink-0" />
                <span>{t.pause}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white shrink-0" />
                <span>{t.start}</span>
              </>
            )}
          </button>

          <button
            onClick={onSingleStep}
            disabled={isRunning}
            title={t.singleStep}
            className="px-3 sm:px-3.5 py-3 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <StepForward className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{t.singleStep}</span>
          </button>

          <button
            onClick={onReset}
            title={t.reset}
            className="px-3 sm:px-3.5 py-3 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 dark:hover:border-rose-900 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>{t.reset}</span>
          </button>
        </div>

        {/* Center: Speed Slider (Levels 1 to 5) */}
        <div className="flex-1 min-w-[260px] bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500 shrink-0" />
              <label htmlFor="speed-slider" className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                {t.speed}:
              </label>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                {t.speedLevels[speed - 1]}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono shrink-0">
              {speed <= 3 ? 'Animiert' : 'Turbo MC'}
            </span>
          </div>

          <input
            id="speed-slider"
            type="range"
            min={1}
            max={5}
            step={1}
            value={speed}
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 dark:text-slate-400">
            <span>1 (Slow)</span>
            <span>2 (Medium)</span>
            <span>3 (Fast)</span>
            <span className="font-semibold text-amber-500">4 (Turbo)</span>
            <span className="font-semibold text-rose-500">5 (Hyper)</span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{t.speedDescriptions[speed - 1]}</span>
          </div>
        </div>

        {/* Right: Batch Size Slider (1 to 1000) */}
        <div className="w-full lg:w-64 xl:w-72 shrink-0 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
              <label htmlFor="batch-slider" className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                {t.batchSize}:
              </label>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {batchSize}
            </span>
          </div>

          <input
            id="batch-slider"
            type="range"
            min={1}
            max={1000}
            step={1}
            value={batchSize}
            onChange={(e) => onChangeBatchSize(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />

          {/* Quick Preset Buttons */}
          <div className="flex items-center justify-between gap-1 mt-2">
            {batchPresets.map((p) => (
              <button
                key={p}
                onClick={() => onChangeBatchSize(p)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
                  batchSize === p
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
