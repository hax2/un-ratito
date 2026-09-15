import React, { useState } from 'react';
import { ListeningPrompt, LearnerLevel } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Radio, Volume2, Eye, HelpCircle } from 'lucide-react';

interface Props {
  prompt: ListeningPrompt;
  learnerLevel?: LearnerLevel;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

export const WhatDidTheyMeanGame: React.FC<Props> = ({
  prompt,
  learnerLevel = 'beginner',
  onAnswer,
  disabled,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealedTranscript, setRevealedTranscript] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const handlePlayAudio = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    audioService.speakSpanish(prompt.clipSpanish);
    setTimeout(() => setIsPlaying(false), 2200);
  };

  const handleSelectChoice = (choiceId: string, isCorrect: boolean) => {
    if (disabled || selectedChoiceId) return;

    setSelectedChoiceId(choiceId);

    if (isCorrect) {
      audioService.playSuccessChime();
      setTimeout(() => {
        onAnswer(revealedTranscript ? 'assisted' : 'correct', { selectedChoiceId, revealedTranscript });
      }, 700);
    } else {
      audioService.playErrorSound();
      setTimeout(() => {
        onAnswer('incorrect', { selectedChoiceId, revealedTranscript });
      }, 900);
    }
  };

  const handleRevealTranscript = () => {
    audioService.playTap();
    setRevealedTranscript(true);
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-3 py-1 select-none overflow-hidden">
      {/* Header Banner */}
      <div className="text-center mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold uppercase tracking-wider mb-1">
          <Radio className="w-3.5 h-3.5 text-indigo-600" />
          {learnerLevel === 'advanced' ? 'Radio Retiro — 98.2 FM' : 'Radio Retiro — Listening Comprehension'}
        </div>
      </div>

      {/* Vintage Radio Tuner Box */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-3 border-4 border-slate-800 shadow-inner flex flex-col justify-between mb-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Emisión en Directo • Madrid
          </span>
          <span className="font-mono text-indigo-400">98.2 FM</span>
        </div>

        {/* Animated Sound Waveform & Big Play Button */}
        <div className="flex items-center justify-center gap-3 py-2">
          <button
            type="button"
            onClick={handlePlayAudio}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
              isPlaying
                ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
            aria-label="Reproducir corte de audio"
          >
            <Volume2 className="w-7 h-7" />
          </button>

          {/* Equalizer Waveform Bars */}
          <div className="flex items-center gap-1 h-10 px-2 bg-slate-800/80 rounded-xl border border-slate-700">
            {[40, 75, 55, 90, 60, 85, 45, 95, 65, 50].map((h, i) => (
              <div
                key={i}
                style={{ height: isPlaying ? `${h}%` : '25%' }}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isPlaying ? 'bg-indigo-400' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Transcript Assistance Reveal */}
        <div className="text-center pt-1 border-t border-slate-800">
          {revealedTranscript ? (
            <p className="text-xs md:text-sm font-serif italic text-amber-200 animate-fade-in">
              «{prompt.transcript}»
            </p>
          ) : (
            <button
              type="button"
              onClick={handleRevealTranscript}
              className="text-[11px] font-medium text-slate-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              {learnerLevel === 'beginner'
                ? 'Reveal spoken transcript (with hint penalty)'
                : 'Mostrar transcripción'}
            </button>
          )}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-2.5 border border-cream-300 shadow-sm mb-2 text-left">
        <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
          <HelpCircle className="w-3.5 h-3.5" />
          {learnerLevel === 'beginner' ? 'Comprehension Question' : 'Pregunta de comprensión'}
        </div>
        <p className="text-sm md:text-base font-bold text-ink-900 leading-snug">
          {learnerLevel === 'beginner' ? prompt.question : (prompt.questionEs || prompt.question)}
        </p>
      </div>

      {/* Multiple-Choice Deduction Cards */}
      <div className="space-y-1.5 mb-1">
        {prompt.choices.map(choice => {
          const isSelected = selectedChoiceId === choice.id;
          let cardStyle = 'bg-white hover:bg-indigo-50/50 border-cream-300 text-ink-800';

          if (isSelected) {
            cardStyle = choice.isCorrect
              ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold ring-2 ring-teal-400'
              : 'bg-terracotta-50 border-terracotta-500 text-terracotta-950 font-bold ring-2 ring-terracotta-400';
          }

          const displayText =
            learnerLevel === 'beginner'
              ? choice.text
              : choice.textEs || choice.text;

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => handleSelectChoice(choice.id, choice.isCorrect)}
              disabled={disabled || !!selectedChoiceId}
              className={`w-full p-2.5 rounded-xl border-2 text-xs md:text-sm text-left transition-all flex items-center justify-between active:scale-98 shadow-sm ${cardStyle}`}
            >
              <span>{displayText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
