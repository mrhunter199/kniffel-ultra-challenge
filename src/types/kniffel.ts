export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export type DiceArray = [DiceValue, DiceValue, DiceValue, DiceValue, DiceValue];

export interface RollStep {
  dice: DiceArray;
  keptIndices: number[];
  targetValue: DiceValue;
  rollNumber: 1 | 2 | 3;
  isKniffel: boolean;
  roundNumber: number;
  currentStreak: number;
  activeGamesCount?: number;
  batchSize?: number;
}

export interface MilestoneRecord {
  streak: number; // 1 to 13
  gameNumber: number; // Exact game counter when milestone was first achieved
  totalRolls: number; // Total cumulative rolls across all games up to this record
  realElapsedMs: number; // Stopwatch time in milliseconds
  humanTimeSeconds: number; // totalRolls * 6 seconds
  achievedAt: number; // Unix timestamp
}

export interface SimulationStats {
  totalGames: number;
  totalRolls: number;
  histogram: number[]; // Index 0 to 13
  highestStreak: number;
  milestones: Record<number, MilestoneRecord>;
  realElapsedMs: number;
  isRunning: boolean;
  speed: number; // 1 to 5
  batchSize: number; // 1 to 1000
  rollsPerSec: number;
  gamesPerSec: number;
  lastActiveRoll?: RollStep;
  activeGamesCount?: number;
}

export type WorkerInMessage =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'SET_BATCH_SIZE'; payload: number }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'SINGLE_STEP' };

export type WorkerOutMessage =
  | {
      type: 'TICK';
      payload: {
        totalGames: number;
        totalRolls: number;
        batchRolls: number;
        rollsDelta: number;
        histogram: number[];
        highestStreak: number;
        milestones: Record<number, MilestoneRecord>;
        realElapsedMs: number;
        rollsPerSec: number;
        gamesPerSec: number;
        visualRoll?: RollStep;
        activeGamesCount?: number;
        isGoalReached?: boolean;
      };
    }
  | {
      type: 'NEW_RECORD';
      payload: MilestoneRecord;
    }
  | {
      type: 'GOAL_REACHED';
      payload: {
        milestone: MilestoneRecord;
      };
    };

export type Language = 'de' | 'en';
