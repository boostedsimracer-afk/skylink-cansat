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
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    verified: true,
  };

  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch {}

  return newEntry;
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
