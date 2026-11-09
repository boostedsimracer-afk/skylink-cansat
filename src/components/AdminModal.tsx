import React, { useState, useEffect } from 'react';
import {
  Award,
  Check,
  Copy,
  Database,
  Download,
  Globe,
  Key,
  Mail,
  RefreshCw,
  Send,
  Trash2,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import type { PilotAccount } from '../types/auth';
import { clearAllLeaderboard, downloadCSV, exportLeaderboardCSV, resetLeaderboardToDefault } from '../utils/storage';
import {
  clearCloudConfig,
  getCloudConfig,
  getLocalAccounts,
  saveCloudConfig,
  testCloudConnection,
  SUPABASE_SQL_SETUP,
} from '../utils/cloudDb';
import type { BeatNotification } from '../utils/notifications';
import {
  getEmailConfig,
  getNotificationsLog,
  saveEmailConfig,
} from '../utils/notifications';
import { useAuth } from '../context/AuthContext';
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
  const { checkCloudStatus } = useAuth();
  const [passcode, setPasscode] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'database' | 'pilots' | 'emails'>('submissions');

  // Database Tab States
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>('');
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Email Alerts States
  const [emailServiceId, setEmailServiceId] = useState<string>('');
  const [emailTemplateId, setEmailTemplateId] = useState<string>('');
  const [emailPublicKey, setEmailPublicKey] = useState<string>('');
  const [emailSavedMsg, setEmailSavedMsg] = useState<string>('');
  const [notifications, setNotifications] = useState<BeatNotification[]>([]);
  const [testEmailAddress, setTestEmailAddress] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testEmailResult, setTestEmailResult] = useState<string>('');

  // Pilots list
  const [pilotAccounts, setPilotAccounts] = useState<PilotAccount[]>([]);

  useEffect(() => {
    if (isOpen) {
      const existing = getCloudConfig();
      if (existing) {
        setSupabaseUrl(existing.supabaseUrl);
        setSupabaseAnonKey(existing.supabaseAnonKey);
      }
      setPilotAccounts(getLocalAccounts());

      const emailCfg = getEmailConfig();
      if (emailCfg) {
        setEmailServiceId(emailCfg.serviceId);
        setEmailTemplateId(emailCfg.templateId);
        setEmailPublicKey(emailCfg.publicKey);
      }
      setNotifications(getNotificationsLog());
    }
  }, [isOpen]);

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

  const handleSaveDatabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setTestResult({ ok: false, message: 'Please provide both Supabase URL and Anon Key.' });
      return;
    }

    saveCloudConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
    });

    checkCloudStatus();
    setIsTesting(true);
    const res = await testCloudConnection();
    setIsTesting(false);
    setTestResult(res);

    if (res.ok) {
      sound.playFanfare();
      onRefresh();
    } else {
      sound.playCrash();
    }
  };

  const handleDisconnectDatabase = () => {
    if (window.confirm('Disconnect cloud database and revert to local booth storage?')) {
      clearCloudConfig();
      setSupabaseUrl('');
      setSupabaseAnonKey('');
      setTestResult(null);
      checkCloudStatus();
      onRefresh();
      sound.playClick(500);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    sound.playClick(800);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveEmailConfig({
      serviceId: emailServiceId.trim(),
      templateId: emailTemplateId.trim(),
      publicKey: emailPublicKey.trim(),
    });
    setEmailSavedMsg('Email alert settings saved successfully!');
    sound.playFanfare();
    setTimeout(() => setEmailSavedMsg(''), 3000);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress.trim() || !emailServiceId || !emailTemplateId || !emailPublicKey) {
      setTestEmailResult('Please fill in EmailJS keys and a test recipient email.');
      return;
    }

    setIsSendingTest(true);
    setTestEmailResult('');

    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailServiceId.trim(),
          template_id: emailTemplateId.trim(),
          user_id: emailPublicKey.trim(),
          template_params: {
            to_email: testEmailAddress.trim(),
            to_callsign: 'TEST_PILOT',
            challenger_callsign: 'SKYLINK_CHAMPION',
            game_title: 'Flappy CanSat',
            challenger_score: '5,400',
            old_score: '4,800',
            site_url: window.location.href,
          },
        }),
      });

      if (res.ok) {
        sound.playFanfare();
        setTestEmailResult(`✅ Test beat-alert email sent to ${testEmailAddress}!`);
      } else {
        const txt = await res.text();
        setTestEmailResult(`❌ EmailJS error: ${txt}`);
      }
    } catch (err: any) {
      setTestEmailResult(`❌ Network error: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-rose-100 rounded-[32px] p-6 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100"
        >
          <X size={18} />
        </button>

        {!isAuthenticated ? (
          <div className="text-center py-6 max-w-sm mx-auto font-sans">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
              <Key size={26} />
            </div>
            <h3 className="text-2xl font-bubbly font-bold text-slate-900 mb-1">
              Organizer & Cloud Portal
            </h3>
            <p className="text-slate-500 text-xs mb-5 font-medium">
              Access prize contact lists, configure global cloud database, and manage beat-alert emails.
            </p>

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                placeholder="Enter passcode (default: cansat2026)"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white font-mono text-sm"
                autoFocus
              />
              {authError && <div className="text-rose-600 text-xs font-mono">{authError}</div>}
              <div>
                <button
                  type="submit"
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-bold rounded-2xl transition-all shadow-md shadow-rose-500/20 text-xs uppercase tracking-wider cursor-pointer"
                >
                  Unlock Portal
                </button>
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Organizer passcode: <code className="text-slate-800 font-mono font-bold">cansat2026</code>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header with Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl font-bubbly text-xs font-semibold overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'submissions'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award size={14} />
                  <span>Submissions ({entries.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('database')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'database'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Database size={14} />
                  <span>Cloud Database</span>
                </button>
                <button
                  onClick={() => setActiveTab('pilots')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'pilots'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users size={14} />
                  <span>Pilots ({pilotAccounts.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('emails')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'emails'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail size={14} />
                  <span>Beat-Alert Emails ({notifications.length})</span>
                </button>
              </div>

              {activeTab === 'submissions' && (
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-semibold rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={13} /> Export CSV
                </button>
              )}
            </div>

            {/* TAB 1: SUBMISSIONS TABLE */}
            {activeTab === 'submissions' && (
              <div className="flex flex-col flex-1 overflow-hidden my-3">
                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl bg-[#F8F9FA]">
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
                <div className="pt-3 flex items-center justify-between text-xs">
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetDefaults}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center gap-1 transition-colors cursor-pointer text-[11px] font-medium"
                    >
                      <RefreshCw size={11} /> Reset Demo Scores
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full flex items-center gap-1 transition-colors cursor-pointer text-[11px] font-medium"
                    >
                      <Trash2 size={11} /> Clear All
                    </button>
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    SKYLINK UTB Bahrain Console
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CLOUD DATABASE SETUP */}
            {activeTab === 'database' && (
              <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-4 text-xs font-sans">
                {/* Supabase Status Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 flex items-start gap-3">
                  <Globe size={20} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bubbly font-bold text-slate-900 text-sm">
                      Global Multiplayer Cloud Database (Supabase)
                    </h4>
                    <p className="text-slate-600 text-xs mt-1">
                      Connect a free Supabase PostgreSQL database so player accounts and game scores synchronize globally in real time across all attendees' phones and booth screens!
                    </p>
                  </div>
                </div>

                {/* Config Form */}
                <form onSubmit={handleSaveDatabaseConfig} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-bold font-bubbly mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={supabaseUrl}
                      onChange={e => setSupabaseUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold font-bubbly mb-1">
                      Supabase Anon (Public) Key
                    </label>
                    <input
                      type="text"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseAnonKey}
                      onChange={e => setSupabaseAnonKey(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  {testResult && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium ${
                        testResult.ok
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-700'
                      }`}
                    >
                      {testResult.ok ? '✅ ' : '❌ '} {testResult.message}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 font-bubbly">
                    <button
                      type="submit"
                      disabled={isTesting}
                      className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Database size={14} />
                      <span>{isTesting ? 'Testing Connection...' : 'Save & Test Connection'}</span>
                    </button>
                    {supabaseUrl && (
                      <button
                        type="button"
                        onClick={handleDisconnectDatabase}
                        className="px-3 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs cursor-pointer"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </form>

                {/* 3-Step Setup Instructions & SQL Copy */}
                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bubbly font-bold text-sm text-white flex items-center gap-1.5">
                      <span>⚡ 2-Minute Supabase Setup Guide</span>
                    </h5>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bubbly font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSql ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Script'}</span>
                    </button>
                  </div>

                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li>
                      Create a free account at{' '}
                      <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-rose-400 underline">
                        supabase.com
                      </a>{' '}
                      and click <strong>New Project</strong>.
                    </li>
                    <li>
                      In your Supabase project dashboard, open the <strong>SQL Editor</strong> tab on the left.
                    </li>
                    <li>
                      Click the <strong>Copy SQL Script</strong> button above, paste it into the editor, and click <strong>Run</strong>.
                    </li>
                    <li>
                      Go to <strong>Project Settings → API</strong>, copy your <strong>Project URL</strong> and <strong>anon public key</strong>, and paste them in the form above!
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB 3: REGISTERED PILOTS */}
            {activeTab === 'pilots' && (
              <div className="flex flex-col flex-1 overflow-hidden my-3">
                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl bg-[#F8F9FA]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-medium sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Callsign</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">School / Org</th>
                        <th className="py-2.5 px-3">Contact</th>
                        <th className="py-2.5 px-3">Password / PIN</th>
                        <th className="py-2.5 px-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans">
                      {pilotAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No pilot accounts registered yet.
                          </td>
                        </tr>
                      ) : (
                        pilotAccounts.map((pilot, idx) => (
                          <tr key={pilot.id || idx} className="hover:bg-white">
                            <td className="py-2.5 px-3 font-mono font-bold text-rose-600">
                              {pilot.callsign}
                            </td>
                            <td className="py-2.5 px-3 text-slate-900 font-medium">
                              {pilot.playerName}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">
                              {pilot.schoolOrOrg || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                              {pilot.contactInfo || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                                🔒 SHA-256 Hashed
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                              {new Date(pilot.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: BEAT-ALERT EMAIL NOTIFICATIONS */}
            {activeTab === 'emails' && (
              <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-4 text-xs font-sans">
                {/* Info Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 flex items-start gap-3">
                  <Zap size={20} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bubbly font-bold text-slate-900 text-sm">
                      Automatic "Score Beaten" Email Alerts (EmailJS)
                    </h4>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                      Whenever another pilot beats someone’s score in any of the 5 games, an automated email alert is immediately sent inviting them back to the launch pad to try again!
                    </p>
                  </div>
                </div>

                {/* EmailJS Setup Form */}
                <form onSubmit={handleSaveEmailConfig} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold font-bubbly mb-1">
                        Service ID
                      </label>
                      <input
                        type="text"
                        placeholder="service_xxxxxxx"
                        value={emailServiceId}
                        onChange={e => setEmailServiceId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold font-bubbly mb-1">
                        Template ID
                      </label>
                      <input
                        type="text"
                        placeholder="template_xxxxxxx"
                        value={emailTemplateId}
                        onChange={e => setEmailTemplateId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold font-bubbly mb-1">
                        Public Key
                      </label>
                      <input
                        type="text"
                        placeholder="user_xxxxxxxxxxxx"
                        value={emailPublicKey}
                        onChange={e => setEmailPublicKey(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  {emailSavedMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                      ✅ {emailSavedMsg}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                    >
                      Save Email Configuration
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Free EmailJS plan includes 200 emails/month
                    </span>
                  </div>
                </form>

                {/* Send Test Email Box */}
                <form onSubmit={handleSendTestEmail} className="bg-white p-4 rounded-2xl border border-rose-100 space-y-2">
                  <h5 className="font-bubbly font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Send size={13} className="text-rose-500" />
                    <span>Send Test Beat-Alert Email</span>
                  </h5>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your-email@example.com"
                      value={testEmailAddress}
                      onChange={e => setTestEmailAddress(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-400"
                    />
                    <button
                      type="submit"
                      disabled={isSendingTest}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bubbly font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSendingTest ? 'Sending...' : 'Dispatch Test Alert'}
                    </button>
                  </div>
                  {testEmailResult && (
                    <div className="text-[11px] font-mono mt-1 text-slate-700">
                      {testEmailResult}
                    </div>
                  )}
                </form>

                {/* Live Triggered Beat Alerts Table */}
                <div>
                  <h5 className="font-bubbly font-bold text-slate-900 text-xs mb-2">
                    Recent Beat-Alert Logs ({notifications.length})
                  </h5>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-[#F8F9FA] max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Time</th>
                          <th className="py-2 px-3">Game</th>
                          <th className="py-2 px-3">Challenger</th>
                          <th className="py-2 px-3">Overtaken Pilot</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-sans">
                        {notifications.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400">
                              No score overtakes logged yet. When a player beats another's score, it will appear here!
                            </td>
                          </tr>
                        ) : (
                          notifications.map((n, idx) => (
                            <tr key={n.id || idx} className="hover:bg-white text-[11px]">
                              <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">
                                {new Date(n.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="py-2 px-3 font-medium text-slate-800">
                                {n.gameTitle}
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-emerald-600">
                                {n.challengerCallsign} ({n.challengerScore.toLocaleString()})
                              </td>
                              <td className="py-2 px-3">
                                <span className="font-mono font-bold text-rose-600">{n.overtakenCallsign}</span>
                                {n.overtakenEmail && (
                                  <span className="text-[10px] text-slate-400 block">{n.overtakenEmail}</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-[10px]">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-medium ${
                                    n.delivered
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {n.statusMessage}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
