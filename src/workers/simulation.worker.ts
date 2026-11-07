import {
  evaluateGreedy,
  getGreedyTarget,
  isKniffel,
  rollDie,
  rollInitialDice,
} from '../core/kniffelEngine';
import {
  DiceArray,
  DiceValue,
  MilestoneRecord,
  RollStep,
  WorkerInMessage,
  WorkerOutMessage,
} from '../types/kniffel';

// Worker state
let totalGames = 0;
let totalRolls = 0;
const histogram = new Array(14).fill(0);
let highestStreak = 0;
const milestones: Record<number, MilestoneRecord> = {};

let isRunning = false;
let batchSize = 100; // 1 to 1000
let speed = 4; // 1 to 5

let realElapsedMs = 0;
let lastTimestamp = 0;
let lastTickTime = 0;

// Roll delta tracker for postMessage batch payload
let rollsSinceLastTick = 0;

// Throughput calculation
let rollsAtLastCalc = 0;
let gamesAtLastCalc = 0;
let lastCalcTimestamp = 0;
let rollsPerSec = 0;
let gamesPerSec = 0;

let loopTimer: any = null;

// Parallel visual active game structure
interface ActiveVisualGame {
  id: number;
  dice: DiceArray;
  keptIndices: number[];
  targetValue: DiceValue;
  rollNumber: 1 | 2 | 3;
  roundNumber: number;
  streak: number;
  isKniffel: boolean;
  isFinished: boolean;
}

let activeParallelGames: ActiveVisualGame[] = [];
let nextGameId = 1;
let lastDisplayStep: RollStep | undefined = undefined;

function resetState() {
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
  isRunning = false;
  totalGames = 0;
  totalRolls = 0;
  histogram.fill(0);
  highestStreak = 0;
  for (const key in milestones) {
    delete milestones[key];
  }
  realElapsedMs = 0;
  lastTimestamp = 0;
  lastTickTime = 0;
  rollsSinceLastTick = 0;
  rollsAtLastCalc = 0;
  gamesAtLastCalc = 0;
  lastCalcTimestamp = 0;
  rollsPerSec = 0;
  gamesPerSec = 0;

  activeParallelGames = [];
  nextGameId = 1;
  lastDisplayStep = undefined;

  sendTick();
}

function sendTick(customVisualRoll?: RollStep, isGoalReached?: boolean) {
  const batchRolls = rollsSinceLastTick;
  rollsSinceLastTick = 0;

  const msg: WorkerOutMessage = {
    type: 'TICK',
    payload: {
      totalGames,
      totalRolls,
      batchRolls,
      rollsDelta: batchRolls,
      histogram: [...histogram],
      highestStreak,
      milestones: { ...milestones },
      realElapsedMs,
      rollsPerSec,
      gamesPerSec,
      visualRoll: customVisualRoll || lastDisplayStep,
      activeGamesCount: activeParallelGames.length,
      isGoalReached,
    },
  };
  self.postMessage(msg);
}

function updateMilestone(streak: number, currentElapsed: number) {
  if (streak <= 0 || streak > 13) return;
  if (!milestones[streak]) {
    const record: MilestoneRecord = {
      streak,
      gameNumber: totalGames,
      totalRolls,
      realElapsedMs: currentElapsed,
      humanTimeSeconds: totalRolls * 6,
      achievedAt: Date.now(),
    };
    milestones[streak] = record;
    self.postMessage({
      type: 'NEW_RECORD',
      payload: record,
    } as WorkerOutMessage);

    if (streak === 13) {
      self.postMessage({
        type: 'GOAL_REACHED',
        payload: { milestone: record },
      } as WorkerOutMessage);
    }
  }
}

/**
 * Initializes a new batch of active parallel games.
 */
function spawnParallelBatch(count: number) {
  activeParallelGames = Array.from({ length: count }, () => ({
    id: nextGameId++,
    dice: [1, 1, 1, 1, 1] as DiceArray,
    keptIndices: [],
    targetValue: 6,
    rollNumber: 1,
    roundNumber: 1,
    streak: 0,
    isKniffel: false,
    isFinished: false,
  }));
}

