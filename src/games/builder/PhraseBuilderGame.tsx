import React, { useState, useEffect } from 'react';
import { BuilderPrompt, BuilderTile, LearnerLevel } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Volume2, RotateCcw, Check, Sparkles } from 'lucide-react';
import { UI_TEXT } from '../../utils/language';

interface Props {
  prompt: BuilderPrompt;
  learnerLevel?: LearnerLevel;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

export const PhraseBuilderGame: React.FC<Props> = ({ prompt, learnerLevel = 'beginner', onAnswer, disabled }) => {
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [typedMode, setTypedMode] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [feedbackNote, setFeedbackNote] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTileIds([]);
    setTypedText('');
    setFeedbackNote(null);
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
      // Clean and normalize strings for typed mode
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

    // Compare selectedTileIds to accepted sequences
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

    // Check valid off-target
    if (prompt.validOffTargetSequences) {
      const offTarget = prompt.validOffTargetSequences.find(ot => {
        if (ot.sequence.length !== selectedTileIds.length) return false;
        return ot.sequence.every((id, idx) => id === selectedTileIds[idx]);
      });
      if (offTarget) {
        audioService.playTap();
        setFeedbackNote(offTarget.feedback);
        onAnswer('valid-off-target', { selectedTileIds });
        return;
      }
    }

    // Otherwise incorrect
    audioService.playErrorSound();
    onAnswer('incorrect', { selectedTileIds });
  };

  const constructedSentence = selectedTileIds
    .map(id => tileMap.get(id)?.text || '')
    .join(' ');

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-4 py-2">
      {/* Intent & Goal header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 text-ink-700 text-xs font-semibold tracking-wide uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
          {learnerLevel === 'advanced' ? 'Constructor de frases' : 'Phrase Builder'}
        </div>
        <h2 className="text-xl md:text-2xl font-serif text-ink-900 font-bold leading-tight">
          {learnerLevel === 'beginner' ? prompt.intent : (prompt.intentEs || prompt.intent)}
        </h2>
        {learnerLevel === 'intermediate' && prompt.intentEs && (
          <p className="text-xs text-ink-400 mt-1 italic">
            ({prompt.intent})
          </p>
        )}
      </div>

      {/* Target construction sentence area */}
      <div className="min-h-[96px] bg-white rounded-2xl border-2 border-dashed border-cream-300 p-3.5 mb-4 flex flex-wrap items-center justify-center gap-2 shadow-inner">
        {typedMode ? (
          <input
            type="text"
            value={typedText}
            onChange={e => setTypedText(e.target.value)}
            placeholder={learnerLevel === 'beginner' ? "Type Spanish sentence here..." : "Escribe la frase en español aquí..."}
            disabled={disabled}
            className="w-full text-center text-lg font-medium p-2 border-b-2 border-teal-500 focus:outline-none bg-transparent"
          />
        ) : selectedTileIds.length === 0 ? (
          <span className="text-ink-400 text-sm italic select-none">
            {learnerLevel === 'beginner' ? "Tap tiles below to build the sentence" : "Toca las fichas inferiores para formar la frase"}
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
                disabled={disabled}
                className="px-3.5 py-2 rounded-xl bg-terracotta-500 text-white font-medium text-base shadow-sm active:scale-95 transition-transform"
              >
                {tile.text}
              </button>
            );
          })
        )}
      </div>

      {feedbackNote && (
        <div className="bg-mustard-100 text-ink-800 text-sm p-3 rounded-xl mb-3 border border-mustard-400">
          {feedbackNote}
        </div>
      )}

      {/* Available Word Tiles */}
      {!typedMode && (
        <div className="flex flex-wrap justify-center gap-2.5 mb-6">
          {prompt.tiles.map(tile => {
            const isSelected = selectedTileIds.includes(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile.id)}
                disabled={disabled || isSelected}
                className={`min-h-[48px] px-4 py-2.5 rounded-xl font-medium text-base transition-all ${
                  isSelected
                    ? 'opacity-30 bg-cream-200 text-ink-400 cursor-not-allowed'
                    : 'notebook-card-interactive bg-white text-ink-900 active:scale-95 hover:border-terracotta-500'
                }`}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom thumb-friendly action bar */}
      <div className="safe-bottom pt-2">
        <div className="flex items-center gap-3">
          {!typedMode && selectedTileIds.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="h-12 w-12 rounded-xl bg-cream-200 text-ink-700 flex items-center justify-center hover:bg-cream-300 transition-colors"
              aria-label="Clear tiles"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => audioService.speakSpanish(constructedSentence || prompt.canonicalDisplay)}
            className="h-12 w-12 rounded-xl bg-cream-200 text-ink-700 flex items-center justify-center hover:bg-cream-300 transition-colors"
            aria-label="Speak pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleCheck}
            disabled={disabled || (!typedMode && selectedTileIds.length === 0)}
            className={`flex-1 h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-md transition-all ${
              disabled || (!typedMode && selectedTileIds.length === 0)
                ? 'bg-cream-300 text-ink-400 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 text-white active:scale-98'
            }`}
          >
            <Check className="w-5 h-5" />
            {UI_TEXT.checkAnswer[learnerLevel]}
          </button>
        </div>

        {/* Stretch difficulty typed mode toggle */}
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => setTypedMode(!typedMode)}
            className="text-xs text-ink-500 underline hover:text-ink-800"
          >
            {typedMode
              ? (learnerLevel === 'advanced' ? 'Usar fichas de palabras' : 'Switch to Word Tiles')
              : (learnerLevel === 'advanced' ? 'Escribir respuesta (teclado)' : 'Switch to Typing (Stretch)')}
          </button>
        </div>
      </div>
    </div>
  );
};
