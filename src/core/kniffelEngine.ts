import { DiceArray, DiceValue, Language, MilestoneRecord, RollStep } from '../types/kniffel';

/**
 * Theoretical probability of achieving a Yahtzee/Kniffel in 3 rolls using
 * the optimal greedy strategy: ~4.60286% (approx 1 in 21.72 attempts).
 */
export const P_SINGLE_KNIFFEL = 0.046028643;

/**
 * Theoretical probability of each streak (0 to 13).
 * For k in 0..12: P(streak = k) = P_SINGLE_KNIFFEL^k * (1 - P_SINGLE_KNIFFEL)
 * For k = 13: P(streak = 13) = P_SINGLE_KNIFFEL^13
 */
export const THEORETICAL_STREAK_PROBABILITIES: number[] = Array.from({ length: 14 }, (_, k) => {
  if (k === 13) {
    return Math.pow(P_SINGLE_KNIFFEL, 13);
  }
  return Math.pow(P_SINGLE_KNIFFEL, k) * (1 - P_SINGLE_KNIFFEL);
});

/**
 * Rolls a single standard 6-sided die.
 */
export function rollDie(): DiceValue {
  return ((Math.floor(Math.random() * 6) + 1) as DiceValue);
}

/**
 * Rolls 5 dice from scratch.
 */
export function rollInitialDice(): DiceArray {
  return [rollDie(), rollDie(), rollDie(), rollDie(), rollDie()];
}

/**
 * Checks whether all 5 dice display the exact same face value (Kniffel / Yahtzee).
 */
export function isKniffel(dice: DiceValue[]): boolean {
  if (dice.length !== 5) return false;
  const first = dice[0];
  return (
    dice[1] === first &&
    dice[2] === first &&
    dice[3] === first &&
    dice[4] === first
  );
}

/**
 * Greedy strategy evaluation:
 * - Count frequency of each face value (1..6).
 * - Keep the face value with highest occurrence.
 * - If there is a tie, keep the higher face value.
 * - If all 5 dice are distinct (all counts = 1), keep the single die with highest face value.
 */
export function evaluateGreedy(dice: DiceValue[]): {
  targetValue: DiceValue;
  keptIndices: number[];
  count: number;
} {
  const counts: number[] = [0, 0, 0, 0, 0, 0, 0]; // 1-indexed for convenience
  for (let i = 0; i < 5; i++) {
    counts[dice[i]]++;
  }

  let maxCount = 0;
  let targetValue: DiceValue = 6;

  // Iterate from 6 down to 1 so tie-breaker naturally favors higher face value
  for (let v = 6; v >= 1; v--) {
    if (counts[v] > maxCount) {
      maxCount = counts[v];
      targetValue = v as DiceValue;
    }
  }

  const keptIndices: number[] = [];
  for (let i = 0; i < 5; i++) {
    if (dice[i] === targetValue) {
      keptIndices.push(i);
    }
  }

  return { targetValue, keptIndices, count: maxCount };
}

/**
 * Simulates a single round (up to 3 rolls for a Kniffel).
 * Returns success (boolean), number of rolls used (1, 2, or 3), final dice, and roll steps.
 */
