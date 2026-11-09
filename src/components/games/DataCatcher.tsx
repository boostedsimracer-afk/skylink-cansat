import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { Volume2, VolumeX, Zap } from 'lucide-react';

interface DataCatcherProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

interface Item {
  x: number;
  y: number;
  type: 'temp' | 'baro' | 'gps' | 'solar' | 'hazard';
  emoji: string;
  points: number;
  speed: number;
  radius: number;
}

export const DataCatcher: React.FC<DataCatcherProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(35);
  const [combo, setCombo] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(sound.enabled);

  const stateRef = useRef({
    dishX: 210,
    items: [] as Item[],
    score: 0,
    combo: 0,
    timeLeft: 35,
    gameOver: false,
    started: false,
    keys: { left: false, right: false },
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
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
    const state = stateRef.current;
    state.dishX = canvas.width / 2;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a'].includes(e.code) || ['ArrowLeft', 'a', 'A'].includes(e.key)) {
        e.preventDefault();
        state.keys.left = true;
      }
      if (['ArrowRight', 'KeyD', 'd'].includes(e.code) || ['ArrowRight', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        state.keys.right = true;
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
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (state.started && !state.gameOver) {
        state.timeLeft -= dt;
        setTimeLeft(Math.max(0, Math.ceil(state.timeLeft)));

        if (state.timeLeft <= 0) {
          state.gameOver = true;
          sound.playFanfare();
          setTimeout(() => {
            onGameOver(state.score);
          }, 1500);
        }

        // Steer dish
        const moveSpeed = 360;
        if (state.keys.left) state.dishX -= moveSpeed * dt;
        if (state.keys.right) state.dishX += moveSpeed * dt;

        const dishW = 76;
        if (state.dishX < dishW / 2) state.dishX = dishW / 2;
        if (state.dishX > canvas.width - dishW / 2) state.dishX = canvas.width - dishW / 2;

        // Spawn items
        spawnTimer += dt;
        if (spawnTimer > 0.45) {
          spawnTimer = 0;
          const isHazard = Math.random() < 0.22;
          const types = [
            { type: 'temp', emoji: '🌡️', points: 100, speed: 200 },
            { type: 'baro', emoji: '📊', points: 150, speed: 220 },
            { type: 'gps', emoji: '🛰️', points: 200, speed: 240 },
            { type: 'solar', emoji: '⚡', points: 300, speed: 270 },
          ];
          const chosen = isHazard
            ? { type: 'hazard', emoji: '⛈️', points: -150, speed: 230 }
            : types[Math.floor(Math.random() * types.length)];

          state.items.push({
            x: 24 + Math.random() * (canvas.width - 48),
            y: -20,
            type: chosen.type as Item['type'],
            emoji: chosen.emoji,
            points: chosen.points,
            speed: chosen.speed,
            radius: 16,
          });
        }

        // Update items
        const dishY = canvas.height - 40;
        for (let i = state.items.length - 1; i >= 0; i--) {
          const item = state.items[i];
          item.y += item.speed * dt;

          // Check caught by dish
          const dist = Math.hypot(state.dishX - item.x, dishY - item.y);
          if (dist < 42) {
            if (item.type === 'hazard') {
              sound.playCrash();
              state.combo = 0;
              state.score = Math.max(0, state.score + item.points);
            } else {
              sound.playCollect(1.0 + (item.points / 500));
              state.combo += 1;
              const bonus = state.combo > 5 ? 1.5 : 1.0;
              state.score += Math.round(item.points * bonus);
            }

            setScore(state.score);
            setCombo(state.combo);

            // Particles
            for (let p = 0; p < 8; p++) {
              state.particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 120,
                vy: (Math.random() - 0.5) * 120,
                life: 0.5,
                color: item.type === 'hazard' ? '#ef4444' : '#f43f5e',
              });
            }

            state.items.splice(i, 1);
            continue;
          }

          if (item.y > canvas.height + 30) {
            state.items.splice(i, 1);
          }
        }
      }

      // Update particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 2.2;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // ---------------- RENDER ----------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cute sky background
      ctx.fillStyle = '#fdf2f4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Star grid
      ctx.fillStyle = 'rgba(244, 63, 94, 0.1)';
      for (let i = 0; i < 20; i++) {
        const sx = (i * 47) % canvas.width;
        const sy = (i * 61 + now * 0.02) % canvas.height;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Items falling
      state.items.forEach(item => {
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, item.x, item.y);
      });

      // Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Ground Station Antenna Dish (Player Receiver)
      const dishY = canvas.height - 40;
      ctx.save();
      ctx.translate(state.dishX, dishY);

      // Dish parabolic arc
      ctx.fillStyle = '#181C24';
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI);
      ctx.fill();

      // Red inner stripe
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI);
      ctx.fill();

      // Feedhorn / receiver probe
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 16, 5, 0, Math.PI * 2);
      ctx.fill();

      // Dish stand
      ctx.fillStyle = '#475569';
      ctx.fillRect(-3, 0, 6, 24);

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onGameOver]);

  const handleStart = () => {
    sound.playClick(800);
    stateRef.current.started = true;
    setIsStarted(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const scale = canvas.width / rect.width;
    stateRef.current.dishX = touchX * scale;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto p-4 select-none font-sans">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between bg-white border border-rose-100 rounded-t-2xl px-5 py-3 text-xs shadow-sm">
        <div className="flex items-center gap-3 font-bubbly">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
            ← Exit
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="font-bold text-slate-800">Time: {timeLeft}s</span>
        </div>

        <div className="flex items-center gap-4">
          {combo > 3 && (
            <div className="flex items-center gap-1 text-rose-500 font-bubbly font-bold">
              <Zap size={14} /> {combo}x Combo!
            </div>
          )}
          <div className="flex items-center gap-1 text-rose-600 font-bubbly font-bold text-base">
            <span>Score: {score}</span>
          </div>
          <button onClick={toggleMute} className="text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer">
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Canvas Box */}
      <div
        onTouchMove={handleTouchMove}
        style={{ touchAction: 'none' }}
        className="relative w-full aspect-[4/5] max-h-[560px] bg-[#fdf2f4] border-x border-b border-rose-100 rounded-b-2xl overflow-hidden shadow-xl cursor-ew-resize"
      >
        <canvas ref={canvasRef} width={420} height={560} className="w-full h-full block" />

        {/* Start Overlay */}
        {!isStarted && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-5xl mb-3 animate-bounce">📡</span>
            <h2 className="text-3xl font-bubbly font-bold text-slate-900 mb-2">
              Data Catcher
            </h2>
            <p className="text-slate-500 text-xs mb-6 max-w-xs">
              Slide your ground station dish left and right to catch sensor packets (🌡️, 📊, 🛰️) and dodge storms (⛈️)!
            </p>
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-bold rounded-full text-sm shadow-md cursor-pointer"
            >
              Start Catching 🚀
            </button>
          </div>
        )}

        {/* Finished Screen */}
        {stateRef.current.gameOver && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-bubbly font-bold text-slate-900 mb-1">
              Downlink Complete!
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Packets Captured: <span className="font-bold text-rose-600 text-base font-mono">{score} pts</span>
            </p>
            <div className="inline-block px-4 py-2 bg-slate-50 text-slate-600 text-xs rounded-full font-mono">
              Logging score to leaderboard...
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="w-full text-center mt-3 text-slate-400 text-xs font-sans">
        📱 Mobile: Slide your finger left and right on the screen to catch packets!
      </div>
    </div>
  );
};
