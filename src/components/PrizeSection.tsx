import React from 'react';
import { Gift, Shirt, BookOpen, Coffee, Trophy, Award } from 'lucide-react';

export const PrizeSection: React.FC = () => {
  const overallPrizes = [
    {
      place: '1st Place 🥇',
      tier: 'Overall Grand Champion',
      badge: 'Gold Tier',
      prizeTitle: 'Custom SKYLINK T-Shirt',
      prizeTag: 'Exclusive Team Edition',
      prizeDesc: 'Official custom-designed Team SKYLINK 2026 CanSat tournament apparel for the #1 pilot!',
      icon: Shirt,
      accent: 'border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-white text-amber-700 shadow-md ring-2 ring-amber-100/80',
      iconBg: 'bg-amber-100 text-amber-600',
      tagBg: 'bg-amber-50 text-amber-700 border-amber-200',
      ribbon: '🏆 TOP PRIZE',
    },
    {
      place: '2nd Place 🥈',
      tier: 'Overall Runner-Up',
      badge: 'Silver Tier',
      prizeTitle: 'Custom SKYLINK Pen & Notebook',
      prizeTag: 'Mission Logbook Set',
      prizeDesc: 'Premium custom-branded SKYLINK engraved executive pen paired with a mission notebook.',
      icon: BookOpen,
      accent: 'border-slate-300 bg-gradient-to-b from-slate-50/70 via-white to-white text-slate-700 shadow-sm',
      iconBg: 'bg-slate-100 text-slate-600',
      tagBg: 'bg-slate-50 text-slate-700 border-slate-200',
      ribbon: 'RUNNER-UP',
    },
    {
      place: '3rd Place 🥉',
      tier: 'Overall 3rd Place',
      badge: 'Bronze Tier',
      prizeTitle: 'Custom SKYLINK Mug',
      prizeTag: 'Ceramic Mission Mug',
      prizeDesc: 'High-gloss custom ceramic SKYLINK CanSat aerospace mission mug to fuel your flights.',
      icon: Coffee,
      accent: 'border-rose-200 bg-gradient-to-b from-rose-50/50 via-white to-white text-rose-700 shadow-sm',
      iconBg: 'bg-rose-100 text-rose-600',
      tagBg: 'bg-rose-50 text-rose-700 border-rose-200',
      ribbon: '3RD PODIUM',
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {overallPrizes.map((p, idx) => {
          const IconComponent = p.icon;
          return (
            <div
              key={idx}
              className={`relative bg-white border-2 ${p.accent} rounded-[32px] p-6 text-center transition-all hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between`}
            >
              {/* Top Ribbon */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-white border border-rose-100 text-slate-800 font-bubbly text-xs font-bold shadow-xs">
                  {p.place}
                </span>
                <span className={`text-[10px] font-bubbly font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${p.tagBg}`}>
                  {p.badge}
                </span>
              </div>

              {/* Icon Illustration */}
              <div className="my-3 flex justify-center">
                <div className={`w-16 h-16 rounded-2xl ${p.iconBg} flex items-center justify-center shadow-inner transition-transform hover:scale-105`}>
                  <IconComponent size={32} />
                </div>
              </div>

              {/* Prize Title & Details */}
              <div className="mb-4">
                <h3 className="font-bubbly text-xl font-bold text-slate-900 mb-1 leading-snug">
                  {p.prizeTitle}
                </h3>
                <span className="text-[11px] font-mono font-semibold text-rose-500 block mb-2">
                  ✨ {p.prizeTag}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {p.prizeDesc}
                </p>
              </div>

              {/* Verified Reward Tag */}
              <div className="pt-3 border-t border-slate-100 text-[11px] font-bubbly font-bold text-slate-500 flex items-center justify-center gap-1.5">
                <Award size={13} className="text-amber-500" />
                <span>{p.tier}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* How Scoring Works Banner */}
      <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white/90 border border-rose-100 rounded-3xl sm:rounded-full px-6 py-3.5 shadow-xs text-xs font-medium text-slate-600">
        <Trophy size={15} className="text-amber-500 shrink-0" />
        <span>
          <strong>How to Win:</strong> Your Total Score is the sum of your personal best in each of the 5 mini-games. Play all 5 games to reach the Top 3 podium!
        </span>
      </div>
    </section>
  );
};