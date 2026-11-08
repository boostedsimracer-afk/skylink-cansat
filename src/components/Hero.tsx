import React from 'react';
import { Gamepad2, Sparkles, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';
import logoUrl from '../assets/logo.png';

interface HeroProps {
  onPlayClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onPlayClick }) => {
  return (
    <div className="pt-8 pb-16 sm:pb-24 px-6 sm:px-12 text-center relative overflow-hidden">
      {/* Cute pill greeting */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-rose-200 text-rose-600 text-xs font-bubbly font-semibold shadow-sm mb-6">
        <Sparkles size={14} className="text-rose-500 animate-spin" />
        <span>SKYLINK • University of Technology Bahrain</span>
      </div>

      {/* Playful bubbly headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bubbly font-bold text-slate-900 tracking-tight leading-[1.15] max-w-3xl mx-auto mb-4">
        Tiny Can.{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-600">
          Big Space Mission!
        </span>
      </h1>

      {/* Minimal subline - strictly 1-2 friendly sentences, zero walls of text */}
      <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto mb-8 font-medium">
        Play our 5 space physics games, land on the target, and take home real prizes from our outreach booth! 🚀
      </p>

      {/* Cute Bubbly Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
        <button
          onClick={() => {
            sound.playClick(850);
            onPlayClick();
          }}
          className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-bold rounded-full shadow-lg shadow-rose-500/25 bubble-btn flex items-center gap-2.5 text-base cursor-pointer"
        >
          <Gamepad2 size={20} />
          <span>Play Mini-Games</span>
        </button>

        <a
          href="#leaderboard"
          onClick={() => sound.playClick(600)}
          className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bubbly font-bold rounded-full shadow-sm border border-rose-200/80 bubble-btn flex items-center gap-2 text-base"
        >
          <Trophy size={18} className="text-rose-500" />
          <span>See Leaderboard & Prizes</span>
        </a>
      </div>

      {/* Central Visual: Playful Floating SKYLINK CanSat Badge with cute orbit badges */}
      <div className="relative max-w-md mx-auto flex flex-col items-center justify-center">
        {/* Glowing aura */}
        <div className="absolute w-64 h-64 bg-rose-300/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Floating Patch */}
        <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-[#181C24] p-1 animate-bounce" style={{ animationDuration: '4s' }}>
          <img
            src={logoUrl}
            alt="SKYLINK Logo"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* Cute floating badges (seamless, no card box structure!) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 font-bubbly text-xs">
          <span className="px-3.5 py-1.5 rounded-full bg-white/90 border border-rose-200 text-slate-800 shadow-sm flex items-center gap-1.5 font-semibold">
            🪂 1,000m Rocket Drop
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/90 border border-rose-200 text-slate-800 shadow-sm flex items-center gap-1.5 font-semibold">
            📡 433 MHz Live Link
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/90 border border-rose-200 text-rose-600 shadow-sm flex items-center gap-1.5 font-semibold">
            🎁 Real Prizes for Top Scores
          </span>
        </div>
      </div>
    </div>
  );
};
