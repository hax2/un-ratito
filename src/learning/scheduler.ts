import { AttemptRecord, TargetProgress } from '../content/types';

export const STAGE_INTERVALS_MS = [
  1 * 24 * 60 * 60 * 1000,  // Stage 0: 1 day
  3 * 24 * 60 * 60 * 1000,  // Stage 1: 3 days
  7 * 24 * 60 * 60 * 1000,  // Stage 2: 7 days
  14 * 24 * 60 * 60 * 1000, // Stage 3: 14 days
  30 * 24 * 60 * 60 * 1000, // Stage 4: 30 days
];

export function calculateNextStageProgress(
  current: TargetProgress | null,
  attempt: AttemptRecord,
  now: number = Date.now()
): TargetProgress {
  const targetId = attempt.targetId;
  const channel = attempt.actualEvidence;

  if (!current) {
    // Initial exposure or first attempt
    if (attempt.result === 'correct' && !attempt.assisted) {
      return {
        targetId,
        channel,
        stage: 0,
        lastPracticed: now,
        nextDue: now + STAGE_INTERVALS_MS[0],
        totalCorrect: 1,
        totalAttempts: 1,
      };
    } else {
      return {
        targetId,
        channel,
        stage: 0,
        lastPracticed: now,
        nextDue: now + STAGE_INTERVALS_MS[0],
        totalCorrect: 0,
        totalAttempts: 1,
      };
    }
  }

  const isDue = now >= current.nextDue;
  let newStage = current.stage;
  let nextDue = current.nextDue;

  if (attempt.result === 'correct' && !attempt.assisted) {
    if (isDue) {
      // Due and correct unassisted: advance stage up to 4
      newStage = Math.min(4, current.stage + 1);
      nextDue = now + STAGE_INTERVALS_MS[newStage];
    } else {
      // Early practice: success recorded, but does not advance stage or push due date later
      nextDue = current.nextDue;
    }
    return {
      targetId,
      channel,
      stage: newStage,
      lastPracticed: now,
      nextDue,
      totalCorrect: current.totalCorrect + 1,
      totalAttempts: current.totalAttempts + 1,
    };
  } else if (attempt.result === 'incorrect' || attempt.assisted) {
    // Mistake or assisted: reset stage to 0 and schedule 1 day out
    newStage = 0;
    nextDue = now + STAGE_INTERVALS_MS[0];
    return {
      targetId,
      channel,
      stage: newStage,
      lastPracticed: now,
      nextDue,
      totalCorrect: current.totalCorrect,
      totalAttempts: current.totalAttempts + 1,
    };
  } else {
    // 'valid-off-target' or skip: no mastery change, don't count as failure
    return {
      ...current,
      lastPracticed: now,
      totalAttempts: current.totalAttempts + 1,
    };
  }
}
