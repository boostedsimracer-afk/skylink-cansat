import type { GameId, LeaderboardEntry } from '../types';
import { getCloudConfig, getLocalAccounts } from './cloudDb';

export interface BeatNotification {
  id: string;
  timestamp: number;
  gameId: GameId;
  gameTitle: string;
  overtakenCallsign: string;
  overtakenEmail: string;
  challengerCallsign: string;
  challengerScore: number;
  delivered: boolean;
  statusMessage: string;
}

const NOTIFICATIONS_KEY = 'skylink_beat_notifications_v1';
const EMAILJS_CONFIG_KEY = 'skylink_emailjs_config_v1';

export interface EmailServiceConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export function getEmailConfig(): EmailServiceConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(EMAILJS_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.serviceId && parsed.templateId && parsed.publicKey) {
        return parsed;
      }
    }
  } catch {}

  const envService = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID;
  const envTemplate = (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID;
  const envKey = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY;

  if (envService && envTemplate && envKey) {
    return {
      serviceId: envService.trim(),
      templateId: envTemplate.trim(),
      publicKey: envKey.trim(),
    };
  }

  // Production default credentials for SKYLINK UTB Bahrain CanSat
  return {
    serviceId: 'service_dmujblr',
    templateId: '1ja2yd9',
    publicKey: '3P9K2A8Ma7tqeYmCn',
  };
}

export function saveEmailConfig(config: EmailServiceConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(config));
}

export function getNotificationsLog(): BeatNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotificationToLog(notif: BeatNotification): void {
  const current = getNotificationsLog();
  const updated = [notif, ...current.slice(0, 99)]; // Keep latest 100
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch {}
}

const GAME_TITLES: Record<GameId, string> = {
  flappy: 'Flappy CanSat',
  descent: 'Can-Drop: Descent Mission',
  telemetry: 'Telemetry Jam',
  lander: 'Target Touchdown',
  collector: 'Data Catcher',
};

/**
 * Checks if a newly submitted score beat an existing player's ranking,
 * and if so, prepares and dispatches an alert email to them.
 */
export async function checkAndNotifyOvertakenPilots(
  newEntry: Omit<LeaderboardEntry, 'id' | 'timestamp'>,
  existingEntries: LeaderboardEntry[]
): Promise<BeatNotification | null> {
  const gameEntries = existingEntries
    .filter(e => e.gameId === newEntry.gameId && e.callsign !== newEntry.callsign)
    .sort((a, b) => b.score - a.score);

  if (gameEntries.length === 0) return null;

  // Find pilot(s) whose score this new entry just beat
  // E.g. Find the highest player that this newEntry passed
  const overtaken = gameEntries.find(e => e.score < newEntry.score);
  if (!overtaken) return null;

  // Find overtaken pilot's contact email (from entry, local accounts, or Supabase profiles)
  let email = (overtaken.contactInfo || '').trim();
  if (!email.includes('@')) {
    const allAccounts = getLocalAccounts();
    const account = allAccounts.find(a => a.callsign === overtaken.callsign);
    if (account && (account.email || account.contactInfo)?.includes('@')) {
      email = (account.email || account.contactInfo || '').trim();
    }
  }

  // If still not found, query live Supabase profiles table
  if (!email.includes('@')) {
    try {
      const config = getCloudConfig();
      if (config) {
        const res = await fetch(
          `${config.supabaseUrl}/rest/v1/profiles?callsign=eq.${encodeURIComponent(overtaken.callsign)}&select=email,contact_info&limit=1`,
          {
            headers: {
              apikey: config.supabaseAnonKey,
              Authorization: `Bearer ${config.supabaseAnonKey}`,
            },
          }
        );
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows[0]) {
            const foundEmail = (rows[0].email || rows[0].contact_info || '').trim();
            if (foundEmail.includes('@')) {
              email = foundEmail;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not query pilot email from Supabase:', err);
    }
  }

  const gameTitle = GAME_TITLES[newEntry.gameId] || newEntry.gameId;
  const emailConfig = getEmailConfig();

  const notification: BeatNotification = {
    id: 'beat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    gameId: newEntry.gameId,
    gameTitle,
    overtakenCallsign: overtaken.callsign,
    overtakenEmail: email,
    challengerCallsign: newEntry.callsign,
    challengerScore: newEntry.score,
    delivered: false,
    statusMessage: email ? 'Queued' : 'Logged (No email address on file for pilot)',
  };

  if (email && emailConfig) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailConfig.serviceId,
          template_id: emailConfig.templateId,
          user_id: emailConfig.publicKey,
          template_params: {
            to_email: email,
            email: email,
            to_callsign: overtaken.callsign,
            callsign: overtaken.callsign,
            challenger_callsign: newEntry.callsign,
            challenger: newEntry.callsign,
            game_title: gameTitle,
            game: gameTitle,
            challenger_score: newEntry.score.toLocaleString(),
            old_score: overtaken.score.toLocaleString(),
            site_url: typeof window !== 'undefined' ? window.location.href : 'https://boostedsimracer-afk.github.io/skylink-cansat/',
          },
        }),
      });

      if (response.ok) {
        notification.delivered = true;
        notification.statusMessage = `Email successfully dispatched to ${email}`;
      } else {
        const errText = await response.text();
        notification.statusMessage = `EmailJS error: ${errText}`;
      }
    } catch (err: any) {
      notification.statusMessage = `Network delivery error: ${err.message || 'Offline'}`;
    }
  } else if (email) {
    notification.statusMessage = `Ready in outbox (Configure EmailJS in Organizer Desk to deliver live emails to ${email})`;
  }

  saveNotificationToLog(notification);
  return notification;
}
