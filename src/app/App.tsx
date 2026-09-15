import React, { useEffect, useState } from 'react';
import { GameId, LearnerLevel, SessionState } from '../content/types';
import { sessionController } from '../learning/sessionController';
import { getSettings, saveSettings } from '../storage/db';
import { Header } from './Header';
import { HomeView } from './HomeView';
import { ChapterSelectView } from './ChapterSelectView';
import { SessionView } from './SessionView';
import { SummaryView } from './SummaryView';
import { NeighborhoodView } from './NeighborhoodView';
import { SettingsView } from './SettingsView';
import { LevelSelectorModal } from '../components/LevelSelectorModal';
import { LEVEL_INFO } from '../utils/language';

export const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [activeSession, setActiveSession] = useState<SessionState | null>(null);
  const [completedSession, setCompletedSession] = useState<SessionState | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState('chapter-a');
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>('beginner');
  const [showLevelModal, setShowLevelModal] = useState(false);

  useEffect(() => {
    getSettings().then(cfg => {
      setSelectedChapterId(cfg.selectedChapterId || 'chapter-a');
      setLearnerLevel(cfg.learnerLevel || 'beginner');
    });

    const handleHashChange = () => {
      const h = window.location.hash || '#/';
      setRoute(h);

      // Handle direct play routes like #/play/market or #/play/cafe
      if (h.startsWith('#/play/')) {
        const game = h.replace('#/play/', '') as GameId;
        handleStartSession(selectedChapterId, game);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedChapterId, learnerLevel]);

  const navigate = (newRoute: string) => {
    window.location.hash = newRoute;
    setRoute(newRoute);
  };

  const handleStartSession = async (chapterId: string, gameId: GameId | 'mixed' = 'mixed') => {
    const session = await sessionController.startSession(
      chapterId,
      gameId,
      'standard',
      5,
      learnerLevel
    );
    setActiveSession(session);
    navigate('#/session');
  };

  const handleResumeSession = async () => {
    const session = await sessionController.resumeActiveSession();
    if (session) {
      setActiveSession(session);
      navigate('#/session');
    }
  };

  const handleFinishSession = (session: SessionState) => {
    setCompletedSession(session);
    setActiveSession(null);
    navigate('#/summary');
  };

  const handleExitSession = () => {
    setActiveSession(null);
    navigate('#/');
  };

  const handleSelectLevel = (newLevel: LearnerLevel) => {
    setLearnerLevel(newLevel);
    const newChapter = LEVEL_INFO[newLevel].chapterDefault;
    setSelectedChapterId(newChapter);
    saveSettings({ learnerLevel: newLevel, selectedChapterId: newChapter });
  };

  const isSessionRoute = route === '#/session';

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-ink-900 font-sans">
      {!isSessionRoute && (
        <Header
          currentRoute={route}
          learnerLevel={learnerLevel}
          onOpenLevelSelector={() => setShowLevelModal(true)}
          onNavigate={navigate}
        />
      )}

      <main className="flex-1 flex flex-col">
        {route === '#/' && (
          <HomeView
            learnerLevel={learnerLevel}
            onOpenLevelSelector={() => setShowLevelModal(true)}
            onStartSession={handleStartSession}
            onResumeSession={handleResumeSession}
            onNavigate={navigate}
          />
        )}

        {route === '#/chapters' && (
          <ChapterSelectView
            currentChapterId={selectedChapterId}
            onSelectChapter={setSelectedChapterId}
            onStartSession={chId => handleStartSession(chId, 'mixed')}
            onBack={() => navigate('#/')}
          />
        )}

        {route === '#/session' && activeSession && (
          <SessionView
            sessionState={activeSession}
            learnerLevel={learnerLevel}
            onFinishSession={handleFinishSession}
            onExitSession={handleExitSession}
          />
        )}

        {route === '#/summary' && completedSession && (
          <SummaryView
            sessionState={completedSession}
            onPlayAgain={() => handleStartSession(completedSession.chapterId, completedSession.gameId)}
            onBackToHome={() => navigate('#/')}
          />
        )}

        {route === '#/neighborhood' && (
          <NeighborhoodView onBack={() => navigate('#/')} />
        )}

        {route === '#/settings' && (
          <SettingsView
            onBack={() => navigate('#/')}
            onLevelChanged={handleSelectLevel}
          />
        )}
      </main>

      {/* Quick-switch Level Modal */}
      {showLevelModal && (
        <LevelSelectorModal
          currentLevel={learnerLevel}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelModal(false)}
        />
      )}
    </div>
  );
};
