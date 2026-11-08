import React from 'react';
import { Play, Trophy } from 'lucide-react';
import type { GameId, LeaderboardEntry } from '../types';
import { sound } from '../utils/audio';

interface ArcadeSectionProps {
  onSelectGame: (gameId: GameId) => void;
  entries: LeaderboardEntry[];
}

export const ArcadeSection: React.FC<ArcadeSectionProps> = ({ onSelectGame, entries }) => {
  const getTopScoreForGame = (id: GameId) => {
    const gameScores = entries.filter(e => e.gameId === id);
    if (gameScores.length === 0) return 0;
    return Math.max(...gameScores.map(e => e.score));
  };

  const games = [
    {
      id: 'flappy' as GameId,
      name: 'Flappy CanSat 🪂',
      tagline: 'Tap to flap thrusters through antenna towers!',
      emoji: '🪂',
      badge: 'TRENDING',
      btnColor: 'bg-rose-500 hover:bg-rose-600',
    },
    {
      id: 'descent' as GameId,
      name: 'Can-Drop 🪂',
      tagline: 'Glide through wind & land under 8m/s!',
      emoji: '🌪️',
      badge: 'POPULAR',
      btnColor: 'bg-slate-900 hover:bg-black',
    },
    {
      id: 'telemetry' as GameId,
      name: 'Telemetry Jam 📡',
      tagline: 'Hit the radio beats before pass ends!',
      emoji: '📡',
      badge: 'RHYTHM',
      btnColor: 'bg-rose-500 hover:bg-rose-600',
    },
    {
      id: 'lander' as GameId,
      name: 'Target Touchdown 🎯',
      tagline: 'Pulse thrusters & land on the target pad!',
      emoji: '🎯',
      badge: 'PHYSICS',
      btnColor: 'bg-slate-900 hover:bg-black',
    },
    {
      id: 'collector' as GameId,
      name: 'Data Catcher ⚡',
      tagline: 'Slide the ground dish to catch falling packets!',
      emoji: '⚡',
      badge: 'FAST PACED',
      btnColor: 'bg-rose-500 hover:bg-rose-600',
    },
  ];

  return (
    <section id="games" className="py-12 px-4 sm:px-12 max-w-6xl mx-auto">
      {/* Playful Minimalist Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-5xl font-bubbly font-bold text-slate-900 tracking-tight mb-2">
          5 CanSat Mini-Games 🎮
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Play to set high scores, top the leaderboard, and win awards!
        </p>
      </div>

      {/* 5 Playful Bubbly Game Pods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {games.map((game, idx) => {
          const topScore = getTopScoreForGame(game.id);

          return (
            <div
              key={game.id}
              className={`relative bg-white/90 border border-rose-200/80 rounded-[36px] p-6 text-center flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all group ${
                idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div>
                {/* Cute Badge */}
                <div className="inline-block px-3 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bubbly font-bold mb-3">
                  {game.badge}
                </div>

                {/* Big cute icon */}
                <div className="w-16 h-16 rounded-full bg-[#fdf2f4] border border-rose-100 flex items-center justify-center mx-auto mb-3 text-3xl group-hover:scale-110 transition-transform">
                  {game.emoji}
                </div>

                {/* Game Title */}
                <h3 className="text-xl font-bubbly font-bold text-slate-900 mb-1">
                  {game.name}
                </h3>

                {/* 1-Line Punchy Goal */}
                <p className="text-xs text-slate-500 font-medium mb-3 max-w-[220px] mx-auto">
                  {game.tagline}
                </p>

                {/* Cute Top Score Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3F4] text-slate-700 text-xs font-bubbly font-semibold mb-5">
                  <Trophy size={12} className="text-rose-500" />
                  <span>{topScore > 0 ? `Top: ${topScore.toLocaleString()} pts` : 'No scores yet!'}</span>
                </div>
              </div>

              {/* Play Button */}
              <button
                onClick={() => {
                  sound.playClick(800);
                  onSelectGame(game.id);
                }}
                className={`w-full py-3 ${game.btnColor} text-white font-bubbly font-bold rounded-full shadow-md bubble-btn flex items-center justify-center gap-2 text-sm cursor-pointer`}
              >
                <Play size={14} className="fill-white" />
                <span>Play Mission</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
