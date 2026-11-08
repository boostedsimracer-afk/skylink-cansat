import React, { useState } from 'react';
import { Gamepad2, Menu, Volume2, VolumeX, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  onPlayClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onPlayClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.enabled);

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
          src="/logo.png"
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
      <div className="flex items-center gap-3">
        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-white text-slate-600 hover:text-rose-600 transition-all shadow-sm border border-rose-100 bubble-btn cursor-pointer"
          title="Toggle Sound"
        >
          {soundOn ? <Volume2 size={18} className="text-rose-500" /> : <VolumeX size={18} />}
        </button>

        {/* Play Now Pill */}
        <button
          onClick={() => {
            sound.playClick(900);
            onPlayClick();
          }}
          className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-semibold rounded-full shadow-md shadow-rose-500/20 bubble-btn flex items-center gap-2 cursor-pointer text-sm"
        >
          <Gamepad2 size={16} />
          <span>Play Now</span>
        </button>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 rounded-full bg-white text-slate-700 md:hidden border border-slate-200"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-24 left-6 right-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl z-50 flex flex-col gap-4 font-bubbly text-base font-semibold border border-rose-100">
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
