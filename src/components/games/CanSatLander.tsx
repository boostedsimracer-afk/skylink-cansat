import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { Flame, Volume2, VolumeX } from 'lucide-react';

interface CanSatLanderProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

interface LandingPad {
  x1: number;
  x2: number;
  y: number;
  multiplier: number;
  label: string;
  color: string;
}

export const CanSatLander: React.FC<CanSatLanderProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fuel, setFuel] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [vy, setVy] = useState<number>(0);
  const [altitude, setAltitude] = useState<number>(400);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(sound.enabled);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);

  const stateRef = useRef({
    x: 240,
    y: 80,
    vx: 0.8,
    vy: 0.5,
    angle: 0,
    fuel: 100,
    score: 0,
    level: 1,
    thrusting: false,
    rotatingLeft: false,
    rotatingRight: false,
    pads: [] as LandingPad[],
    terrainPoints: [] as { x: number; y: number }[],
    bonusProbes: [] as { x: number; y: number; collected: boolean }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    gameOver: false,
    landedSafely: false,
  });

  const toggleMute = () => {
    const next = sound.toggleMute();
    setSoundOn(next);
  };

  const setupLevel = (lvl: number, currentScore: number) => {
    const state = stateRef.current;
    state.x = 80 + Math.random() * 300;
    state.y = 70;
    state.vx = (Math.random() - 0.5) * 1.5;
    state.vy = 0.5;
    state.angle = 0;
    state.fuel = Math.min(100, 75 + lvl * 5);
    state.level = lvl;
    state.score = currentScore;
    state.landedSafely = false;
    state.gameOver = false;
    state.particles = [];

    const width = 480;
    const height = 550;
    const groundBase = height - 70;

    const pad1: LandingPad = {
      x1: 50,
      x2: 120,
      y: groundBase - 15,
      multiplier: 2,
      label: 'BASE 2X',
      color: '#64748B',
    };

    const pad2: LandingPad = {
      x1: 200,
      x2: 260,
      y: groundBase - 40,
      multiplier: 3,
      label: 'TARGET 3X',
      color: '#E11D48',
    };

    const pad3: LandingPad = {
      x1: 340,
      x2: 420,
      y: groundBase,
      multiplier: 1.5,
      label: 'LZ 1.5X',
      color: '#10B981',
    };

    state.pads = [pad1, pad2, pad3];

    state.terrainPoints = [
      { x: 0, y: groundBase + 10 },
      { x: pad1.x1, y: pad1.y },
      { x: pad1.x2, y: pad1.y },
      { x: 160, y: groundBase + 35 },
      { x: pad2.x1, y: pad2.y },
      { x: pad2.x2, y: pad2.y },
      { x: 300, y: groundBase + 25 },
      { x: pad3.x1, y: pad3.y },
      { x: pad3.x2, y: pad3.y },
      { x: width, y: groundBase + 15 },
    ];

    state.bonusProbes = [
      { x: 140, y: 160, collected: false },
      { x: 300, y: 220, collected: false },
      { x: 220, y: 310, collected: false },
    ];

    setFuel(Math.round(state.fuel));
    setLevel(state.level);
    setScore(state.score);
    setMessage({ text: `LEVEL ${lvl}: DESCEND TO TARGET PAD`, type: 'info' });
  };

  useEffect(() => {
    setupLevel(1, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current;
      if (['ArrowUp', 'KeyW', 'w', 'Space'].includes(e.code)) {
        state.thrusting = true;
      }
      if (['ArrowLeft', 'KeyA', 'a'].includes(e.code)) {
        state.rotatingLeft = true;
      }
      if (['ArrowRight', 'KeyD', 'd'].includes(e.code)) {
        state.rotatingRight = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = stateRef.current;
      if (['ArrowUp', 'KeyW', 'w', 'Space'].includes(e.code)) {
        state.thrusting = false;
      }
      if (['ArrowLeft', 'KeyA', 'a'].includes(e.code)) {
        state.rotatingLeft = false;
      }
      if (['ArrowRight', 'KeyD', 'd'].includes(e.code)) {
        state.rotatingRight = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const state = stateRef.current;

      if (isStarted && !state.gameOver) {
        const gravity = 1.9;
        state.vy += gravity * dt;

        const rotSpeed = 2.4;
        if (state.rotatingLeft) state.angle -= rotSpeed * dt;
        if (state.rotatingRight) state.angle += rotSpeed * dt;

        if (state.thrusting && state.fuel > 0) {
          const thrustPower = 5.2;
          const thrustX = Math.sin(state.angle) * thrustPower;
          const thrustY = -Math.cos(state.angle) * thrustPower;

          state.vx += thrustX * dt;
          state.vy += thrustY * dt;
          state.fuel = Math.max(0, state.fuel - 14 * dt);
          sound.playThrust();

          for (let i = 0; i < 3; i++) {
            const spread = (Math.random() - 0.5) * 0.4;
            state.particles.push({
              x: state.x - Math.sin(state.angle) * 16,
              y: state.y + Math.cos(state.angle) * 16,
              vx: -Math.sin(state.angle + spread) * 6 + (Math.random() - 0.5) * 1.5,
              vy: Math.cos(state.angle + spread) * 6 + (Math.random() - 0.5) * 1.5,
              life: 0.4,
              color: Math.random() < 0.5 ? '#E11D48' : '#ffffff',
            });
          }
        }

        state.vx *= 0.992;
        state.vy *= 0.998;

        state.x += state.vx * dt * 40;
        state.y += state.vy * dt * 40;

        if (state.x < 15) { state.x = 15; state.vx = Math.abs(state.vx) * 0.5; }
        if (state.x > canvas.width - 15) { state.x = canvas.width - 15; state.vx = -Math.abs(state.vx) * 0.5; }

        setFuel(Math.round(state.fuel));
        setVy(Number(state.vy.toFixed(1)));
        setAltitude(Math.max(0, Math.round(500 - state.y)));

        state.bonusProbes.forEach(probe => {
          if (!probe.collected) {
            const d = Math.hypot(state.x - probe.x, state.y - probe.y);
            if (d < 22) {
              probe.collected = true;
              state.score += 400;
              setScore(state.score);
              sound.playCollect(1.4);
              for (let p = 0; p < 8; p++) {
                state.particles.push({
                  x: probe.x,
                  y: probe.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 0.6,
                  color: '#E11D48',
                });
              }
            }
          }
        });

        const canBottomY = state.y + 14;
        const canLeftX = state.x - 10;
        const canRightX = state.x + 10;

        let touchedPad: LandingPad | null = null;
        for (const pad of state.pads) {
          if (canRightX >= pad.x1 && canLeftX <= pad.x2 && canBottomY >= pad.y) {
            touchedPad = pad;
            break;
          }
        }

        if (touchedPad) {
          const safeVy = state.vy < 2.8;
          const safeVx = Math.abs(state.vx) < 1.6;
          const safeAngle = Math.abs(state.angle) < 0.28;

          if (safeVy && safeVx && safeAngle) {
            state.landedSafely = true;
            sound.playFanfare();
            const padBonus = Math.round(1500 * touchedPad.multiplier);
            const fuelBonus = Math.round(state.fuel * 15);
            const levelPoints = padBonus + fuelBonus;
            state.score += levelPoints;
            setScore(state.score);

            setMessage({
              text: `PERFECT TOUCHDOWN ON ${touchedPad.label}! +${levelPoints} PTS`,
              type: 'success',
            });

            setTimeout(() => {
              setupLevel(state.level + 1, state.score);
            }, 2000);
          } else {
            state.gameOver = true;
            sound.playCrash();
            setMessage({
              text: `CRASH! Impact speed: ${state.vy.toFixed(1)}m/s`,
              type: 'danger',
            });

            for (let p = 0; p < 25; p++) {
              state.particles.push({
                x: state.x,
                y: state.y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 0.9,
                color: '#E11D48',
              });
            }

            setTimeout(() => {
              onGameOver(state.score);
            }, 2200);
          }
        } else if (canBottomY >= canvas.height - 70) {
          state.gameOver = true;
          sound.playCrash();
          setMessage({
            text: 'CRASHED ON RUGGED TERRAIN! Missed Pad.',
            type: 'danger',
          });

          for (let p = 0; p < 25; p++) {
            state.particles.push({
              x: state.x,
              y: state.y,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              life: 0.9,
              color: '#181C24',
            });
          }

          setTimeout(() => {
            onGameOver(state.score);
          }, 2200);
        }
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 2;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // ---------------- RENDER ----------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#181C24';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Mountains
      ctx.fillStyle = '#11151C';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(0, canvas.height - 180);
      ctx.lineTo(120, canvas.height - 230);
      ctx.lineTo(260, canvas.height - 190);
      ctx.lineTo(380, canvas.height - 250);
      ctx.lineTo(canvas.width, canvas.height - 170);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fill();

      // Terrain
      ctx.fillStyle = '#23272e';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      state.terrainPoints.forEach((pt, idx) => {
        if (idx === 0) ctx.lineTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fill();
      ctx.stroke();

      // Landing Pads
      state.pads.forEach(pad => {
        ctx.fillStyle = '#11151C';
        ctx.fillRect(pad.x1, pad.y, pad.x2 - pad.x1, 14);

        ctx.strokeStyle = pad.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pad.x1, pad.y);
        ctx.lineTo(pad.x2, pad.y);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pad.label, (pad.x1 + pad.x2) / 2, pad.y + 11);
      });

      // Bonus Probes
      state.bonusProbes.forEach(probe => {
        if (!probe.collected) {
          ctx.save();
          ctx.translate(probe.x, probe.y);
          ctx.strokeStyle = '#E11D48';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 10 + Math.sin(now * 0.01) * 2, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#E11D48';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('DATA', 0, 2);
          ctx.restore();
        }
      });

      // Draw CanSat Lander Craft with SKYLINK Red details
      if (!state.gameOver || state.landedSafely) {
        ctx.save();
        ctx.translate(state.x, state.y);
        ctx.rotate(state.angle);

        const cw = 18;
        const ch = 28;

        const grad = ctx.createLinearGradient(-cw / 2, 0, cw / 2, 0);
        grad.addColorStop(0, '#64748b');
        grad.addColorStop(0.3, '#f1f5f9');
        grad.addColorStop(0.7, '#cbd5e1');
        grad.addColorStop(1, '#475569');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 3);
        ctx.fill();
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Landing gear legs
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-cw / 2, ch / 2 - 4);
        ctx.lineTo(-cw / 2 - 6, ch / 2 + 6);
        ctx.lineTo(-cw / 2 - 9, ch / 2 + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cw / 2, ch / 2 - 4);
        ctx.lineTo(cw / 2 + 6, ch / 2 + 6);
        ctx.lineTo(cw / 2 + 9, ch / 2 + 6);
        ctx.stroke();

        // Nozzle
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-4, ch / 2 - 1, 8, 4);

        // Antenna
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -ch / 2);
        ctx.lineTo(0, -ch / 2 - 12);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isStarted, onGameOver]);

  const handleStart = () => {
    sound.playClick(950);
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
          <div className="flex items-center gap-1.5 text-slate-800 font-bold font-mono">
            <span>LVL {level}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-700">
            <span className="text-slate-400 text-[11px] font-mono">ALT:</span>
            <span className="font-bold font-mono text-slate-900">{altitude}m</span>
          </div>
          <div className="flex items-center gap-1 text-slate-700">
            <span className="text-slate-400 text-[11px] font-mono">V-SPD:</span>
            <span className={`font-bold font-mono ${vy > 2.8 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
              {vy} m/s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame size={14} className={fuel < 25 ? 'text-rose-600 animate-bounce' : 'text-slate-600'} />
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-100 ${
                  fuel > 40 ? 'bg-slate-800' : 'bg-rose-600'
                }`}
                style={{ width: `${fuel}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{fuel}%</span>
          </div>

          <div className="flex items-center gap-1 text-rose-600 font-mono font-bold text-sm">
            <span>{score} pts</span>
          </div>

          <button onClick={toggleMute} className="text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer">
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Canvas Box */}
      <div className="relative w-full aspect-[4/5] max-h-[560px] bg-[#181C24] border-x border-b border-slate-200 rounded-b-2xl overflow-hidden shadow-xl">
        <canvas ref={canvasRef} width={480} height={550} className="w-full h-full block" />

        {/* Start Screen */}
        {!isStarted && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 text-rose-600">
              <Flame size={28} />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 mb-1">
              SKYLINK MISSION 03
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              CanSat Target Lander
            </h2>
            <p className="text-slate-500 text-xs max-w-sm mb-6 leading-relaxed">
              Terminal recovery phase! Fire cold-gas thrusters to control descent and attitude. Touch down softly on target pads with vertical velocity below 2.8 m/s!
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6 text-xs text-left">
              <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-3">
                <span className="text-slate-900 font-bold block mb-0.5">MAIN THRUSTER</span>
                <span className="text-slate-500 font-mono text-[11px]">Up Arrow / W / Space</span>
              </div>
              <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-3">
                <span className="text-rose-600 font-bold block mb-0.5">TILT ATTITUDE</span>
                <span className="text-slate-500 font-mono text-[11px]">A / D or Left / Right</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3.5 bg-[#181C24] hover:bg-black text-white font-semibold rounded-full shadow-md active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              🎯 Start Precision Landing
            </button>
          </div>
        )}

        {/* In-game Message Notice */}
        {message && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-mono font-bold border backdrop-blur-md transition-all ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : message.type === 'danger'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="w-full flex items-center justify-between gap-3 mt-3 sm:hidden">
        <button
          onTouchStart={() => { stateRef.current.rotatingLeft = true; }}
          onTouchEnd={() => { stateRef.current.rotatingLeft = false; }}
          onMouseDown={() => { stateRef.current.rotatingLeft = true; }}
          onMouseUp={() => { stateRef.current.rotatingLeft = false; }}
          className="flex-1 py-3.5 bg-white border border-slate-200 active:bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center font-bold shadow-sm"
        >
          ↶ Tilt Left
        </button>

        <button
          onTouchStart={() => { stateRef.current.thrusting = true; }}
          onTouchEnd={() => { stateRef.current.thrusting = false; }}
          onMouseDown={() => { stateRef.current.thrusting = true; }}
          onMouseUp={() => { stateRef.current.thrusting = false; }}
          className="flex-2 py-3.5 bg-rose-50 border border-rose-200 active:bg-rose-100 text-rose-700 font-mono text-xs rounded-2xl flex items-center justify-center gap-1.5 font-bold shadow-sm"
        >
          <Flame size={16} /> Thrusters ({fuel}%)
        </button>

        <button
          onTouchStart={() => { stateRef.current.rotatingRight = true; }}
          onTouchEnd={() => { stateRef.current.rotatingRight = false; }}
          onMouseDown={() => { stateRef.current.rotatingRight = true; }}
          onMouseUp={() => { stateRef.current.rotatingRight = false; }}
          className="flex-1 py-3.5 bg-white border border-slate-200 active:bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center font-bold shadow-sm"
        >
          Tilt Right ↷
        </button>
      </div>

      <div className="w-full text-center mt-3 text-slate-400 text-[11px]">
        💡 Real CanSat Physics: Precision touchdown protects delicate internal sensors (optical lenses, air spectrometers). Safe recovery enables immediate post-flight data verification!
      </div>
    </div>
  );
};
