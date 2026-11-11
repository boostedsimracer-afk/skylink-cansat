import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PilotAccount } from '../types/auth';
import {
  getActivePilot,
  setActivePilot,
  loginPilot,
  registerPilot,
  isCloudConfigured,
} from '../utils/cloudDb';
import { sound } from '../utils/audio';

interface AuthContextType {
  currentPilot: PilotAccount | null;
  isLoggedIn: boolean;
  isCloudConnected: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (callsign: string, pin: string) => Promise<{ ok: boolean; message: string }>;
  register: (data: {
    callsign: string;
    playerName: string;
    schoolOrOrg?: string;
    email?: string;
    phone?: string;
    contactInfo?: string;
    pin: string;
  }) => Promise<{ ok: boolean; message: string }>;
  logout: () => void;
  checkCloudStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPilot, setCurrentPilotState] = useState<PilotAccount | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  useEffect(() => {
    // Load initial active pilot
    const active = getActivePilot();
    setCurrentPilotState(active);
    setIsCloudConnected(isCloudConfigured());
  }, []);

  const checkCloudStatus = () => {
    setIsCloudConnected(isCloudConfigured());
  };

  const openAuthModal = () => {
    sound.playClick(750);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (callsign: string, pin: string) => {
    const res = await loginPilot(callsign, pin);
    if (res.ok && res.pilot) {
      setCurrentPilotState(res.pilot);
      sound.playFanfare();
      setAuthModalOpen(false);
    }
    return { ok: res.ok, message: res.message };
  };

  const register = async (data: {
    callsign: string;
    playerName: string;
    schoolOrOrg?: string;
    email?: string;
    phone?: string;
    contactInfo?: string;
    pin: string;
  }) => {
    const res = await registerPilot(data);
    if (res.ok && res.pilot) {
      setCurrentPilotState(res.pilot);
      sound.playFanfare();
      setAuthModalOpen(false);
    }
    return { ok: res.ok, message: res.message };
  };

  const logout = () => {
    sound.playClick(500);
    setActivePilot(null);
    setCurrentPilotState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentPilot,
        isLoggedIn: !!currentPilot,
        isCloudConnected,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        checkCloudStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