/**
 * Executes a step across all currently active parallel games (Speed 1, 2, 3 or Single Step).
 * Strictly counts rolls only for games that were actually active and rolled during this step.
 */
function stepParallelVisualGames(): RollStep {
  // If no active games remain, spawn a fresh batch
  if (activeParallelGames.length === 0) {
    spawnParallelBatch(batchSize);
  }

  // Exact number of physical dice rolls performed in this step
  const activeCountBeforeRoll = activeParallelGames.length;
  totalRolls += activeCountBeforeRoll;
  rollsSinceLastTick += activeCountBeforeRoll;

  // Track the most interesting game for visual 3D rendering
  let primaryGame: ActiveVisualGame = activeParallelGames[0];
  let maxStreakInBatch = -1;

  for (let i = 0; i < activeParallelGames.length; i++) {
    const g = activeParallelGames[i];

    if (g.rollNumber === 1) {
      // Roll 1: 5 fresh dice
      g.dice = rollInitialDice();
      const kniffel = isKniffel(g.dice);
      const evalRes = evaluateGreedy(g.dice);
      g.targetValue = evalRes.targetValue;
      g.keptIndices = kniffel ? [0, 1, 2, 3, 4] : evalRes.keptIndices;
      g.isKniffel = kniffel;

      if (kniffel) {
        // Succeeded on roll 1!
        g.streak++;
        if (g.streak > highestStreak) {
          highestStreak = g.streak;
        }
        updateMilestone(g.streak, realElapsedMs);

        if (g.streak === 13) {
          totalGames++;
          histogram[13]++;
          g.isFinished = true;
        } else {
          g.roundNumber++;
          g.rollNumber = 1; // ready for next round
        }
      } else {
        g.rollNumber = 2; // ready for roll 2
      }
    } else if (g.rollNumber === 2) {
      // Roll 2: reroll unkept dice
      const keptSet = new Set(g.keptIndices);
      for (let d = 0; d < 5; d++) {
        if (!keptSet.has(d)) {
          g.dice[d] = rollDie();
        }
      }
      const kniffel = isKniffel(g.dice);
      const evalRes = evaluateGreedy(g.dice);
      g.targetValue = evalRes.targetValue;
      g.keptIndices = kniffel ? [0, 1, 2, 3, 4] : evalRes.keptIndices;
      g.isKniffel = kniffel;

      if (kniffel) {
        // Succeeded on roll 2!
        g.streak++;
        if (g.streak > highestStreak) {
          highestStreak = g.streak;
        }
        updateMilestone(g.streak, realElapsedMs);

        if (g.streak === 13) {
          totalGames++;
          histogram[13]++;
          g.isFinished = true;
        } else {
          g.roundNumber++;
          g.rollNumber = 1;
        }
      } else {
        g.rollNumber = 3; // ready for roll 3
      }
    } else {
      // Roll 3: final attempt of this round
      const keptSet = new Set(g.keptIndices);
      for (let d = 0; d < 5; d++) {
        if (!keptSet.has(d)) {
          g.dice[d] = rollDie();
        }
      }
      const kniffel = isKniffel(g.dice);
      const evalRes = evaluateGreedy(g.dice);
      g.targetValue = evalRes.targetValue;
      g.keptIndices = kniffel ? [0, 1, 2, 3, 4] : evalRes.keptIndices;
      g.isKniffel = kniffel;

      if (kniffel) {
        // Succeeded on roll 3!
        g.streak++;
        if (g.streak > highestStreak) {
          highestStreak = g.streak;
        }
        updateMilestone(g.streak, realElapsedMs);

        if (g.streak === 13) {
          totalGames++;
          histogram[13]++;
          g.isFinished = true;
        } else {
          g.roundNumber++;
          g.rollNumber = 1;
        }
      } else {
        // STRICT ABORT on failure after Roll 3!
        totalGames++;
        histogram[g.streak]++;
        g.isFinished = true;
      }
    }

    // Pick game with highest streak to display on the board
    if (g.streak > maxStreakInBatch) {
      maxStreakInBatch = g.streak;
      primaryGame = g;
    }
  }

  // Remove all finished / aborted games from active parallel set
  activeParallelGames = activeParallelGames.filter((g) => !g.isFinished);

  const displayStep: RollStep = {
    dice: [...primaryGame.dice] as DiceArray,
    keptIndices: [...primaryGame.keptIndices],
    targetValue: primaryGame.targetValue,
    rollNumber: (primaryGame.rollNumber === 1 ? 1 : primaryGame.rollNumber - 1) as 1 | 2 | 3,
    isKniffel: primaryGame.isKniffel,
    roundNumber: primaryGame.roundNumber,
    currentStreak: primaryGame.streak,
    activeGamesCount: activeCountBeforeRoll,
    batchSize,
  };

  lastDisplayStep = displayStep;
  return displayStep;
}

