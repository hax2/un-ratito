import React, { useState } from 'react';
import { TaleChoice, TalesPrompt, LearnerLevel } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Volume2, ArrowRight, Compass } from 'lucide-react';

interface Props {
  prompt: TalesPrompt;
  learnerLevel?: LearnerLevel;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

export const TinyTalesGame: React.FC<Props> = ({
  prompt,
  learnerLevel = 'beginner',
  onAnswer,
  disabled,
}) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<TaleChoice | null>(null);
  const [history, setHistory] = useState<{ speaker: string; text: string; userReply: string; consequence: string }[]>([]);

  const turn = prompt.turns[currentTurnIndex];
  const isLastTurn = currentTurnIndex === prompt.turns.length - 1;

  const handleSelectChoice = (choice: TaleChoice) => {
    if (disabled || selectedChoice) return;

    setSelectedChoice(choice);
    audioService.speakSpanish(choice.text);

    if (choice.isCorrect) {
      audioService.playSuccessChime();
    } else {
      audioService.playErrorSound();
    }
  };

  const handleContinue = () => {
    if (!selectedChoice) return;

    const newHistory = [
      ...history,
      {
        speaker: turn.speaker,
        text: turn.text,
        userReply: selectedChoice.text,
        consequence: selectedChoice.consequence,
      },
    ];
    setHistory(newHistory);

    if (isLastTurn) {
      const hadMistakes = !selectedChoice.isCorrect;
      onAnswer(hadMistakes ? 'incorrect' : 'correct', { history: newHistory });
    } else {
      setSelectedChoice(null);
      setCurrentTurnIndex(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-3 py-1 select-none overflow-hidden">
      {/* Header Banner */}
      <div className="text-center mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-1">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          {learnerLevel === 'advanced'
            ? `Aventuras en Madrid • ${prompt.title}`
            : `Aventuras en Madrid — ${prompt.title}`}
        </div>
        <p className="text-[11px] text-ink-500 italic truncate">{prompt.setting}</p>
      </div>

      {/* Narrative Dialogue Container */}
      <div className="flex-1 flex flex-col justify-center space-y-2 overflow-y-auto mb-2 min-h-0">
        {/* Past dialogue history (compact) */}
        {history.map((hist, i) => (
          <div key={i} className="text-[11px] opacity-75 border-l-2 border-emerald-300 pl-2 py-0.5 space-y-0.5">
            <p className="font-semibold text-ink-800">{hist.speaker}: «{hist.text}»</p>
            <p className="text-emerald-700 font-medium">Tú: «{hist.userReply}»</p>
          </div>
        ))}

        {/* Current Speaker Bubble */}
        <div className="bg-white rounded-2xl p-3 border-2 border-emerald-200 shadow-sm relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <span className="text-2xl" role="img" aria-label="speaker">
                {turn.speakerRole === 'server' ? '🧑‍🍳' : '🙋'}
              </span>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                  {turn.speaker}
                </span>
                <p className="text-sm md:text-base font-bold text-ink-900 leading-snug">
                  «{turn.text}»
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => audioService.speakSpanish(turn.text)}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors shrink-0"
              aria-label="Escuchar diálogo"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Goal Indicator */}
        <div className="text-center bg-emerald-50/70 py-1 px-2.5 rounded-lg border border-emerald-200">
          <span className="text-xs text-ink-700 font-medium">
            {learnerLevel === 'beginner' ? 'Goal:' : 'Tu respuesta:'}{' '}
            <strong className="text-ink-900">
              {learnerLevel === 'beginner' ? turn.goal : (turn.goalEs || turn.goal)}
            </strong>
          </span>
        </div>

        {/* Consequence Feedback */}
        {selectedChoice && (
          <div
            className={`p-2.5 rounded-xl border text-xs animate-fade-in ${
              selectedChoice.isCorrect
                ? 'bg-teal-50 border-teal-300 text-teal-900'
                : 'bg-terracotta-50 border-terracotta-300 text-terracotta-900'
            }`}
          >
            <p className="font-bold">{selectedChoice.feedback}</p>
            <p className="text-[11px] mt-0.5 italic">{selectedChoice.consequence}</p>
          </div>
        )}
      </div>

      {/* Response Choices / Continue */}
      <div className="pt-1 safe-bottom">
        {!selectedChoice ? (
          <div className="space-y-1.5">
            {turn.choices.map(choice => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleSelectChoice(choice)}
                disabled={disabled}
                className="w-full p-2.5 text-left rounded-xl bg-white border border-cream-300 hover:border-emerald-500 active:scale-98 transition-all flex items-center justify-between shadow-sm text-xs md:text-sm font-medium"
              >
                <span>{choice.text}</span>
                <ArrowRight className="w-3.5 h-3.5 text-ink-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>
              {isLastTurn
                ? (learnerLevel === 'beginner' ? 'Finish Adventure' : 'Completar Aventura')
                : (learnerLevel === 'beginner' ? 'Continue Scene' : 'Continuar')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
