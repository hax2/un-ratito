import React, { useEffect } from 'react';
import { SessionState } from '../content/types';
import { TARGETS } from '../content/packs/chapters';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, ArrowRight, RotateCcw, MapPin } from 'lucide-react';
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
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D95D39', '#2A7B88', '#E5A93C'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const total = sessionState.attempts.length;
  const correct = sessionState.attempts.filter(a => a.result === 'correct' || a.result === 'assisted').length;

  // Unique targets touched in this session
  const targetIds = Array.from(new Set(sessionState.attempts.map(a => a.targetId)));
  const practicedTargets = targetIds
    .map(tid => TARGETS.find(t => t.id === tid))
    .filter(Boolean);

  return (
    <div className="h-[100dvh] max-h-[100dvh] flex flex-col justify-between max-w-lg mx-auto w-full px-4 py-3 overflow-hidden select-none">
      {/* Top Celebratory Header (Compact) */}
      <div className="text-center shrink-0 pt-1">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-terracotta-100 text-terracotta-600 mx-auto shadow-sm mb-1.5 animate-pop">
          <Trophy className="w-8 h-8" />
        </div>
        <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest block">
          ¡Sesión Completada!
        </span>
        <h2 className="text-xl md:text-2xl font-serif text-ink-900 font-bold leading-tight">
          ¡Un ratito bien aprovechado!
        </h2>
        <p className="text-xs text-ink-500 font-medium mt-0.5">
          {correct} de {total} respuestas acertadas
        </p>
      </div>

      {/* Middle Scrollable Content (Stamp & Targets) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 my-2 pr-1">
        {/* Neighborhood Stamp Unlocked */}
        <div className="bg-mustard-50 border border-mustard-300 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-mustard-400 text-mustard-950 flex items-center justify-center font-bold shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h4 className="font-bold text-xs uppercase tracking-wider text-mustard-900 leading-tight">
              Sello del Barrio Desbloqueado
            </h4>
            <p className="text-[11px] text-mustard-800 truncate">
              Tu mapa de Madrid ha recibido una nueva estampa de visita.
            </p>
          </div>
        </div>

        {/* Practiced Targets */}
        <div className="bg-white rounded-2xl p-3 border border-cream-300 shadow-sm text-left">
          <h3 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-2">
            Patrones practicados en este ratito
          </h3>
          <div className="space-y-1.5">
            {practicedTargets.map(target => (
              <div
                key={target!.id}
                className="flex items-center justify-between p-2 rounded-xl bg-cream-50 border border-cream-200"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold text-ink-900 truncate">{target!.spanish}</p>
                  <p className="text-[10px] text-ink-500 truncate">{target!.english}</p>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permanently Anchored Action Buttons (GUARANTEED visible without scrolling) */}
      <div className="shrink-0 space-y-2 pt-2 border-t border-cream-200 safe-bottom">
        <button
          type="button"
          onClick={() => {
            audioService.playTap();
            onPlayAgain();
          }}
          className="w-full h-12 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Jugar otro ratito (Play Another Minute)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audioService.playTap();
            onBackToHome();
          }}
          className="w-full h-10 rounded-xl bg-cream-200 hover:bg-cream-300 active:scale-98 text-ink-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Volver al Arcade (Back to Arcade)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