export function simulateSingleRound(
  roundNumber: number = 1,
  currentStreak: number = 0,
  onRollStep?: (step: RollStep) => void
): {
  success: boolean;
  rollsUsed: number;
  finalDice: DiceArray;
  steps: RollStep[];
} {
  const steps: RollStep[] = [];
  let currentDice: DiceArray = rollInitialDice();
  let rollsUsed = 1;

  let kniffelFound = isKniffel(currentDice);
  let evalResult = evaluateGreedy(currentDice);

  const step1: RollStep = {
    dice: [...currentDice] as DiceArray,
    keptIndices: kniffelFound ? [0, 1, 2, 3, 4] : evalResult.keptIndices,
    targetValue: evalResult.targetValue,
    rollNumber: 1,
    isKniffel: kniffelFound,
    roundNumber,
    currentStreak,
  };
  steps.push(step1);
  if (onRollStep) onRollStep(step1);

  if (kniffelFound) {
    return { success: true, rollsUsed: 1, finalDice: currentDice, steps };
  }

  // Roll 2
  rollsUsed = 2;
  const kept1 = new Set(evalResult.keptIndices);
  for (let i = 0; i < 5; i++) {
    if (!kept1.has(i)) {
      currentDice[i] = rollDie();
    }
  }

  kniffelFound = isKniffel(currentDice);
  evalResult = evaluateGreedy(currentDice);

  const step2: RollStep = {
    dice: [...currentDice] as DiceArray,
    keptIndices: kniffelFound ? [0, 1, 2, 3, 4] : evalResult.keptIndices,
    targetValue: evalResult.targetValue,
    rollNumber: 2,
    isKniffel: kniffelFound,
    roundNumber,
    currentStreak,
  };
  steps.push(step2);
  if (onRollStep) onRollStep(step2);

  if (kniffelFound) {
    return { success: true, rollsUsed: 2, finalDice: currentDice, steps };
  }

  // Roll 3
  rollsUsed = 3;
  const kept2 = new Set(evalResult.keptIndices);
  for (let i = 0; i < 5; i++) {
    if (!kept2.has(i)) {
      currentDice[i] = rollDie();
    }
  }

  kniffelFound = isKniffel(currentDice);
  evalResult = evaluateGreedy(currentDice);

  const step3: RollStep = {
    dice: [...currentDice] as DiceArray,
    keptIndices: kniffelFound ? [0, 1, 2, 3, 4] : evalResult.keptIndices,
    targetValue: evalResult.targetValue,
    rollNumber: 3,
    isKniffel: kniffelFound,
    roundNumber,
    currentStreak,
  };
  steps.push(step3);
  if (onRollStep) onRollStep(step3);

  return {
    success: kniffelFound,
    rollsUsed: 3,
    finalDice: currentDice,
    steps,
  };
}

/**
 * Fast inlined game simulation for maximum Monte-Carlo throughput.
 * Simulates one game until abortion or 13 consecutive Kniffels.
 * Returns { streak, totalRolls }.
 */
export function simulateOneGameFast(): { streak: number; totalRolls: number } {
  let streak = 0;
  let totalRolls = 0;

  // Dice array reusable buffer
  let d0: number, d1: number, d2: number, d3: number, d4: number;

  while (streak < 13) {
    // Round attempt
    // Roll 1
    d0 = (Math.random() * 6 | 0) + 1;
    d1 = (Math.random() * 6 | 0) + 1;
    d2 = (Math.random() * 6 | 0) + 1;
    d3 = (Math.random() * 6 | 0) + 1;
    d4 = (Math.random() * 6 | 0) + 1;
    totalRolls++;

    if (d0 === d1 && d0 === d2 && d0 === d3 && d0 === d4) {
      streak++;
      continue;
    }

    // Roll 2 greedy choice
    let target = getGreedyTarget(d0, d1, d2, d3, d4);
    if (d0 !== target) d0 = (Math.random() * 6 | 0) + 1;
    if (d1 !== target) d1 = (Math.random() * 6 | 0) + 1;
    if (d2 !== target) d2 = (Math.random() * 6 | 0) + 1;
    if (d3 !== target) d3 = (Math.random() * 6 | 0) + 1;
    if (d4 !== target) d4 = (Math.random() * 6 | 0) + 1;
    totalRolls++;

    if (d0 === d1 && d0 === d2 && d0 === d3 && d0 === d4) {
      streak++;
      continue;
    }

    // Roll 3 greedy choice
    target = getGreedyTarget(d0, d1, d2, d3, d4);
    if (d0 !== target) d0 = (Math.random() * 6 | 0) + 1;
    if (d1 !== target) d1 = (Math.random() * 6 | 0) + 1;
    if (d2 !== target) d2 = (Math.random() * 6 | 0) + 1;
    if (d3 !== target) d3 = (Math.random() * 6 | 0) + 1;
    if (d4 !== target) d4 = (Math.random() * 6 | 0) + 1;
    totalRolls++;

    if (d0 === d1 && d0 === d2 && d0 === d3 && d0 === d4) {
      streak++;
      continue;
    }

    // Failed after Roll 3 -> STRICT ABORT!
    break;
  }

  return { streak, totalRolls };
}

/**
 * Helper to determine greedy target for 5 values.
 * Inlined for worker speed.
 */
