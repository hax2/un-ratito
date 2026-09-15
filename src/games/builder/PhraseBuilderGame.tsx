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

  const isBeginner = learnerLevel === 'beginner';
  const promptHeader = isBeginner
    ? prompt.intent
    : prompt.interlocutorQuestion || prompt.situationalContext || prompt.intentEs || prompt.intent;

  const promptSubtext = !isBeginner && prompt.interlocutorQuestion && prompt.situationalContext
    ? prompt.situationalContext
    : null;

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-3 py-1 select-none overflow-hidden">
      {/* Header Arcade Banner */}
      <div className="flex items-center justify-between shrink-0 mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-950 font-black text-xs uppercase tracking-wider">
          <TrainTrack className="w-4 h-4 text-blue-700" />
          <span>Metro Sprint — Vía Madrid</span>
        </div>
      </div>

      {/* Situational Context Card */}
      <div className="bg-white rounded-2xl p-3 border-2 border-blue-200 shadow-sm relative mb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs font-black text-blue-800 uppercase tracking-wide block leading-none mb-1">
              {isBeginner ? 'Tu Objetivo' : 'Interlocutor / Situación'}
            </span>
            <p className="text-base md:text-lg font-black text-ink-900 leading-snug">
              {promptHeader}
            </p>
            {promptSubtext && (
              <p className="text-xs text-ink-500 mt-1 italic font-medium">
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
            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 flex items-center justify-center transition-colors shrink-0 shadow-xs active:scale-95"
            aria-label="Escuchar pista"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metro Rail Sentence Track */}
      <div className="bg-slate-900 rounded-2xl p-3 border-4 border-slate-950 shadow-inner flex flex-col justify-between min-h-[92px] mb-2 shrink-0">
        <div className="flex items-center justify-between text-xs font-black text-blue-300 uppercase tracking-wider mb-1">
          <span className="flex items-center gap-1.5">
            <TrainTrack className="w-4 h-4 text-blue-400" />
            Línea 1 Metro de Madrid
          </span>
          {selectedTileIds.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Borrar
            </button>
          )}
        </div>

        {/* Selected Tiles along track */}
        <div className="min-h-[50px] bg-slate-800/90 rounded-xl p-2 border border-slate-700 flex flex-wrap items-center justify-center gap-2">
          {typedMode ? (
            <input
              type="text"
              value={typedText}
              onChange={e => setTypedText(e.target.value)}
              placeholder={isBeginner ? "Escribe en español aquí..." : "Escribe tu respuesta aquí..."}
              disabled={disabled}
              className="w-full text-center text-lg font-bold text-white border-b-2 border-blue-400 focus:outline-none bg-transparent"
            />
          ) : selectedTileIds.length === 0 ? (
            <span className="text-xs text-slate-400 font-semibold italic">
              Toca las fichas inferiores para conectar la vía
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
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-black text-xs md:text-sm shadow-md border-b-2 border-blue-500 flex items-center gap-1 animate-pop hover:bg-blue-50 active:scale-95"
                >
                  <span>{tile.text}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Available Word Tiles with physical arcade depth */}
      <div className="mb-2 shrink-0">
        <div className="flex flex-wrap justify-center gap-2 min-h-[75px] items-center p-2 bg-cream-100/70 rounded-2xl border border-cream-200">
          {prompt.tiles.map(tile => {
            const isSelected = selectedTileIds.includes(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile.id)}
                disabled={disabled || isSelected}
                className={`px-3.5 py-2 rounded-xl font-black text-xs md:text-sm transition-all ${
                  isSelected
                    ? 'opacity-20 bg-cream-200 text-ink-300 pointer-events-none scale-95'
                    : 'bg-white text-ink-900 border-2 border-slate-200 hover:border-blue-500 shadow-[0_3px_0_#cbd5e1] active:translate-y-0.5 active:shadow-none cursor-pointer'
                }`}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Check Track Button */}
      <div className="flex items-center gap-2 pt-1 safe-bottom shrink-0">
        <button
          type="button"
          onClick={() => setTypedMode(!typedMode)}
          className="h-13 px-3.5 rounded-xl border-2 border-cream-300 font-bold text-xs text-ink-700 hover:bg-cream-100 transition-colors shrink-0"
        >
          {typedMode ? 'Fichas' : 'Teclado'}
        </button>

        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled || (!typedMode && selectedTileIds.length === 0)}
          className={`flex-1 h-13 py-3 rounded-2xl font-black text-base tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
            selectedTileIds.length > 0 || typedText.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_5px_0_#1d4ed8] active:translate-y-1 active:shadow-none'
              : 'bg-cream-200 text-ink-400 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>¡COMPROBAR VÍA!</span>
        </button>
      </div>
    </div>
  );
};