/**
 * Headless simulation batch for Turbo (Speed 4) and Hyper-Speed (Speed 5).
 * Accumulates the exact sum of all physical dice rolls performed across all game instances.
 */
function runFastBatch() {
  if (!isRunning) return;

  const now = performance.now();
  const delta = now - lastTimestamp;
  lastTimestamp = now;
  realElapsedMs += delta;

  // Games per frame budget:
  // Speed 4 (Turbo): 2x batchSize per cycle (e.g. 200..2000 games)
  // Speed 5 (Hyper-Speed): 25x batchSize per cycle (e.g. 2,500..25,000 games)
  const gamesThisIteration = speed === 5 ? Math.max(5000, batchSize * 25) : Math.max(50, batchSize * 2);

  let batchRolls = 0;
  let batchGames = 0;

  // Inlined loop variables for maximum speed
  let d0: number, d1: number, d2: number, d3: number, d4: number;
  let target: number;

  for (let g = 0; g < gamesThisIteration; g++) {
    batchGames++;
    let streak = 0;

    while (streak < 13) {
      // Round Roll 1: 5 dice rolled
      d0 = ((Math.random() * 6) | 0) + 1;
      d1 = ((Math.random() * 6) | 0) + 1;
      d2 = ((Math.random() * 6) | 0) + 1;
      d3 = ((Math.random() * 6) | 0) + 1;
      d4 = ((Math.random() * 6) | 0) + 1;
      batchRolls++;

      if (d0 === d1 && d0 === d2 && d0 === d3 && d0 === d4) {
        streak++;
        continue;
      }

      // Roll 2
      target = getGreedyTarget(d0, d1, d2, d3, d4);
      if (d0 !== target) d0 = ((Math.random() * 6) | 0) + 1;
      if (d1 !== target) d1 = ((Math.random() * 6) | 0) + 1;
      if (d2 !== target) d2 = ((Math.random() * 6) | 0) + 1;
      if (d3 !== target) d3 = ((Math.random() * 6) | 0) + 1;
      if (d4 !== target) d4 = ((Math.random() * 6) | 0) + 1;
      batchRolls++;

      if (d0 === d1 && d0 === d2 && d0 === d3 && d0 === d4) {
        streak++;
        continue;
      }

      // Roll 3
      target = getGreedyTarget(d0, d1, d2, d3, d4);
      if (d0 !== target) d0 = ((Math.random() * 6) | 0) + 1;
      if (d1 !== target) d1 = ((Math.random() * 6) | 0) + 1;
      if (d2 !== target) d2 = ((Math.random() * 6) | 0) + 1;
      if (d3 !== target) d3 = ((Math.random() * 6) | 0) + 1;
      if (d4 !== target) d4 = ((Math.random() * 6) | 0) + 1;
      batchRolls++;

      if (d0 === d1 && d0 === d2 && d0 === d3 && d0 === d4) {
        streak++;
        continue;
      }

      // Failed after Roll 3 -> STRICT ABORT!
      break;
    }

    histogram[streak]++;

    if (streak > highestStreak) {
      highestStreak = streak;
    }

    if (streak > 0 && !milestones[streak]) {
      updateMilestone(streak, realElapsedMs);
    }
  }

  // Exact addition of all physical rolls and games executed in this batch
  totalGames += batchGames;
  totalRolls += batchRolls;
  rollsSinceLastTick += batchRolls;

  // Update throughput rates every 250ms
  if (now - lastCalcTimestamp >= 250) {
    const elapsedSec = (now - lastCalcTimestamp) / 1000;
    rollsPerSec = Math.round((totalRolls - rollsAtLastCalc) / elapsedSec);
    gamesPerSec = Math.round((totalGames - gamesAtLastCalc) / elapsedSec);
    rollsAtLastCalc = totalRolls;
    gamesAtLastCalc = totalGames;
    lastCalcTimestamp = now;
  }

  // 60-FPS postMessage interval (~16.6ms)
  if (now - lastTickTime >= 16) {
    sendTick();
    lastTickTime = now;
  }

  if (isRunning) {
    loopTimer = setTimeout(runFastBatch, 0);
  }
}

