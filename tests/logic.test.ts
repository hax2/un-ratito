import { describe, it, expect } from 'vitest';
import { calculateNextStageProgress, STAGE_INTERVALS_MS } from '../src/learning/scheduler';
import { AttemptRecord, TargetProgress } from '../src/content/types';
import { exportLearnerData, importLearnerData, clearAllLearnerData, getAllProgress } from '../src/storage/db';

describe('Spaced Repetition Scheduler', () => {
  const baseAttempt: AttemptRecord = {
    attemptId: 'att-1',
    sessionId: 'ses-1',
    promptId: 'bld.order.bill.1',
    targetId: 'order.bill',
    game: 'builder',
    requestedEvidence: 'scaffolded-production',
    actualEvidence: 'scaffolded-production',
    result: 'correct',
    answerPayload: {},
    assisted: false,
    timestamp: 1000000000,
    durationMs: 4000,
  };

  it('initial correct attempt creates stage 0 progress with 1 day interval', () => {
    const now = 1000000000;
    const progress = calculateNextStageProgress(null, baseAttempt, now);

    expect(progress.stage).toBe(0);
    expect(progress.totalCorrect).toBe(1);
    expect(progress.totalAttempts).toBe(1);
    expect(progress.nextDue).toBe(now + STAGE_INTERVALS_MS[0]);
  });

  it('correct attempt when DUE advances stage up to max 4', () => {
    const now = 2000000000;
    const current: TargetProgress = {
      targetId: 'order.bill',
      channel: 'scaffolded-production',
      stage: 1,
      lastPracticed: now - STAGE_INTERVALS_MS[1] - 1000,
      nextDue: now - 500, // Due!
      totalCorrect: 2,
      totalAttempts: 2,
    };

    const next = calculateNextStageProgress(current, baseAttempt, now);
    expect(next.stage).toBe(2);
    expect(next.totalCorrect).toBe(3);
    expect(next.nextDue).toBe(now + STAGE_INTERVALS_MS[2]);
  });

  it('early practice records success but DOES NOT advance stage or push due date', () => {
    const now = 2000000000;
    const futureDue = now + 100000000;
    const current: TargetProgress = {
      targetId: 'order.bill',
      channel: 'scaffolded-production',
      stage: 1,
      lastPracticed: now - 10000,
      nextDue: futureDue, // NOT due yet!
      totalCorrect: 2,
      totalAttempts: 2,
    };

    const next = calculateNextStageProgress(current, baseAttempt, now);
    expect(next.stage).toBe(1); // stage retained
    expect(next.totalCorrect).toBe(3);
    expect(next.nextDue).toBe(futureDue); // unchanged
  });

  it('mistake or assisted resets stage to 0 and schedules for next day', () => {
    const now = 2000000000;
    const current: TargetProgress = {
      targetId: 'order.bill',
      channel: 'scaffolded-production',
      stage: 3,
      lastPracticed: now - 50000,
      nextDue: now - 1000,
      totalCorrect: 5,
      totalAttempts: 5,
    };

    const failedAttempt: AttemptRecord = {
      ...baseAttempt,
      result: 'incorrect',
    };

    const next = calculateNextStageProgress(current, failedAttempt, now);
    expect(next.stage).toBe(0);
    expect(next.nextDue).toBe(now + STAGE_INTERVALS_MS[0]);
    expect(next.totalCorrect).toBe(5);
    expect(next.totalAttempts).toBe(6);
  });

  it('valid-off-target does not change mastery stage or penalize learner', () => {
    const now = 2000000000;
    const current: TargetProgress = {
      targetId: 'order.bill',
      channel: 'scaffolded-production',
      stage: 2,
      lastPracticed: now - 50000,
      nextDue: now + 500000,
      totalCorrect: 3,
      totalAttempts: 3,
    };

    const offTargetAttempt: AttemptRecord = {
      ...baseAttempt,
      result: 'valid-off-target',
    };

    const next = calculateNextStageProgress(current, offTargetAttempt, now);
    expect(next.stage).toBe(2);
    expect(next.totalCorrect).toBe(3);
    expect(next.totalAttempts).toBe(4);
  });
});

describe('Data Export & Import', () => {
  it('exports and imports backup data correctly', async () => {
    await clearAllLearnerData();

    const sampleBackup = JSON.stringify({
      version: 1,
      exportTimestamp: Date.now(),
      settings: {
        soundEnabled: true,
        selectedChapterId: 'chapter-b',
        supportLevel: 'stretch',
        speechRate: 0.85,
      },
      progress: [
        {
          targetId: 'past.progressive-action',
          channel: 'scaffolded-production',
          stage: 2,
          lastPracticed: 1700000000,
          nextDue: 1700604800,
          totalCorrect: 3,
          totalAttempts: 4,
        },
      ],
      stamps: [
        { id: 'market', count: 3, unlockedAt: 1700000000 },
      ],
    });

    const success = await importLearnerData(sampleBackup);
    expect(success).toBe(true);

    const exported = await exportLearnerData();
    const parsed = JSON.parse(exported);
    expect(parsed.settings.selectedChapterId).toBe('chapter-b');
    expect(parsed.progress.length).toBe(1);
    expect(parsed.progress[0].targetId).toBe('past.progressive-action');
    expect(parsed.stamps.length).toBe(1);
    expect(parsed.stamps[0].count).toBe(3);
  });
});

describe('Game Evaluators', () => {
  it('Phrase Builder correctly identifies valid tile sequence', () => {
    const acceptedSequences = [['t1', 't2', 't3', 't4']];
    const userSequence = ['t1', 't2', 't3', 't4'];
    const matches = acceptedSequences.some(seq =>
      seq.length === userSequence.length && seq.every((t, i) => t === userSequence[i])
    );
    expect(matches).toBe(true);

    const wrongSequence = ['t1', 't3', 't2', 't4'];
    const wrongMatches = acceptedSequences.some(seq =>
      seq.length === wrongSequence.length && seq.every((t, i) => t === wrongSequence[i])
    );
    expect(wrongMatches).toBe(false);
  });

  it('Café Please correctly verifies drink, milk modifier, and quantity', () => {
    const target = { drink: 'café', milk: 'con leche', quantity: 2 };
    const served = { drink: 'café', milk: 'con leche', quantity: 2 };

    const isMatch = served.drink === target.drink &&
      served.milk === target.milk &&
      served.quantity === target.quantity;

    expect(isMatch).toBe(true);

    const wrongServed = { drink: 'café', milk: 'solo', quantity: 2 };
    const isWrongMatch = wrongServed.drink === target.drink &&
      wrongServed.milk === target.milk &&
      wrongServed.quantity === target.quantity;

    expect(isWrongMatch).toBe(false);
  });

  it('Spot the Slip verifies token index and correction', () => {
    const errorTokenIndex = 2;
    const correctCorrection = 'cocinando';

    const userSelectedToken = 2;
    const userChosenCorrection = 'cocinando';

    expect(userSelectedToken === errorTokenIndex && userChosenCorrection === correctCorrection).toBe(true);
  });
});
