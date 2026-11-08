import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { Radio, Volume2, VolumeX, Zap } from 'lucide-react';

interface TelemetryOverdriveProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

interface Note {
  id: number;
  lane: number;
  y: number;
  label: string;
  color: string;
  hit: boolean;
}

const LANES = [
  { key: 'D', altKey: '1', name: '433 MHz', sub: 'BARO/ALT', color: '#E11D48', glow: 'rgba(225, 29, 72, 0.3)' },
  { key: 'F', altKey: '2', name: '144 MHz', sub: 'TEMP/VOLT', color: '#0284c7', glow: 'rgba(2, 132, 199, 0.3)' },
  { key: 'J', altKey: '3', name: '868 MHz', sub: 'GPS/LORA', color: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
  { key: 'K', altKey: '4', name: '2.4 GHz', sub: 'PAYLOAD', color: '#d97706', glow: 'rgba(217, 119, 6, 0.3)' },
];

export const TelemetryOverdrive: React.FC<TelemetryOverdriveProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [accuracyNotice, setAccuracyNotice] = useState<{ text: string; color: string } | null>(null);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(sound.enabled);
  const [activeLaneIndex, setActiveLaneIndex] = useState<number | null>(null);

  const stateRef = useRef({
    notes: [] as Note[],
    score: 0,
    combo: 0,
    multiplier: 1,
    timeLeft: 45,
    gameOver: false,
    speed: 320,
    nextNoteId: 1,
    lanePushed: [false, false, false, false],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
  });

  const toggleMute = () => {
    const next = sound.toggleMute();
    setSoundOn(next);
  };

  const triggerHit = (lane: number) => {
    const state = stateRef.current;
    if (state.gameOver || !isStarted) return;

    sound.playClick(300 + lane * 150, 0.03);
    state.lanePushed[lane] = true;
    setActiveLaneIndex(lane);
    setTimeout(() => {
      state.lanePushed[lane] = false;
      setActiveLaneIndex(null);
    }, 120);

    const hitLineY = 480;
    const tolerance = 65;

    let closestNote: Note | null = null;
    let minDist = Infinity;

    for (const note of state.notes) {
      if (note.lane === lane && !note.hit) {
        const dist = Math.abs(note.y - hitLineY);
        if (dist < minDist && dist < tolerance) {
          minDist = dist;
          closestNote = note;
        }
      }
    }

    if (closestNote) {
      closestNote.hit = true;
      const isPerfect = minDist < 24;
      const accuracyText = isPerfect ? 'PERFECT LOCK!' : 'PACKET DECODED';
      const accuracyColor = isPerfect ? '#E11D48' : '#10b981';
      const basePoints = isPerfect ? 200 : 100;

      sound.playRhythmHit(isPerfect ? 'perfect' : 'good');

      state.combo += 1;
      state.multiplier = Math.min(4, 1 + Math.floor(state.combo / 8));
      state.score += basePoints * state.multiplier;

      setScore(state.score);
      setCombo(state.combo);
      setMultiplier(state.multiplier);
      setAccuracyNotice({ text: accuracyText, color: accuracyColor });

      const laneWidth = 480 / 4;
      const hitX = lane * laneWidth + laneWidth / 2;
      for (let i = 0; i < 12; i++) {
        state.particles.push({
          x: hitX,
          y: hitLineY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: LANES[lane].color,
          life: 0.6,
        });
      }
    } else {
      sound.playRhythmHit('miss');
      state.combo = 0;
      state.multiplier = 1;
      setCombo(0);
      setMultiplier(1);
      setAccuracyNotice({ text: 'SIGNAL LOST', color: '#ef4444' });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'KeyD' || e.key === '1') triggerHit(0);
      if (e.code === 'KeyF' || e.key === '2') triggerHit(1);
      if (e.code === 'KeyJ' || e.key === '3') triggerHit(2);
      if (e.code === 'KeyK' || e.key === '4') triggerHit(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let noteTimer = 0;
    const hitLineY = 480;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const state = stateRef.current;

      if (isStarted && !state.gameOver) {
        state.timeLeft -= dt;
        setTimeLeft(Math.max(0, Math.ceil(state.timeLeft)));

        if (state.timeLeft <= 0) {
          state.gameOver = true;
          sound.playFanfare();
          setTimeout(() => {
            onGameOver(state.score);
          }, 1500);
        }

        noteTimer += dt;
        const interval = Math.max(0.42, 0.9 - (45 - state.timeLeft) * 0.008);
        if (noteTimer > interval) {
          noteTimer = 0;
          const lane = Math.floor(Math.random() * 4);
          state.notes.push({
            id: state.nextNoteId++,
            lane,
            y: 0,
            label: LANES[lane].sub,
            color: LANES[lane].color,
            hit: false,
          });
        }

        for (let i = state.notes.length - 1; i >= 0; i--) {
          const note = state.notes[i];
          note.y += state.speed * dt;

          if (!note.hit && note.y > hitLineY + 60) {
            state.combo = 0;
            state.multiplier = 1;
            setCombo(0);
            setMultiplier(1);
            setAccuracyNotice({ text: 'DROPPED PACKET', color: '#f87171' });
            state.notes.splice(i, 1);
            continue;
          }

          if (note.y > canvas.height + 40) {
            state.notes.splice(i, 1);
          }
        }
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 2.2;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // ---------------- RENDER ----------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#181C24';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radar scanline
      const scanY = (now * 0.15) % canvas.height;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, canvas.width, 30);

      // Draw 4 Lanes
      const laneWidth = canvas.width / 4;
      for (let i = 0; i < 4; i++) {
        const laneX = i * laneWidth;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(laneX, 0, laneWidth, canvas.height);

        if (state.lanePushed[i]) {
          const glowGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          glowGrad.addColorStop(0, 'transparent');
          glowGrad.addColorStop(1, LANES[i].glow);
          ctx.fillStyle = glowGrad;
          ctx.fillRect(laneX, 0, laneWidth, canvas.height);
        }

        // Header Tag
        ctx.fillStyle = '#23272e';
        ctx.fillRect(laneX + 2, 4, laneWidth - 4, 34);
        ctx.fillStyle = LANES[i].color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(LANES[i].name, laneX + laneWidth / 2, 20);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText(`[${LANES[i].key}]`, laneX + laneWidth / 2, 32);
      }

      // Hit Line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, hitLineY);
      ctx.lineTo(canvas.width, hitLineY);
      ctx.stroke();

      // Antenna target pads in each lane
      for (let i = 0; i < 4; i++) {
        const cx = i * laneWidth + laneWidth / 2;
        ctx.strokeStyle = state.lanePushed[i] ? '#ffffff' : LANES[i].color;
        ctx.lineWidth = state.lanePushed[i] ? 3 : 2;
        ctx.beginPath();
        ctx.arc(cx, hitLineY, 20, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#11151C';
        ctx.beginPath();
        ctx.arc(cx, hitLineY, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(LANES[i].key, cx, hitLineY);
      }

      // Draw Notes
      state.notes.forEach(note => {
        if (note.hit) return;
        const cx = note.lane * laneWidth + laneWidth / 2;
        const cy = note.y;

        ctx.save();
        ctx.translate(cx, cy);

        ctx.fillStyle = note.color;
        ctx.beginPath();
        ctx.roundRect(-22, -13, 44, 26, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(note.label, 0, 0);

        ctx.restore();
      });

      // Draw Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isStarted, onGameOver]);

  const handleStart = () => {
    sound.playClick(900);
    setIsStarted(true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none">
      {/* Top HUD (Clean Muted Style) */}
      <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-t-2xl px-5 py-3 text-xs font-sans shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
            ← Exit
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <Radio size={14} className="text-rose-600 animate-pulse" />
            <span className="text-slate-400 text-[11px] font-mono">PASS:</span>
            <span className="font-bold font-mono text-slate-900">{timeLeft}s</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-slate-700 font-mono">
            <span className="text-slate-400 text-[11px]">COMBO:</span>
            <span className="font-bold text-rose-600">{combo}x</span>
          </div>
          {multiplier > 1 && (
            <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200 text-[10px] font-bold">
              <Zap size={11} /> {multiplier}X BOOST
            </div>
          )}
          <div className="flex items-center gap-1 text-slate-900 font-mono font-bold text-sm">
            <span>{score} pts</span>
          </div>
          <button onClick={toggleMute} className="text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer">
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Canvas Box */}
      <div className="relative w-full aspect-[4/5] max-h-[560px] bg-[#181C24] border-x border-b border-slate-200 rounded-b-2xl overflow-hidden shadow-xl">
        <canvas ref={canvasRef} width={480} height={600} className="w-full h-full block" />

        {/* Start Overlay */}
        {!isStarted && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 text-slate-800">
              <Radio size={28} />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 mb-1">
              SKYLINK MISSION 02
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Telemetry Overdrive
            </h2>
            <p className="text-slate-500 text-xs max-w-sm mb-6 leading-relaxed">
              Ground Station antenna pass active! Align keystrokes across 4 frequency channels to catch incoming packets before the line-of-sight window ends.
            </p>

            <div className="grid grid-cols-4 gap-2 w-full max-w-xs mb-6 text-center font-mono">
              {LANES.map(lane => (
                <div key={lane.key} className="bg-[#F8F9FA] border border-slate-200 p-2 rounded-xl">
                  <div className="font-bold text-sm mb-0.5" style={{ color: lane.color }}>
                    {lane.key}
                  </div>
                  <div className="text-[9px] text-slate-400">{lane.sub}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3.5 bg-[#181C24] hover:bg-black text-white font-semibold rounded-full shadow-md active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              📡 Lock Ground Antenna
            </button>
          </div>
        )}

        {/* Accuracy Floater */}
        {accuracyNotice && (
          <div
            key={accuracyNotice.text + Date.now()}
            className="absolute top-24 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full font-mono text-xs font-bold pointer-events-none bg-white border shadow-md animate-ping"
            style={{ color: accuracyNotice.color }}
          >
            {accuracyNotice.text}
          </div>
        )}

        {/* Game Over Screen */}
        {stateRef.current.gameOver && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              LINE-OF-SIGHT PASS COMPLETE!
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Ground Station Final Score: <span className="font-bold text-rose-600 text-lg font-mono">{score}</span>
            </p>
            <div className="inline-block bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-slate-600 text-xs font-mono">
              Syncing Downlink Packets to Leaderboard...
            </div>
          </div>
        )}
      </div>

      {/* Tactile On-Screen Pads for Touch / Mobile */}
      <div className="w-full grid grid-cols-4 gap-2 mt-3 sm:hidden">
        {LANES.map((lane, idx) => (
          <button
            key={lane.key}
            onTouchStart={e => {
              e.preventDefault();
              triggerHit(idx);
            }}
            onMouseDown={() => triggerHit(idx)}
            className={`py-3.5 rounded-2xl border font-bold flex flex-col items-center justify-center transition-all shadow-sm ${
              activeLaneIndex === idx
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <span className="text-base font-mono" style={{ color: activeLaneIndex === idx ? '#fff' : lane.color }}>
              {lane.key}
            </span>
            <span className="text-[9px] text-slate-400">{lane.name}</span>
          </button>
        ))}
      </div>

      <div className="w-full text-center mt-3 text-slate-400 text-[11px]">
        💡 Real CanSat Physics: Telemetry is transmitted over 433MHz/868MHz LoRa radio protocols. Antenna alignment and baud rate sync ensure zero packet loss during short line-of-sight passes!
      </div>
    </div>
  );
};
