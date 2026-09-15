import React from 'react';
import { Target } from '../content/types';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Volume2 } from 'lucide-react';
import { audioService } from '../audio/audioService';

interface Props {
  outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target';
  explanation: string;
  target?: Target;
  onNext: () => void;
  isLastPrompt: boolean;
}

export const FeedbackBanner: React.FC<Props> = ({
  outcome,
  explanation,
  target,
  onNext,
  isLastPrompt,
}) => {
  const isPositive = outcome === 'correct' || outcome === 'assisted';

  return (
    <div
      role="region"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 p-4 safe-bottom border-t-2 shadow-2xl z-50 animate-slide-up ${
        isPositive
          ? 'bg-teal-50 border-teal-400 text-teal-950'
          : outcome === 'valid-off-target'
          ? 'bg-mustard-100 border-mustard-400 text-ink-900'
          : 'bg-terracotta-50 border-terracotta-400 text-terracotta-950'
      }`}
    >
      <div className="max-w-lg mx-auto flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            {isPositive ? (
              <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
            ) : outcome === 'valid-off-target' ? (
              <AlertCircle className="w-6 h-6 text-mustard-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-terracotta-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-base leading-tight">
                {outcome === 'correct'
                  ? '¡Muy bien! (Correct)'
                  : outcome === 'assisted'
                  ? 'Good (Assisted)'
                  : outcome === 'valid-off-target'
                  ? 'Valid Spanish, but try the target construction'
                  : 'Needs repair'}
              </h3>
              <p className="text-xs md:text-sm text-ink-700 mt-1">
                {explanation}
              </p>
              {target && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs bg-white/80 px-2 py-0.5 rounded font-mono text-ink-800 border border-cream-300">
                    Target: {target.spanish}
                  </span>
                  <button
                    type="button"
                    onClick={() => audioService.speakSpanish(target.spanish)}
                    className="p-1 rounded bg-white/80 hover:bg-white text-ink-700"
                    aria-label="Listen to target Spanish"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          autoFocus
          className={`w-full h-13 py-3 rounded-2xl font-bold text-base text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 ${
            isPositive
              ? 'bg-teal-600 hover:bg-teal-700'
              : 'bg-terracotta-600 hover:bg-terracotta-700'
          }`}
        >
          <span>{isLastPrompt ? 'See Summary' : 'Next Question'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
