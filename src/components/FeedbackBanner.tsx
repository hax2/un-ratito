import React from 'react';
import { Target, LearnerLevel } from '../content/types';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Volume2 } from 'lucide-react';
import { audioService } from '../audio/audioService';
import { UI_TEXT } from '../utils/language';

interface Props {
  outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target';
  explanation: string;
  target?: Target;
  learnerLevel?: LearnerLevel;
  onNext: () => void;
  isLastPrompt: boolean;
}

export const FeedbackBanner: React.FC<Props> = ({
  outcome,
  explanation,
  target,
  learnerLevel = 'beginner',
  onNext,
  isLastPrompt,
}) => {
  const isPositive = outcome === 'correct' || outcome === 'assisted';

  return (
    <div
      role="region"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 p-3 safe-bottom border-t-2 shadow-2xl z-50 animate-slide-up ${
        isPositive
          ? 'bg-teal-50 border-teal-400 text-teal-950'
          : outcome === 'valid-off-target'
          ? 'bg-mustard-100 border-mustard-400 text-ink-900'
          : 'bg-terracotta-50 border-terracotta-400 text-terracotta-950'
      }`}
    >
      <div className="max-w-lg mx-auto flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            {isPositive ? (
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            ) : outcome === 'valid-off-target' ? (
              <AlertCircle className="w-5 h-5 text-mustard-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {learnerLevel === 'beginner' ? (
                  outcome === 'correct'
                    ? '¡Muy bien! (Correct)'
                    : outcome === 'assisted'
                    ? 'Good (Assisted)'
                    : outcome === 'valid-off-target'
                    ? 'Valid Spanish, but try the target construction'
                    : 'Needs repair'
                ) : (
                  outcome === 'correct'
                    ? '¡Excelente! (Correcto)'
                    : outcome === 'assisted'
                    ? 'Bien (con ayuda)'
                    : outcome === 'valid-off-target'
                    ? 'Válido, pero practica la construcción indicada'
                    : 'Necesita corrección'
                )}
              </h3>
              <p className="text-xs text-ink-700 mt-0.5 line-clamp-2">
                {explanation}
              </p>
              {target && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] bg-white/80 px-1.5 py-0.2 rounded font-mono text-ink-800 border border-cream-300">
                    {learnerLevel === 'beginner' ? 'Target' : 'Objetivo'}: {target.spanish}
                  </span>
                  <button
                    type="button"
                    onClick={() => audioService.speakSpanish(target.spanish)}
                    className="p-0.5 rounded bg-white/80 hover:bg-white text-ink-700"
                    aria-label="Escuchar objetivo en español"
                  >
                    <Volume2 className="w-3 h-3" />
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
          className={`w-full h-11 rounded-xl font-bold text-sm text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 ${
            isPositive
              ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
              : 'bg-terracotta-600 hover:bg-terracotta-700 shadow-terracotta-200'
          }`}
        >
          <span>
            {isLastPrompt
              ? UI_TEXT.seeSummary[learnerLevel]
              : UI_TEXT.nextQuestion[learnerLevel]}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
