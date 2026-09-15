import { ALL_PROMPTS } from '../content/packs/prompts';
import { TARGETS } from '../content/packs/chapters';
import {
  AnyPrompt,
  AttemptRecord,
  EvidenceType,
  GameId,
  SessionState,
  SupportLevel,
  Target,
} from '../content/types';
import {
  awardStamp,
  getLatestActiveSession,
  getTargetProgress,
  markSessionCompleted,
  recordAttempt,
  saveSessionState,
  saveTargetProgress,
} from '../storage/db';
import { calculateNextStageProgress } from './scheduler';

export interface EvaluationResult {
  outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target';
  feedback: string;
  target: Target;
}

export class SessionController {
  private state: SessionState | null = null;
  private currentPrompt: AnyPrompt | null = null;
  private promptStartTime: number = Date.now();

  public getState(): SessionState | null {
    return this.state;
  }

  public getCurrentPrompt(): AnyPrompt | null {
    return this.currentPrompt;
  }

  public async startSession(
    chapterId: string,
    gameId: GameId | 'mixed' = 'mixed',
    supportLevel: SupportLevel = 'standard',
    promptLimit: number = 5,
    learnerLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<SessionState> {
    let resolvedChapterId = chapterId;
    if (chapterId === 'auto') {
      const levelMap: Record<string, string> = {
        beginner: 'chapter-a',
        intermediate: 'chapter-b',
        advanced: 'chapter-c',
      };
      resolvedChapterId = levelMap[learnerLevel] || 'chapter-a';
    }

    // Filter available candidate prompts
    let candidates = ALL_PROMPTS.filter(p => {
      if (resolvedChapterId !== 'all' && p.chapterId !== resolvedChapterId) return false;
      if (gameId !== 'mixed' && p.game !== gameId) return false;
      return true;
    });

    if (candidates.length === 0) {
      // Fallback to game or all prompts if none match exact chapter
      candidates = ALL_PROMPTS.filter(p => gameId === 'mixed' || p.game === gameId);
      if (candidates.length === 0) candidates = ALL_PROMPTS;
    }

    // Shuffle and pick up to promptLimit
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, Math.min(promptLimit, shuffled.length));
    const promptIds = chosen.map(p => p.id);

    const sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newState: SessionState = {
      sessionId,
      chapterId: resolvedChapterId,
      gameId,
      supportLevel,
      promptIds,
      currentPromptIndex: 0,
      attempts: [],
      isCompleted: false,
      startTime: Date.now(),
    };

    this.state = newState;
    this.loadCurrentPrompt();
    await saveSessionState(newState);
    return newState;
  }

  public async resumeActiveSession(): Promise<SessionState | null> {
    const existing = await getLatestActiveSession();
    if (!existing || existing.isCompleted) {
      return null;
    }
    this.state = existing;
    this.loadCurrentPrompt();
    return existing;
  }

  private loadCurrentPrompt(): void {
    if (!this.state || this.state.currentPromptIndex >= this.state.promptIds.length) {
      this.currentPrompt = null;
      return;
    }
    const currentId = this.state.promptIds[this.state.currentPromptIndex];
    this.currentPrompt = ALL_PROMPTS.find(p => p.id === currentId) || null;
    this.promptStartTime = Date.now();
  }

  public async submitAnswer(
    outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target',
    answerPayload: any,
    assisted: boolean = false,
    actualEvidenceOverride?: EvidenceType
  ): Promise<EvaluationResult> {
    if (!this.state || !this.currentPrompt) {
      throw new Error('No active prompt to evaluate');
    }

    const durationMs = Date.now() - this.promptStartTime;
    const target = TARGETS.find(t => t.id === this.currentPrompt!.targetId)!;
    const evidenceChannel = actualEvidenceOverride || this.currentPrompt.evidence;

    const attempt: AttemptRecord = {
      attemptId: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId: this.state.sessionId,
      promptId: this.currentPrompt.id,
      targetId: target.id,
      game: this.currentPrompt.game,
      requestedEvidence: this.currentPrompt.evidence,
      actualEvidence: evidenceChannel,
      result: outcome,
      answerPayload,
      assisted,
      timestamp: Date.now(),
      durationMs,
    };

    // Save attempt
    await recordAttempt(attempt);
    this.state.attempts.push(attempt);

    // Update Target Progress in Spaced Repetition DB
    const existingProgress = await getTargetProgress(target.id, evidenceChannel);
    const updatedProgress = calculateNextStageProgress(existingProgress, attempt);
    await saveTargetProgress(updatedProgress);

    // If incorrect, enqueue a remedial retry prompt at the end if not already queued
    if (outcome === 'incorrect' && !this.state.promptIds.slice(this.state.currentPromptIndex + 1).includes(this.currentPrompt.id)) {
      this.state.promptIds.push(this.currentPrompt.id);
    }

    await saveSessionState(this.state);

    return {
      outcome,
      feedback: this.currentPrompt.explanation,
      target,
    };
  }

  public async advancePrompt(): Promise<{ hasMore: boolean; nextIndex: number }> {
    if (!this.state) {
      return { hasMore: false, nextIndex: 0 };
    }

    this.state.currentPromptIndex += 1;

    if (this.state.currentPromptIndex >= this.state.promptIds.length) {
      this.state.isCompleted = true;
      await markSessionCompleted(this.state.sessionId);

      // Award a decorative neighborhood stamp for completing a session!
      const gameStampMap: Record<string, string> = {
        market: 'market',
        cafe: 'cafe',
        builder: 'station',
        tales: 'park',
        slip: 'station',
        listening: 'cafe',
      };
      const stampId = gameStampMap[this.state.gameId] || 'market';
      await awardStamp(stampId);

      this.currentPrompt = null;
      return { hasMore: false, nextIndex: this.state.currentPromptIndex };
    }

    this.loadCurrentPrompt();
    await saveSessionState(this.state);
    return { hasMore: true, nextIndex: this.state.currentPromptIndex };
  }
}

export const sessionController = new SessionController();
