import React, { useState } from 'react';
import { SessionState, LearnerLevel } from '../content/types';
import { sessionController, EvaluationResult } from '../learning/sessionController';
import { PromptRenderer } from '../components/PromptRenderer';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { X } from 'lucide-react';
import { audioService } from '../audio/audioService';

interface Props {
  sessionState: SessionState;
  learnerLevel?: LearnerLevel;
  onFinishSession: (session: SessionState) => void;
  onExitSession: () => void;
}

export const SessionView: React.FC<Props> = ({
  sessionState,
  learnerLevel = 'beginner',
  onFinishSession,
  onExitSession,
}) => {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const currentPrompt = sessionController.getCurrentPrompt();

  if (!currentPrompt) {
    // If no prompt, session is already complete
    onFinishSession(sessionState);
    return null;
  }

  const handleAnswer = async (
    outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target',
    payload: any,
    assisted: boolean = false,
    evidenceOverride?: any
  ) => {
    if (evaluation) return; // Prevent double-submit
    const res = await sessionController.submitAnswer(outcome, payload, assisted, evidenceOverride);
    setEvaluation(res);
  };

  const handleNext = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    audioService.playTap();

    const { hasMore } = await sessionController.advancePrompt();
    setEvaluation(null);
    setIsAdvancing(false);

    if (!hasMore) {
      const finalState = sessionController.getState();
      if (finalState) {
        onFinishSession(finalState);
      }
    }
  };

  const totalQuestions = sessionState.promptIds.length;
  const currentIndex = sessionState.currentPromptIndex;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] justify-between max-w-lg mx-auto w-full pb-4">
      {/* Session Progress Header */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            audioService.playTap();
            onExitSession();
          }}
          className="p-2 rounded-xl text-ink-500 hover:text-ink-900 hover:bg-cream-200 transition-colors"
          aria-label="Stop session and save"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress indicators */}
        <div className="flex-1 flex items-center justify-center gap-1.5 px-2">
          {sessionState.promptIds.map((_, idx) => {
            let dotColor = 'bg-cream-300';
            if (idx < currentIndex) {
              dotColor = 'bg-teal-500';
            } else if (idx === currentIndex) {
              dotColor = 'bg-terracotta-500 scale-125';
            }
            return (
              <div
                key={idx}
                className={`h-2 flex-1 max-w-[32px] rounded-full transition-all ${dotColor}`}
              />
            );
          })}
        </div>

        <span className="text-xs font-bold text-ink-500 font-mono">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Main Game Surface */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto">
        <PromptRenderer
          key={currentPrompt.id}
          prompt={currentPrompt}
          learnerLevel={learnerLevel}
          onAnswer={handleAnswer}
          disabled={!!evaluation}
        />
      </div>

      {/* Evaluation Feedback Banner */}
      {evaluation && (
        <FeedbackBanner
          outcome={evaluation.outcome}
          explanation={evaluation.feedback}
          target={evaluation.target}
          learnerLevel={learnerLevel}
          onNext={handleNext}
          isLastPrompt={isLast}
        />
      )}
    </div>
  );
};
