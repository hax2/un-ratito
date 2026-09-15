import React, { useState } from 'react';
import { CHAPTERS } from '../content/packs/chapters';
import { Chapter, SupportLevel } from '../content/types';
import { saveSettings } from '../storage/db';
import { audioService } from '../audio/audioService';
import { Search, Volume2, Check, ArrowLeft, Play, BookOpen } from 'lucide-react';
import { CurriculumRoadmapModal } from '../components/CurriculumRoadmapModal';

interface Props {
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  onStartSession: (chapterId: string) => void;
  onBack: () => void;
}

export const ChapterSelectView: React.FC<Props> = ({
  currentChapterId,
  onSelectChapter,
  onStartSession,
  onBack,
}) => {
  const [search, setSearch] = useState('');
  const [supportLevel, setSupportLevel] = useState<SupportLevel>('standard');
  const [showRoadmap, setShowRoadmap] = useState(false);

  const filteredChapters = CHAPTERS.filter(ch => {
    const q = search.toLowerCase();
    if (ch.title.toLowerCase().includes(q)) return true;
    if (ch.subtitle.toLowerCase().includes(q)) return true;
    if (ch.band.toLowerCase().includes(q)) return true;
    return ch.grammarAliases.some(alias => alias.toLowerCase().includes(q));
  });

  const handleChoose = (chapter: Chapter) => {
    audioService.playTap();
    onSelectChapter(chapter.id);
    saveSettings({ selectedChapterId: chapter.id, supportLevel });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm font-semibold text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Arcade
        </button>
        <span className="text-xs font-bold text-terracotta-600 uppercase tracking-wide">
          Curriculum
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif text-ink-900 font-bold">
            Chapter Catalogue
          </h2>
          <p className="text-xs text-ink-500 mt-1">
            Directly accessible at any level. No artificial locks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            audioService.playTap();
            setShowRoadmap(true);
          }}
          className="px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5 hover:bg-teal-100 transition-colors shrink-0 shadow-2xs"
          title="Ver Plan de Estudios y Hoja de Ruta A1–C1"
        >
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          <span>Hoja de Ruta</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by topic, e.g. 'estaba', 'subjunctive'..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-cream-300 text-sm focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Assistance / Support Level Toggle */}
      <div className="bg-cream-100 p-3 rounded-2xl border border-cream-200">
        <label className="text-[11px] font-bold text-ink-500 uppercase tracking-wider block mb-2">
          Assistance Setting
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['supported', 'standard', 'stretch'] as const).map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                audioService.playTap();
                setSupportLevel(lvl);
                saveSettings({ supportLevel: lvl });
              }}
              className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                supportLevel === lvl
                  ? 'bg-ink-900 text-white shadow-sm'
                  : 'bg-white text-ink-800 border border-cream-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters List */}
      <div className="space-y-4">
        {filteredChapters.map(ch => {
          const isSelected = ch.id === currentChapterId;

          const bandColor =
            ch.band === 'Beginner'
              ? 'bg-mustard-100 text-mustard-800'
              : ch.band === 'Intermediate'
              ? 'bg-terracotta-100 text-terracotta-800'
              : 'bg-teal-100 text-teal-800';

          return (
            <div
              key={ch.id}
              className={`rounded-3xl p-5 border transition-all ${
                isSelected
                  ? 'bg-white border-teal-500 ring-2 ring-teal-200 shadow-md'
                  : 'bg-white border-cream-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${bandColor}`}>
                    {ch.band}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-ink-900 mt-1">
                    {ch.title}
                  </h3>
                  <span className="text-xs text-ink-500 font-medium">{ch.subtitle}</span>
                </div>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full border border-teal-200">
                    <Check className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>

              <p className="text-xs text-ink-700 mt-2 mb-3">
                {ch.goal}
              </p>

              {/* Mini audio examples */}
              <div className="bg-cream-50 rounded-xl p-2.5 border border-cream-200 space-y-1.5 mb-4">
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">
                  Example Sentences
                </span>
                {ch.examples.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-ink-900">{ex.spanish}</span>
                      <span className="text-ink-500 ml-2 italic">— {ex.english}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => audioService.speakSpanish(ex.spanish)}
                      className="p-1 rounded text-ink-600 hover:text-teal-600 shrink-0 ml-1"
                      aria-label="Play example audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleChoose(ch)}
                  className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-cream-200 text-ink-900'
                      : 'bg-white border border-cream-300 text-ink-800 hover:bg-cream-50'
                  }`}
                >
                  {isSelected ? 'Active Focus' : 'Set as Focus'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleChoose(ch);
                    onStartSession(ch.id);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Practice Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showRoadmap && (
        <CurriculumRoadmapModal onClose={() => setShowRoadmap(false)} />
      )}
    </div>
  );
};
