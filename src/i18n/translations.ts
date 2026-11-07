import { Language } from '../types/kniffel';

export interface Translations {
  title: string;
  subtitle: string;
  start: string;
  pause: string;
  resume: string;
  reset: string;
  singleStep: string;
  running: string;
  paused: string;
  idle: string;
  batchSize: string;
  batchTooltip: string;
  speed: string;
  speedLevels: [string, string, string, string, string];
  speedDescriptions: [string, string, string, string, string];
  metrics: {
    totalGames: string;
    totalRolls: string;
    humanTime: string;
    humanTimeSub: string;
    realTime: string;
    highestStreak: string;
    throughput: string;
    gamesPerSec: string;
    rollsPerSec: string;
  };
  arena: {
    activeGame: string;
    round: string;
    roll: string;
    targetDice: string;
    keptDice: string;
    rerollDice: string;
    keptBadge: string;
    rolledBadge: string;
    kniffelSuccess: string;
    roundFailed: string;
    greedyNotice: string;
    liveVisualNotice: string;
    turboNotice: string;
    keptRollSummary: (kept: number, reroll: number) => string;
  };
  histogram: {
    title: string;
    subtitle: string;
    streakLabel: string;
    gamesCount: string;
    frequency: string;
    theoretical: string;
    scaleLabel: string;
    scaleLog: string;
    scaleLinear: string;
    scaleDesc: string;
    emptyHint: string;
    odds: string;
  };
  milestones: {
    title: string;
    subtitle: string;
    streakCol: string;
    streakName: (streak: number) => string;
    gameNumCol: string;
    realTimeCol: string;
    humanTimeCol: string;
    rollsCol: string;
    oddsCol: string;
    statusCol: string;
    achieved: string;
    pending: string;
    recordBadge: string;
    goalBannerTitle: string;
    goalBannerDesc: string;
  };
  explainer: {
    title: string;
    theoryHeading: string;
    theoryText: string;
    humanHeading: string;
    humanText: string;
    strategyHeading: string;
    strategyText: string;
  };
}

