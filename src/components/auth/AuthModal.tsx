import React, { useState } from 'react';
import { LogIn, Rocket, ShieldCheck, Sparkles, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sound } from '../../utils/audio';

export const AuthModal: React.FC = () => {
  const { authModalOpen, closeAuthModal, login, register, isCloudConnected } = useAuth();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Register Form
  const [regCallsign, setRegCallsign] = useState('');
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');

  // Login Form
  const [loginCallsign, setLoginCallsign] = useState('');
  const [loginPin, setLoginPin] = useState('');

  if (!authModalOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await register({
      callsign: regCallsign,
      playerName: regName,
      schoolOrOrg: regSchool,
      email: regEmail,
      phone: regPhone,
      contactInfo: `${regEmail} ${regPhone}`.trim(),
      pin: regPin,
    });

    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      sound.playCrash();
    } else {
      setSuccess(res.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await login(loginCallsign, loginPin);
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      sound.playCrash();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 overflow-hidden font-sans">
        {/* Decorative Top Ambient Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick(600);
            closeAuthModal();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm">
            <Rocket size={28} className="animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <h3 className="text-2xl font-bubbly font-bold text-slate-900 tracking-tight">
            {mode === 'register' ? 'Join CanSat Mission' : 'Pilot Sign In'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {mode === 'register'
              ? 'Create your callsign account to save scores to the global leaderboard!'
              : 'Log back in to track your stats and claim tournament prizes.'}
          </p>

          {/* Cloud Status Pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold font-bubbly bg-slate-100 text-slate-600">
            <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isCloudConnected ? 'Global Cloud Database Active' : 'Local Booth Storage'}</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 font-bubbly text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              sound.playClick(600);
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={14} />
            <span>New Pilot</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick(600);
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                Pilot Callsign <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. ASTRO_FALCON"
                  value={regCallsign}
                  onChange={e => setRegCallsign(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-rose-400 focus:outline-none tracking-wider uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                This public handle shows on the live leaderboard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ali Hassan"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                  School / Affiliation
                </label>
                <input
                  type="text"
                  placeholder="UTB Bahrain"
                  value={regSchool}
                  onChange={e => setRegSchool(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Alerts)</span>
                </label>
                <input
                  type="email"
                  placeholder="pilot@gmail.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                  Phone Number <span className="text-slate-400 font-normal">(Prizes)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+973 3XXXXXXX"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1">
              🔒 Kept private in Supabase for prize contact and score-beaten alerts.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                Flight PIN / Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="4-digit PIN or password"
                value={regPin}
                onChange={e => setRegPin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-rose-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                🔒 Cryptographically hashed using Salted SHA-256 before storage.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bubbly font-bold rounded-2xl shadow-lg shadow-rose-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Sparkles size={16} />
              <span>{loading ? 'Creating Account...' : 'Create Pilot Account 🚀'}</span>
            </button>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                Pilot Callsign
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ASTRO_FALCON"
                value={loginCallsign}
                onChange={e => setLoginCallsign(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-rose-400 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                Flight PIN / Password
              </label>
              <input
                type="password"
                required
                placeholder="Your 4-digit PIN"
                value={loginPin}
                onChange={e => setLoginPin(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-rose-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bubbly font-bold rounded-2xl shadow-lg shadow-rose-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <LogIn size={16} />
              <span>{loading ? 'Authenticating...' : 'Sign In & Load Stats'}</span>
            </button>
          </form>
        )}

        {/* Footer / Guest Play Note */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              sound.playClick(500);
              closeAuthModal();
            }}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
          >
            Or play as Guest (scores saved on this device only) →
          </button>
        </div>
      </div>
    </div>
  );
};