export function getGreedyTarget(d0: number, d1: number, d2: number, d3: number, d4: number): number {
  let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, c6 = 0;
  if (d0 === 1) c1++; else if (d0 === 2) c2++; else if (d0 === 3) c3++; else if (d0 === 4) c4++; else if (d0 === 5) c5++; else c6++;
  if (d1 === 1) c1++; else if (d1 === 2) c2++; else if (d1 === 3) c3++; else if (d1 === 4) c4++; else if (d1 === 5) c5++; else c6++;
  if (d2 === 1) c1++; else if (d2 === 2) c2++; else if (d2 === 3) c3++; else if (d2 === 4) c4++; else if (d2 === 5) c5++; else c6++;
  if (d3 === 1) c1++; else if (d3 === 2) c2++; else if (d3 === 3) c3++; else if (d3 === 4) c4++; else if (d3 === 5) c5++; else c6++;
  if (d4 === 1) c1++; else if (d4 === 2) c2++; else if (d4 === 3) c3++; else if (d4 === 4) c4++; else if (d4 === 5) c5++; else c6++;

  // Higher face value preference on ties: test 6 down to 1
  let max = c6;
  let target = 6;
  if (c5 > max) { max = c5; target = 5; }
  if (c4 > max) { max = c4; target = 4; }
  if (c3 > max) { max = c3; target = 3; }
  if (c2 > max) { max = c2; target = 2; }
  if (c1 > max) { max = c1; target = 1; }

  return target;
}

/**
 * Human time calculation:
 * Strict rule: totalRolls * 6 seconds = table time in seconds.
 * Formats dynamically:
 * Seconds -> Minutes -> Hours -> Days -> Years
 */
export function formatHumanTime(totalSeconds: number, lang: Language = 'de'): string {
  if (totalSeconds < 0) return '0 s';

  const isDe = lang === 'de';

  if (totalSeconds < 60) {
    return isDe ? `${Math.floor(totalSeconds)} s` : `${Math.floor(totalSeconds)} s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);

  if (totalSeconds < 3600) {
    return `${minutes} min ${remainingSeconds} s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);

  if (totalSeconds < 86400) {
    return `${hours} h ${remainingMinutes} min`;
  }

  const days = Math.floor(totalSeconds / 86400);
  const remainingHours = Math.floor((totalSeconds % 86400) / 3600);

  // 1 Gregorian Year = 365.25 days = 31,557,600 seconds
  const SECONDS_PER_YEAR = 31557600;

  if (totalSeconds < SECONDS_PER_YEAR) {
    const dayLabel = isDe ? (days === 1 ? 'Tag' : 'Tage') : (days === 1 ? 'day' : 'days');
    if (days >= 100) {
      return isDe ? `${days} T. ${remainingHours} h` : `${days}d ${remainingHours}h`;
    }
    return `${days} ${dayLabel} ${remainingHours} h`;
  }

  const years = totalSeconds / SECONDS_PER_YEAR;

  if (years < 1000) {
    const wholeYears = Math.floor(years);
    const remDays = Math.floor((totalSeconds % SECONDS_PER_YEAR) / 86400);
    const yrLabel = isDe ? (wholeYears === 1 ? 'Jahr' : 'Jahre') : (wholeYears === 1 ? 'yr' : 'yrs');
    const dLabel = isDe ? 'T.' : 'd';
    if (remDays === 0) {
      return `${wholeYears} ${yrLabel}`;
    }
    if (wholeYears >= 10 || remDays >= 100) {
      return isDe ? `${wholeYears} J. ${remDays} T.` : `${wholeYears}y ${remDays}d`;
    }
    return `${wholeYears} ${yrLabel} ${remDays} ${dLabel}`;
  }

  if (years < 1_000_000) {
    const formatted = Math.floor(years).toLocaleString(isDe ? 'de-DE' : 'en-US');
    return isDe ? `${formatted} Jahre` : `${formatted} years`;
  }

  if (years < 1_000_000_000) {
    const mio = (years / 1_000_000).toFixed(2);
    return isDe ? `${mio} Mio. Jahre` : `${mio} M years`;
  }

  const mrd = (years / 1_000_000_000).toFixed(2);
  return isDe ? `${mrd} Mrd. Jahre` : `${mrd} B years`;
}

/**
 * Stopwatch real simulation time formatting.
 */
export function formatRealTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.floor(ms)} ms`;
  }
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)} s`;
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = (totalSeconds % 60).toFixed(1);
  if (mins < 60) {
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

/**
 * Localized integer number formatting.
 */
export function formatNumber(num: number, lang: Language = 'de'): string {
  return num.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US');
}
