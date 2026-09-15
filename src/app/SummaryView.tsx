import React, { useEffect } from 'react';
import { SessionState } from '../content/types';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCcw, MapPin, Sparkles, CheckCircle } from 'lucide-react';
import { audioService } from '../audio/audioService';

interface Props {
  sessionState: SessionState;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export const SummaryView: React.FC<Props> = ({ sessionState, onPlayAgain, onBackToHome }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#D95D39', '#2A7B88', '#E5A93C', '#10B981'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const total = sessionState.attempts.length;
  const correct = sessionState.attempts.filter(a => a.result === 'correct' || a.result === 'assisted').length;
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 100;

  return (
    <div className="h-full w-full max-w-md mx-auto px-4 py-4 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Celebratory Header */}
      <div className="flex flex-col items-center text-center shrink-0 pt-2">
        <div className="relative mb-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 border-4 border-amber-600 shadow-[0_5px_0_#92400e] flex items-center justify-center text-amber-950 animate-pop">
            <Trophy className="w-9 h-9" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-ping" />
        </div>

        <span className="inline-block px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-black uppercase tracking-wider mb-1">
          ¡Sesión Completada!
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-ink-900 font-extrabold leading-tight">
          ¡Un ratito bien aprovechado!
        </h2>
        <p className="text-sm font-bold text-ink-500 mt-0.5">
          Has practicado español peninsular con éxito
        </p>
      </div>

      {/* Center Stats Showcase Card */}
      <div className="my-auto py-2 flex flex-col gap-2.5 shrink-0">
        {/* Score & Accuracy Pill Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-2xl p-3 border-2 border-cream-300 shadow-sm text-center">
            <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block mb-0.5">
              Aciertos
            </span>
            <span className="text-2xl font-black text-teal-600 font-mono">
              {correct}/{total}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3 border-2 border-cream-300 shadow-sm text-center">
            <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block mb-0.5">
              Precisión
            </span>
            <span className="text-2xl font-black text-amber-600 font-mono">
              {accuracyPct}%
            </span>
          </div>
        </div>

        {/* Neighborhood Stamp Earned Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-amber-400 border-2 border-amber-600 text-amber-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center gap-1 text-amber-900 font-black text-xs uppercase tracking-wide">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>Sello del Barrio Desbloqueado</span>
            </div>
            <p className="text-xs text-amber-900/80 font-medium mt-0.5 leading-snug">
              Visita registrada en tu mapa de Madrid.
            </p>
          </div>
        </div>
      </div>

      {/* Permanently Visible, Unmissable Arcade Action Buttons */}
      <div className="shrink-0 space-y-2.5 pb-2 safe-bottom">
        <button
          type="button"
          onClick={() => {
            audioService.playTap();
            onPlayAgain();
          }}
          className="w-full h-14 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-black text-base md:text-lg tracking-wide uppercase shadow-[0_5px_0_#9c3418] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>¡JUGAR OTRO RATITO!</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audioService.playTap();
            onBackToHome();
          }}
          className="w-full h-11 rounded-xl bg-cream-200 hover:bg-cream-300 text-ink-800 font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 border border-cream-300 active:scale-98"
        >
          <span>Volver al Arcade</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
