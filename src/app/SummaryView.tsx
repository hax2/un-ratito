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
    // Fire festive celebratory confetti
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
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 text-center">
      {/* Trophy & Badge */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-terracotta-100 text-terracotta-600 mx-auto shadow-sm">
        <Trophy className="w-10 h-10" />
      </div>

      <div>
        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-1">
          Session Complete!
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-ink-900 font-bold">
          ¡Un ratito bien aprovechado!
        </h2>
        <p className="text-sm text-ink-500 mt-1">
          {correct} of {total} answers on point
        </p>
      </div>

      {/* Decorative Neighborhood Stamp Unlocked */}
      <div className="bg-mustard-50 border border-mustard-300 rounded-3xl p-4 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-mustard-400 text-mustard-950 flex items-center justify-center font-bold">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h4 className="font-bold text-xs uppercase tracking-wider text-mustard-900">
            Neighborhood Stamp Earned
          </h4>
          <p className="text-xs text-mustard-800">
            Your pocket town has been decorated with a new visit stamp!
          </p>
        </div>
      </div>

      {/* Targets Practiced List */}
      <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-sm text-left">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">
          Language Patterns Practised
        </h3>
        <div className="space-y-2.5">
          {practicedTargets.map(target => (
            <div key={target!.id} className="flex items-center justify-between p-2 rounded-xl bg-cream-50 border border-cream-200">
              <div>
                <p className="text-sm font-bold text-ink-900">{target!.spanish}</p>
                <p className="text-xs text-ink-500">{target!.english}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="space-y-3 pt-2 safe-bottom">
        <button
          type="button"
          onClick={() => {
            audioService.playTap();
            onPlayAgain();
          }}
          className="w-full h-14 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-base shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Play Another Minute
        </button>

        <button
          type="button"
          onClick={() => {
            audioService.playTap();
            onBackToHome();
          }}
          className="w-full h-12 rounded-2xl bg-cream-200 hover:bg-cream-300 text-ink-800 font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>Back to Arcade</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
