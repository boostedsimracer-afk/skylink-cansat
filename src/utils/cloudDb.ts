import type { CloudDbConfig, PilotAccount } from '../types/auth';
import type { LeaderboardEntry } from '../types';
import { getLeaderboard, saveLeaderboardEntry } from './storage';
import { hashPin, verifyPin } from './crypto';
import { checkAndNotifyOvertakenPilots } from './notifications';

const CONFIG_KEY = 'skylink_supabase_config_v1';
const ACCOUNTS_KEY = 'skylink_pilot_accounts_v1';
const ACTIVE_PILOT_KEY = 'skylink_active_pilot_v1';

export const SUPABASE_SQL_SETUP = `-- ========================================================
-- SKYLINK CANSAT 2026: SUPABASE DATABASE INITIALIZATION
-- Paste this script into your Supabase SQL Editor and click RUN.
-- ========================================================

-- 1. Create Leaderboard Table (Public rankings)
create table if not exists public.leaderboard (
  id uuid default gen_random_uuid() primary key,
  game_id text not null,
  player_name text not null,
  callsign text not null,
  score integer not null,
  school_or_org text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Pilot Profiles Table (Private accounts with contact info & hashed passwords)
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  callsign text unique not null,
  player_name text not null,
  school_or_org text,
  email text,
  phone text,
  contact_info text,
  pin text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.leaderboard enable row level security;
alter table public.profiles enable row level security;

-- 4. Set Policies for Public Outreach Website
create policy "Allow anyone to read leaderboard" on public.leaderboard for select using (true);
create policy "Allow anyone to insert leaderboard" on public.leaderboard for insert with check (true);

create policy "Allow anyone to read profiles" on public.profiles for select using (true);
create policy "Allow anyone to insert profiles" on public.profiles for insert with check (true);
create policy "Allow anyone to update profiles" on public.profiles for update using (true);

-- 5. Enable Real-Time Broadcasts
alter publication supabase_realtime add table public.leaderboard;
`;

export function getCloudConfig(): CloudDbConfig | null {
  if (typeof window === 'undefined') return null;

  // 1. Check UI-saved configuration
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return parsed;
      }
    }
  } catch {}

  // 2. Check Vite environment variables
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return {
      supabaseUrl: envUrl.trim(),
      supabaseAnonKey: envKey.trim(),
    };
  }

  // 3. Production default for SKYLINK UTB Bahrain CanSat 2026
  return {
    supabaseUrl: 'https://qvsovbjvuqpfqexxgvqt.supabase.co',
    supabaseAnonKey: 'sb_publishable_JaO_rPdO-bi-O_S3S89wyg_5yc6p1bR',
  };
}

export function saveCloudConfig(config: CloudDbConfig): void {
  if (typeof window === 'undefined') return;
  // Clean url
  const cleanUrl = config.supabaseUrl.trim().replace(/\/+$/, '');
  const cleanKey = config.supabaseAnonKey.trim();
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ supabaseUrl: cleanUrl, supabaseAnonKey: cleanKey }));
}

export function clearCloudConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONFIG_KEY);
}

export function isCloudConfigured(): boolean {
  return !!getCloudConfig();
}

