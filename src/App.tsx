import { useState, useEffect, useRef } from 'react';
import type { GameId, LeaderboardEntry } from './types';
import { fetchGlobalLeaderboard } from './utils/cloudDb';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ArcadeSection } from './components/ArcadeSection';
import { LeaderboardSection } from './components/LeaderboardSection';
import { PrizeSection } from './components/PrizeSection';
import { BlogSection } from './components/BlogSection';
import { BlogPage } from './components/BlogPage';
import { CanSatViewer } from './components/CanSatViewer';
import { AboutCanSat } from './components/AboutCanSat';
import { TeamSection } from './components/TeamSection';
import { Footer } from './components/Footer';
import { GameModal } from './components/games/GameModal';
import { AdminModal } from './components/AdminModal';
import { sound } from './utils/audio';

export function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'blog'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.toLowerCase().includes('blog') ? 'blog' : 'home';
    }
    return 'home';
  });

  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const activeGameRef = useRef<GameId | null>(null);
  activeGameRef.current = activeGame;

  const refreshLeaderboard = async () => {
    try {
      const data = await fetchGlobalLeaderboard();
      setLeaderboardEntries(data);
    } catch {}
  };

  useEffect(() => {
    refreshLeaderboard();

    // Listen to hash changes for deep linking to #blog
    const handleHashChange = () => {
      const isBlog = window.location.hash.toLowerCase().includes('blog');
      setCurrentView(isBlog ? 'blog' : 'home');
    };
    window.addEventListener('hashchange', handleHashChange);

    // Auto-poll every 6 seconds so when anyone completes a game on their phone,
    // the leaderboard live updates on all attendees' screens & projectors!
    // Pauses while a player is inside a game to prevent any screen flashing/interruptions.
    const interval = setInterval(() => {
      if (!activeGameRef.current && document.visibilityState === 'visible') {
        refreshLeaderboard();
      }
    }, 6000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleLaunchGame = (gameId: GameId) => {
    sound.playClick(800);
    setActiveGame(gameId);
  };

  const handleScrollToGames = () => {
    if (currentView === 'blog') {
      setCurrentView('home');
      window.location.hash = '';
      setTimeout(() => {
        const el = document.getElementById('games');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById('games');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setActiveGame('flappy');
      }
    }
  };

  const handleSelectView = (view: 'home' | 'blog') => {
    setCurrentView(view);
    window.location.hash = view === 'blog' ? 'blog' : '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0e1017] p-2 sm:p-6 lg:p-10 flex flex-col items-center justify-center relative ambient-glow selection:bg-rose-400 selection:text-white">
      {/* Decorative ambient light ribbon elements matching reference */}
      <div className="absolute top-12 left-10 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-12 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Monolithic Glowing Frosted Tablet Frame (Matching user reference) */}
      <div className="w-full max-w-6xl glow-frame relative overflow-hidden backdrop-blur-md">
        {/* Top Navbar */}
        <Navbar
          onPlayClick={handleScrollToGames}
          currentView={currentView}
          onSelectView={handleSelectView}
        />

        {/* Main Content View Switcher */}
        <main>
          {currentView === 'blog' ? (
            /* DEDICATED BLOG & MISSION EVIDENCE PAGE */
            <BlogPage
              onBackToArcade={() => handleSelectView('home')}
              onOpenGame={handleLaunchGame}
            />
          ) : (
            /* HOME & INTERACTIVE ARCADE VIEW */
            <>
              {/* 1. Hero */}
              <Hero onPlayClick={handleScrollToGames} />

              {/* 2. Interactive 5 Mini-Games Arcade */}
              <ArcadeSection
                onSelectGame={handleLaunchGame}
                entries={leaderboardEntries}
              />

              {/* 3. Live Leaderboard System */}
              <LeaderboardSection
                entries={leaderboardEntries}
                onOpenGame={handleLaunchGame}
                onOpenAdmin={() => setAdminModalOpen(true)}
                onRefresh={refreshLeaderboard}
              />

              {/* 4. Prizes Pool */}
              <PrizeSection />

              {/* 5. Mission Log & Outreach Blog Preview */}
              <BlogSection onOpenFullBlog={() => handleSelectView('blog')} />

              {/* 6. What's Inside CanSat */}
              <CanSatViewer />

              {/* 7. How it Works (5 Steps) */}
              <AboutCanSat />

              {/* 8. The Team */}
              <TeamSection />
            </>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Active Game Modal */}
      {activeGame && (
        <GameModal
          gameId={activeGame}
          onClose={() => setActiveGame(null)}
          onScoreSubmitted={refreshLeaderboard}
        />
      )}

      {/* Organizer / Prize Admin Desk Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        entries={leaderboardEntries}
        onClose={() => setAdminModalOpen(false)}
        onRefresh={refreshLeaderboard}
      />

      {/* Pilot Account Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
