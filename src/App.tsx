import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { SimulationControls } from './components/SimulationControls';
import { DiceArena } from './components/DiceArena';
import { StreakHistogram } from './components/StreakHistogram';
import { MilestoneTable } from './components/MilestoneTable';
import { ProbabilityExplainer } from './components/ProbabilityExplainer';
import { Language, RollStep, SimulationStats, WorkerOutMessage } from './types/kniffel';

const INITIAL_STATS: SimulationStats = {
  totalGames: 0,
  totalRolls: 0,
  histogram: new Array(14).fill(0),
  highestStreak: 0,
  milestones: {},
  realElapsedMs: 0,
  isRunning: false,
  speed: 4,
  batchSize: 100,
  rollsPerSec: 0,
  gamesPerSec: 0,
  lastActiveRoll: {
    dice: [1, 2, 3, 4, 5],
    keptIndices: [0],
    targetValue: 5,
    rollNumber: 1,
    isKniffel: false,
    roundNumber: 1,
    currentStreak: 0,
  },
};

export default function App() {
  const [lang, setLang] = useState<Language>('de');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [stats, setStats] = useState<SimulationStats>(INITIAL_STATS);

  const workerRef = useRef<Worker | null>(null);

  // Sync theme class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initialize Web Worker
  useEffect(() => {
    const worker = new Worker(
      new URL('./workers/simulation.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const { type, payload } = event.data;

      if (type === 'TICK') {
        const delta = payload.batchRolls ?? payload.rollsDelta ?? 0;
        setStats((prev) => {
          const newTotalRolls =
            payload.totalRolls !== undefined ? payload.totalRolls : prev.totalRolls + delta;
          return {
            ...prev,
            totalGames: payload.totalGames,
            totalRolls: newTotalRolls,
            histogram: payload.histogram,
            highestStreak: payload.highestStreak,
            milestones: payload.milestones,
            realElapsedMs: payload.realElapsedMs,
            rollsPerSec: payload.rollsPerSec,
            gamesPerSec: payload.gamesPerSec,
            lastActiveRoll: payload.visualRoll || prev.lastActiveRoll,
            activeGamesCount: payload.activeGamesCount,
          };
        });
      } else if (type === 'NEW_RECORD') {
        setStats((prev) => ({
          ...prev,
          milestones: {
            ...prev.milestones,
            [payload.streak]: payload,
          },
          highestStreak: Math.max(prev.highestStreak, payload.streak),
        }));
      } else if (type === 'GOAL_REACHED') {
        // Milestone 13 reached!
        setStats((prev) => ({
          ...prev,
          highestStreak: 13,
          milestones: {
            ...prev.milestones,
            13: payload.milestone,
          },
        }));
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (!workerRef.current) return;
    if (stats.isRunning) {
      workerRef.current.postMessage({ type: 'PAUSE' });
      setStats((prev) => ({ ...prev, isRunning: false }));
    } else {
      workerRef.current.postMessage({ type: 'START' });
      setStats((prev) => ({ ...prev, isRunning: true }));
    }
  }, [stats.isRunning]);

  const handleReset = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'RESET' });
    setStats({
      ...INITIAL_STATS,
      speed: stats.speed,
      batchSize: stats.batchSize,
    });
  }, [stats.speed, stats.batchSize]);

  const handleSingleStep = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'SINGLE_STEP' });
  }, []);

  const handleChangeBatchSize = useCallback((size: number) => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'SET_BATCH_SIZE', payload: size });
    setStats((prev) => ({ ...prev, batchSize: size }));
  }, []);

  const handleChangeSpeed = useCallback((speedVal: number) => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'SET_SPEED', payload: speedVal });
    setStats((prev) => ({ ...prev, speed: speedVal }));
  }, []);

  const handleToggleLang = useCallback(() => {
    setLang((prev) => (prev === 'de' ? 'en' : 'de'));
  }, []);

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics Ribbon */}
        <section aria-label="Key Performance Indicators">
          <MetricsBar stats={stats} lang={lang} />
        </section>

        {/* Simulation Execution & Slider Controls */}
        <section aria-label="Simulation Controls">
          <SimulationControls
            isRunning={stats.isRunning}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            onSingleStep={handleSingleStep}
            batchSize={stats.batchSize}
            onChangeBatchSize={handleChangeBatchSize}
            speed={stats.speed}
            onChangeSpeed={handleChangeSpeed}
            lang={lang}
          />
        </section>

        {/* Live Dice Board & Round Stage */}
        <section aria-label="Live Dice Board">
          <DiceArena
            rollStep={stats.lastActiveRoll}
            speed={stats.speed}
            isRunning={stats.isRunning}
            lang={lang}
          />
        </section>

        {/* Histogram of Streaks 0 to 13 */}
        <section aria-label="Streak Histogram">
          <StreakHistogram
            histogram={stats.histogram}
            totalGames={stats.totalGames}
            lang={lang}
          />
        </section>

        {/* Milestone Records Table */}
        <section aria-label="Milestones Table">
          <MilestoneTable milestones={stats.milestones} lang={lang} />
        </section>

        {/* Probability and Mathematical Explainer */}
        <section aria-label="Stochastic Foundations">
          <ProbabilityExplainer lang={lang} />
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Kniffel Streak Simulator
            </span>
            <span>·</span>
            <span>Web Worker Threading & Monte-Carlo Stochastik</span>
          </div>
          <div className="text-[11px] text-slate-400">
            6s / Wurf am Tisch · Strikte Greedy-Strategie · 60 FPS Zwischenstände
          </div>
        </div>
      </footer>
    </div>
  );
}
