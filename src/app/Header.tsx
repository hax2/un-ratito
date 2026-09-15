import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Settings, MapPin, Compass } from 'lucide-react';
import { audioService } from '../audio/audioService';
import { saveSettings } from '../storage/db';
import { LearnerLevel } from '../content/types';
import { LEVEL_INFO } from '../utils/language';

interface Props {
  currentRoute: string;
  learnerLevel?: LearnerLevel;
  onOpenLevelSelector?: () => void;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<Props> = ({
  currentRoute,
  learnerLevel = 'beginner',
  onOpenLevelSelector,
  onNavigate,
}) => {
  const [soundOn, setSoundOn] = useState(audioService.isSoundEnabled());

  useEffect(() => {
    setSoundOn(audioService.isSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    audioService.setSoundEnabled(next);
    saveSettings({ soundEnabled: next });
    if (next) {
      audioService.playTap();
    }
  };

  return (
    <header className="safe-top bg-cream-50/90 backdrop-blur-md border-b border-cream-200 sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Brand logo & title */}
        <button
          type="button"
          onClick={() => onNavigate('#/')}
          className="flex items-center gap-2 group text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-serif font-bold text-base shadow-sm group-hover:bg-terracotta-600 transition-colors">
            R
          </div>
          <div>
            <h1 className="font-serif font-bold text-ink-900 text-base leading-none">
              Un Ratito
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-terracotta-600">
              Spanish Arcade
            </span>
          </div>
        </button>

        {/* Quick controls & navigation */}
        <div className="flex items-center gap-1.5">
          {onOpenLevelSelector && (
            <button
              type="button"
              onClick={onOpenLevelSelector}
              className={`px-2 py-1 rounded-xl text-xs font-bold transition-all border shadow-2xs flex items-center gap-1 ${
                LEVEL_INFO[learnerLevel].color
              }`}
              title="Cambiar nivel / Change level"
            >
              <span>{LEVEL_INFO[learnerLevel].name}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('#/chapters')}
            className={`p-2 rounded-xl transition-colors ${
              currentRoute.startsWith('#/chapters')
                ? 'bg-cream-200 text-ink-900'
                : 'text-ink-600 hover:bg-cream-100'
            }`}
            aria-label="Explore Chapters"
            title="Explore Chapters"
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('#/neighborhood')}
            className={`p-2 rounded-xl transition-colors ${
              currentRoute.startsWith('#/neighborhood')
                ? 'bg-cream-200 text-ink-900'
                : 'text-ink-600 hover:bg-cream-100'
            }`}
            aria-label="Neighborhood Stamps"
            title="Neighborhood Stamps"
          >
            <MapPin className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl transition-colors ${
              soundOn ? 'text-teal-600 hover:bg-teal-50' : 'text-ink-400 hover:bg-cream-100'
            }`}
            aria-label={soundOn ? 'Mute audio' : 'Unmute audio'}
            title={soundOn ? 'Sound On' : 'Silent Mode'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('#/settings')}
            className={`p-2 rounded-xl transition-colors ${
              currentRoute.startsWith('#/settings')
                ? 'bg-cream-200 text-ink-900'
                : 'text-ink-600 hover:bg-cream-100'
            }`}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
