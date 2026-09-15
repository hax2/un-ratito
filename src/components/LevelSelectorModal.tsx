import React from 'react';
import { LearnerLevel } from '../content/types';
import { LEVEL_INFO } from '../utils/language';
import { Check, X, Sparkles, GraduationCap } from 'lucide-react';
import { audioService } from '../audio/audioService';

interface Props {
  currentLevel: LearnerLevel;
  onSelectLevel: (level: LearnerLevel) => void;
  onClose: () => void;
}

export const LevelSelectorModal: React.FC<Props> = ({ currentLevel, onSelectLevel, onClose }) => {
  const levels: LearnerLevel[] = ['beginner', 'intermediate', 'advanced'];

  const handleSelect = (lvl: LearnerLevel) => {
    audioService.playTap();
    onSelectLevel(lvl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-cream-50 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-cream-300 shadow-2xl safe-bottom animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink-900 leading-tight">
                Elige tu nivel (Select Level)
              </h3>
              <p className="text-xs text-ink-500">
                Determines language immersion & content difficulty
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-400 hover:text-ink-800 hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Cards */}
        <div className="space-y-3 my-4">
          {levels.map(lvl => {
            const info = LEVEL_INFO[lvl];
            const isSelected = currentLevel === lvl;

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleSelect(lvl)}
                className={`w-full p-4 rounded-2xl text-left border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-white border-teal-500 ring-2 ring-teal-300 shadow-md'
                    : 'notebook-card-interactive bg-white border-cream-300 hover:border-cream-400'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif font-bold text-base text-ink-900">
                      {info.name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${info.color}`}>
                      {info.badge}
                    </span>
                    {lvl === 'advanced' && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> Inmersión 100%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    {info.description}
                  </p>
                </div>

                <div className="pt-1">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-cream-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-center text-ink-400">
          You can change your level at any time with no penalty to your progress.
        </p>
      </div>
    </div>
  );
};
