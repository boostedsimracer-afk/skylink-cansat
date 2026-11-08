export type GameId = 'flappy' | 'descent' | 'telemetry' | 'lander' | 'collector';

export interface LeaderboardEntry {
  id: string;
  gameId: GameId;
  playerName: string;
  callsign: string;
  score: number;
  contactInfo?: string;
  schoolOrOrg?: string;
  timestamp: number;
  badge?: string;
  verified?: boolean;
}

export interface PlayerProfile {
  callsign: string;
  playerName: string;
  contactInfo: string;
  schoolOrOrg: string;
}

export interface TeamMember {
  name: string;
  role: string;
  subsystem: string;
  bio: string;
  favoriteSensor: string;
  avatarColor: string;
}
