import type { LeaderboardEntry, PlayerProfile } from '../types';

const LEADERBOARD_KEY = 'skylink_leaderboard_v2';
const PROFILE_KEY = 'skylink_player_profile_v2';

const DEFAULT_ENTRIES: LeaderboardEntry[] = [];

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return DEFAULT_ENTRIES;
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return DEFAULT_ENTRIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ENTRIES;
  } catch {
    return DEFAULT_ENTRIES;
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): LeaderboardEntry {
  const current = getLeaderboard();
  const cleanCallsign = (entry.callsign || 'ANON').toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');

  const existingIdx = current.findIndex(e => e.callsign.toUpperCase().trim() === cleanCallsign);
  let updatedRecord: LeaderboardEntry;

  if (existingIdx >= 0) {
    const existing = current[existingIdx];
    const scoreFlappy = entry.gameId === 'flappy' ? Math.max(existing.scoreFlappy || 0, entry.score) : (existing.scoreFlappy || 0);
    const scoreDescent = entry.gameId === 'descent' ? Math.max(existing.scoreDescent || 0, entry.score) : (existing.scoreDescent || 0);
    const scoreTelemetry = entry.gameId === 'telemetry' ? Math.max(existing.scoreTelemetry || 0, entry.score) : (existing.scoreTelemetry || 0);
    const scoreLander = entry.gameId === 'lander' ? Math.max(existing.scoreLander || 0, entry.score) : (existing.scoreLander || 0);
    const scoreCollector = entry.gameId === 'collector' ? Math.max(existing.scoreCollector || 0, entry.score) : (existing.scoreCollector || 0);
    const totalScore = scoreFlappy + scoreDescent + scoreTelemetry + scoreLander + scoreCollector;

    updatedRecord = {
      ...existing,
      playerName: entry.playerName || existing.playerName,
      schoolOrOrg: entry.schoolOrOrg || existing.schoolOrOrg,
      contactInfo: entry.contactInfo || existing.contactInfo,
      score: totalScore,
      totalScore,
      scoreFlappy,
      scoreDescent,
      scoreTelemetry,
      scoreLander,
      scoreCollector,
      timestamp: Date.now(),
    };
    current[existingIdx] = updatedRecord;
  } else {
    const scoreFlappy = entry.gameId === 'flappy' ? entry.score : 0;
    const scoreDescent = entry.gameId === 'descent' ? entry.score : 0;
    const scoreTelemetry = entry.gameId === 'telemetry' ? entry.score : 0;
    const scoreLander = entry.gameId === 'lander' ? entry.score : 0;
    const scoreCollector = entry.gameId === 'collector' ? entry.score : 0;
    const totalScore = scoreFlappy + scoreDescent + scoreTelemetry + scoreLander + scoreCollector;

    updatedRecord = {
      id: 'entry-' + cleanCallsign,
      gameId: 'all',
      callsign: cleanCallsign,
      playerName: entry.playerName,
      schoolOrOrg: entry.schoolOrOrg,
      contactInfo: entry.contactInfo,
      score: totalScore,
      totalScore,
      scoreFlappy,
      scoreDescent,
      scoreTelemetry,
      scoreLander,
      scoreCollector,
      timestamp: Date.now(),
      verified: true,
    };
    current.push(updatedRecord);
  }

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(current));
  } catch {}

  return updatedRecord;
}

export function getSavedPlayerProfile(): PlayerProfile {
  if (typeof window === 'undefined') {
    return { callsign: '', playerName: '', contactInfo: '', schoolOrOrg: '' };
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { callsign: '', playerName: '', contactInfo: '', schoolOrOrg: '' };
}

export function savePlayerProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function clearAllLeaderboard(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
}

export function resetLeaderboardToDefault(): void {
  clearAllLeaderboard();
}

export function exportLeaderboardCSV(entries: LeaderboardEntry[]): string {
  const headers = ['Rank', 'Player Name', 'Callsign', 'Game', 'Score', 'School / Affiliation', 'Contact Info (Prize)', 'Date & Time'];
  const rows = entries.map((e, idx) => [
    idx + 1,
    `"${(e.playerName || '').replace(/"/g, '""')}"`,
    `"${(e.callsign || '').replace(/"/g, '""')}"`,
    e.gameId.toUpperCase(),
    e.score,
    `"${(e.schoolOrOrg || 'N/A').replace(/"/g, '""')}"`,
    `"${(e.contactInfo || 'N/A').replace(/"/g, '""')}"`,
    new Date(e.timestamp).toISOString(),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
