import React, { useState } from 'react';
import { MarketItem, MarketPrompt, LearnerLevel } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { ShoppingBag, Volume2, Scale } from 'lucide-react';
import { shouldShowEnglish } from '../../utils/language';

interface Props {
  prompt: MarketPrompt;
  learnerLevel?: LearnerLevel;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

const renderItemIcon = (iconName: string) => {
  switch (iconName) {
    case 'apple':
      return <span className="text-4xl select-none" role="img" aria-label="apple">🍎</span>;
    case 'bread':
      return <span className="text-4xl select-none" role="img" aria-label="bread">🥖</span>;
    case 'water':
      return <span className="text-4xl select-none" role="img" aria-label="water">💧</span>;
    case 'cheese':
      return <span className="text-4xl select-none" role="img" aria-label="cheese">🧀</span>;
    case 'milk':
      return <span className="text-4xl select-none" role="img" aria-label="milk">🥛</span>;
    case 'orange':
      return <span className="text-4xl select-none" role="img" aria-label="orange">🍊</span>;
    default:
      return <span className="text-4xl select-none" role="img" aria-label="item">🧺</span>;
  }
};

export const PocketMarketGame: React.FC<Props> = ({
  prompt,
  learnerLevel = 'beginner',
  onAnswer,
  disabled,
}) => {
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [bagGrams, setBagGrams] = useState(0);

  const handleSelectItem = (item: MarketItem) => {
    if (disabled || selectedItem) return;

    setSelectedItem(item);
    setBagGrams(item.weightGrams || 300);
    audioService.speakSpanish(item.spanish);

    const isCorrect = item.id === prompt.correctItemId;
    if (isCorrect) {
      audioService.playSuccessChime();
      setTimeout(() => {
        onAnswer('correct', { selectedItemId: item.id });
      }, 800);
    } else {
      audioService.playErrorSound();
      setTimeout(() => {
        onAnswer('incorrect', { selectedItemId: item.id });
      }, 1000);
    }
  };

  const handlePlayVendorAudio = () => {
    if (prompt.vendorDialogue) {
      audioService.speakSpanish(prompt.vendorDialogue.replace(/[«»]/g, ''));
    } else {
      audioService.speakSpanish(prompt.instructionEs || prompt.instruction);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-3 py-1 select-none overflow-hidden">
      {/* Header Arcade Title */}
      <div className="flex items-center justify-between shrink-0 mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black text-xs uppercase tracking-wider">
          <ShoppingBag className="w-4 h-4 text-amber-700" />
          <span>Mercado Rush Arcade</span>
        </div>
      </div>

      {/* Vendor Request Bubble */}
      <div className="bg-white rounded-2xl p-3 border-2 border-amber-300 shadow-sm relative mb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-3xl filter drop-shadow-xs" role="img" aria-label="vendor">
              🏪
            </span>
            <div className="min-w-0">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wide block leading-none mb-1">
                Tendero del Mercado
              </span>
              <p className="text-base md:text-lg font-black text-ink-900 leading-snug">
                {prompt.vendorDialogue || (learnerLevel === 'beginner' ? prompt.instruction : (prompt.instructionEs || prompt.instruction))}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePlayVendorAudio}
            className="w-10 h-10 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 flex items-center justify-center transition-colors shrink-0 shadow-xs active:scale-95"
            aria-label="Escuchar al tendero"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {shouldShowEnglish(learnerLevel) && (
          <p className="text-xs text-ink-500 mt-1 italic border-t border-amber-100 pt-1 font-medium">
            "{prompt.instruction}"
          </p>
        )}
      </div>

      {/* Market Scale & Animated Shopping Bag Area */}
      <div className="bg-gradient-to-b from-amber-50 to-amber-100/70 rounded-2xl p-3 border-2 border-amber-300 flex items-center justify-around shadow-inner mb-2 shrink-0">
        {/* Market Scale */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-20 bg-white rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col items-center justify-center p-1.5">
            <div className="flex items-center gap-1 text-amber-700">
              <Scale className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Báscula</span>
            </div>
            <span className="text-xl font-mono font-black text-ink-900 mt-0.5">
              {bagGrams > 0 ? `${bagGrams}g` : '0g'}
            </span>
          </div>
          <span className="text-xs text-ink-500 mt-1 font-bold">Peso en gramos</span>
        </div>

        {/* Illustrated Shopping Bag */}
        <div className="relative w-32 h-32 bg-amber-400 rounded-b-2xl rounded-t-md border-4 border-amber-600 shadow-md flex flex-col items-center justify-end pb-2">
          {/* Handles */}
          <div className="absolute -top-5 w-16 h-8 border-4 border-amber-700 rounded-t-full bg-transparent pointer-events-none" />

          {/* Item inside bag when selected */}
          {selectedItem ? (
            <div className="animate-pop flex flex-col items-center">
              {renderItemIcon(selectedItem.icon)}
              <span className="text-xs font-black text-ink-900 bg-white/95 px-2 py-0.5 rounded-md mt-0.5 shadow-xs border border-amber-300">
                {selectedItem.spanish}
              </span>
            </div>
          ) : (
            <span className="text-xs font-black text-amber-950/70 uppercase tracking-widest text-center px-1">
              Bolsa Vacía
            </span>
          )}
        </div>
      </div>

      {/* Market Crates / Big Tactile Product Buttons */}
      <div className="mb-2 shrink-0">
        <span className="text-xs font-black text-ink-600 uppercase tracking-wider block mb-1.5 text-center">
          ¡Toca el producto para pesarlo y embolsarlo!
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          {prompt.choices.map(item => {
            const isChosen = selectedItem?.id === item.id;
            const isCorrect = item.id === prompt.correctItemId;

            let cardStyle = 'bg-white border-cream-300 hover:border-amber-400 text-ink-900 shadow-[0_4px_0_#e2e8f0]';
            if (isChosen) {
              cardStyle = isCorrect
                ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-400 shadow-[0_4px_0_#0d9488]'
                : 'bg-terracotta-50 border-terracotta-500 ring-2 ring-terracotta-400 shadow-[0_4px_0_#b91c1c]';
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item)}
                disabled={disabled || !!selectedItem}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 active:translate-y-1 active:shadow-none transition-all cursor-pointer ${cardStyle}`}
              >
                <div className="mb-1">{renderItemIcon(item.icon)}</div>
                <span className="text-sm font-black text-center leading-tight">
                  {item.spanish}
                </span>
                {shouldShowEnglish(learnerLevel) && (
                  <span className="text-xs text-ink-400 mt-0.5 text-center font-medium">
                    {item.english}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
