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
      return <span className="text-3xl select-none" role="img" aria-label="apple">🍎</span>;
    case 'bread':
      return <span className="text-3xl select-none" role="img" aria-label="bread">🥖</span>;
    case 'water':
      return <span className="text-3xl select-none" role="img" aria-label="water">💧</span>;
    case 'cheese':
      return <span className="text-3xl select-none" role="img" aria-label="cheese">🧀</span>;
    case 'milk':
      return <span className="text-3xl select-none" role="img" aria-label="milk">🥛</span>;
    case 'orange':
      return <span className="text-3xl select-none" role="img" aria-label="orange">🍊</span>;
    default:
      return <span className="text-3xl select-none" role="img" aria-label="item">🧺</span>;
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
    setBagGrams(item.weightGrams || 250);
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
      {/* Header Badge */}
      <div className="text-center mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-mustard-100 text-mustard-800 text-xs font-bold uppercase tracking-wider mb-1">
          <ShoppingBag className="w-3.5 h-3.5 text-mustard-600" />
          {learnerLevel === 'advanced' ? 'Mercado Rush' : 'Mercado Rush — Madrid Market Stall'}
        </div>
      </div>

      {/* Vendor Request Bubble */}
      <div className="bg-white rounded-2xl p-3 border-2 border-mustard-300 shadow-sm mb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="vendor">
              🏪
            </span>
            <div>
              <span className="text-[11px] font-bold text-mustard-800 uppercase tracking-wide block">
                {learnerLevel === 'beginner' ? 'Market Vendor' : 'Puesto del Mercado'}
              </span>
              <p className="text-sm md:text-base font-bold text-ink-900 leading-snug">
                {prompt.vendorDialogue || (learnerLevel === 'beginner' ? prompt.instruction : (prompt.instructionEs || prompt.instruction))}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePlayVendorAudio}
            className="p-2 rounded-xl bg-mustard-100 text-mustard-900 hover:bg-mustard-200 transition-colors shrink-0"
            aria-label="Escuchar al tendero"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {shouldShowEnglish(learnerLevel) && (
          <p className="text-xs text-ink-400 mt-1 italic border-t border-mustard-100 pt-1">
            "{prompt.instruction}"
          </p>
        )}
      </div>

      {/* Market Scale & Shopping Bag Area */}
      <div className="bg-gradient-to-b from-amber-50 to-amber-100/60 rounded-2xl p-3 border-2 border-amber-200 flex items-center justify-around shadow-inner mb-2">
        {/* Market Scale */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-16 bg-white rounded-xl border-2 border-amber-300 shadow-sm flex flex-col items-center justify-center p-1">
            <div className="flex items-center gap-1 text-amber-700">
              <Scale className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Báscula</span>
            </div>
            <span className="text-base font-mono font-bold text-ink-900 mt-0.5">
              {bagGrams > 0 ? `${bagGrams}g` : '0g'}
            </span>
          </div>
          <span className="text-[10px] text-ink-400 mt-1 font-medium">Peso exacto</span>
        </div>

        {/* Illustrated Shopping Bag */}
        <div className="relative w-28 h-32 bg-amber-400 rounded-b-2xl rounded-t-md border-4 border-amber-600 shadow-md flex flex-col items-center justify-end pb-2">
          {/* Handles */}
          <div className="absolute -top-5 w-14 h-8 border-4 border-amber-700 rounded-t-full bg-transparent pointer-events-none" />

          {/* Item inside bag when selected */}
          {selectedItem ? (
            <div className="animate-pop flex flex-col items-center">
              {renderItemIcon(selectedItem.icon)}
              <span className="text-[11px] font-bold text-ink-900 bg-white/90 px-1.5 rounded mt-0.5 shadow-sm">
                {selectedItem.spanish}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-amber-950/70 uppercase tracking-widest text-center px-1">
              Bolsa Vacía
            </span>
          )}
        </div>
      </div>

      {/* Market Crates / Item Selection */}
      <div className="mb-2">
        <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wide block mb-1 text-center">
          {learnerLevel === 'beginner' ? 'Tap the requested item to bag it' : 'Toca el producto pedido para embolsarlo'}
        </span>
        <div className="grid grid-cols-3 gap-2">
          {prompt.choices.map(item => {
            const isChosen = selectedItem?.id === item.id;
            const isCorrect = item.id === prompt.correctItemId;

            let cardStyle = 'bg-white border-cream-300 hover:border-mustard-400 text-ink-900';
            if (isChosen) {
              cardStyle = isCorrect
                ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-400'
                : 'bg-terracotta-50 border-terracotta-500 ring-2 ring-terracotta-400';
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item)}
                disabled={disabled || !!selectedItem}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 shadow-sm active:scale-95 transition-all ${cardStyle}`}
              >
                <div className="mb-1">{renderItemIcon(item.icon)}</div>
                <span className="text-xs font-bold text-center leading-tight">
                  {item.spanish}
                </span>
                {shouldShowEnglish(learnerLevel) && (
                  <span className="text-[10px] text-ink-400 mt-0.5 text-center">
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
