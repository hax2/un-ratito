import React, { useState } from 'react';
import { ListeningPrompt } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Headphones, Volume2, Eye, HelpCircle } from 'lucide-react';

interface Props {
  prompt: ListeningPrompt;
  onAnswer: (
    outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target',
    payload: any,
    assisted?: boolean,
    evidenceOverride?: 'meaning-recognition'
  ) => void;
  disabled?: boolean;
}

export const WhatDidTheyMeanGame: React.FC<Props> = ({ prompt, onAnswer, disabled }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    audioService.speakSpanish(prompt.clipSpanish, () => {
      setIsPlaying(false);
    });
  };

  const handleRevealTranscript = () => {
    setShowTranscript(true);
    audioService.playTap();
  };

  const handleChoice = (choiceId: string, isCorrect: boolean) => {
    if (disabled || selectedChoiceId) return;
    setSelectedChoiceId(choiceId);

    if (isCorrect) {
      audioService.playSuccessChime();
      if (showTranscript) {
        // Revealing transcript marks assisted and downgrades evidence to meaning recognition
        onAnswer('assisted', { choiceId }, true, 'meaning-recognition');
      } else {
        onAnswer('correct', { choiceId });
      }
    } else {
      audioService.playErrorSound();
      onAnswer('incorrect', { choiceId });
    }
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-4 py-2">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-xs font-semibold uppercase mb-1">
          <Headphones className="w-3.5 h-3.5" />
          What Did They Mean?
        </div>
        <h2 className="text-lg md:text-xl font-serif text-ink-900 font-bold">
          {prompt.question}
        </h2>
      </div>

      {/* Audio Player Card */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm text-center my-3 flex flex-col items-center">
        <button
          type="button"
          onClick={handlePlayAudio}
          disabled={disabled}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${
            isPlaying ? 'bg-terracotta-500 ring-4 ring-terracotta-200 animate-pulse' : 'bg-teal-500 hover:bg-teal-600'
          }`}
          aria-label="Play Spanish audio clip"
        >
          <Volume2 className="w-9 h-9" />
        </button>
        <span className="text-xs text-ink-500 font-medium mt-3">
          {isPlaying ? 'Listening to audio...' : 'Tap to hear the clip (Spain Spanish)'}
        </span>

        {/* Transcript Accordion / Assistance */}
        {showTranscript ? (
          <div className="mt-4 p-3 bg-cream-100 rounded-xl border border-cream-200 w-full animate-fade-in text-sm text-ink-900 font-medium italic">
            «{prompt.transcript}»
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRevealTranscript}
            className="mt-3 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800 underline"
          >
            <Eye className="w-3.5 h-3.5" />
            Show transcript (reading assistance)
          </button>
        )}
      </div>

      {/* Multiple Choice Options */}
      <div className="safe-bottom space-y-2.5 pt-2">
        {prompt.choices.map(choice => {
          const isSelected = selectedChoiceId === choice.id;
          let style = 'notebook-card-interactive bg-white border-cream-300 hover:border-teal-500 text-ink-900';
          if (selectedChoiceId) {
            if (isSelected) {
              style = choice.isCorrect
                ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold ring-2 ring-teal-400'
                : 'bg-terracotta-50 border-terracotta-500 text-terracotta-900 font-semibold ring-2 ring-terracotta-400';
            } else if (choice.isCorrect) {
              style = 'bg-teal-50 border-teal-400 text-teal-800 font-medium';
            } else {
              style = 'opacity-40 bg-cream-100 border-transparent text-ink-400';
            }
          }

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => handleChoice(choice.id, choice.isCorrect)}
              disabled={disabled || !!selectedChoiceId}
              className={`w-full min-h-[52px] px-4 py-3 text-left rounded-2xl text-sm md:text-base transition-all flex items-center justify-between ${style}`}
            >
              <span>{choice.text}</span>
              {isSelected && <HelpCircle className="w-4 h-4 shrink-0 ml-2 opacity-60" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
