import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

interface FlappyCanSatProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  gap: number;
  passed: boolean;
  bonusCollected?: boolean;
}

export const FlappyCanSat: React.FC<FlappyCanSatProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(sound.enabled);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const stateRef = useRef({
    canY: 250,
    canVy: 0,
    gravity: 1400, // px/s^2
    jumpStrength: -420,
    pipes: [] as Pipe[],
    pipeSpeed: 170, // px/s
    score: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    gameOver: false,
    started: false,
  });

  const toggleMute = () => {
    const next = sound.toggleMute();
    setSoundOn(next);
  };

  const jump = () => {
    const state = stateRef.current;
    if (state.gameOver) return;
    if (!state.started) {
      state.started = true;
      setIsStarted(true);
    }
    state.canVy = state.jumpStrength;
    sound.playThrust();

    // Spawn cute thrust particles
    for (let i = 0; i < 4; i++) {
      state.particles.push({
        x: 100 - 8,
        y: state.canY + 12,
        vx: -Math.random() * 80 - 40,
        vy: (Math.random() - 0.5) * 60,
        life: 0.35,
        color: Math.random() > 0.5 ? '#f43f5e' : '#fb7185',
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let pipeTimer = 0;

    const state = stateRef.current;
    state.canY = canvas.height / 2;
    state.canVy = 0;
    state.pipes = [];
    state.score = 0;
    state.particles = [];
    state.gameOver = false;
    state.started = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', ' ', 'ArrowUp', 'KeyW', 'w'].includes(e.code) || [' ', 'ArrowUp', 'w', 'W'].includes(e.key)) {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (state.started && !state.gameOver) {
        // Physics update
        state.canVy += state.gravity * dt;
        state.canY += state.canVy * dt;

        // Ground / Ceiling collision
        if (state.canY > canvas.height - 35) {
          state.canY = canvas.height - 35;
          endGame();
        }
        if (state.canY < 20) {
          state.canY = 20;
          state.canVy = 0;
        }

        // Spawn Pipes
        pipeTimer += dt;
        if (pipeTimer > 1.6) {
          pipeTimer = 0;
          const gap = 145; // generous friendly gap
          const minH = 70;
          const maxH = canvas.height - gap - minH;
          const topHeight = minH + Math.random() * (maxH - minH);
          state.pipes.push({
            x: canvas.width + 20,
            topHeight,
            gap,
            passed: false,
          });
        }

        // Update Pipes
        const canX = 100;
        const canRadius = 14;

        for (let i = state.pipes.length - 1; i >= 0; i--) {
          const pipe = state.pipes[i];
          pipe.x -= state.pipeSpeed * dt;

          const pipeW = 54;
          const bottomY = pipe.topHeight + pipe.gap;

          // Check passing for points
          if (!pipe.passed && pipe.x + pipeW < canX) {
            pipe.passed = true;
            state.score += 100;
            setScore(state.score);
            sound.playCollect(1.2);
          }

          // Check collision with top pipe
          if (
            canX + canRadius > pipe.x &&
            canX - canRadius < pipe.x + pipeW &&
            state.canY - canRadius < pipe.topHeight
          ) {
            endGame();
          }

          // Check collision with bottom pipe
          if (
            canX + canRadius > pipe.x &&
            canX - canRadius < pipe.x + pipeW &&
            state.canY + canRadius > bottomY
          ) {
            endGame();
          }

          if (pipe.x < -70) {
            state.pipes.splice(i, 1);
          }
        }
      }

      // Update particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 2.5;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // ---------------- RENDER ----------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cute sky background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#fef2f2');
      skyGrad.addColorStop(0.6, '#fff1f2');
      skyGrad.addColorStop(1, '#fce7f3');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clouds in background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let c = 0; c < 3; c++) {
        const cx = ((c * 170 + now * 0.02) % (canvas.width + 100)) - 50;
        const cy = 60 + c * 80;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 40, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Pipes (Rocket Launch Gantries with cute red/white stripes)
      state.pipes.forEach(pipe => {
        const pipeW = 52;
        const bottomY = pipe.topHeight + pipe.gap;

        // Top Pipe
        ctx.fillStyle = '#181C24';
        ctx.beginPath();
        ctx.roundRect(pipe.x, 0, pipeW, pipe.topHeight, [0, 0, 16, 16]);
        ctx.fill();
        // Red accent rim
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 12, pipeW + 6, 12);

        // Bottom Pipe
        ctx.fillStyle = '#181C24';
        ctx.beginPath();
        ctx.roundRect(pipe.x, bottomY, pipeW, canvas.height - bottomY, [16, 16, 0, 0]);
        ctx.fill();
        // Red accent rim
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(pipe.x - 3, bottomY, pipeW + 6, 12);

        // Star bonus in center of gap
        if (!pipe.passed) {
          const starY = pipe.topHeight + pipe.gap / 2;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(pipe.x + pipeW / 2, starY, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Ground
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(0, canvas.height - 24, canvas.width, 4);

      // Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw SKYLINK CanSat Bird
      ctx.save();
      const canX = 100;
      ctx.translate(canX, state.canY);

      // Pitch angle based on velocity
      const tilt = Math.max(-0.4, Math.min(0.6, state.canVy * 0.0015));
      ctx.rotate(tilt);

      // Mini parachute on top
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, -18, 14, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Suspension lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-10, -18);
      ctx.lineTo(0, -6);
      ctx.moveTo(10, -18);
      ctx.lineTo(0, -6);
      ctx.stroke();

      // Soda can cylinder
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#181C24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-10, -8, 20, 24, 4);
      ctx.fill();
      ctx.stroke();

      // Red SKYLINK livery band
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-9, -2, 18, 8);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SKYLINK', 0, 4);

      // Cute little jet flame when jumping
      if (state.canVy < 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-4, 16);
        ctx.lineTo(4, 16);
        ctx.lineTo(0, 24);
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    const endGame = () => {
      state.gameOver = true;
      setGameOver(true);
      sound.playCrash();
      setTimeout(() => {
        onGameOver(state.score);
      }, 1400);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onGameOver]);

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto p-4 select-none font-sans">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between bg-white border border-rose-100 rounded-t-2xl px-5 py-3 text-xs shadow-sm">
        <div className="flex items-center gap-3 font-bubbly">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
            ← Exit
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="font-bold text-slate-800">Flappy CanSat</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-rose-600 font-bubbly font-bold text-base">
            <span>Score: {score}</span>
          </div>
          <button onClick={toggleMute} className="text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer">
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      <div
        onClick={jump}
        onTouchStart={e => {
          e.preventDefault();
          jump();
        }}
        style={{ touchAction: 'none' }}
        className="relative w-full aspect-[4/5] max-h-[560px] bg-[#fdf2f4] border-x border-b border-rose-100 rounded-b-2xl overflow-hidden shadow-xl cursor-pointer"
      >
        <canvas ref={canvasRef} width={420} height={560} className="w-full h-full block" />

        {/* Start Overlay */}
        {!isStarted && !gameOver && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 pointer-events-none">
            <span className="text-5xl mb-3 animate-bounce">🪂</span>
            <h2 className="text-3xl font-bubbly font-bold text-slate-900 mb-2">
              Flappy CanSat
            </h2>
            <p className="text-slate-500 text-xs mb-6 max-w-xs">
              Tap screen or press Space to flap thrusters and fly through antenna towers!
            </p>
            <div className="px-6 py-3 bg-rose-500 text-white font-bubbly font-bold rounded-full text-sm shadow-md">
              Tap Anywhere to Fly 🚀
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-4xl mb-2">💥</span>
            <h3 className="text-2xl font-bubbly font-bold text-slate-900 mb-1">
              Mission Crash!
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Final Score: <span className="font-bold text-rose-600 text-base font-mono">{score} pts</span>
            </p>
            <div className="inline-block px-4 py-2 bg-slate-50 text-slate-600 text-xs rounded-full font-mono">
              Logging score to leaderboard...
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Instruction */}
      <div className="w-full text-center mt-3 text-slate-400 text-xs font-sans">
        📱 Mobile: Tap anywhere on the game screen to jump!
      </div>
    </div>
  );
};
