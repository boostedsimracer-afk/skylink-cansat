import React from 'react';
import logoUrl from '../assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="pt-8 pb-12 px-6 sm:px-12 text-center text-xs text-slate-400 font-sans border-t border-rose-100/80">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5">
          <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-full object-cover" />
          <span className="font-bubbly font-bold text-slate-800 text-sm">
            SKYLINK CANSAT 2026
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">UTB Bahrain</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <a href="#games" className="hover:text-rose-500 transition-colors">Games</a>
          <a href="#leaderboard" className="hover:text-rose-500 transition-colors">Leaderboard</a>
          <a href="#prizes" className="hover:text-rose-500 transition-colors">Prizes</a>
          <a href="mailto:outreach@skylink-cansat.org" className="hover:text-rose-500 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};