export async function testCloudConnection(): Promise<{ ok: boolean; message: string }> {
  const config = getCloudConfig();
  if (!config) {
    return { ok: false, message: 'No Supabase credentials configured yet.' };
  }

  try {
    const res = await fetch(`${config.supabaseUrl}/rest/v1/leaderboard?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
      },
    });

    if (res.ok) {
      return { ok: true, message: 'Connected to Supabase successfully! Tables are ready.' };
    }

    if (res.status === 404 || res.status === 400) {
      return {
        ok: false,
        message: `Connected to Supabase, but the "leaderboard" table is missing. Run the SQL setup script in your Supabase SQL editor.`,
      };
    }

    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: 'Invalid Supabase Anon Key. Please check the API key.' };
    }

    return { ok: false, message: `Supabase returned status code ${res.status}.` };
  } catch (err: any) {
    return { ok: false, message: `Connection failed: ${err.message || 'Network error'}` };
  }
}

// Global Leaderboard Fetch
export async function fetchGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  const localEntries = getLeaderboard();
  const config = getCloudConfig();

  if (!config) {
    return localEntries;
  }

  try {
    const res = await fetch(`${config.supabaseUrl}/rest/v1/leaderboard?select=*&order=score.desc&limit=200`, {
      method: 'GET',
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
      },
    });

    if (!res.ok) {
      console.warn('Supabase fetch failed, falling back to local entries');
      return localEntries;
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) return localEntries;

    const cloudEntries: LeaderboardEntry[] = rows.map(r => ({
      id: r.id || `cloud-${r.created_at}`,
      gameId: r.game_id,
      playerName: r.player_name,
      callsign: r.callsign,
      score: Number(r.score) || 0,
      schoolOrOrg: r.school_or_org || '',
      contactInfo: r.contact_info || '',
      timestamp: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
      verified: r.verified !== false,
    }));

    return cloudEntries;
  } catch (err) {
    console.warn('Network error fetching global leaderboard, using local storage:', err);
    return localEntries;
  }
}

// Global Score Save
export async function saveGlobalScore(
  entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>
): Promise<LeaderboardEntry> {
  const existingEntries = getLeaderboard();

  // Check if this new score beat any other pilot and trigger email notification
  try {
    checkAndNotifyOvertakenPilots(entry, existingEntries);
  } catch (notifErr) {
    console.warn('Notification check error:', notifErr);
  }

  // Always save locally first so gameplay is never blocked by network latency
  const localEntry = saveLeaderboardEntry(entry);

  const config = getCloudConfig();
  if (!config) return localEntry;

  try {
    const payload = {
      game_id: entry.gameId,
      player_name: entry.playerName,
      callsign: entry.callsign.toUpperCase().trim(),
      score: entry.score,
      school_or_org: entry.schoolOrOrg || null,
      contact_info: entry.contactInfo || null,
      verified: true,
    };

    const res = await fetch(`${config.supabaseUrl}/rest/v1/leaderboard`, {
      method: 'POST',
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        return {
          id: data[0].id,
          gameId: data[0].game_id,
          playerName: data[0].player_name,
          callsign: data[0].callsign,
          score: data[0].score,
          schoolOrOrg: data[0].school_or_org,
          contactInfo: data[0].contact_info,
          timestamp: new Date(data[0].created_at).getTime(),
          verified: data[0].verified,
        };
      }
    }
  } catch (err) {
    console.warn('Could not sync score to cloud DB:', err);
  }

  return localEntry;
}

// Pilot Accounts Management
export function getLocalAccounts(): PilotAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalAccount(account: PilotAccount): void {
  const current = getLocalAccounts();
  const filtered = current.filter(a => a.callsign !== account.callsign);
  filtered.push(account);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(filtered));
}

export function getActivePilot(): PilotAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_PILOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActivePilot(pilot: PilotAccount | null): void {
  if (typeof window === 'undefined') return;
  if (!pilot) {
    localStorage.removeItem(ACTIVE_PILOT_KEY);
  } else {
    localStorage.setItem(ACTIVE_PILOT_KEY, JSON.stringify(pilot));
  }
}

export async function registerPilot(data: {
  callsign: string;
  playerName: string;
  schoolOrOrg?: string;
  email?: string;
  phone?: string;
  contactInfo?: string;
  pin: string;
}): Promise<{ ok: boolean; message: string; pilot?: PilotAccount }> {
  const cleanCallsign = data.callsign.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
  if (!cleanCallsign) {
    return { ok: false, message: 'Please enter a valid Callsign (letters, numbers, dash/underscore).' };
  }
  if (!data.playerName.trim()) {
    return { ok: false, message: 'Please enter your Player Name.' };
  }
  if (!data.pin || data.pin.length < 3) {
    return { ok: false, message: 'Please enter a PIN or password with at least 3 digits/characters.' };
  }

  const hashedPin = await hashPin(data.pin, cleanCallsign);
  const resolvedEmail = (data.email || '').trim();
  const resolvedPhone = (data.phone || '').trim();
  const resolvedContact = (data.contactInfo || `${resolvedEmail} ${resolvedPhone}`).trim();

  const newPilot: PilotAccount = {
    id: 'pilot-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    callsign: cleanCallsign,
    playerName: data.playerName.trim(),
    schoolOrOrg: (data.schoolOrOrg || '').trim(),
    email: resolvedEmail,
    phone: resolvedPhone,
    contactInfo: resolvedContact,
    pin: hashedPin,
    createdAt: Date.now(),
  };

  const config = getCloudConfig();
  if (config) {
    try {
      // 1. Check if callsign already exists in Supabase
      const checkRes = await fetch(
        `${config.supabaseUrl}/rest/v1/profiles?callsign=eq.${encodeURIComponent(cleanCallsign)}&select=callsign`,
        {
          headers: {
            apikey: config.supabaseAnonKey,
            Authorization: `Bearer ${config.supabaseAnonKey}`,
          },
        }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (Array.isArray(existing) && existing.length > 0) {
          return { ok: false, message: `Callsign "${cleanCallsign}" is already claimed! Please choose another or Sign In.` };
        }
      }

      // 2. Insert into profiles table with cryptographic hash & dedicated email/phone
      const insertRes = await fetch(`${config.supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${config.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          callsign: newPilot.callsign,
          player_name: newPilot.playerName,
          school_or_org: newPilot.schoolOrOrg,
          email: resolvedEmail || null,
          phone: resolvedPhone || null,
          contact_info: resolvedContact || null,
          pin: hashedPin,
        }),
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        console.warn('Supabase profile creation error:', errText);
      }
    } catch (err: any) {
      console.warn('Network error registering profile on Supabase:', err);
    }
  }

  // Save locally and set active
  saveLocalAccount(newPilot);
  setActivePilot(newPilot);

  return { ok: true, message: `Pilot account "${cleanCallsign}" created successfully!`, pilot: newPilot };
}

