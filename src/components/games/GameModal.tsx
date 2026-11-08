import React, { useState } from 'react';
import type { GameId } from '../../types';
import { FlappyCanSat } from './FlappyCanSat';
import { CanSatDescent } from './CanSatDescent';
import { TelemetryOverdrive } from './TelemetryOverdrive';
import { CanSatLander } from './CanSatLander';
import { DataCatcher } from './DataCatcher';
import { ScoreSubmitModal } from './ScoreSubmitModal';

interface GameModalProps {
  gameId: GameId | null;
  onClose: () => void;
  onScoreSubmitted: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({ gameId, onClose, onScoreSubmitted }) => {
  const [completedScore, setCompletedScore] = useState<number | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);

  if (!gameId) return null;

  const handleGameOver = (finalScore: number) => {
    setCompletedScore(finalScore);
    setSubmitModalOpen(true);
  };

  const handleScoreDone = () => {
    setSubmitModalOpen(false);
    onScoreSubmitted();
    onClose();
  };

  const getGameTitle = () => {
    switch (gameId) {
      case 'flappy': return 'Flappy CanSat';
      case 'descent': return 'Can-Drop: Descent Mission';
      case 'telemetry': return 'Telemetry Jam';
      case 'lander': return 'Target Touchdown';
      case 'collector': return 'Data Catcher';
      default: return 'CanSat Arcade';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-rose-200 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {gameId === 'flappy' && (
          <FlappyCanSat onGameOver={handleGameOver} onExit={onClose} />
        )}
        {gameId === 'descent' && (
          <CanSatDescent onGameOver={handleGameOver} onExit={onClose} />
        )}
        {gameId === 'telemetry' && (
          <TelemetryOverdrive onGameOver={handleGameOver} onExit={onClose} />
        )}
        {gameId === 'lander' && (
          <CanSatLander onGameOver={handleGameOver} onExit={onClose} />
        )}
        {gameId === 'collector' && (
          <DataCatcher onGameOver={handleGameOver} onExit={onClose} />
        )}

        {completedScore !== null && (
          <ScoreSubmitModal
            isOpen={submitModalOpen}
            gameId={gameId}
            gameTitle={getGameTitle()}
            score={completedScore}
            onClose={() => setSubmitModalOpen(false)}
            onScoreSubmitted={handleScoreDone}
          />
        )}
      </div>
    </div>
  );
};
