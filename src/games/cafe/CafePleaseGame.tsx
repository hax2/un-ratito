import React, { useState, useEffect, useRef } from 'react';
import { CafePrompt, CafeSlot, LearnerLevel } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Coffee, Volume2, CheckCircle2, Zap } from 'lucide-react';
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
  const [espressoPressure, setEspressoPressure] = useState(0);
  const [isPullingEspresso, setIsPullingEspresso] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const pressTimerRef = useRef<any>(null);

  // Pressure gauge loop when pulling espresso
  useEffect(() => {
    if (isPullingEspresso) {
      pressTimerRef.current = setInterval(() => {
        setEspressoPressure(p => (p >= 100 ? 0 : p + 4));
      }, 40);
    } else {
      if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    }
    return () => {
      if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    };
  }, [isPullingEspresso]);

  const handleStartPull = () => {
    if (disabled || isSliding) return;
    audioService.playTap();
    setIsPullingEspresso(true);
  };

  const handleStopPull = () => {
    if (!isPullingEspresso) return;
    setIsPullingEspresso(false);
    audioService.playTap();
  };

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
        audioService.speakSpanish('¡Muchas gracias, jefe! De lujo.');
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
      <div className="flex items-center justify-between shrink-0 mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black text-xs uppercase tracking-wider">
          <Coffee className="w-4 h-4 text-amber-700" />
          <span>Barista de Barrio Simulator</span>
        </div>
      </div>

      {/* Customer Request Speech Bubble */}
      <div className="bg-white rounded-2xl p-3 border-2 border-amber-300 shadow-sm relative mb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-3xl filter drop-shadow-xs" role="img" aria-label="customer">
              🧑
            </span>
            <div className="min-w-0">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wide block leading-none mb-1">
                {prompt.customerName}
              </span>
              <p className="text-base md:text-lg font-black text-ink-900 leading-snug">
                «{prompt.orderSpokenSpanish}»
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => audioService.speakSpanish(prompt.orderSpokenSpanish)}
            className="w-10 h-10 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 flex items-center justify-center transition-colors shrink-0 shadow-xs active:scale-95"
            aria-label="Escuchar pedido"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {shouldShowEnglish(learnerLevel) && prompt.orderEnglish && (
          <p className="text-xs text-ink-500 mt-1 italic border-t border-amber-100 pt-1 font-medium">
            "{prompt.orderEnglish}"
          </p>
        )}
      </div>

      {/* Interactive Bar Counter & Espresso Machine Surface */}
      <div className="bg-gradient-to-b from-amber-900 to-amber-950 rounded-2xl p-3 border-4 border-amber-950 shadow-inner flex flex-col justify-between mb-2 shrink-0">
        <div className="flex items-center justify-between text-xs font-black text-amber-200 uppercase tracking-wider mb-1">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Cafetera Espresso & Barra
          </span>
          <span className="text-amber-300 font-mono">
            {quantity}x {selectedDrink} {selectedDrink === 'café' ? `(${selectedMilk})` : ''}
          </span>
        </div>

        {/* Dynamic Cups & Sliding Motion Area */}
        <div className="h-16 bg-amber-900/50 rounded-xl border border-amber-800/80 flex items-center justify-center gap-4 relative overflow-hidden px-4 mb-2">
          <div
            className={`flex items-center gap-4 transition-transform duration-500 ease-out ${
              isSliding ? 'translate-x-48 opacity-0' : 'translate-x-0 opacity-100'
            }`}
          >
            {Array.from({ length: quantity }).map((_, idx) => (
              <div key={idx} className="relative flex flex-col items-center animate-pop">
                <span className="text-3xl filter drop-shadow-md select-none">
                  {selectedDrink === 'café'
                    ? selectedMilk === 'con hielo'
                      ? '🧊'
                      : '☕'
                    : selectedDrink === 'cortado'
                    ? '🥛'
                    : selectedDrink === 'té'
                    ? '🍵'
                    : '💧'}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-950 text-amber-100 border border-amber-700 mt-0.5 capitalize shadow-xs">
                  {selectedDrink === 'café' ? selectedMilk : selectedDrink}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hold-to-Pull Espresso Lever */}
        {selectedDrink !== 'agua' && selectedDrink !== 'té' && (
          <div className="bg-amber-950/80 rounded-xl p-2 border border-amber-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onMouseDown={handleStartPull}
              onMouseUp={handleStopPull}
              onTouchStart={handleStartPull}
              onTouchEnd={handleStopPull}
              className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                isPullingEspresso
                  ? 'bg-emerald-500 text-white shadow-emerald-400'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {isPullingEspresso ? '¡Tirando café!' : 'Mantener palanca'}
            </button>

            {/* Pressure bar */}
            <div className="flex-1 bg-stone-900 h-4 rounded-full border border-amber-700 overflow-hidden relative">
              {/* Target zone in middle */}
              <div className="absolute left-[45%] width-[20%] w-[20%] h-full bg-emerald-500/40 border-x border-emerald-400" />
              <div
                style={{ width: `${espressoPressure}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-75"
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-200 w-8 text-right">
              {espressoPressure}%
            </span>
          </div>
        )}
      </div>

      {/* Barista Controls (Drink, Milk, Quantity) */}
      <div className="bg-white rounded-2xl p-2.5 border-2 border-cream-300 shadow-sm space-y-2 mb-2 shrink-0">
        {/* Drink selection */}
        <div>
          <span className="text-xs font-black text-ink-600 uppercase tracking-wide block mb-1">
            1. Bebida
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
                className={`py-2 px-1 rounded-xl text-xs font-black capitalize transition-all active:scale-95 ${
                  selectedDrink === d
                    ? 'bg-amber-900 text-white shadow-sm ring-2 ring-amber-500'
                    : 'bg-cream-100 text-ink-800 hover:bg-cream-200 border border-cream-300'
                }`}
              >
                {d === 'café' ? '☕ Café' : d === 'cortado' ? '🥛 Cortado' : d === 'té' ? '🍵 Té' : '💧 Agua'}
              </button>
            ))}
          </div>
        </div>

        {/* Milk / Style selection */}
        {selectedDrink === 'café' && (
          <div>
            <span className="text-xs font-black text-ink-600 uppercase tracking-wide block mb-1">
              2. Preparación
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
                  className={`py-2 px-1 rounded-xl text-xs font-black capitalize transition-all active:scale-95 ${
                    selectedMilk === m
                      ? 'bg-terracotta-500 text-white shadow-sm ring-2 ring-terracotta-400'
                      : 'bg-cream-100 text-ink-800 hover:bg-cream-200 border border-cream-300'
                  }`}
                >
                  {m === 'solo' ? '☕ Solo' : m === 'con leche' ? '🥛 Con leche' : '🧊 Con hielo'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity selector */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-xs font-black text-ink-600 uppercase tracking-wide">
            3. Cantidad
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
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all active:scale-95 ${
                  quantity === qty
                    ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-400'
                    : 'bg-cream-100 text-ink-800 hover:bg-cream-200 border border-cream-300'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Across Bar Action Button */}
      <div className="pt-1 safe-bottom shrink-0">
        <button
          type="button"
          onClick={handleServe}
          disabled={disabled || isSliding}
          className="w-full h-13 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-black text-base tracking-wide uppercase shadow-[0_5px_0_#9c3418] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>¡DESLIZAR EN BARRA!</span>
        </button>
      </div>
    </div>
  );
};