export async function loginPilot(
  callsign: string,
  pin: string
): Promise<{ ok: boolean; message: string; pilot?: PilotAccount }> {
  const cleanCallsign = callsign.toUpperCase().trim();
  const cleanPin = pin.trim();

  // 1. Check Cloud Supabase first if available
  const config = getCloudConfig();
  if (config) {
    try {
      const res = await fetch(
        `${config.supabaseUrl}/rest/v1/profiles?callsign=eq.${encodeURIComponent(cleanCallsign)}&limit=1`,
        {
          headers: {
            apikey: config.supabaseAnonKey,
            Authorization: `Bearer ${config.supabaseAnonKey}`,
          },
        }
      );

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const profile = rows[0];
          const isValid = await verifyPin(cleanPin, profile.pin, cleanCallsign);
          if (isValid) {
            const pilot: PilotAccount = {
              id: profile.id,
              callsign: profile.callsign,
              playerName: profile.player_name,
              schoolOrOrg: profile.school_or_org || '',
              email: profile.email || '',
              phone: profile.phone || '',
              contactInfo: profile.contact_info || '',
              pin: profile.pin,
              createdAt: profile.created_at ? new Date(profile.created_at).getTime() : Date.now(),
            };
            saveLocalAccount(pilot);
            setActivePilot(pilot);
            return { ok: true, message: `Welcome back, Pilot ${cleanCallsign}!`, pilot };
          } else {
            return { ok: false, message: 'Incorrect PIN/Password for this callsign.' };
          }
        }
      }
    } catch (err) {
      console.warn('Cloud login check failed, falling back to local accounts:', err);
    }
  }

  // 2. Check Local Accounts
  const localAccounts = getLocalAccounts();
  const found = localAccounts.find(a => a.callsign === cleanCallsign);
  if (found) {
    const isValid = await verifyPin(cleanPin, found.pin, cleanCallsign);
    if (isValid) {
      setActivePilot(found);
      return { ok: true, message: `Welcome back, Pilot ${cleanCallsign}!`, pilot: found };
    } else {
      return { ok: false, message: 'Incorrect PIN/Password for this callsign.' };
    }
  }

  return { ok: false, message: `Callsign "${cleanCallsign}" not found. Create a new account to join!` };
}
