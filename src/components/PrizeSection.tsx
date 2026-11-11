import React from 'react';
import { Gift, Sparkles, Trophy } from 'lucide-react';

export const PrizeSection: React.FC = () => {
  const overallPrizes = [
    {
      place: '1st Place 🥇',
      tier: 'Overall Grand Champion',
      badge: 'Gold Tier',
      status: 'Mystery Prize ✨ (To Be Announced)',
      accent: 'border-amber-300 bg-amber-50/40 text-amber-700',
    },
    {
      place: '2nd Place 🥈',
      tier: 'Overall Runner-Up',
      badge: 'Silver Tier',
      status: 'Mystery Prize ✨ (To Be Announced)',
      accent: 'border-slate-300 bg-slate-50/50 text-slate-700',
    },
    {
      place: '3rd Place 🥉',
      tier: 'Overall 3rd Place',
      badge: 'Bronze Tier',
      status: 'Mystery Prize ✨ (To Be Announced)',
      accent: 'border-rose-200 bg-rose-50/30 text-rose-700',
    },
  ];

  return (
    <section id="prizes" className="py-14 px-4 sm:px-12 max-w-4xl mx-auto text-center">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bubbly text-xs font-semibold mb-2 shadow-sm">
          <Gift size={13} />
          <span>Competition Rewards</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bubbly font-bold text-slate-900 tracking-tight mb-2">
          Tournament Prizes 🏆
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-md mx-auto">
          Prizes will be awarded to the <strong>Overall Top 3 pilots</strong> with the highest total combined score across all 5 space missions!
        </p>
      </div>

      {/* Overall Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {overallPrizes.map((p, idx) => (
          <div
            key={idx}
            className={`bg-white/90 border-2 ${p.accent} rounded-3xl p-6 text-center shadow-sm hover:shadow-lg transition-all hover:-translate-y-1`}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-white border border-rose-100 text-slate-800 font-bubbly text-xs font-bold mb-3 shadow-xs">
              {p.place}
            </div>
            <h3 className="font-bubbly text-lg font-bold text-slate-900 mb-1">
              {p.tier}
            </h3>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-rose-500 block mb-3">
              {p.badge}
            </span>
            <p className="text-xs text-slate-600 font-medium flex items-center justify-center gap-1.5 bg-white/70 py-2 rounded-2xl border border-rose-100/60">
              <Sparkles size={13} className="text-rose-500 shrink-0" />
              <span>{p.status}</span>
            </p>
          </div>
        ))}
      </div>

      {/* How Scoring Works Banner */}
      <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white/80 border border-rose-100 rounded-3xl sm:rounded-full px-6 py-3 shadow-xs text-xs font-medium text-slate-600">
        <Trophy size={14} className="text-amber-500 shrink-0" />
        <span>
          <strong>How to Win:</strong> Your Total Score is the sum of your personal best in each of the 5 mini-games. Play all games to climb to the top!
        </span>
      </div>
    </section>
  );
};
