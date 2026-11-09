import React, { useState } from 'react';
import {
  BookOpen,
  Compass,
  ExternalLink,
  Gift,
  LogOut,
  Mail,
  Menu,
  Rocket,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { sound } from '../utils/audio';
import logoUrl from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onPlayClick: () => void;
  currentView?: 'home' | 'blog';
  onSelectView?: (view: 'home' | 'blog') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onPlayClick,
  currentView = 'home',
  onSelectView,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.enabled);
  const { currentPilot, isLoggedIn, openAuthModal, logout } = useAuth();

  const toggleSound = () => {
    const next = sound.toggleMute();
    setSoundOn(next);
  };

  const handleNavClick = (href: string, isBlogLink?: boolean) => {
    sound.playClick(650);
    setMenuOpen(false);

    if (isBlogLink) {
      if (onSelectView) onSelectView('blog');
      return;
    }

    if (currentView === 'blog' && onSelectView) {
      onSelectView('home');
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="w-full pt-5 pb-4 px-5 sm:px-10 flex items-center justify-between relative border-b border-rose-100/50">
      {/* Brand */}
      <button
        onClick={() => {
          sound.playClick(800);
          if (onSelectView) onSelectView('home');
        }}
        className="flex items-center gap-3 text-left cursor-pointer group"
      >
        <img
          src={logoUrl}
          alt="SKYLINK Logo"
          className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform border border-rose-100"
        />
        <div className="flex flex-col">
          <span className="font-bubbly font-bold text-slate-900 text-lg sm:text-xl tracking-wide leading-none">
            SKYLINK
          </span>
          <span className="text-[10px] font-sans font-bold text-rose-500 tracking-wider uppercase mt-0.5">
            UTB BAHRAIN
          </span>
        </div>
      </button>

      {/* Right Controls - Minimal & Spacious */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick View Toggle (Blog vs Home) */}
        {currentView === 'home' ? (
          <button
            onClick={() => {
              sound.playClick(750);
              if (onSelectView) onSelectView('blog');
            }}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bubbly text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-sm cursor-pointer flex items-center gap-1.5 bubble-btn"
          >
            <span>📰</span>
            <span className="hidden xs:inline">Mission Blog</span>
            <span className="xs:hidden">Blog</span>
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playClick(750);
              if (onSelectView) onSelectView('home');
            }}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bubbly text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-rose-200 transition-all shadow-sm cursor-pointer flex items-center gap-1.5 bubble-btn"
          >
            <span>🏠</span>
            <span>Home</span>
          </button>
        )}

        {/* Pilot Account Pill */}
        {isLoggedIn && currentPilot ? (
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200/80 rounded-full px-3 py-1.5 shadow-sm text-xs">
            <span className="text-sm">👨‍🚀</span>
            <span className="font-bubbly font-bold text-rose-700 hidden sm:inline">
              {currentPilot.callsign}
            </span>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded-full cursor-pointer ml-0.5"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playClick(600);
              openAuthModal();
            }}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white hover:bg-slate-50 text-slate-700 font-bubbly font-bold rounded-full shadow-sm border border-rose-100 bubble-btn flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Rocket size={13} className="text-rose-500" />
            <span className="hidden sm:inline">Pilot Login</span>
          </button>
        )}

        {/* Hamburger Menu Toggle Button */}
        <button
          onClick={() => {
            sound.playClick(600);
            setMenuOpen(!menuOpen);
          }}
          className={`p-2 sm:px-3.5 sm:py-2 rounded-full transition-all border shadow-sm flex items-center gap-1.5 cursor-pointer ${
            menuOpen
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-rose-200/80'
          }`}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
          <span className="font-bubbly font-semibold text-xs hidden sm:inline">Menu</span>
        </button>
      </div>

      {/* Hamburger Modal Drawer */}
      {menuOpen && (
        <div className="absolute top-20 right-4 sm:right-10 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl z-50 flex flex-col gap-2 font-bubbly border border-rose-200/80 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider px-2 pb-1 border-b border-rose-50">
            Navigation
          </div>

          <button
            onClick={() => {
              handleNavClick('#games');
              onPlayClick();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors text-left text-sm font-semibold cursor-pointer"
          >
            <span className="text-base">🎮</span>
            <span>Mini-Games Arcade</span>
          </button>

          <button
            onClick={() => handleNavClick('#leaderboard')}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors text-left text-sm font-semibold cursor-pointer"
          >
            <Trophy size={16} className="text-amber-500" />
            <span>Live Leaderboard</span>
          </button>

          <button
            onClick={() => handleNavClick('#prizes')}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors text-left text-sm font-semibold cursor-pointer"
          >
            <Gift size={16} className="text-rose-500" />
            <span>Prizes Pool</span>
          </button>

          <button
            onClick={() => handleNavClick('#blog', true)}
            className="flex items-center justify-between px-3 py-2 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 text-rose-700 transition-colors text-left text-sm font-bold cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={16} className="text-rose-600" />
              <span>Mission Blog</span>
            </div>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-rose-200 text-rose-600 font-sans">
              CAD Printing 🛠️
            </span>
          </button>

          <button
            onClick={() => handleNavClick('#cansat')}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors text-left text-sm font-semibold cursor-pointer"
          >
            <Compass size={16} className="text-indigo-500" />
            <span>What is CanSat?</span>
          </button>

          <button
            onClick={() => handleNavClick('#team')}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors text-left text-sm font-semibold cursor-pointer"
          >
            <Users size={16} className="text-slate-600" />
            <span>Team SKYLINK</span>
          </button>

          {/* Social & Contact */}
          <div className="pt-2 mt-1 border-t border-rose-100 flex flex-col gap-1.5 font-sans">
            <a
              href="https://linktr.ee/qr/2a450f9d-f8f9-4041-bca6-d3176b9d65b6"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>🌲</span>
                <span>Official Linktree</span>
              </div>
              <ExternalLink size={12} className="opacity-70" />
            </a>

            <a
              href="mailto:skylinkutb@gmail.com"
              className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            >
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-rose-500" />
                <span>skylinkutb@gmail.com</span>
              </div>
            </a>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 text-xs font-medium cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {soundOn ? <Volume2 size={14} className="text-rose-500" /> : <VolumeX size={14} />}
                <span>Sound Effects</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  soundOn ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {soundOn ? 'ON' : 'MUTED'}
              </span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
