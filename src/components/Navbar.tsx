import React, { useState } from 'react';
import { Gamepad2, LogOut, Menu, Rocket, Volume2, VolumeX, X } from 'lucide-react';
import { sound } from '../utils/audio';
import logoUrl from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onPlayClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onPlayClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.enabled);
  const { currentPilot, isLoggedIn, openAuthModal, logout } = useAuth();

  const toggleSound = () => {
    const next = sound.toggleMute();
    setSoundOn(next);
  };

  const navLinks = [
    { href: '#games', label: 'Games' },
    { href: '#leaderboard', label: 'Leaderboard' },
    { href: '#prizes', label: 'Prizes' },
    { href: '#cansat', label: 'What is CanSat?' },
    { href: '#team', label: 'Team' },
  ];

  return (
    <nav className="w-full pt-6 pb-4 px-6 sm:px-12 flex items-center justify-between">
      {/* Brand */}
      <a href="#" className="flex items-center gap-3 group" onClick={() => sound.playClick(800)}>
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
      </a>

      {/* Minimal clean links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 font-sans">
        {navLinks.map(link => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => sound.playClick(650)}
            className="hover:text-rose-500 transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
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
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bubbly font-bold rounded-full shadow-sm border border-rose-100 bubble-btn flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Rocket size={14} className="text-rose-500" />
            <span className="hidden sm:inline">Pilot Login</span>
          </button>
        )}

        {/* Play Now Pill */}
        <button
          onClick={() => {
            sound.playClick(900);
            onPlayClick();
          }}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-semibold rounded-full shadow-md shadow-rose-500/20 bubble-btn flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
        >
          <Gamepad2 size={16} />
          <span>Play Now</span>
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
        <div className="absolute top-24 left-6 right-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl z-50 flex flex-col gap-4 font-bubbly text-base font-semibold border border-rose-100">
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
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => {
                sound.playClick(650);
                setMobileMenuOpen(false);
              }}
              className="text-slate-700 hover:text-rose-500 py-1"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};
