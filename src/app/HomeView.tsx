import React, { useEffect, useState } from 'react';
import { CHAPTERS } from '../content/packs/chapters';
import { GameId, LearnerLevel, SessionState, StampRecord } from '../content/types';
import { getAllStamps, getLatestActiveSession, getSettings } from '../storage/db';
import {
  Play,
  RotateCcw,
  ShoppingBag,
  Coffee,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Headphones,
  Compass,
  MapPin,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { audioService } from '../audio/audioService';
import { LEVEL_INFO, UI_TEXT } from '../utils/language';

interface Props {
  learnerLevel?: LearnerLevel;
  onOpenLevelSelector?: () => void;
  onStartSession: (chapterId: string, gameId: GameId | 'mixed') => void;
  onResumeSession: () => void;
  onNavigate: (route: string) => void;
}

export const HomeView: React.FC<Props> = ({
  learnerLevel = 'beginner',
  onOpenLevelSelector,
  onStartSession,
  onResumeSession,
  onNavigate,
}) => {
  const [activeSession, setActiveSession] = useState<SessionState | null>(null);
  const [stamps, setStamps] = useState<StampRecord[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState('chapter-a');

  useEffect(() => {
    getLatestActiveSession().then(s => setActiveSession(s));
    getAllStamps().then(st => setStamps(st));
    getSettings().then(cfg => setSelectedChapterId(cfg.selectedChapterId));
  }, []);

  const currentChapter = CHAPTERS.find(c => c.id === selectedChapterId) || CHAPTERS[0];

  const games: {
    id: GameId;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    bg: string;
  }[] = [
    {
      id: 'market',
      title: learnerLevel === 'advanced' ? 'Mercado de bolsillo' : 'Pocket Market',
      description: learnerLevel === 'advanced'
        ? 'Añade artículos cotidianos con su género (el/la)'
        : 'Fill the bag with everyday items & noun genders',
      icon: <ShoppingBag className="w-5 h-5 text-mustard-600" />,
      badge: learnerLevel === 'advanced' ? 'A1–A2' : 'Beginner',
      bg: 'bg-mustard-100/60',
    },
    {
      id: 'cafe',
      title: learnerLevel === 'advanced' ? 'Café, por favor' : 'Café, Please',
      description: learnerLevel === 'advanced'
        ? 'Prepara pedidos, tipos de leche y cantidades'
        : 'Assemble café orders, milk modifiers & numbers',
      icon: <Coffee className="w-5 h-5 text-terracotta-600" />,
      badge: learnerLevel === 'advanced' ? 'Diario' : 'Everyday',
      bg: 'bg-terracotta-100/60',
    },
    {
      id: 'builder',
      title: learnerLevel === 'advanced' ? 'Constructor de frases' : 'Phrase Builder',
      description: learnerLevel === 'advanced'
        ? 'Forma oraciones con fichas y combinaciones'
        : 'Tap word tiles into natural Spanish sentences',
      icon: <Sparkles className="w-5 h-5 text-teal-600" />,
      badge: 'Core',
      bg: 'bg-teal-100/60',
    },
    {
      id: 'slip',
      title: learnerLevel === 'advanced' ? 'Caza el error' : 'Spot the Slip',
      description: learnerLevel === 'advanced'
        ? 'Detecta y corrige fallos de concordancia y modo'
        : 'Inspect signs, find grammar errors & repair them',
      icon: <AlertTriangle className="w-5 h-5 text-terracotta-600" />,
      badge: 'Grammar',
      bg: 'bg-terracotta-100/60',
    },
    {
      id: 'tales',
      title: learnerLevel === 'advanced' ? 'Microhistorias' : 'Tiny Tales',
      description: learnerLevel === 'advanced'
        ? 'Diálogos interactivos con decisiones naturales'
        : 'Short multi-turn conversations & choices',
      icon: <BookOpen className="w-5 h-5 text-olive-600" />,
      badge: 'Stories',
      bg: 'bg-olive-100/60',
    },
    {
      id: 'listening',
      title: learnerLevel === 'advanced' ? '¿Qué querían decir?' : 'What Did They Mean?',
      description: learnerLevel === 'advanced'
        ? 'Escucha clips y deduce la intención o matiz'
        : 'Listen to clips, solve meaning & implication',
      icon: <Headphones className="w-5 h-5 text-teal-600" />,
      badge: 'Audio',
      bg: 'bg-teal-100/60',
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
      {/* Resumable Session Alert */}
      {activeSession && !activeSession.isCompleted && (
        <div className="p-4 rounded-3xl bg-white border-2 border-teal-500 shadow-sm flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              {learnerLevel === 'beginner' ? 'Session in Progress' : 'Sesión en curso'}
            </span>
            <p className="text-sm font-semibold text-ink-900 mt-0.5">
              {learnerLevel === 'beginner'
                ? `Question ${activeSession.currentPromptIndex + 1} of ${activeSession.promptIds.length}`
                : `Pregunta ${activeSession.currentPromptIndex + 1} de ${activeSession.promptIds.length}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              audioService.playTap();
              onResumeSession();
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            {learnerLevel === 'beginner' ? 'Resume' : 'Reanudar'}
          </button>
        </div>
      )}

      {/* Hero "Play a minute" Banner */}
      <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenLevelSelector && (
              <button
                type="button"
                onClick={onOpenLevelSelector}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all ${LEVEL_INFO[learnerLevel].color}`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Nivel: {LEVEL_INFO[learnerLevel].name}</span>
                <span className="opacity-60 text-[10px]">({LEVEL_INFO[learnerLevel].badge})</span>
              </button>
            )}

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cream-200 text-ink-700 text-xs font-semibold">
              <span>{learnerLevel === 'beginner' ? 'Chapter:' : 'Capítulo:'}</span>
              <span className="font-bold">{currentChapter.title}</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif text-ink-900 font-bold leading-tight">
            {learnerLevel === 'beginner'
              ? 'A little Spanish whenever you have a moment.'
              : 'Un poco de español cuando tengas un momento.'}
          </h2>

          <p className="text-xs text-ink-500">
            {currentChapter.goal}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => {
                audioService.playTap();
                onStartSession(selectedChapterId, 'mixed');
              }}
              className="w-full h-14 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-lg shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              {UI_TEXT.playMinute[learnerLevel]}
            </button>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-cream-100 -z-0 pointer-events-none" />
      </div>

      {/* Active Chapter Card */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-100 border border-cream-200">
        <div className="flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-terracotta-600" />
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-400">
              {UI_TEXT.currentFocus[learnerLevel]}
            </span>
            <p className="text-sm font-bold text-ink-900 leading-none">
              {currentChapter.title} ({currentChapter.band})
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('#/chapters')}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
        >
          {UI_TEXT.change[learnerLevel]} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Arcade Games Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-serif font-bold text-ink-900">
            Choose a Game
          </h3>
          <span className="text-xs text-ink-400">6 games available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {games.map(game => (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                audioService.playTap();
                onStartSession(selectedChapterId, game.id);
              }}
              className="p-3.5 rounded-2xl notebook-card-interactive bg-white border border-cream-200 text-left flex items-start gap-3 hover:border-teal-500 active:scale-98 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${game.bg} flex items-center justify-center shrink-0`}>
                {game.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-sm text-ink-900 truncate">
                    {game.title}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-ink-400 bg-cream-100 px-1.5 py-0.5 rounded">
                    {game.badge}
                  </span>
                </div>
                <p className="text-xs text-ink-500 line-clamp-2 mt-0.5">
                  {game.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Neighborhood Stamps Teaser */}
      <button
        type="button"
        onClick={() => onNavigate('#/neighborhood')}
        className="w-full p-4 rounded-3xl bg-white border border-cream-200 shadow-sm flex items-center justify-between text-left hover:border-mustard-400 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-mustard-100 flex items-center justify-center text-mustard-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-ink-900">Pocket Neighborhood</h4>
            <p className="text-xs text-ink-500">
              {stamps.length > 0
                ? `${stamps.reduce((acc, s) => acc + s.count, 0)} stamps collected`
                : 'Complete sessions to decorate your town'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-ink-400" />
      </button>
    </div>
  );
};
