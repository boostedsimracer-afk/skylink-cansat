import React, { useState } from 'react';
import { ExternalLink, Gamepad2, LogOut, Mail, Menu, Rocket, Volume2, VolumeX, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.enabled);
  const { currentPilot, isLoggedIn, openAuthModal, logout } = useAuth();

  const toggleSound = () => {
    const next = sound.toggleMute();
    setSoundOn(next);
  };

  const handleNavClick = (href: string, isBlogLink?: boolean) => {
    sound.playClick(650);
    setMobileMenuOpen(false);

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
    <nav className="w-full pt-6 pb-4 px-6 sm:px-12 flex items-center justify-between">
      {/* Brand */}
      <button
        onClick={() => {
          sound.playClick(800);
          if (onSelectView) onSelectView('home');
        }}
        className="flex items-center gap-3 group text-left cursor-pointer"
      >
        <img
          src={logoUrl}
          alt="SKYLINK Logo"
          className="w-11 h-11 rounded-full object-cover shadow-md group-hover:rotate-6 transition-transform border-2 border-white"
        />
        <div>
          <span className="font-bubbly font-bold text-slate-900 text-xl tracking-wide block leading-none">
            SKYLINK
          </span>
          <span className="text-[11px] font-semibold text-rose-500 font-sans tracking-wider">
            UTB BAHRAIN
          </span>
        </div>
      </button>

      {/* Main Navigation Links */}
      <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 font-sans">
        <button
          onClick={() => handleNavClick('#games')}
          className={`hover:text-rose-500 transition-colors cursor-pointer ${
            currentView === 'home' ? 'text-slate-900 font-bold' : ''
          }`}
        >
          Games
        </button>
        <button
          onClick={() => handleNavClick('#leaderboard')}
          className="hover:text-rose-500 transition-colors cursor-pointer"
        >
          Leaderboard
        </button>
        <button
          onClick={() => handleNavClick('#prizes')}
          className="hover:text-rose-500 transition-colors cursor-pointer"
        >
          Prizes
        </button>

        {/* Dedicated Mission Blog Tab Button */}
        <button
          onClick={() => handleNavClick('#blog', true)}
          className={`px-3 py-1 rounded-full font-bubbly text-xs font-bold transition-all cursor-pointer ${
            currentView === 'blog'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          📰 Mission Blog
        </button>

        <button
          onClick={() => handleNavClick('#cansat')}
          className="hover:text-rose-500 transition-colors cursor-pointer"
        >
          What is CanSat?
        </button>
        <button
          onClick={() => handleNavClick('#team')}
          className="hover:text-rose-500 transition-colors cursor-pointer"
        >
          Team
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Linktree Button */}
        <a
          href="https://linktr.ee/qr/2a450f9d-f8f9-4041-bca6-d3176b9d65b6"
          target="_blank"
          rel="noopener noreferrer"
          title="SKYLINK Linktree Link-in-Bio"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bubbly font-bold transition-all shadow-sm"
        >
          <span>🌲</span>
          <span>Linktree</span>
          <ExternalLink size={11} className="opacity-70" />
        </a>

        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-white text-slate-600 hover:text-rose-600 transition-all shadow-sm border border-rose-100 bubble-btn cursor-pointer"
          title="Toggle Sound"
        >
          {soundOn ? <Volume2 size={18} className="text-rose-500" /> : <VolumeX size={18} />}
        </button>

        {/* Pilot Account Pill */}
        {isLoggedIn && currentPilot ? (
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200/80 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-sm">👨‍🚀</span>
            <span className="font-bubbly font-bold text-xs text-rose-700 tracking-wider">
              {currentPilot.callsign}
            </span>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-full cursor-pointer"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bubbly font-bold rounded-full shadow-sm border border-rose-100 bubble-btn flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Rocket size={14} className="text-rose-500" />
            <span className="hidden sm:inline">Pilot Login</span>
          </button>
        )}

        {/* Play Now Pill */}
        <button
          onClick={() => {
            sound.playClick(900);
            if (currentView === 'blog' && onSelectView) {
              onSelectView('home');
              setTimeout(() => onPlayClick(), 150);
            } else {
              onPlayClick();
            }
          }}
          className="px-4 sm:px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-semibold rounded-full shadow-md shadow-rose-500/20 bubble-btn flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
        >
          <Gamepad2 size={16} />
          <span>Play Games</span>
        </button>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-full bg-white text-slate-700 md:hidden border border-slate-200"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-24 left-6 right-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl z-50 flex flex-col gap-3 font-bubbly text-base font-semibold border border-rose-100">
          {/* Mobile Pilot Profile */}
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            {isLoggedIn && currentPilot ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👨‍🚀</span>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">{currentPilot.callsign}</span>
                    <span className="text-[10px] text-slate-500">{currentPilot.playerName}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-rose-500 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Rocket size={14} />
                <span>Create Pilot Account / Sign In</span>
              </button>
            )}
          </div>

          <button
            onClick={() => handleNavClick('#games')}
            className="text-left text-slate-700 hover:text-rose-500 py-1"
          >
            🎮 Games Arcade
          </button>
          <button
            onClick={() => handleNavClick('#leaderboard')}
            className="text-left text-slate-700 hover:text-rose-500 py-1"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => handleNavClick('#prizes')}
            className="text-left text-slate-700 hover:text-rose-500 py-1"
          >
            🎁 Prizes
          </button>
          <button
            onClick={() => handleNavClick('#blog', true)}
            className="text-left text-rose-600 hover:text-rose-700 font-bold py-1 flex items-center justify-between"
          >
            <span>📰 Mission Blog (Completed to PDR)</span>
            <span className="text-xs bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">New</span>
          </button>
          <button
            onClick={() => handleNavClick('#cansat')}
            className="text-left text-slate-700 hover:text-rose-500 py-1"
          >
            🛰️ What is CanSat?
          </button>
          <button
            onClick={() => handleNavClick('#team')}
            className="text-left text-slate-700 hover:text-rose-500 py-1"
          >
            👥 Team SKYLINK
          </button>

          {/* External Links */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 text-xs">
            <a
              href="https://linktr.ee/qr/2a450f9d-f8f9-4041-bca6-d3176b9d65b6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center justify-between font-bold"
            >
              <span>🌲 Official Team Linktree</span>
              <ExternalLink size={14} />
            </a>
            <a
              href="mailto:skylinkutb@gmail.com"
              className="text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex items-center justify-between"
            >
              <span>✉️ skylinkutb@gmail.com</span>
              <Mail size={14} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