export const translations: Record<Language, Translations> = {
  de: {
    title: 'Kniffel Streak Simulator',
    subtitle: 'Monte-Carlo-Simulation von 13 aufeinanderfolgenden Kniffeln mit Greedy-Strategie',
    start: 'Simulation starten',
    pause: 'Pausieren',
    resume: 'Fortsetzen',
    reset: 'Zurücksetzen',
    singleStep: 'Einzelschritt',
    running: 'Simulation läuft',
    paused: 'Pausiert',
    idle: 'Bereit',
    batchSize: 'Batch-Größe',
    batchTooltip: 'Partien pro Rechenschritt (1 bis 1.000)',
    speed: 'Geschwindigkeit',
    speedLevels: [
      'Stufe 1 (Visuell, langsam)',
      'Stufe 2 (Visuell, mittel)',
      'Stufe 3 (Visuell, schnell)',
      'Stufe 4 (Turbo-Worker)',
      'Stufe 5 (Hyper-Speed)',
    ],
    speedDescriptions: [
      'Ausführliche Würfelanimation (~600ms/Wurf)',
      'Flüssige Würfelanimation (~180ms/Wurf)',
      'Schnelle Würfelanimation (~45ms/Wurf)',
      'Aggregierter Multithread-Worker (60 FPS)',
      'Maximaler Monte-Carlo-Durchsatz',
    ],
    metrics: {
      totalGames: 'Partien gesamt',
      totalRolls: 'Würfe gesamt',
      humanTime: 'Menschliche Spielzeit',
      humanTimeSub: 'Berechnet als 6 Sekunden pro echtem Tischwurf',
      realTime: 'Reale Rechenzeit',
      highestStreak: 'Höchste Serie',
      throughput: 'Durchsatz',
      gamesPerSec: 'Spiele/s',
      rollsPerSec: 'Würfe/s',
    },
    arena: {
      activeGame: 'Aktives Spielgeschehen',
      round: 'Runde',
      roll: 'Wurf',
      targetDice: 'Fokus-Augenzahl',
      keptDice: 'Gehaltene Würfel',
      rerollDice: 'Neu gewürfelt',
      keptBadge: 'GEHALTEN',
      rolledBadge: 'GEROLLT',
      kniffelSuccess: 'Kniffel erzielt! Serie wächst.',
      roundFailed: 'Kein Kniffel in 3 Würfen – Spiel abgebrochen.',
      greedyNotice: 'Greedy-Regel: Höchste Häufigkeit behalten (bei Gleichstand höhere Augen).',
      liveVisualNotice: 'Visuelle Animation aktiv.',
      turboNotice: 'Im Turbo-Modus läuft die Simulation mit Millionen Würfen im Hintergrund.',
      keptRollSummary: (kept, reroll) => `${kept} gehalten, ${reroll} im nächsten Wurf`,
    },
    histogram: {
      title: 'Verteilung der erreichten Serien (0 bis 13)',
      subtitle: 'Vergleich zwischen empirischer Häufigkeit und stochastischer Erwartung',
      streakLabel: 'Serie',
      gamesCount: 'Partien',
      frequency: 'Anteil',
      theoretical: 'Theoretisch',
      scaleLabel: 'Skalierung:',
      scaleLog: 'Logarithmisch',
      scaleLinear: 'Linear',
      scaleDesc: 'Logarithmisch empfohlen, da Streak 0 ca. 95,4% aller Spiele ausmacht.',
      emptyHint: 'Starte die Simulation, um Daten für das Histogramm zu generieren.',
      odds: 'Wahrscheinlichkeit',
    },
    milestones: {
      title: 'Rekorde & Meilensteine (0–13 Serien)',
      subtitle: 'Exakte Erfassung der ersten Erreichung jeder Serienlänge',
      streakCol: 'Streak-Ziel',
      streakName: (s) => (s === 1 ? '1 Kniffel' : `${s}er-Serie`),
      gameNumCol: 'Spielnummer',
      realTimeCol: 'Reale Stoppuhr',
      humanTimeCol: 'Menschliche Zeit (@ 6s/Wurf)',
      rollsCol: 'Würfe bis Rekord',
      oddsCol: 'Theoretische Chance',
      statusCol: 'Status',
      achieved: 'Erreicht',
      pending: 'Ausstehend',
      recordBadge: 'NEUER REKORD',
      goalBannerTitle: '13 Kniffel in Serie erreicht!',
      goalBannerDesc: 'Ein astronomisches stochastisches Ereignis wurde simuliert.',
    },
    explainer: {
      title: 'Stochastische Grundlagen & Kniffel-Mathematik',
      theoryHeading: 'Warum ist 13 Kniffel in Serie so selten?',
      theoryText:
        'Die Wahrscheinlichkeit, mit der optimalen Greedy-Strategie in maximal 3 Würfen einen Kniffel zu erzielen, liegt bei exakt ca. 4,603% (~1 zu 21,7). Eine Serie von 13 Kniffeln entspricht p¹³ ≈ 2,80 × 10⁻¹⁸ – das entspricht einer Chance von 1 zu 357 Billiarden Partien!',
      humanHeading: 'Menschliche Spielzeit am Küchentisch',
      humanText:
        'Ein menschlicher Wurf am Tisch mit Schütteln und Sortieren dauert durchschnittlich 6 Sekunden. Würde ein Mensch ununterbrochen Tag und Nacht am Tisch würfeln, entspräche eine Million Spiele rund 7 Monaten reiner Spielzeit. Eine 13er-Serie würde astronomische Zeitalter am Tisch erfordern.',
      strategyHeading: 'Strikte Greedy-Strategie',
      strategyText:
        'Nach jedem Wurf wird die am häufigsten gefallene Augenzahl identifiziert und behalten. Bei Gleichstand (z.B. zwei 3er und zwei 6er) behält der Algorithmus die höhere Augenzahl. Bei 5 unterschiedlichen Würfeln wird genau 1 Würfel mit der höchsten Augenzahl behalten.',
    },
  },
  en: {
    title: 'Yahtzee Streak Simulator',
    subtitle: 'Monte Carlo simulation of 13 consecutive Yahtzees using greedy strategy',
    start: 'Start Simulation',
    pause: 'Pause',
    resume: 'Resume',
    reset: 'Reset',
    singleStep: 'Single Step',
    running: 'Simulation running',
    paused: 'Paused',
    idle: 'Ready',
    batchSize: 'Batch Size',
    batchTooltip: 'Games per iteration step (1 to 1,000)',
    speed: 'Speed',
    speedLevels: [
      'Level 1 (Visual, slow)',
      'Level 2 (Visual, medium)',
      'Level 3 (Visual, fast)',
      'Level 4 (Turbo Worker)',
      'Level 5 (Hyper-Speed)',
    ],
    speedDescriptions: [
      'Detailed dice animation (~600ms/roll)',
      'Smooth dice animation (~180ms/roll)',
      'Fast dice animation (~45ms/roll)',
      'Aggregated multithreaded worker (60 FPS)',
      'Maximum Monte Carlo throughput',
    ],
    metrics: {
      totalGames: 'Total Games',
      totalRolls: 'Total Rolls',
      humanTime: 'Human Playtime',
      humanTimeSub: 'Calculated as 6 seconds per real tabletop roll',
      realTime: 'Real Elapsed Time',
      highestStreak: 'Highest Streak',
      throughput: 'Throughput',
      gamesPerSec: 'Games/s',
      rollsPerSec: 'Rolls/s',
    },
    arena: {
      activeGame: 'Live Dice Board',
      round: 'Round',
      roll: 'Roll',
      targetDice: 'Target Value',
      keptDice: 'Kept Dice',
      rerollDice: 'Rerolled',
      keptBadge: 'KEPT',
      rolledBadge: 'ROLLED',
      kniffelSuccess: 'Yahtzee achieved! Streak increases.',
      roundFailed: 'No Yahtzee in 3 rolls – game aborted.',
      greedyNotice: 'Greedy rule: Keep highest frequency (higher value on ties).',
      liveVisualNotice: 'Visual animation active.',
      turboNotice: 'In Turbo mode, millions of rolls are simulated in the background worker.',
      keptRollSummary: (kept, reroll) => `${kept} kept, ${reroll} in next roll`,
    },
    histogram: {
      title: 'Distribution of Achieved Streaks (0 to 13)',
      subtitle: 'Empirical sample frequency compared with theoretical probability',
      streakLabel: 'Streak',
      gamesCount: 'Games',
      frequency: 'Share',
      theoretical: 'Theoretical',
      scaleLabel: 'Scale:',
      scaleLog: 'Logarithmic',
      scaleLinear: 'Linear',
      scaleDesc: 'Logarithmic recommended because streak 0 accounts for ~95.4% of all games.',
      emptyHint: 'Start the simulation to generate distribution histogram data.',
      odds: 'Probability',
    },
    milestones: {
      title: 'Milestone Records (0–13 Streaks)',
      subtitle: 'Exact log of the first occurrence of each streak length',
      streakCol: 'Streak Target',
      streakName: (s) => (s === 1 ? '1 Yahtzee' : `${s} Streak`),
      gameNumCol: 'Game Number',
      realTimeCol: 'Real Stopwatch',
      humanTimeCol: 'Human Playtime (@ 6s/roll)',
      rollsCol: 'Rolls to Record',
      oddsCol: 'Theoretical Odds',
      statusCol: 'Status',
      achieved: 'Achieved',
      pending: 'Pending',
      recordBadge: 'NEW RECORD',
      goalBannerTitle: '13 Consecutive Yahtzees Achieved!',
      goalBannerDesc: 'An astronomical stochastic event has been successfully simulated.',
    },
    explainer: {
      title: 'Stochastic Fundamentals & Yahtzee Mathematics',
      theoryHeading: 'Why are 13 consecutive Yahtzees so rare?',
      theoryText:
        'The probability of achieving a Yahtzee within 3 rolls using the optimal greedy strategy is ~4.603% (~1 in 21.7). A streak of 13 Yahtzees corresponds to p¹³ ≈ 2.80 × 10⁻¹⁸ – that is roughly 1 in 357 quadrillion games!',
      humanHeading: 'Human Tabletop Playtime',
      humanText:
        'A real human roll at a physical table with cup shaking and sorting takes approximately 6 seconds. If a human rolled nonstop day and night, 1 million games would equal ~7 months of continuous rolling. A 13-streak would require vast cosmic epochs at the table.',
      strategyHeading: 'Strict Greedy Strategy',
      strategyText:
        'After each roll, the most frequent dice face is identified and kept. In case of ties (e.g., two 3s and two 6s), the algorithm keeps the higher face value. If all 5 dice are distinct, exactly 1 die with the highest face value is kept.',
    },
  },
};
