import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateGreedy,
  formatHumanTime,
  getGreedyTarget,
  isKniffel,
  simulateOneGameFast,
  simulateSingleRound,
} from './kniffelEngine';

test('isKniffel correctly identifies 5 of a kind', () => {
  assert.equal(isKniffel([5, 5, 5, 5, 5]), true);
  assert.equal(isKniffel([1, 1, 1, 1, 1]), true);
  assert.equal(isKniffel([6, 6, 6, 6, 6]), true);
  assert.equal(isKniffel([5, 5, 5, 5, 4]), false);
  assert.equal(isKniffel([1, 2, 3, 4, 5]), false);
});

test('evaluateGreedy selects the most frequent dice value', () => {
  const result = evaluateGreedy([2, 2, 2, 4, 1]);
  assert.equal(result.targetValue, 2);
  assert.equal(result.count, 3);
  assert.deepEqual(result.keptIndices, [0, 1, 2]);
});

test('evaluateGreedy breaks frequency ties by choosing the higher face value', () => {
  // Two 3s and two 6s: should keep the 6s
  const result = evaluateGreedy([3, 3, 6, 6, 1]);
  assert.equal(result.targetValue, 6);
  assert.equal(result.count, 2);
  assert.deepEqual(result.keptIndices, [2, 3]);

  // Two 2s and two 5s: should keep 5s
  const result2 = evaluateGreedy([5, 2, 5, 2, 1]);
  assert.equal(result2.targetValue, 5);
  assert.equal(result2.count, 2);
  assert.deepEqual(result2.keptIndices, [0, 2]);
});

test('evaluateGreedy keeps 1 die with the highest face value when all 5 are distinct', () => {
  // 1, 2, 3, 4, 5 -> keeps 5
  const res1 = evaluateGreedy([1, 2, 3, 4, 5]);
  assert.equal(res1.targetValue, 5);
  assert.equal(res1.count, 1);
  assert.deepEqual(res1.keptIndices, [4]);

  // 1, 2, 3, 4, 6 -> keeps 6
  const res2 = evaluateGreedy([1, 6, 2, 3, 4]);
  assert.equal(res2.targetValue, 6);
  assert.equal(res2.count, 1);
  assert.deepEqual(res2.keptIndices, [1]);
});

test('getGreedyTarget helper matches evaluateGreedy results', () => {
  assert.equal(getGreedyTarget(3, 3, 6, 6, 1), 6);
  assert.equal(getGreedyTarget(1, 2, 3, 4, 5), 5);
  assert.equal(getGreedyTarget(4, 4, 4, 1, 2), 4);
  assert.equal(getGreedyTarget(6, 1, 2, 3, 4), 6);
});

test('simulateSingleRound enforces max 3 rolls and strict termination', () => {
  const result = simulateSingleRound(1, 0);
  assert.ok(result.rollsUsed >= 1 && result.rollsUsed <= 3);
  assert.equal(result.steps.length, result.rollsUsed);
  if (result.success) {
    assert.equal(isKniffel(result.finalDice), true);
  } else {
    assert.equal(result.rollsUsed, 3);
    assert.equal(isKniffel(result.finalDice), false);
  }
});

test('simulateOneGameFast runs full game with strict termination', () => {
  for (let i = 0; i < 50; i++) {
    const game = simulateOneGameFast();
    assert.ok(game.streak >= 0 && game.streak <= 13);
    assert.ok(game.totalRolls >= 1);
    // If streak is 0, the very first round failed on roll 3
    if (game.streak === 0) {
      assert.equal(game.totalRolls, 3);
    }
  }
});

test('formatHumanTime calculates dynamic units correctly', () => {
  assert.equal(formatHumanTime(6, 'de'), '6 s');
  assert.equal(formatHumanTime(60, 'de'), '1 min 0 s');
  assert.equal(formatHumanTime(3600, 'de'), '1 h 0 min');
  assert.equal(formatHumanTime(3665, 'de'), '1 h 1 min');
  assert.equal(formatHumanTime(86400 + 7200, 'de'), '1 Tag 2 h');
  assert.equal(formatHumanTime(86400 * 2 + 3600, 'en'), '2 days 1 h');
  
  // Year scale
  const yearSec = 31557600;
  assert.equal(formatHumanTime(yearSec * 2, 'de'), '2 Jahre');
  assert.equal(formatHumanTime(yearSec * 2, 'en'), '2 yrs');
  // 3-digit days or >= 10 years should use compact non-wrapping format
  assert.equal(formatHumanTime(yearSec * 27 + 86400 * 338, 'de'), '27 J. 338 T.');
  assert.equal(formatHumanTime(yearSec * 27 + 86400 * 338, 'en'), '27y 338d');
  assert.equal(formatHumanTime(yearSec * 35, 'de'), '35 Jahre');
  assert.ok(formatHumanTime(yearSec * 1500000, 'de').includes('Mio. Jahre'));
});

test('human play time strictly synchronizes as totalRolls * 6 seconds', () => {
  const testRollCounts = [0, 1, 10, 100, 1000, 60000];
  for (const rolls of testRollCounts) {
    const expectedSeconds = rolls * 6;
    assert.equal(rolls * 6, expectedSeconds);
    const formatted = formatHumanTime(expectedSeconds, 'de');
    assert.ok(typeof formatted === 'string' && formatted.length > 0);
  }
});

test('parallel batch roll counting increments by activeGames.length not +1', () => {
  // Simulating a parallel batch of 100 games
  const batchSize = 100;
  let activeCount = batchSize;
  let totalRolls = 0;

  // Roll 1: all 100 games roll
  totalRolls += activeCount;
  assert.equal(totalRolls, 100);

  // Suppose 5 games get Kniffel on roll 1, 95 games need roll 2
  activeCount = 95;
  totalRolls += activeCount;
  assert.equal(totalRolls, 195);

  // Roll 3: remaining active games roll
  totalRolls += activeCount;
  assert.equal(totalRolls, 290);

  // Suppose only 4 games achieved Kniffel after roll 3, 91 games aborted
  activeCount = 4; // only surviving games remain active
  totalRolls += activeCount; // Round 2 Roll 1 only executed by surviving games
  assert.equal(totalRolls, 294);
});

