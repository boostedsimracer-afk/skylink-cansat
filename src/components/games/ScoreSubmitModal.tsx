import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, Trophy, X } from 'lucide-react';
import type { GameId, PlayerProfile } from '../../types';
import { getSavedPlayerProfile, saveLeaderboardEntry, savePlayerProfile } from '../../utils/storage';
import { sound } from '../../utils/audio';

interface ScoreSubmitModalProps {
  isOpen: boolean;
  gameId: GameId;
  gameTitle: string;
  score: number;
  onClose: () => void;
  onScoreSubmitted: () => void;
}

export const ScoreSubmitModal: React.FC<ScoreSubmitModalProps> = ({
  isOpen,
  gameId,
  gameTitle,
  score,
  onClose,
  onScoreSubmitted,
}) => {
  const [formData, setFormData] = useState<PlayerProfile>({
    callsign: '',
    playerName: '',
    contactInfo: '',
    schoolOrOrg: '',
  });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedPlayerProfile();
      setFormData(saved);
      setSubmitted(false);
      setError('');

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E11D48', '#181C24', '#ffffff', '#cbd5e1'],
        });
      } catch {}
    }
  }, [isOpen, score]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.callsign.trim() && !formData.playerName.trim()) {
      setError('Please provide a Callsign or Player Name');
      return;
    }

    const finalCallsign = formData.callsign.trim() || formData.playerName.trim().toUpperCase().replace(/\s+/g, '_');
    const finalName = formData.playerName.trim() || finalCallsign;

    savePlayerProfile({
      ...formData,
      callsign: finalCallsign,
      playerName: finalName,
    });

    saveLeaderboardEntry({
      gameId,
      playerName: finalName,
      callsign: finalCallsign,
      score,
      contactInfo: formData.contactInfo.trim(),
      schoolOrOrg: formData.schoolOrOrg.trim(),
    });

    sound.playFanfare();
    setSubmitted(true);

    setTimeout(() => {
      onScoreSubmitted();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-[32px] p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Telemetry Logged!
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Your score of <span className="text-rose-600 font-bold font-mono">{score} pts</span> is now logged on the event leaderboard!
            </p>
            <div className="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-full font-mono">
              Redirecting to Leaderboard...
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Trophy size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                  {gameTitle} Complete
                </span>
                <h3 className="text-lg font-bold text-slate-900">Save Mission Score</h3>
              </div>
            </div>

            {/* Score Display Card */}
            <div className="bg-[#F8F9FA] border border-slate-200/90 rounded-2xl p-4 text-center mb-5">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">FINAL TELEMETRY SCORE</span>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">
                {score.toLocaleString()} <span className="text-xs text-rose-600 font-sans font-bold">PTS</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Callsign / Handle <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SKY_FOX"
                  value={formData.callsign}
                  onChange={e => setFormData({ ...formData, callsign: e.target.value.toUpperCase() })}
                  maxLength={16}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={formData.playerName}
                  onChange={e => setFormData({ ...formData, playerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Contact Email / Student ID <span className="text-rose-600 font-normal">(For Prizes!)</span>
                </label>
                <input
                  type="text"
                  placeholder="email@example.com or student ID"
                  value={formData.contactInfo}
                  onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  🔒 Private: Only organizers see this to notify top winners.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  School / Team / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. University of Technology Bahrain"
                  value={formData.schoolOrOrg}
                  onChange={e => setFormData({ ...formData, schoolOrOrg: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              {error && (
                <div className="text-rose-600 text-xs py-1 text-center font-mono">
                  {error}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition-colors cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-[#181C24] hover:bg-black text-white font-semibold rounded-full transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 uppercase tracking-wider text-xs cursor-pointer"
                >
                  <Sparkles size={14} className="text-rose-400" />
                  <span>Submit Score</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
