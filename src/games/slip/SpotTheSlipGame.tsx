import React, { useState } from 'react';
import { SlipPrompt } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  prompt: SlipPrompt;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

export const SpotTheSlipGame: React.FC<Props> = ({ prompt, onAnswer, disabled }) => {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [chosenCorrection, setChosenCorrection] = useState<string | null>(null);

  const handleTokenClick = (idx: number) => {
    if (disabled || chosenCorrection) return;
    audioService.playTap();
    setSelectedTokenIndex(idx);
  };

  const handleChooseCorrection = (correction: string) => {
    if (disabled || chosenCorrection) return;
    setChosenCorrection(correction);

    if (!prompt.hasError) {
      if (correction === prompt.correctCorrection) {
        audioService.playSuccessChime();
        onAnswer('correct', { noError: true });
      } else {
        audioService.playErrorSound();
        onAnswer('incorrect', { correction });
      }
      return;
    }

    // Has error: check if token index matches AND correction matches
    const isTokenCorrect = selectedTokenIndex === prompt.errorTokenIndex;
    const isCorrectionCorrect = correction === prompt.correctCorrection;

    if (isTokenCorrect && isCorrectionCorrect) {
      audioService.playSuccessChime();
      audioService.speakSpanish(prompt.correctedSentence);
      onAnswer('correct', { selectedTokenIndex, correction });
    } else {
      audioService.playErrorSound();
      onAnswer('incorrect', { selectedTokenIndex, correction });
    }
  };

  const handleClaimNoError = () => {
    if (disabled || chosenCorrection) return;
    setChosenCorrection('Sentence is correct as is');

    if (!prompt.hasError) {
      audioService.playSuccessChime();
      audioService.speakSpanish(prompt.correctedSentence);
      onAnswer('correct', { noError: true });
    } else {
      audioService.playErrorSound();
      onAnswer('incorrect', { claimedNoError: true });
    }
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-4 py-2">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-700 text-xs font-semibold uppercase mb-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Spot the Slip
        </div>
        <h2 className="text-lg md:text-xl font-serif text-ink-900 font-bold">
          Tap the word with an error, or confirm it's correct
        </h2>
      </div>

      {/* Sentence Sign Box */}
      <div className="bg-white rounded-3xl p-5 border-2 border-cream-300 shadow-sm text-center my-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {prompt.tokens.map((token, idx) => {
            const isSelected = selectedTokenIndex === idx;
            const isErrorToken = prompt.hasError && prompt.errorTokenIndex === idx;

            let tokenStyle = 'bg-cream-100 text-ink-900 hover:border-teal-500';
            if (isSelected) {
              tokenStyle = 'bg-terracotta-500 text-white shadow-md ring-2 ring-terracotta-300';
            } else if (chosenCorrection && isErrorToken) {
              tokenStyle = 'bg-terracotta-100 text-terracotta-800 line-through';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTokenClick(idx)}
                disabled={disabled || !!chosenCorrection}
                className={`min-h-[48px] px-3.5 py-2 rounded-xl text-lg font-medium border border-cream-200 transition-all active:scale-95 ${tokenStyle}`}
              >
                {token}
              </button>
            );
          })}
        </div>
      </div>

      {/* Correction Drawer / Choices */}
      <div className="safe-bottom space-y-3 pt-2">
        {selectedTokenIndex !== null && prompt.hasError && !chosenCorrection && (
          <div className="bg-cream-100 p-4 rounded-2xl border border-cream-200 animate-fade-in">
            <p className="text-xs font-bold text-ink-600 uppercase mb-2 text-center">
              How would you fix «{prompt.tokens[selectedTokenIndex]}»?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {prompt.correctionChoices.map((choice, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleChooseCorrection(choice)}
                  disabled={disabled}
                  className="min-h-[48px] py-2.5 px-3 rounded-xl bg-white border border-cream-300 font-bold text-ink-900 hover:border-teal-500 active:scale-95 shadow-sm text-sm"
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        )}

        {!chosenCorrection && (
          <button
            type="button"
            onClick={handleClaimNoError}
            disabled={disabled}
            className="w-full min-h-[50px] rounded-2xl bg-cream-200 hover:bg-cream-300 text-ink-800 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            This sentence has no mistake
          </button>
        )}

        {chosenCorrection && (
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-teal-600" />
            <div>
              <p className="font-bold">Correct version:</p>
              <p className="italic">{prompt.correctedSentence}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
