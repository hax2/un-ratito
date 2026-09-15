import React, { useState } from 'react';
import { TapeoPrompt, LearnerLevel } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Volume2, UtensilsCrossed, CheckCircle2, RotateCcw, Flame } from 'lucide-react';
import { shouldShowEnglish } from '../../utils/language';

interface Props {
  prompt: TapeoPrompt;
  learnerLevel?: LearnerLevel;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

export const TapeoFrenzyGame: React.FC<Props> = ({
  prompt,
  learnerLevel = 'beginner',
  onAnswer,
  disabled,
}) => {
  const [trayItemIds, setTrayItemIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleToggleItem = (itemId: string) => {
    if (disabled || submitted) return;

    audioService.playTap();
    const item = prompt.availableItems.find(i => i.id === itemId);
    if (item) {
      audioService.speakSpanish(item.nameEs);
    }

    if (trayItemIds.includes(itemId)) {
      setTrayItemIds(prev => prev.filter(id => id !== itemId));
    } else {
      setTrayItemIds(prev => [...prev, itemId]);
    }
  };

  const handleClearTray = () => {
    if (disabled || submitted) return;
    audioService.playRemove();
    setTrayItemIds([]);
  };

  const handlePlayAudio = () => {
    audioService.speakSpanish(prompt.orderSpokenSpanish);
  };

  const handleServe = () => {
    if (disabled || submitted || trayItemIds.length === 0) return;

    setSubmitted(true);

    // Check if tray items match required items
    const reqSorted = [...prompt.requiredItemIds].sort();
    const traySorted = [...trayItemIds].sort();

    const isMatch =
      reqSorted.length === traySorted.length &&
      reqSorted.every((val, idx) => val === traySorted[idx]);

    if (isMatch) {
      audioService.playSuccessChime();
      setTimeout(() => {
        onAnswer('correct', { trayItemIds });
      }, 700);
    } else {
      audioService.playErrorSound();
      setTimeout(() => {
        onAnswer('incorrect', { trayItemIds });
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-3 py-2 select-none overflow-hidden">
      {/* Header Banner */}
      <div className="text-center mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-terracotta-100 text-terracotta-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Flame className="w-3.5 h-3.5 text-terracotta-500 animate-pulse" />
          {learnerLevel === 'advanced' ? 'Tapeo Frenzy — ¡Marchando!' : 'Tapeo Frenzy — Tapas Bar Rush'}
        </div>
      </div>

      {/* Customer Comanda Bubble */}
      <div className="bg-white rounded-2xl p-3 border-2 border-amber-200 shadow-sm relative mb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="patron">
              🧑‍🍳
            </span>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block">
                {prompt.patronName}
              </span>
              <p className="text-sm md:text-base font-bold text-ink-900 leading-snug">
                «{prompt.orderSpokenSpanish}»
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePlayAudio}
            className="p-2 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors shrink-0"
            aria-label="Escuchar pedido"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {shouldShowEnglish(learnerLevel) && prompt.orderEnglish && (
          <p className="text-xs text-ink-400 mt-1 italic border-t border-amber-100 pt-1">
            "{prompt.orderEnglish}"
          </p>
        )}
      </div>

      {/* Bar Counter & Serving Tray */}
      <div className="bg-amber-950/90 rounded-2xl p-3 border-4 border-amber-900 shadow-inner flex flex-col justify-between min-h-[100px] mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold uppercase text-amber-200 tracking-wider flex items-center gap-1">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            {learnerLevel === 'beginner' ? 'Bar Serving Tray' : 'Bandeja de servicio'}
          </span>
          {trayItemIds.length > 0 && !submitted && (
            <button
              type="button"
              onClick={handleClearTray}
              className="text-xs text-amber-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {learnerLevel === 'beginner' ? 'Clear' : 'Vaciar'}
            </button>
          )}
        </div>

        {/* Items on Tray */}
        <div className="flex items-center justify-center gap-2 min-h-[52px] bg-amber-900/60 rounded-xl p-1.5 border border-amber-800 flex-wrap">
          {trayItemIds.length === 0 ? (
            <span className="text-xs text-amber-300/70 italic">
              {learnerLevel === 'beginner'
                ? 'Tap tapas and drinks below to place on tray'
                : 'Toca las tapas y cañas para ponerlas en la bandeja'}
            </span>
          ) : (
            trayItemIds.map(id => {
              const item = prompt.availableItems.find(i => i.id === id);
              if (!item) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleToggleItem(id)}
                  className="px-2.5 py-1 rounded-lg bg-white text-ink-900 font-bold text-xs shadow-md border border-amber-300 flex items-center gap-1.5 animate-pop"
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.nameEs}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Tapas Bar Menu Selection */}
      <div className="mb-2">
        <span className="text-xs font-bold text-ink-500 uppercase tracking-wide block mb-1.5 text-center">
          {learnerLevel === 'beginner' ? 'Tapas & Drinks on Counter' : 'Tapas y Bebidas en Barra'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          {prompt.availableItems.map(item => {
            const isSelected = trayItemIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleItem(item.id)}
                disabled={disabled || submitted}
                className={`p-2.5 rounded-xl border-2 font-medium text-left transition-all flex items-center gap-2.5 active:scale-95 ${
                  isSelected
                    ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-400'
                    : 'bg-white border-cream-300 hover:border-amber-400 text-ink-900 shadow-sm'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-bold truncate leading-tight">
                    {item.nameEs}
                  </p>
                  {shouldShowEnglish(learnerLevel) && (
                    <p className="text-[10px] text-ink-400 truncate">
                      {item.nameEn}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Dispatch Button */}
      <div className="pt-1 safe-bottom">
        <button
          type="button"
          onClick={handleServe}
          disabled={disabled || submitted || trayItemIds.length === 0}
          className={`w-full h-12 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
            trayItemIds.length > 0 && !submitted
              ? 'bg-terracotta-500 hover:bg-terracotta-600 text-white active:scale-98 shadow-terracotta-200'
              : 'bg-cream-200 text-ink-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {learnerLevel === 'beginner'
              ? 'Serve Tapas Order! (¡Marchando!)'
              : '¡Marchando comanda!'}
          </span>
        </button>
      </div>
    </div>
  );
};
