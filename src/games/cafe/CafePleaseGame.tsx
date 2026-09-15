import React, { useState } from 'react';
import { CafePrompt, CafeSlot } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Coffee, Volume2, Check, AlertCircle } from 'lucide-react';

interface Props {
  prompt: CafePrompt;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

export const CafePleaseGame: React.FC<Props> = ({ prompt, onAnswer, disabled }) => {
  const [selectedDrink, setSelectedDrink] = useState<'café' | 'cortado' | 'agua' | 'té'>('café');
  const [selectedMilk, setSelectedMilk] = useState<'solo' | 'con leche' | 'cortado' | 'con hielo'>('con leche');
  const [quantity, setQuantity] = useState<number>(1);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleServe = () => {
    if (disabled) return;

    const servedSlot: CafeSlot = {
      drink: selectedDrink,
      milk: selectedMilk,
      quantity,
    };

    const target = prompt.targetSlot;
    const isDrinkMatch = servedSlot.drink === target.drink;
    const isMilkMatch = !target.milk || servedSlot.milk === target.milk;
    const isQtyMatch = servedSlot.quantity === target.quantity;

    if (isDrinkMatch && isMilkMatch && isQtyMatch) {
      audioService.playSuccessChime();
      audioService.speakSpanish(`¡Muchas gracias! Justo lo que quería.`);
      onAnswer('correct', { servedSlot });
    } else {
      audioService.playErrorSound();
      let mismatchMsg = 'Order mismatch: ';
      if (!isQtyMatch) mismatchMsg += `wanted ${target.quantity}, served ${quantity}. `;
      if (!isDrinkMatch) mismatchMsg += `wanted ${target.drink}, served ${selectedDrink}. `;
      if (!isMilkMatch) mismatchMsg += `wanted ${target.milk}, served ${selectedMilk}. `;
      setFeedbackError(mismatchMsg);
      onAnswer('incorrect', { servedSlot });
    }
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-4 py-2">
      {/* Customer order banner */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-600 text-xs font-semibold uppercase mb-1">
          <Coffee className="w-3.5 h-3.5" />
          Café, Please • Customer: {prompt.customerName}
        </div>

        {/* Customer Bubble */}
        <div className="bg-white rounded-2xl p-4 border border-cream-200 shadow-sm mt-1 flex items-center justify-between gap-3">
          <div className="text-left">
            <p className="text-lg md:text-xl font-medium text-ink-900">
              «{prompt.orderSpokenSpanish}»
            </p>
            <p className="text-xs text-ink-400 mt-0.5">{prompt.orderEnglish}</p>
          </div>
          <button
            type="button"
            onClick={() => audioService.speakSpanish(prompt.orderSpokenSpanish)}
            className="p-3 rounded-xl bg-cream-100 text-ink-700 hover:bg-cream-200 transition-colors shrink-0"
            aria-label="Listen to customer order"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {feedbackError && (
        <div className="bg-terracotta-50 text-terracotta-800 text-xs p-3 rounded-xl border border-terracotta-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* Assembly Tray Controls */}
      <div className="bg-cream-100 rounded-3xl p-4 border border-cream-200 space-y-4 shadow-inner my-2">
        {/* Drink selection */}
        <div>
          <label className="text-xs font-bold text-ink-500 uppercase tracking-wider block mb-1.5">
            1. Select Drink
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['café', 'cortado', 'té', 'agua'] as const).map(drink => (
              <button
                key={drink}
                type="button"
                onClick={() => {
                  audioService.playTap();
                  setSelectedDrink(drink);
                  if (drink === 'cortado') setSelectedMilk('cortado');
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedDrink === drink
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'bg-white text-ink-800 border border-cream-300'
                }`}
              >
                {drink === 'café' ? '☕ Café' : drink === 'cortado' ? '🥛 Cortado' : drink === 'té' ? '🍵 Té' : '💧 Agua'}
              </button>
            ))}
          </div>
        </div>

        {/* Milk / Style Modifier */}
        {selectedDrink !== 'agua' && selectedDrink !== 'té' && (
          <div>
            <label className="text-xs font-bold text-ink-500 uppercase tracking-wider block mb-1.5">
              2. Milk / Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['solo', 'con leche', 'con hielo'] as const).map(milk => (
                <button
                  key={milk}
                  type="button"
                  onClick={() => {
                    audioService.playTap();
                    setSelectedMilk(milk);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                    selectedMilk === milk
                      ? 'bg-terracotta-500 text-white shadow-sm'
                      : 'bg-white text-ink-800 border border-cream-300'
                  }`}
                >
                  {milk}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="text-xs font-bold text-ink-500 uppercase tracking-wider block mb-1.5">
            3. Quantity
          </label>
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map(qty => (
              <button
                key={qty}
                type="button"
                onClick={() => {
                  audioService.playTap();
                  setQuantity(qty);
                }}
                className={`w-12 h-12 rounded-2xl text-base font-bold transition-all ${
                  quantity === qty
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-white text-ink-800 border border-cream-300'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Serve Button */}
      <div className="safe-bottom pt-2">
        <button
          type="button"
          onClick={handleServe}
          disabled={disabled}
          className="w-full h-14 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-lg shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Serve Order
        </button>
      </div>
    </div>
  );
};
