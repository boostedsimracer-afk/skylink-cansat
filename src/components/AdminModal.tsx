import React, { useState } from 'react';
import { Download, Key, RefreshCw, Trash2, X, Award } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { clearAllLeaderboard, downloadCSV, exportLeaderboardCSV, resetLeaderboardToDefault } from '../utils/storage';
import { sound } from '../utils/audio';

interface AdminModalProps {
  isOpen: boolean;
  entries: LeaderboardEntry[];
  onClose: () => void;
  onRefresh: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  entries,
  onClose,
  onRefresh,
}) => {
  const [passcode, setPasscode] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'cansat2026' || passcode === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
      sound.playFanfare();
    } else {
      setAuthError('Incorrect passcode. (Organizer default: cansat2026)');
      sound.playCrash();
    }
  };

  const handleExportCSV = () => {
    sound.playClick(700);
    const csvContent = exportLeaderboardCSV(entries);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`skylink_prize_winners_${dateStr}.csv`, csvContent);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset leaderboard to default demo scores?')) {
      resetLeaderboardToDefault();
      onRefresh();
      sound.playClick(500);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear ALL scores for a fresh outreach event?')) {
      clearAllLeaderboard();
      onRefresh();
      sound.playClick(400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[32px] p-7 shadow-2xl max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        {!isAuthenticated ? (
          <div className="text-center py-6 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-800">
              <Key size={26} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Organizer & Prize Desk</h3>
            <p className="text-slate-500 text-xs mb-5">
              Access attendee contact details and export CSV for prize distribution.
            </p>

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                placeholder="Enter passcode (default: cansat2026)"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-mono text-sm"
                autoFocus
              />
              {authError && <div className="text-rose-600 text-xs font-mono">{authError}</div>}
              <div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#181C24] hover:bg-black text-white font-semibold rounded-full transition-all shadow-sm text-xs uppercase tracking-wider cursor-pointer"
                >
                  Unlock Admin Portal
                </button>
              </div>
              <div className="text-[11px] text-slate-400">
                Organizer hint: default is <code className="text-slate-800 font-mono">cansat2026</code>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Prize Distribution Desk</h3>
                  <p className="text-xs text-slate-400">
                    Total recorded submissions: <span className="text-slate-900 font-bold">{entries.length}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-[#181C24] hover:bg-black text-white font-semibold rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="flex-1 overflow-y-auto my-4 border border-slate-200 rounded-2xl bg-[#F8F9FA]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-medium sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Player / Callsign</th>
                    <th className="py-2.5 px-3">Mission</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3 text-rose-600 font-bold">Contact (Prize)</th>
                    <th className="py-2.5 px-3">Affiliation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No scores recorded yet. Play a game to test!
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry, idx) => (
                      <tr key={entry.id || idx} className="hover:bg-white">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{entry.playerName || entry.callsign}</div>
                          <div className="text-[10px] font-mono text-slate-400">{entry.callsign}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono uppercase text-[10px] text-slate-600">
                          {entry.gameId}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                          {entry.score.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-mono text-[11px]">
                          {entry.contactInfo ? (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              {entry.contactInfo}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No contact</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {entry.schoolOrOrg || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex gap-2">
                <button
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                >
                  <RefreshCw size={11} /> Reset Demo Scores
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                >
                  <Trash2 size={11} /> Clear All For New Event
                </button>
              </div>

              <div className="text-slate-400 text-[11px] font-mono">
                SKYLINK UTB Bahrain Console
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
