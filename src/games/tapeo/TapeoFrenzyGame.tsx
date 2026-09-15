import React, { useState, useEffect, useRef } from 'react';
import { TapeoPrompt, LearnerLevel } from '../../content/types';
import { audioService } from '../../audio/audioService';
import { Volume2, CheckCircle2, Flame, RotateCcw, Utensils } from 'lucide-react';
import { shouldShowEnglish } from '../../utils/language';

interface Props {
  prompt: TapeoPrompt;
  learnerLevel?: LearnerLevel;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any) => void;
  disabled?: boolean;
}

interface ConveyorDish {
  uid: string;
  itemId: string;
  nameEs: string;
  nameEn: string;
  icon: string;
  x: number; // percentage across belt (0 to 100)
  speed: number;
}

export const TapeoFrenzyGame: React.FC<Props> = ({
  prompt,
  learnerLevel = 'beginner',
  onAnswer,
  disabled,
}) => {
  const [trayItemIds, setTrayItemIds] = useState<string[]>([]);
  const [conveyorDishes, setConveyorDishes] = useState<ConveyorDish[]>([]);
  const [scoreCombo, setScoreCombo] = useState(0);
  const [floatingFeedback, setFloatingFeedback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const animRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(Date.now());

  // Initialize and run real-time conveyor loop
  useEffect(() => {
    // Initial 3 dishes on belt
    const initialDishes: ConveyorDish[] = prompt.availableItems.slice(0, 3).map((item, idx) => ({
      uid: `dish_${idx}_${Date.now()}`,
      itemId: item.id,
      nameEs: item.nameEs,
      nameEn: item.nameEn,
      icon: item.icon,
      x: idx * 30 + 10,
      speed: 0.18 + Math.random() * 0.08,
    }));
    setConveyorDishes(initialDishes);

    let prevTime = performance.now();

    const loop = (time: number) => {
      const dt = time - prevTime;
      prevTime = time;

      setConveyorDishes(prev => {
        // Move dishes to the right
        const updated = prev
          .map(d => ({ ...d, x: d.x + d.speed * (dt / 16) }))
          .filter(d => d.x < 105); // remove when rolls off right

        // Spawn new dish if needed
        if (updated.length < 3 && Date.now() - lastSpawnRef.current > 1200) {
          lastSpawnRef.current = Date.now();
          const randomItem = prompt.availableItems[Math.floor(Math.random() * prompt.availableItems.length)];
          updated.push({
            uid: `dish_${Date.now()}_${Math.random()}`,
            itemId: randomItem.id,
            nameEs: randomItem.nameEs,
            nameEn: randomItem.nameEn,
            icon: randomItem.icon,
            x: -12,
            speed: 0.16 + Math.random() * 0.08,
          });
        }

        return updated;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [prompt.id]);

  // Snatch moving dish from conveyor
  const handleSnatchDish = (dish: ConveyorDish) => {
    if (disabled || submitted) return;

    audioService.playTap();
    audioService.speakSpanish(dish.nameEs);

    // Remove dish from conveyor immediately
    setConveyorDishes(prev => prev.filter(d => d.uid !== dish.uid));

    // Check if item is in the customer order
    const isNeeded = prompt.requiredItemIds.includes(dish.itemId) && !trayItemIds.includes(dish.itemId);

    if (isNeeded) {
      setScoreCombo(prev => prev + 1);
      setFloatingFeedback(`¡Oído! +${(scoreCombo + 1) * 50}`);
      setTrayItemIds(prev => [...prev, dish.itemId]);
      setTimeout(() => setFloatingFeedback(null), 900);
    } else if (trayItemIds.includes(dish.itemId)) {
      setFloatingFeedback('¡Ya tienes ese plato en bandeja!');
      setTimeout(() => setFloatingFeedback(null), 900);
    } else {
      audioService.playErrorSound();
      setScoreCombo(0);
      setFloatingFeedback('«¡Oye, ese plato no lo he pedido!»');
      setTimeout(() => setFloatingFeedback(null), 1100);
    }
  };

  const handleClearTray = () => {
    if (disabled || submitted) return;
    audioService.playRemove();
    setTrayItemIds([]);
  };

  const handleServe = () => {
    if (disabled || submitted || trayItemIds.length === 0) return;

    setSubmitted(true);

    const reqSorted = [...prompt.requiredItemIds].sort();
    const traySorted = [...trayItemIds].sort();

    const isMatch =
      reqSorted.length === traySorted.length &&
      reqSorted.every((val, idx) => val === traySorted[idx]);

    if (isMatch) {
      audioService.playSuccessChime();
      audioService.speakSpanish('¡Oído cocina, de lujo!');
      setTimeout(() => {
        onAnswer('correct', { trayItemIds });
      }, 700);
    } else {
      audioService.playErrorSound();
      setTimeout(() => {
        onAnswer('incorrect', { trayItemIds });
      }, 900);
    }
  };

  const allReady =
    trayItemIds.length === prompt.requiredItemIds.length &&
    prompt.requiredItemIds.every(id => trayItemIds.includes(id));

  return (
    <div className="flex flex-col h-full justify-between max-w-lg mx-auto w-full px-3 py-1 select-none overflow-hidden">
      {/* Header Arcade Title */}
      <div className="flex items-center justify-between shrink-0 mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black text-xs uppercase tracking-wider shadow-xs">
          <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Tapeo Rush Arcade</span>
        </div>

        {scoreCombo > 0 && (
          <div className="px-2.5 py-0.5 rounded-full bg-teal-500 text-white font-black text-xs animate-bounce shadow-xs">
            Combo x{scoreCombo}!
          </div>
        )}
      </div>

      {/* Customer Comanda Order Bubble */}
      <div className="bg-white rounded-2xl p-3 border-2 border-amber-300 shadow-sm relative mb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-3xl filter drop-shadow-xs" role="img" aria-label="patron">
              🧑‍🍳
            </span>
            <div className="min-w-0">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wide block leading-none mb-1">
                {prompt.patronName}
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

      {/* Real-Time Moving Conveyor Belt Area */}
      <div className="relative bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl p-2 border-4 border-stone-950 shadow-inner flex flex-col justify-between h-36 mb-2 overflow-hidden shrink-0">
        {/* Conveyor Belt Slats Animation Header */}
        <div className="flex items-center justify-between text-[11px] font-black text-amber-300 uppercase tracking-wider px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Cinta de Tapas en Marcha
          </span>
          <span className="text-amber-200 text-[10px] bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
            ¡Toca el plato al pasar!
          </span>
        </div>

        {/* Floating feedback alert */}
        {floatingFeedback && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-xs shadow-lg animate-pop">
            {floatingFeedback}
          </div>
        )}

        {/* Moving Dishes Layer */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center">
          {conveyorDishes.map(dish => (
            <button
              key={dish.uid}
              type="button"
              onClick={() => handleSnatchDish(dish)}
              disabled={disabled || submitted}
              style={{ left: `${dish.x}%` }}
              className="absolute top-1/2 -translate-y-1/2 p-1.5 bg-white/95 rounded-2xl border-2 border-amber-400 shadow-lg flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer w-20 h-20 group"
            >
              <span className="text-3xl group-hover:animate-bounce select-none">
                {dish.icon}
              </span>
              <span className="text-[10px] font-black text-ink-900 leading-tight text-center truncate w-full mt-0.5">
                {dish.nameEs}
              </span>
            </button>
          ))}
        </div>

        {/* Conveyor belt metal rollers graphic */}
        <div className="h-3 w-full bg-gradient-to-r from-stone-700 via-stone-500 to-stone-700 rounded border-t border-stone-600 flex justify-around">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="w-1.5 h-full bg-stone-900/60" />
          ))}
        </div>
      </div>

      {/* Serving Tray (Comanda en Barra) */}
      <div className="bg-amber-950/90 rounded-2xl p-2.5 border-2 border-amber-800 shadow-md flex flex-col justify-between min-h-[82px] mb-2 shrink-0">
        <div className="flex items-center justify-between text-xs font-black uppercase text-amber-200 tracking-wider mb-1">
          <span className="flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-amber-400" />
            Tu Bandeja ({trayItemIds.length}/{prompt.requiredItemIds.length})
          </span>
          {trayItemIds.length > 0 && !submitted && (
            <button
              type="button"
              onClick={handleClearTray}
              className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Vaciar
            </button>
          )}
        </div>

        {/* Snapped items on tray */}
        <div className="flex items-center justify-center gap-2 min-h-[44px] bg-amber-900/60 rounded-xl p-1.5 border border-amber-800/80 flex-wrap">
          {trayItemIds.length === 0 ? (
            <span className="text-xs font-semibold text-amber-300/70 italic">
              Atrapa los platos pedidos de la cinta
            </span>
          ) : (
            trayItemIds.map(id => {
              const item = prompt.availableItems.find(i => i.id === id);
              if (!item) return null;
              return (
                <div
                  key={id}
                  className="px-3 py-1 rounded-xl bg-white text-ink-900 font-black text-xs shadow-md border-2 border-amber-400 flex items-center gap-1.5 animate-pop"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.nameEs}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Big Tactile Dispatch Button */}
      <div className="pt-1 safe-bottom shrink-0">
        <button
          type="button"
          onClick={handleServe}
          disabled={disabled || submitted || trayItemIds.length === 0}
          className={`w-full h-13 py-3 rounded-2xl font-black text-base tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
            allReady && !submitted
              ? 'bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-[0_5px_0_#9c3418] active:translate-y-1 active:shadow-none animate-pulse'
              : trayItemIds.length > 0 && !submitted
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-[0_4px_0_#78350f] active:translate-y-1 active:shadow-none'
              : 'bg-cream-200 text-ink-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>¡MARCHANDO COMANDA!</span>
        </button>
      </div>
    </div>
  );
};
