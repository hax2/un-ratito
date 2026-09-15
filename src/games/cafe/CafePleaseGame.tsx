import React, { useState } from 'react';
import { CafePrompt, CafeSlot, LearnerLevel } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Coffee, Volume2, CheckCircle2 } from 'lucide-react';
import { shouldShowEnglish } from '../../utils/language';

interface Props {
  prompt: CafePrompt;
  learnerLevel?: LearnerLevel;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

export const CafePleaseGame: React.FC<Props> = ({
  prompt,
  learnerLevel = 'beginner',
  onAnswer,
  disabled,
}) => {
  const [selectedDrink, setSelectedDrink] = useState<'café' | 'cortado' | 'agua' | 'té'>('café');
  const [selectedMilk, setSelectedMilk] = useState<'solo' | 'con leche' | 'cortado' | 'con hielo'>('con leche');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSliding, setIsSliding] = useState(false);

  const handleServe = () => {
    if (disabled || isSliding) return;

    setIsSliding(true);
    audioService.playTap();

    const servedSlot: CafeSlot = {
      drink: selectedDrink,
      milk: selectedMilk,
      quantity,
    };

    const target = prompt.targetSlot;
    const isDrinkMatch = servedSlot.drink === target.drink;
    const isMilkMatch = !target.milk || servedSlot.milk === target.milk;
    const isQtyMatch = servedSlot.quantity === target.quantity;

    setTimeout(() => {
      if (isDrinkMatch && isMilkMatch && isQtyMatch) {
        audioService.playSuccessChime();
        audioService.speakSpanish(`¡Muchas gracias, jefe! De lujo.`);
        setTimeout(() => {
          onAnswer('correct', { servedSlot });
        }, 600);
      } else {
        audioService.playErrorSound();
        setTimeout(() => {
          onAnswer('incorrect', { servedSlot });
        }, 800);
      }
    }, 450);
  };

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-3 py-1 select-none overflow-hidden">
      {/* Header Banner */}
      <div className="text-center mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1">
          <Coffee className="w-3.5 h-3.5 text-amber-700" />
          {learnerLevel === 'advanced' ? 'Barista de Barrio' : 'Barista de Barrio — Madrid Bar Counter'}
        </div>
      </div>

      {/* Customer Request Bubble */}
      <div className="bg-white rounded-2xl p-3 border-2 border-amber-200 shadow-sm relative mb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="customer">
              🧑
            </span>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
                {prompt.customerName}
              </span>
              <p className="text-sm md:text-base font-bold text-ink-900 leading-snug">
                «{prompt.orderSpokenSpanish}»
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => audioService.speakSpanish(prompt.orderSpokenSpanish)}
            className="p-2 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors shrink-0"
            aria-label="Escuchar pedido del cliente"
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

      {/* Interactive Bar Counter Simulation Surface */}
      <div className="bg-gradient-to-b from-amber-900 to-amber-950 rounded-2xl p-3 border-4 border-amber-950 shadow-inner flex flex-col justify-between mb-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-amber-200 uppercase tracking-wider mb-1">
          <span>Barra de Café</span>
          <span className="text-amber-300 font-mono">
            {quantity}x {selectedDrink} {selectedDrink === 'café' ? `(${selectedMilk})` : ''}
          </span>
        </div>

        {/* Cups & Slide Visual Area */}
        <div className="h-16 bg-amber-900/40 rounded-xl border border-amber-800 flex items-center justify-center gap-4 relative overflow-hidden px-4">
          <div
            className={`flex items-center gap-3 transition-transform duration-500 ease-out ${
              isSliding ? 'translate-x-32 opacity-0' : 'translate-x-0 opacity-100'
            }`}
          >
            {Array.from({ length: quantity }).map((_, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center animate-bounce-short"
              >
                <div className="text-3xl filter drop-shadow-md select-none">
                  {selectedDrink === 'café'
                    ? selectedMilk === 'con hielo'
                      ? '🧊'
                      : '☕'
                    : selectedDrink === 'cortado'
                    ? '🥛'
                    : selectedDrink === 'té'
                    ? '🍵'
                    : '💧'}
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-100 border border-amber-700 mt-0.5 capitalize">
                  {selectedDrink === 'café' ? selectedMilk : selectedDrink}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barista Station Controls */}
      <div className="bg-white rounded-2xl p-2.5 border border-cream-300 shadow-sm space-y-2 mb-2">
        {/* Drink station */}
        <div>
          <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wide block mb-1">
            {learnerLevel === 'beginner' ? '1. Drink Choice' : '1. Tipo de bebida'}
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {(['café', 'cortado', 'té', 'agua'] as const).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  audioService.playTap();
                  setSelectedDrink(d);
                  if (d === 'cortado') setSelectedMilk('cortado');
                }}
                className={`py-1.5 px-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedDrink === d
                    ? 'bg-amber-900 text-white shadow-sm ring-2 ring-amber-500'
                    : 'bg-cream-100 text-ink-800 hover:bg-cream-200'
                }`}
              >
                {d === 'café' ? '☕ Café' : d === 'cortado' ? '🥛 Cortado' : d === 'té' ? '🍵 Té' : '💧 Agua'}
              </button>
            ))}
          </div>
        </div>

        {/* Milk / Style station */}
        {selectedDrink === 'café' && (
          <div>
            <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wide block mb-1">
              {learnerLevel === 'beginner' ? '2. Milk & Temperature' : '2. Preparación de la leche'}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['solo', 'con leche', 'con hielo'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    audioService.playTap();
                    setSelectedMilk(m);
                  }}
                  className={`py-1.5 px-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                    selectedMilk === m
                      ? 'bg-terracotta-500 text-white shadow-sm ring-2 ring-terracotta-400'
                      : 'bg-cream-100 text-ink-800 hover:bg-cream-200'
                  }`}
                >
                  {m === 'solo' ? '☕ Solo' : m === 'con leche' ? '🥛 Con leche' : '🧊 Con hielo'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity station */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wide block">
              {learnerLevel === 'beginner' ? '3. Quantity' : '3. Cantidad'}
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(qty => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => {
                    audioService.playTap();
                    setQuantity(qty);
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    quantity === qty
                      ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-400'
                      : 'bg-cream-100 text-ink-800 hover:bg-cream-200'
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide & Serve Action Button */}
      <div className="pt-1 safe-bottom">
        <button
          type="button"
          onClick={handleServe}
          disabled={disabled || isSliding}
          className="w-full h-12 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {learnerLevel === 'beginner'
              ? 'Slide Drink on Bar! (Servir)'
              : '¡Deslizar café en barra!'}
          </span>
        </button>
      </div>
    </div>
  );
};
