export interface PilotAccount {
  id: string;
  callsign: string;
  playerName: string;
  schoolOrOrg: string;
  contactInfo: string;
  pin: string;
  createdAt: number;
}

export interface CloudDbConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface CloudConnectionStatus {
  configured: boolean;
  connected: boolean;
  message?: string;
  lastChecked?: number;
}
