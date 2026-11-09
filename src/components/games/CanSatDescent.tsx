import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { AlertTriangle, ArrowLeft, ArrowRight, Shield, Volume2, VolumeX, Wind } from 'lucide-react';

interface CanSatDescentProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

interface Collectible {
  x: number;
  y: number;
  type: 'pressure' | 'temp' | 'gps' | 'radiation';
  label: string;
  points: number;
  color: string;
  radius: number;
  collected?: boolean;
}

interface Hazard {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cloud' | 'drone' | 'shear';
  vx: number;
}

export const CanSatDescent: React.FC<CanSatDescentProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [altitude, setAltitude] = useState<number>(1000);
  const [score, setScore] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(11.2);
  const [parachuting, setParachuting] = useState<boolean>(false);
  const [packetsCollected, setPacketsCollected] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(sound.enabled);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const stateRef = useRef({
    altitude: 1000,
    score: 0,
    canX: 200,
    canY: 120,
    canVx: 0,
    descentRate: 11.5,
    chuteActive: false,
    wind: 0,
    collectibles: [] as Collectible[],
    hazards: [] as Hazard[],
    keys: { left: false, right: false, space: false },
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    gameOver: false,
    touchdownSuccess: false,
  });

  const toggleMute = () => {
    const next = sound.toggleMute();
    setSoundOn(next);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let spawnTimer = 0;
    let hazardTimer = 0;

    const state = stateRef.current;
    state.canX = canvas.width / 2;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a'].includes(e.code) || ['ArrowLeft', 'a', 'A'].includes(e.key)) {
        e.preventDefault();
        state.keys.left = true;
      }
      if (['ArrowRight', 'KeyD', 'd'].includes(e.code) || ['ArrowRight', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        state.keys.right = true;
      }
      if (['Space', ' ', 'ArrowDown', 'KeyS', 's'].includes(e.code) || [' ', 'ArrowDown', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        if (!state.keys.space) sound.playParachute();
        state.keys.space = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a'].includes(e.code) || ['ArrowLeft', 'a', 'A'].includes(e.key)) {
        e.preventDefault();
        state.keys.left = false;
      }
      if (['ArrowRight', 'KeyD', 'd'].includes(e.code) || ['ArrowRight', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        state.keys.right = false;
      }
      if (['Space', ' ', 'ArrowDown', 'KeyS', 's'].includes(e.code) || [' ', 'ArrowDown', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        state.keys.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    // Initial item spawns
    for (let i = 0; i < 5; i++) {
      state.collectibles.push({
        x: 40 + Math.random() * (canvas.width - 80),
        y: 200 + i * 90,
        type: ['pressure', 'temp', 'gps', 'radiation'][Math.floor(Math.random() * 4)] as Collectible['type'],
        label: ['BARO', 'TEMP', 'GPS', 'COSMIC'][Math.floor(Math.random() * 4)],
        points: 250,
        color: '#E11D48',
        radius: 12,
      });
    }

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!state.gameOver && isStarted) {
        state.wind = Math.sin(now * 0.001) * 3.5;

        if (state.keys.left) state.canVx -= 24 * dt;
        if (state.keys.right) state.canVx += 24 * dt;
        state.canVx *= 0.94;
        state.canX += (state.canVx + state.wind * 0.4);

        if (state.canX < 24) { state.canX = 24; state.canVx = 0; }
        if (state.canX > canvas.width - 24) { state.canX = canvas.width - 24; state.canVx = 0; }

        state.chuteActive = state.keys.space;
        const targetRate = state.chuteActive ? 5.8 : 12.5;
        state.descentRate += (targetRate - state.descentRate) * 0.1;

        state.altitude -= state.descentRate * dt * 3.5;
        state.score += Math.round(state.descentRate * 2 * dt);

        setAltitude(Math.max(0, Math.round(state.altitude)));
        setVelocity(Number(state.descentRate.toFixed(1)));
        setParachuting(state.chuteActive);
        setScore(state.score);

        // Exhaust particles
        if (Math.random() < 0.4) {
          state.particles.push({
            x: state.canX + (Math.random() * 12 - 6),
            y: state.canY - 24,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 3 - 1,
            life: 1.0,
            color: state.chuteActive ? '#E11D48' : '#94a3b8',
          });
        }

        // Spawn collectibles
        spawnTimer += dt;
        if (spawnTimer > 1.2 && state.altitude > 60) {
          spawnTimer = 0;
          const types = [
            { type: 'pressure', label: 'BARO', points: 300, color: '#E11D48' },
            { type: 'temp', label: 'TEMP', points: 350, color: '#f59e0b' },
            { type: 'gps', label: 'GPS', points: 400, color: '#10b981' },
            { type: 'radiation', label: 'COSMIC', points: 600, color: '#1e293b' },
          ];
          const chosen = types[Math.floor(Math.random() * types.length)];
          state.collectibles.push({
            x: 40 + Math.random() * (canvas.width - 80),
            y: canvas.height + 20,
            type: chosen.type as Collectible['type'],
            label: chosen.label,
            points: chosen.points,
            color: chosen.color,
            radius: 13,
          });
        }

        // Spawn hazards
        hazardTimer += dt;
        if (hazardTimer > 2.2 && state.altitude > 80) {
          hazardTimer = 0;
          const hazardTypes: ('cloud' | 'drone' | 'shear')[] = ['cloud', 'drone', 'shear'];
          const chosenType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
          state.hazards.push({
            x: chosenType === 'drone' ? 0 : Math.random() * (canvas.width - 90),
            y: canvas.height + 30,
            width: chosenType === 'cloud' ? 80 : 36,
            height: chosenType === 'cloud' ? 40 : 20,
            type: chosenType,
            vx: chosenType === 'drone' ? 2.5 : (Math.random() - 0.5) * 1.5,
          });
        }

        // Move collectibles upward
        const upwardSpeed = state.descentRate * 22 * dt;
        for (let i = state.collectibles.length - 1; i >= 0; i--) {
          const item = state.collectibles[i];
          item.y -= upwardSpeed;

          const dist = Math.hypot(state.canX - item.x, state.canY - item.y);
          if (dist < item.radius + 18) {
            state.score += item.points;
            sound.playCollect(1.0 + (item.points / 1000));
            setPacketsCollected(prev => prev + 1);

            for (let p = 0; p < 8; p++) {
              state.particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 0.8,
                color: item.color,
              });
            }
            state.collectibles.splice(i, 1);
            continue;
          }

          if (item.y < -30) {
            state.collectibles.splice(i, 1);
          }
        }

        // Move hazards upward
        for (let i = state.hazards.length - 1; i >= 0; i--) {
          const h = state.hazards[i];
          h.y -= upwardSpeed;
          h.x += h.vx;

          if (
            state.canX + 14 > h.x &&
            state.canX - 14 < h.x + h.width &&
            state.canY + 22 > h.y &&
            state.canY - 20 < h.y + h.height
          ) {
            sound.playCrash();
            state.canVx += (Math.random() - 0.5) * 14;
            state.score = Math.max(0, state.score - 150);

            for (let p = 0; p < 10; p++) {
              state.particles.push({
                x: state.canX,
                y: state.canY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 0.6,
                color: '#E11D48',
              });
            }
            state.hazards.splice(i, 1);
            continue;
          }

          if (h.y < -50 || h.x < -100 || h.x > canvas.width + 100) {
            state.hazards.splice(i, 1);
          }
        }

        // Touchdown
        if (state.altitude <= 0) {
          state.altitude = 0;
          state.gameOver = true;
          const safeLanding = state.descentRate <= 7.5;
          state.touchdownSuccess = safeLanding;

          if (safeLanding) {
            sound.playFanfare();
            state.score += 2500;
          } else {
            sound.playCrash();
            state.score = Math.max(0, state.score - 500);
          }
          setScore(state.score);
          setIsFinished(true);
          setTimeout(() => {
            onGameOver(state.score);
          }, 1800);
        }
      }

      // Update particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 1.8;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // ----------------- RENDER CANVAS -----------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky Gradient by altitude
      const altNorm = Math.min(1, Math.max(0, state.altitude / 1000));
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (altNorm > 0.6) {
        // High altitude (deep charcoal navy)
        skyGrad.addColorStop(0, '#11151C');
        skyGrad.addColorStop(1, '#1E232A');
      } else if (altNorm > 0.25) {
        // Mid altitude (slate steel)
        skyGrad.addColorStop(0, '#1E232A');
        skyGrad.addColorStop(1, '#334155');
      } else {
        // Low altitude near ground (soft atmospheric slate)
        skyGrad.addColorStop(0, '#334155');
        skyGrad.addColorStop(1, '#64748B');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle stars
      if (altNorm > 0.4) {
        ctx.fillStyle = `rgba(255, 255, 255, ${altNorm * 0.6})`;
        for (let i = 0; i < 25; i++) {
          const sx = (i * 73) % canvas.width;
          const sy = (i * 97 + now * 0.02) % canvas.height;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
      }

      // Ground approaching when altitude < 150m
      if (state.altitude < 150) {
        const groundY = canvas.height - (150 - state.altitude) * 2.8;
        // Grass / pad
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

        // Bullseye pad with team red
        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, groundY + 30, 80, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, groundY + 30, 50, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, groundY + 30, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Collectibles
      state.collectibles.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);

        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, item.radius + 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = item.color;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, 0, 0);

        ctx.restore();
      });

      // Render Hazards
      state.hazards.forEach(h => {
        ctx.save();
        if (h.type === 'cloud') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.ellipse(h.x + h.width / 2, h.y + h.height / 2, h.width / 2, h.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (h.type === 'drone') {
          ctx.fillStyle = '#E11D48';
          ctx.fillRect(h.x, h.y, h.width, h.height);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(h.x, h.y, 16, 0, Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      });

      // Render Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      });
      ctx.globalAlpha = 1.0;

      // Render SKYLINK CanSat with RED & WHITE Parachute (from Logo!)
      ctx.save();
      ctx.translate(state.canX, state.canY);

      const chuteOpen = state.chuteActive;
      const chuteRadius = chuteOpen ? 34 : 20;
      const chuteY = -48;

      // Suspension lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-chuteRadius * 0.9, chuteY);
      ctx.lineTo(0, -14);
      ctx.moveTo(chuteRadius * 0.9, chuteY);
      ctx.lineTo(0, -14);
      ctx.moveTo(0, chuteY);
      ctx.lineTo(0, -14);
      ctx.stroke();

      // Red & White Striped Parachute Canopy (Just like the SKYLINK Logo!)
      const stripeCount = 6;
      const angleStep = Math.PI / stripeCount;
      for (let s = 0; s < stripeCount; s++) {
        ctx.fillStyle = s % 2 === 0 ? '#E11D48' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, chuteY);
        ctx.arc(0, chuteY, chuteRadius, Math.PI + s * angleStep, Math.PI + (s + 1) * angleStep);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = '#181C24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, chuteY, chuteRadius, Math.PI, 0, false);
      ctx.stroke();

      // CanSat Cylinder (330ml Can with SKYLINK red banner)
      const canW = 20;
      const canH = 34;

      const canGrad = ctx.createLinearGradient(-canW / 2, 0, canW / 2, 0);
      canGrad.addColorStop(0, '#94a3b8');
      canGrad.addColorStop(0.3, '#f8fafc');
      canGrad.addColorStop(0.7, '#cbd5e1');
      canGrad.addColorStop(1, '#64748b');

      ctx.fillStyle = canGrad;
      ctx.beginPath();
      ctx.roundRect(-canW / 2, -canH / 2, canW, canH, 4);
      ctx.fill();
      ctx.strokeStyle = '#181C24';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Red SKYLINK livery band
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(-canW / 2 + 1, -4, canW - 2, 12);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SKYLINK', 0, 4);

      // Blinking Green LED
      ctx.fillStyle = Math.sin(now * 0.015) > 0 ? '#10b981' : '#047857';
      ctx.beginPath();
      ctx.arc(canW / 2 - 4, canH / 2 - 5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Antenna Wire
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, canH / 2);
      ctx.lineTo(state.wind * 1.5, canH / 2 + 16);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isStarted, onGameOver]);

  const handleStart = () => {
    sound.playClick(800);
    setIsStarted(true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none">
      {/* Top Telemetry Bar (Clean Muted Style) */}
      <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-t-2xl px-5 py-3 text-xs font-sans shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-slate-400 hover:text-slate-800 transition-colors font-medium cursor-pointer"
          >
            ← Exit
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="text-slate-400 text-[11px] font-mono">ALT:</span>
            <span className="font-bold font-mono text-slate-900">{altitude}m</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="text-slate-400 text-[11px] font-mono">SPEED:</span>
            <span className={`font-bold font-mono ${velocity > 8 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {velocity} m/s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="text-slate-400 text-[11px] font-mono">DATA:</span>
            <span className="font-bold font-mono text-slate-900">{packetsCollected} pkts</span>
          </div>
          <div className="flex items-center gap-1 text-rose-600 font-mono font-bold text-sm">
            <span>{score} pts</span>
          </div>
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer"
            title="Toggle Sound"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div
        style={{ touchAction: 'none' }}
        className="relative w-full aspect-[4/5] max-h-[560px] bg-[#181C24] border-x border-b border-slate-200 rounded-b-2xl overflow-hidden shadow-xl"
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={600}
          className="w-full h-full block"
        />

        {/* Start Overlay Screen (Clean Muted Modal) */}
        {!isStarted && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 text-rose-600">
              <Wind size={28} />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 mb-1">
              SKYLINK MISSION 01
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Can-Drop: Descent Mission
            </h2>
            <p className="text-slate-500 text-xs max-w-sm mb-6 leading-relaxed">
              Ejected at 1,000m apogee. Steer through crosswinds, collect scientific sensor packets, flare your parachute, and achieve a soft landing under 8 m/s!
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6 text-xs text-left">
              <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-3">
                <span className="text-slate-800 font-bold block mb-0.5">STEER</span>
                <span className="text-slate-500 font-mono text-[11px]">A / D or Arrow Keys</span>
              </div>
              <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-3">
                <span className="text-rose-600 font-bold block mb-0.5">PARACHUTE BRAKE</span>
                <span className="text-slate-500 font-mono text-[11px]">Spacebar or Down</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3.5 bg-[#181C24] hover:bg-black text-white font-semibold rounded-full shadow-md active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              🚀 Launch Ejection Drop
            </button>
          </div>
        )}

        {/* Parachute active badge */}
        {isStarted && !isFinished && parachuting && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 border border-slate-200 px-3.5 py-1 rounded-full text-xs font-mono text-slate-900 flex items-center gap-1.5 shadow">
            <Shield size={12} className="text-rose-600" />
            <span>BRAKE ACTIVE ({velocity} m/s)</span>
          </div>
        )}

        {/* Speed Warning */}
        {isStarted && !isFinished && altitude < 120 && velocity > 8.0 && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg animate-bounce">
            <AlertTriangle size={14} />
            <span>HOLD SPACE TO BRAKE BEFORE IMPACT!</span>
          </div>
        )}

        {/* Finished Touchdown Banner */}
        {isFinished && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              TOUCHDOWN CONFIRMED!
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Final Science Score: <span className="font-bold text-rose-600 text-lg font-mono">{score}</span>
            </p>
            <div className="inline-block bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-slate-600 text-xs font-mono">
              Recording score to SKYLINK Leaderboard...
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="w-full flex items-center justify-between gap-3 mt-3 sm:hidden">
        <button
          onTouchStart={() => { stateRef.current.keys.left = true; }}
          onTouchEnd={() => { stateRef.current.keys.left = false; }}
          onMouseDown={() => { stateRef.current.keys.left = true; }}
          onMouseUp={() => { stateRef.current.keys.left = false; }}
          className="flex-1 py-3 bg-white border border-slate-200 active:bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center font-bold shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>

        <button
          onTouchStart={() => {
            sound.playParachute();
            stateRef.current.keys.space = true;
          }}
          onTouchEnd={() => { stateRef.current.keys.space = false; }}
          onMouseDown={() => {
            sound.playParachute();
            stateRef.current.keys.space = true;
          }}
          onMouseUp={() => { stateRef.current.keys.space = false; }}
          className="flex-2 py-3 bg-rose-50 border border-rose-200 active:bg-rose-100 text-rose-700 font-mono text-xs rounded-2xl flex items-center justify-center gap-1.5 font-bold shadow-sm"
        >
          <Shield size={15} /> Parachute Brake
        </button>

        <button
          onTouchStart={() => { stateRef.current.keys.right = true; }}
          onTouchEnd={() => { stateRef.current.keys.right = false; }}
          onMouseDown={() => { stateRef.current.keys.right = true; }}
          onMouseUp={() => { stateRef.current.keys.right = false; }}
          className="flex-1 py-3 bg-white border border-slate-200 active:bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center font-bold shadow-sm"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="w-full text-center mt-3 text-slate-400 text-[11px]">
        💡 Real CanSat Physics: Parachutes regulate descent rate to 8-11 m/s to ensure structural safety and optimal radio packet broadcast duration.
      </div>
    </div>
  );
};