/**
 * Loop for Visual speeds (Speed 1, 2, 3).
 */
function runVisualLoop() {
  if (!isRunning) return;

  const now = performance.now();
  const delta = now - lastTimestamp;
  lastTimestamp = now;
  realElapsedMs += delta;

  const step = stepParallelVisualGames();

  // Update throughput
  if (now - lastCalcTimestamp >= 500) {
    const elapsedSec = (now - lastCalcTimestamp) / 1000;
    rollsPerSec = Math.round((totalRolls - rollsAtLastCalc) / elapsedSec);
    gamesPerSec = Math.round((totalGames - gamesAtLastCalc) / elapsedSec);
    rollsAtLastCalc = totalRolls;
    gamesAtLastCalc = totalGames;
    lastCalcTimestamp = now;
  }

  sendTick(step);

  let delay = 600;
  if (speed === 2) delay = 180;
  else if (speed === 3) delay = 45;

  if (isRunning) {
    loopTimer = setTimeout(runVisualLoop, delay);
  }
}

function start() {
  if (isRunning) return;
  isRunning = true;
  lastTimestamp = performance.now();
  lastTickTime = lastTimestamp;
  lastCalcTimestamp = lastTimestamp;
  rollsAtLastCalc = totalRolls;
  gamesAtLastCalc = totalGames;

  if (speed <= 3) {
    runVisualLoop();
  } else {
    runFastBatch();
  }
}

function pause() {
  if (!isRunning) return;
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
  const now = performance.now();
  realElapsedMs += now - lastTimestamp;
  isRunning = false;
  rollsPerSec = 0;
  gamesPerSec = 0;
  sendTick();
}

self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const { type } = event.data;

  switch (type) {
    case 'START':
      start();
      break;

    case 'PAUSE':
      pause();
      break;

    case 'RESUME':
      start();
      break;

    case 'RESET':
      resetState();
      break;

    case 'SET_BATCH_SIZE':
      batchSize = Math.max(1, Math.min(1000, event.data.payload));
      // If we are currently not running, reset active parallel pool so next batch uses new size
      if (!isRunning) {
        activeParallelGames = [];
      }
      break;

    case 'SET_SPEED': {
      const prevSpeed = speed;
      speed = Math.max(1, Math.min(5, event.data.payload));
      if (isRunning && prevSpeed !== speed) {
        if (loopTimer) clearTimeout(loopTimer);
        lastTimestamp = performance.now();
        if (speed <= 3) {
          runVisualLoop();
        } else {
          runFastBatch();
        }
      }
      break;
    }

    case 'SINGLE_STEP': {
      if (isRunning) pause();
      const step = stepParallelVisualGames();
      sendTick(step);
      break;
    }
  }
};
