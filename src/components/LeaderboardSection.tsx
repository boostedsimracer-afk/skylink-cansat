import React, { useState } from 'react';
import { Crown, Globe, RefreshCw, Search } from 'lucide-react';
import type { GameId, LeaderboardEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

interface LeaderboardSectionProps {
  entries: LeaderboardEntry[];
  onOpenGame: (gameId: GameId) => void;
  onRefresh?: () => void;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  entries,
  onOpenGame,
  onRefresh,
}) => {
  const { currentPilot, isCloudConnected } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'all' | GameId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const tabs: { id: 'all' | GameId; label: string; emoji: string }[] = [
    { id: 'all', label: 'Overall', emoji: '🌟' },
    { id: 'flappy', label: 'Flappy', emoji: '🪂' },
    { id: 'descent', label: 'Can-Drop', emoji: '🌪️' },
    { id: 'telemetry', label: 'Telemetry', emoji: '📡' },
    { id: 'lander', label: 'Lander', emoji: '🎯' },
    { id: 'collector', label: 'Catcher', emoji: '⚡' },
  ];

  const handleManualRefresh = () => {
    if (onRefresh) {
      sound.playClick(800);
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 700);
    }
  };

  const filteredEntries = entries
    .map(entry => {
      let displayScore = entry.totalScore ?? entry.score;
      if (selectedTab === 'flappy') displayScore = entry.scoreFlappy ?? 0;
      else if (selectedTab === 'descent') displayScore = entry.scoreDescent ?? 0;
      else if (selectedTab === 'telemetry') displayScore = entry.scoreTelemetry ?? 0;
      else if (selectedTab === 'lander') displayScore = entry.scoreLander ?? 0;
      else if (selectedTab === 'collector') displayScore = entry.scoreCollector ?? 0;

      return {
        ...entry,
        displayScore,
      };
    })
    .filter(entry => {
      if (entry.displayScore <= 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.playerName.toLowerCase().includes(q) ||
          entry.callsign.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.displayScore - a.displayScore);

  const top1 = filteredEntries[0];
  const top2 = filteredEntries[1];
  const top3 = filteredEntries[2];
  const remaining = filteredEntries.slice(3);

  const getGameLabel = (id: GameId) => {
    switch (id) {
      case 'flappy': return 'Flappy CanSat';
      case 'descent': return 'Can-Drop';
      case 'telemetry': return 'Telemetry Jam';
      case 'lander': return 'Target Touchdown';
      case 'collector': return 'Data Catcher';
      default: return id;
    }
  };

  return (
    <section id="leaderboard" className="py-14 px-4 sm:px-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bubbly font-semibold shadow-sm ${
              isCloudConnected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white text-slate-600 border border-rose-100'
            }`}
          >
            <Globe size={13} className={isCloudConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'} />
            <span>{isCloudConnected ? 'Global Live Cloud Synchronized' : 'Booth Storage (Local Station)'}</span>
          </div>

          {onRefresh && (
            <button
              onClick={handleManualRefresh}
              title="Refresh Standings"
              className="p-1 rounded-full bg-white text-slate-400 hover:text-rose-600 border border-rose-100 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-rose-500' : ''} />
            </button>
          )}
        </div>

        <h2 className="text-3xl sm:text-5xl font-bubbly font-bold text-slate-900 tracking-tight mb-2">
          Live Leaderboard 🏆
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">
          Play games, set new high scores, and win prizes for Overall Top 3 & Game 1st Places!
        </p>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        {/* Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick(700);
                setSelectedTab(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-full font-bubbly text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedTab === tab.id
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-rose-100'
              }`}
            >
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State when no scores submitted yet */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white/90 border border-rose-100 rounded-[36px] p-10 text-center shadow-sm">
          <span className="text-5xl mb-3 block animate-bounce">🚀</span>
          <h3 className="font-bubbly text-2xl font-bold text-slate-900 mb-2">
            No Flights Logged Yet!
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-sm mx-auto mb-6">
            Be the very first pilot to play a game and claim the #1 spot on the live leaderboard!
          </p>
          <button
            onClick={() => onOpenGame(selectedTab === 'all' ? 'flappy' : selectedTab)}
            className="px-7 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-bold rounded-full shadow-md bubble-btn text-xs uppercase tracking-wider cursor-pointer"
          >
            Launch First Flight 🎮
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium when scores exist */}
          <div className="grid grid-cols-3 gap-3 items-end mb-8 text-center font-bubbly">
            {/* 2nd Place */}
            {top2 ? (
              <div className={`bg-white/80 border rounded-[28px] p-4 flex flex-col items-center shadow-sm ${
                currentPilot && top2.callsign === currentPilot.callsign
                  ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-200'
                  : 'border-slate-200/90'
              }`}>
                <span className="text-2xl mb-1">🥈</span>
                <div className="flex items-center gap-1 truncate max-w-full">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {top2.callsign}
                  </span>
                  {currentPilot && top2.callsign === currentPilot.callsign && (
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                  {top2.displayScore.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-sans">
                  {selectedTab === 'all' ? 'Overall 2nd Prize' : 'Runner-Up'}
                </span>
              </div>
            ) : <div />}

            {/* 1st Place */}
            {top1 && (
              <div className={`bg-white border-2 rounded-[32px] p-5 flex flex-col items-center shadow-lg -translate-y-2 ${
                currentPilot && top1.callsign === currentPilot.callsign
                  ? 'border-rose-500 ring-4 ring-rose-200'
                  : 'border-rose-400'
              }`}>
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white mb-1 shadow">
                  <Crown size={16} />
                </div>
                <div className="flex items-center gap-1 truncate max-w-full">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {top1.callsign}
                  </span>
                  {currentPilot && top1.callsign === currentPilot.callsign && (
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-base font-extrabold text-rose-600 font-mono mt-0.5">
                  {top1.displayScore.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mt-1.5 font-sans">
                  🏆 {selectedTab === 'all' ? 'Overall 1st Prize' : 'Game 1st Prize'}
                </span>
              </div>
            )}

            {/* 3rd Place */}
            {top3 ? (
              <div className={`bg-white/80 border rounded-[28px] p-4 flex flex-col items-center shadow-sm ${
                currentPilot && top3.callsign === currentPilot.callsign
                  ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-200'
                  : 'border-slate-200/90'
              }`}>
                <span className="text-2xl mb-1">🥉</span>
                <div className="flex items-center gap-1 truncate max-w-full">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {top3.callsign}
                  </span>
                  {currentPilot && top3.callsign === currentPilot.callsign && (
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                  {top3.displayScore.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-sans">
                  {selectedTab === 'all' ? 'Overall 3rd Prize' : '3rd Place'}
                </span>
              </div>
            ) : <div />}
          </div>

          {/* Clean List */}
          <div className="bg-white/90 border border-rose-100 rounded-[32px] p-4 sm:p-6 shadow-sm">
            {/* Search */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by callsign or name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF3F4] border border-rose-100 rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 font-sans"
              />
            </div>

            {/* Remaining Rows */}
            <div className="divide-y divide-rose-50">
              {remaining.map((entry, idx) => {
                const isUser = currentPilot && entry.callsign === currentPilot.callsign;
                return (
                  <div
                    key={entry.id || idx}
                    className={`py-3 px-3 flex items-center justify-between rounded-2xl transition-colors font-sans text-xs ${
                      isUser
                        ? 'bg-rose-50/80 border border-rose-200/80 font-semibold'
                        : 'hover:bg-rose-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bubbly font-bold text-slate-400 w-5 text-center">
                        #{idx + 4}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 font-bubbly text-sm">
                            {entry.callsign}
                          </span>
                          {isUser && (
                            <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {selectedTab === 'all' ? (entry.playerName || 'Overall Champion') : getGameLabel(selectedTab)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 font-mono text-sm block">
                        {entry.displayScore.toLocaleString()} pts
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {entry.schoolOrOrg || 'Independent'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
};
