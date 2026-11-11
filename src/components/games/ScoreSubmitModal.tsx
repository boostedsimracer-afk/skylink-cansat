import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Globe, Rocket, Sparkles, Trophy, X } from 'lucide-react';
import type { GameId, PlayerProfile } from '../../types';
import { getSavedPlayerProfile, savePlayerProfile } from '../../utils/storage';
import { saveGlobalScore } from '../../utils/cloudDb';
import { useAuth } from '../../context/AuthContext';
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
  const { currentPilot, isLoggedIn, openAuthModal, isCloudConnected } = useAuth();
  const [formData, setFormData] = useState<PlayerProfile>({
    callsign: '',
    playerName: '',
    contactInfo: '',
    schoolOrOrg: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (isLoggedIn && currentPilot) {
        setFormData({
          callsign: currentPilot.callsign,
          playerName: currentPilot.playerName,
          contactInfo: currentPilot.contactInfo || currentPilot.email || '',
          schoolOrOrg: currentPilot.schoolOrOrg || '',
        });
      } else {
        const saved = getSavedPlayerProfile();
        setFormData(saved);
      }
      setSubmitted(false);
      setError('');
      setIsSubmitting(false);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E11D48', '#181C24', '#ffffff', '#cbd5e1'],
        });
      } catch {}
    }
  }, [isOpen, score, isLoggedIn, currentPilot]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const callsignToUse = (
      isLoggedIn && currentPilot ? currentPilot.callsign : formData.callsign
    ).trim();
    const nameToUse = (
      isLoggedIn && currentPilot ? currentPilot.playerName : formData.playerName
    ).trim();

    if (!callsignToUse && !nameToUse) {
      setError('Please provide a Callsign or Player Name');
      return;
    }

    const finalCallsign = (callsignToUse || nameToUse).toUpperCase().replace(/\s+/g, '_');
    const finalName = nameToUse || finalCallsign;
    const finalSchool = (isLoggedIn && currentPilot ? (currentPilot.schoolOrOrg || '') : formData.schoolOrOrg).trim();
    const finalContact = (isLoggedIn && currentPilot ? (currentPilot.contactInfo || currentPilot.email || '') : formData.contactInfo).trim();

    setIsSubmitting(true);

    // Save profile locally
    savePlayerProfile({
      callsign: finalCallsign,
      playerName: finalName,
      schoolOrOrg: finalSchool,
      contactInfo: finalContact,
    });

    // Save to Global Database (Supabase + local)
    await saveGlobalScore({
      gameId,
      playerName: finalName,
      callsign: finalCallsign,
      score,
      contactInfo: finalContact,
      schoolOrOrg: finalSchool,
    });

    sound.playFanfare();
    setIsSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      onScoreSubmitted();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-rose-100 rounded-[32px] p-6 sm:p-7 shadow-2xl font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="text-center py-6 font-bubbly">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              Telemetry Synchronized! 📡
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Your score of <span className="text-rose-600 font-bold font-mono text-sm">{score.toLocaleString()} pts</span> is now broadcast to the global live leaderboard!
            </p>
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-full font-mono">
              <Globe size={13} className="text-emerald-500 animate-spin" />
              <span>Updating standings for all pilots...</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Trophy size={22} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                  {gameTitle} Complete
                </span>
                <h3 className="text-lg font-bubbly font-bold text-slate-900">Log Flight Score</h3>
              </div>
            </div>

            {/* Score Display Card */}
            <div className="bg-gradient-to-br from-rose-50/70 to-slate-50 border border-rose-100 rounded-2xl p-4 text-center mb-5">
              <span className="text-[11px] text-slate-400 font-bubbly font-semibold block mb-1">
                FINAL TELEMETRY SCORE
              </span>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">
                {score.toLocaleString()} <span className="text-xs text-rose-600 font-sans font-bold">PTS</span>
              </div>
            </div>

            {/* LOGGED-IN PILOT VIEW */}
            {isLoggedIn && currentPilot ? (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-lg shadow-sm">
                      👨‍🚀
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block font-bubbly">
                        {currentPilot.callsign}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {currentPilot.playerName} {currentPilot.schoolOrOrg && `• ${currentPilot.schoolOrOrg}`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold font-bubbly">
                    Verified Pilot
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Globe size={14} className={isCloudConnected ? 'text-emerald-500' : 'text-amber-500'} />
                  <span>
                    {isCloudConnected
                      ? 'Global Cloud Sync: Everyone will see your score.'
                      : 'Local Booth Mode: Syncs to this station.'}
                  </span>
                </div>

                <div className="pt-2 flex gap-3 font-bubbly">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors cursor-pointer text-xs"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="flex-2 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={16} />
                    <span>{isSubmitting ? 'Transmitting...' : 'Log Score Globally 🚀'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* GUEST SUBMISSION FORM */
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {/* Account Suggestion Banner */}
                <div className="p-3 bg-rose-50/80 border border-rose-200/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rocket size={16} className="text-rose-500 shrink-0" />
                    <span className="text-[11px] text-slate-700 font-medium">
                      Have a Pilot Account?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal();
                    }}
                    className="text-[11px] font-bubbly font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Sign In / Register →
                  </button>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold font-bubbly mb-1">
                    Callsign / Handle <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SKY_FOX"
                    value={formData.callsign}
                    onChange={e => setFormData({ ...formData, callsign: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    maxLength={16}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white font-mono uppercase font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold font-bubbly mb-1">
                      Player Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={formData.playerName}
                      onChange={e => setFormData({ ...formData, playerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold font-bubbly mb-1">
                      School / Team
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTB Bahrain"
                      value={formData.schoolOrOrg}
                      onChange={e => setFormData({ ...formData, schoolOrOrg: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold font-bubbly mb-1">
                    Contact Email / Phone <span className="text-rose-600 font-normal">(For Prizes!)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="email@example.com or phone"
                    value={formData.contactInfo}
                    onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    🔒 Kept private for organizers to award outreach prizes.
                  </span>
                </div>

                {error && (
                  <div className="text-rose-600 text-xs py-1 text-center font-mono">
                    {error}
                  </div>
                )}

                <div className="pt-2 flex gap-3 font-bubbly">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors cursor-pointer text-xs"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={14} className="text-white" />
                    <span>{isSubmitting ? 'Transmitting...' : 'Log Score Globally 🚀'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
