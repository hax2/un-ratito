import React, { useState } from 'react';
import { MarketItem, MarketPrompt } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { ShoppingBag, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  prompt: MarketPrompt;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

// Visual icons for groceries
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

export const PocketMarketGame: React.FC<Props> = ({ prompt, onAnswer, disabled }) => {
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);

  const handleSelectItem = (item: MarketItem) => {
    if (disabled || selectedItem) return;

    setSelectedItem(item);
    audioService.speakSpanish(item.spanish);

    const isCorrect = item.id === prompt.correctItemId;
    if (isCorrect) {
      audioService.playSuccessChime();
      setTimeout(() => {
        onAnswer('correct', { selectedItemId: item.id });
      }, 900);
    } else {
      audioService.playErrorSound();
      setTimeout(() => {
        onAnswer('incorrect', { selectedItemId: item.id });
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-4 py-2">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mustard-100 text-mustard-600 text-xs font-semibold uppercase mb-1">
          <ShoppingBag className="w-3.5 h-3.5" />
          Pocket Market
        </div>
        <h2 className="text-xl md:text-2xl font-serif text-ink-900 font-bold">
          {prompt.instruction}
        </h2>
      </div>

      {/* Shopping Bag Illustration Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="relative w-36 h-40 bg-mustard-400 rounded-b-3xl rounded-t-lg border-4 border-mustard-600 shadow-lg flex flex-col items-center justify-end pb-3">
          {/* Bag handle */}
          <div className="absolute -top-7 w-16 h-10 border-4 border-mustard-600 rounded-t-full bg-transparent" />

          {/* Items inside bag */}
          <div className="flex gap-1 items-center justify-center z-10">
            {selectedItem && selectedItem.id === prompt.correctItemId && (
              <div className="animate-bounce">
                {renderItemIcon(selectedItem.icon)}
              </div>
            )}
            <span className="text-2xl opacity-40">🥖</span>
            <span className="text-2xl opacity-40">🍊</span>
          </div>

          <span className="text-xs font-bold text-mustard-900 uppercase tracking-widest mt-1">
            Bolsa
          </span>
        </div>

        {selectedItem && (
          <div className="mt-3 text-center">
            {selectedItem.id === prompt.correctItemId ? (
              <span className="inline-flex items-center gap-1.5 text-teal-600 font-bold text-sm bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                <CheckCircle2 className="w-4 h-4" /> ¡Correcto! {selectedItem.spanish} ({selectedItem.gender})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-terracotta-600 font-bold text-sm bg-terracotta-50 px-3 py-1 rounded-full border border-terracotta-200">
                <XCircle className="w-4 h-4" /> Eso es {selectedItem.spanish}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3 Illustrated Choices */}
      <div className="safe-bottom grid grid-cols-3 gap-3 pt-2">
        {prompt.choices.map(item => {
          const isSelected = selectedItem?.id === item.id;
          const isTarget = item.id === prompt.correctItemId;

          let cardStyle = 'notebook-card-interactive bg-white border-cream-300 hover:border-teal-500';
          if (selectedItem) {
            if (isSelected) {
              cardStyle = isTarget
                ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-400'
                : 'bg-terracotta-50 border-terracotta-500 ring-2 ring-terracotta-400';
            } else {
              cardStyle = 'opacity-50 bg-cream-100 border-transparent';
            }
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectItem(item)}
              disabled={disabled || !!selectedItem}
              className={`min-h-[110px] p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-center transition-all ${cardStyle}`}
            >
              <div className="h-10 flex items-center justify-center">
                {renderItemIcon(item.icon)}
              </div>
              <span className="font-bold text-sm text-ink-900 leading-tight">
                {item.spanish}
              </span>
              <span className="text-xs text-ink-400">
                {item.english}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
