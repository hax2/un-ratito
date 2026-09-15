import React, { useState, useEffect } from 'react';
import { BuilderPrompt, BuilderTile, LearnerLevel } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Volume2, RotateCcw, Check, TrainTrack } from 'lucide-react';

interface Props {
  prompt: BuilderPrompt;
  learnerLevel?: LearnerLevel;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

export const PhraseBuilderGame: React.FC<Props> = ({
  prompt,
  learnerLevel = 'beginner',
  onAnswer,
  disabled,
}) => {
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [typedMode, setTypedMode] = useState(false);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    setSelectedTileIds([]);
    setTypedText('');
  }, [prompt.id]);

  const tileMap = new Map<string, BuilderTile>(prompt.tiles.map(t => [t.id, t]));

  const handleTileClick = (tileId: string) => {
    if (disabled) return;
    audioService.playTap();
    if (selectedTileIds.includes(tileId)) {
      setSelectedTileIds(prev => prev.filter(id => id !== tileId));
    } else {
      setSelectedTileIds(prev => [...prev, tileId]);
    }
  };

  const handleClear = () => {
    if (disabled) return;
    audioService.playRemove();
    setSelectedTileIds([]);
  };

  const handleCheck = () => {
    if (disabled) return;

    if (typedMode) {
      const cleanTyped = typedText.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()¿¡]/g, '');
      const cleanCanonical = prompt.canonicalDisplay.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()¿¡]/g, '');
      if (cleanTyped === cleanCanonical) {
        audioService.playSuccessChime();
        audioService.speakSpanish(prompt.canonicalDisplay);
        onAnswer('correct', { typed: typedText });
      } else {
        audioService.playErrorSound();
        onAnswer('incorrect', { typed: typedText });
      }
      return;
    }

    if (selectedTileIds.length === 0) return;

    const isAccepted = prompt.acceptedSequences.some(seq => {
      if (seq.length !== selectedTileIds.length) return false;
      return seq.every((id, idx) => id === selectedTileIds[idx]);
    });

    if (isAccepted) {
      audioService.playSuccessChime();
      audioService.speakSpanish(prompt.canonicalDisplay);
      onAnswer('correct', { selectedTileIds });
      return;
    }

    if (prompt.validOffTargetSequences) {
      const offTarget = prompt.validOffTargetSequences.find(ot => {
        if (ot.sequence.length !== selectedTileIds.length) return false;
        return ot.sequence.every((id, idx) => id === selectedTileIds[idx]);
      });
      if (offTarget) {
        audioService.playTap();
        onAnswer('valid-off-target', { selectedTileIds });
        return;
      }
    }

    audioService.playErrorSound();
    onAnswer('incorrect', { selectedTileIds });
  };

  // Determine prompt display: NEVER ask to translate Spanish to Spanish!
  const isBeginner = learnerLevel === 'beginner';
  const promptHeader = isBeginner
    ? prompt.intent
    : prompt.interlocutorQuestion || prompt.situationalContext || prompt.intentEs || prompt.intent;

  const promptSubtext = !isBeginner && prompt.interlocutorQuestion && prompt.situationalContext
    ? prompt.situationalContext
    : isBeginner
    ? null
    : null;

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-3 py-1 select-none overflow-hidden">
      {/* Header Banner */}
      <div className="text-center mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-1">
          <TrainTrack className="w-3.5 h-3.5 text-blue-600" />
          {learnerLevel === 'advanced' ? 'Metro Sprint — Vía Rápida' : 'Metro Sprint — Sentence Rail'}
        </div>
      </div>

      {/* Situational Interlocutor / Context Prompt */}
      <div className="bg-white rounded-2xl p-3 border-2 border-blue-200 shadow-sm relative mb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="text-left">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide block mb-0.5">
              {isBeginner ? 'Your Goal' : 'Interlocutor / Situación'}
            </span>
            <p className="text-sm md:text-base font-bold text-ink-900 leading-snug">
              {promptHeader}
            </p>
            {promptSubtext && (
              <p className="text-xs text-ink-500 mt-1 italic">
                {promptSubtext}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (prompt.interlocutorQuestion) {
                audioService.speakSpanish(prompt.interlocutorQuestion.replace(/«|»/g, ''));
              } else {
                audioService.speakSpanish(prompt.canonicalDisplay);
              }
            }}
            className="p-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors shrink-0"
            aria-label="Escuchar pista"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metro Rail Sentence Construction Track */}
      <div className="bg-slate-900 rounded-2xl p-3 border-4 border-slate-800 shadow-inner flex flex-col justify-between min-h-[90px] mb-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
          <span className="flex items-center gap-1">
            <TrainTrack className="w-3 h-3 text-blue-400" />
            Vía Metro Madrid
          </span>
          {selectedTileIds.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {isBeginner ? 'Clear' : 'Borrar'}
            </button>
          )}
        </div>

        {/* Selected Tiles on Track */}
        <div className="min-h-[50px] bg-slate-800/80 rounded-xl p-2 border border-slate-700 flex flex-wrap items-center justify-center gap-1.5">
          {typedMode ? (
            <input
              type="text"
              value={typedText}
              onChange={e => setTypedText(e.target.value)}
              placeholder={isBeginner ? "Type response here..." : "Escribe tu respuesta aquí..."}
              disabled={disabled}
              className="w-full text-center text-base font-medium text-white border-b border-blue-400 focus:outline-none bg-transparent"
            />
          ) : selectedTileIds.length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              {isBeginner ? 'Tap metro tiles below to connect the sentence' : 'Toca las fichas para conectar la respuesta'}
            </span>
          ) : (
            selectedTileIds.map(id => {
              const tile = tileMap.get(id);
              if (!tile) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTileClick(id)}
                  className="px-2.5 py-1 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-md border-b-2 border-blue-500 flex items-center gap-1 animate-pop hover:bg-blue-50"
                >
                  <span>{tile.text}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Available Word Tiles */}
      <div className="mb-2">
        <div className="flex flex-wrap justify-center gap-1.5 min-h-[70px] items-center p-1 bg-cream-100/60 rounded-2xl border border-cream-200">
          {prompt.tiles.map(tile => {
            const isSelected = selectedTileIds.includes(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile.id)}
                disabled={disabled || isSelected}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm ${
                  isSelected
                    ? 'opacity-25 bg-cream-200 text-ink-300 pointer-events-none scale-95'
                    : 'bg-white hover:bg-blue-50 text-ink-900 border border-cream-300 hover:border-blue-400 active:scale-95'
                }`}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center gap-2 pt-1 safe-bottom">
        <button
          type="button"
          onClick={() => setTypedMode(!typedMode)}
          className="h-12 px-3 rounded-xl border border-cream-300 text-xs font-bold text-ink-600 hover:bg-cream-100 transition-colors shrink-0"
        >
          {typedMode ? 'Tiles' : 'Type'}
        </button>

        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || (!typedMode && selectedTileIds.length === 0)}
          className={`flex-1 h-12 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
            selectedTileIds.length > 0 || typedText.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-blue-200'
              : 'bg-cream-200 text-ink-400 cursor-not-allowed'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{isBeginner ? 'Check Sentence' : 'Comprobar Vía'}</span>
        </button>
      </div>
    </div>
  );
};
