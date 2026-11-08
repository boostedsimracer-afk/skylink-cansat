import React from 'react';
import { Gift, Sparkles } from 'lucide-react';

export const PrizeSection: React.FC = () => {
  const overallPrizes = [
    { place: '1st Place 🥇', tier: 'Overall Champion', status: 'Mystery Prize ✨ (To Be Announced)' },
    { place: '2nd Place 🥈', tier: 'Overall Runner-Up', status: 'Mystery Prize ✨ (To Be Announced)' },
    { place: '3rd Place 🥉', tier: 'Overall 3rd Place', status: 'Mystery Prize ✨ (To Be Announced)' },
  ];

  const gamePrizes = [
    { game: 'Flappy CanSat 🪂', prize: '1st Place Mystery Award' },
    { game: 'Can-Drop 🌪️', prize: '1st Place Mystery Award' },
    { game: 'Telemetry Jam 📡', prize: '1st Place Mystery Award' },
    { game: 'Target Touchdown 🎯', prize: '1st Place Mystery Award' },
    { game: 'Data Catcher ⚡', prize: '1st Place Mystery Award' },
  ];

  return (
    <section id="prizes" className="py-12 px-4 sm:px-12 max-w-5xl mx-auto text-center">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bubbly text-xs font-semibold mb-2">
          <Gift size={13} />
          <span>Competition Rewards</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bubbly font-bold text-slate-900 tracking-tight mb-2">
          Prizes & Awards 🎁
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-md mx-auto">
          Prizes for the Overall Top 3 pilots + special 1st place prizes for each individual game!
        </p>
      </div>

      {/* Overall Top 3 Podium Cards */}
      <div className="mb-6">
        <span className="text-xs font-bubbly font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Overall Tournament Podium
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overallPrizes.map((p, idx) => (
            <div
              key={idx}
              className="bg-white/90 border border-rose-200/80 rounded-3xl p-5 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bubbly text-xs font-bold mb-2">
                {p.place}
              </span>
              <h3 className="font-bubbly text-base font-bold text-slate-900 mb-1">
                {p.tier}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
                <Sparkles size={12} className="text-rose-500" />
                <span>{p.status}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Per-Game 1st Place Awards */}
      <div className="bg-white/80 border border-rose-100 rounded-3xl p-6 shadow-sm">
        <span className="text-xs font-bubbly font-bold text-slate-700 uppercase tracking-wider block mb-4">
          Individual Game Champion Awards (1st Place Each)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {gamePrizes.map((g, idx) => (
            <div
              key={idx}
              className="bg-[#FAF3F4] border border-rose-100 rounded-2xl p-3 text-center"
            >
              <span className="font-bubbly font-bold text-slate-900 text-xs block mb-1">
                {g.game}
              </span>
              <span className="text-[11px] text-rose-600 font-medium block">
                {g.prize}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-slate-400 font-sans mt-4">
        * Exact prizes will be revealed during the event. Submit your contact details after playing to qualify!
      </div>
    </section>
  );
};
