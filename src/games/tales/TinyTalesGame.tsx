import React, { useState } from 'react';
import { TaleChoice, TalesPrompt } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { BookOpen, Volume2, ArrowRight } from 'lucide-react';

interface Props {
  prompt: TalesPrompt;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

export const TinyTalesGame: React.FC<Props> = ({ prompt, onAnswer, disabled }) => {
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
      // Scene completed! Check if any choice was wrong
      const hadMistakes = !selectedChoice.isCorrect;
      onAnswer(hadMistakes ? 'incorrect' : 'correct', { history: newHistory });
    } else {
      setSelectedChoice(null);
      setCurrentTurnIndex(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-4 py-2">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-100 text-olive-600 text-xs font-semibold uppercase mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          Tiny Tales • {prompt.title}
        </div>
        <p className="text-xs text-ink-500 italic">{prompt.setting}</p>
      </div>

      {/* Narrative Dialogue Area */}
      <div className="flex-1 flex flex-col justify-center space-y-4 overflow-y-auto mb-4 max-h-[46vh]">
        {/* Previous dialogue summary if multi-turn */}
        {history.map((hist, i) => (
          <div key={i} className="text-xs opacity-60 border-l-2 border-cream-300 pl-3 py-1 space-y-1">
            <p className="font-semibold text-ink-800">{hist.speaker}: «{hist.text}»</p>
            <p className="text-teal-600 font-medium">Tú: «{hist.userReply}»</p>
          </div>
        ))}

        {/* Current Speaker Bubble */}
        <div className="bg-white rounded-2xl p-4 border border-cream-200 shadow-sm relative">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-terracotta-600 uppercase tracking-wider">
                {turn.speaker}
              </span>
              <p className="text-lg md:text-xl font-medium text-ink-900 mt-1">
                «{turn.text}»
              </p>
            </div>
            <button
              type="button"
              onClick={() => audioService.speakSpanish(turn.text)}
              className="p-2 rounded-xl bg-cream-100 text-ink-700 hover:bg-cream-200 transition-colors"
              aria-label="Listen to speaker"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Goal Indicator */}
        <div className="text-center bg-cream-100 py-1.5 px-3 rounded-lg border border-cream-200">
          <span className="text-xs text-ink-700 font-medium">
            🎯 Your goal: <strong className="text-ink-900">{turn.goal}</strong>
          </span>
        </div>

        {/* Consequence / Feedback Banner */}
        {selectedChoice && (
          <div className={`p-3.5 rounded-xl border text-sm animate-fade-in ${
            selectedChoice.isCorrect
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-terracotta-50 border-terracotta-200 text-terracotta-800'
          }`}>
            <p className="font-semibold">{selectedChoice.feedback}</p>
            <p className="text-xs mt-1 text-ink-700 italic">{selectedChoice.consequence}</p>
          </div>
        )}
      </div>

      {/* Response Choices */}
      <div className="safe-bottom space-y-2 pt-2">
        {!selectedChoice ? (
          <div className="space-y-2.5">
            {turn.choices.map(choice => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleSelectChoice(choice)}
                disabled={disabled}
                className="w-full min-h-[52px] px-4 py-3 text-left rounded-2xl notebook-card-interactive bg-white border border-cream-300 font-medium text-ink-900 hover:border-teal-500 active:scale-98 transition-all flex items-center justify-between"
              >
                <span>{choice.text}</span>
                <ArrowRight className="w-4 h-4 text-ink-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleContinue}
            className="w-full h-14 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>{isLastTurn ? 'Finish Scene' : 'Next Turn'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
