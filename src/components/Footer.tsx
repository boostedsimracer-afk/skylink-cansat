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

        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 font-medium">
          <a href="#games" className="hover:text-rose-500 transition-colors">Games</a>
          <a href="#leaderboard" className="hover:text-rose-500 transition-colors">Leaderboard</a>
          <a href="#blog" className="hover:text-rose-500 transition-colors">Mission Blog</a>
          <a
            href="https://linktr.ee/qr/2a450f9d-f8f9-4041-bca6-d3176b9d65b6"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-600 transition-colors flex items-center gap-1 text-slate-700 font-semibold"
          >
            <span>🌲 Linktree</span>
          </a>
          <a href="mailto:skylinkutb@gmail.com" className="hover:text-rose-500 transition-colors font-medium">
            skylinkutb@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};
