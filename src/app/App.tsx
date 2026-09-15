import React, { useEffect, useState } from 'react';
import { GameId, SessionState } from '../content/types';
import { sessionController } from '../learning/sessionController';
import { getSettings } from '../storage/db';
import { Header } from './Header';
import { HomeView } from './HomeView';
import { ChapterSelectView } from './ChapterSelectView';
import { SessionView } from './SessionView';
import { SummaryView } from './SummaryView';
import { NeighborhoodView } from './NeighborhoodView';
import { SettingsView } from './SettingsView';

export const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [activeSession, setActiveSession] = useState<SessionState | null>(null);
  const [completedSession, setCompletedSession] = useState<SessionState | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState('chapter-a');

  useEffect(() => {
    getSettings().then(cfg => setSelectedChapterId(cfg.selectedChapterId));

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
  }, [selectedChapterId]);

  const navigate = (newRoute: string) => {
    window.location.hash = newRoute;
    setRoute(newRoute);
  };

  const handleStartSession = async (chapterId: string, gameId: GameId | 'mixed' = 'mixed') => {
    const session = await sessionController.startSession(chapterId, gameId);
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

  const isSessionRoute = route === '#/session';

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-ink-900 font-sans">
      {!isSessionRoute && (
        <Header currentRoute={route} onNavigate={navigate} />
      )}

      <main className="flex-1 flex flex-col">
        {route === '#/' && (
          <HomeView
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
          <SettingsView onBack={() => navigate('#/')} />
        )}
      </main>
    </div>
  );
};
