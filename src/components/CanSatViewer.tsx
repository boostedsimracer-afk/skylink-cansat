import React, { useState } from 'react';
import { sound } from '../utils/audio';

interface Part {
  id: string;
  name: string;
  emoji: string;
  tip: string;
}

const PARTS: Part[] = [
  { id: 'chute', name: 'Parachute', emoji: '🪂', tip: 'Red & white canopy keeps descent speed under 11 m/s for a safe landing!' },
  { id: 'antenna', name: '433MHz Antenna', emoji: '📡', tip: 'Beams telemetry frames live to our Ground Station up to 5km away!' },
  { id: 'cpu', name: 'ESP32 Flight Brain', emoji: '🧠', tip: 'Logs flight data at 10Hz and manages all onboard electronics.' },
  { id: 'sensors', name: 'Sensors (BME280)', emoji: '🌡️', tip: 'Measures barometric pressure to calculate instantaneous altitude.' },
  { id: 'battery', name: 'LiPo Battery Pack', emoji: '⚡', tip: 'Powers the entire CanSat for over 4 hours of mission time.' },
];

export const CanSatViewer: React.FC = () => {
  const [activePart, setActivePart] = useState<Part>(PARTS[0]);

  const select = (p: Part) => {
    sound.playClick(600);
    setActivePart(p);
  };

  return (
    <section id="cansat" className="py-14 px-6 sm:px-12 max-w-4xl mx-auto text-center">
      <h2 className="text-3xl sm:text-4xl font-bubbly font-bold text-slate-900 tracking-tight mb-2">
        What's Inside a CanSat? 🛰️
      </h2>
      <p className="text-slate-500 text-sm font-medium mb-8">
        A real satellite packed into a 330ml soda can. Tap a component below!
      </p>

      {/* Interactive CanSat Display */}
      <div className="bg-white/80 border border-rose-100 rounded-[38px] p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Visual Can Model */}
        <div className="relative w-44 h-64 flex flex-col items-center justify-between">
          {/* Parachute Top */}
          <button
            onClick={() => select(PARTS[0])}
            className={`w-36 h-14 rounded-t-full cursor-pointer transition-transform border-2 flex items-center justify-center ${
              activePart.id === 'chute' ? 'bg-rose-600 border-slate-900 scale-105 shadow-md' : 'bg-rose-500 border-rose-400'
            }`}
          >
            <span className="font-bubbly text-xs text-white font-bold">Parachute 🪂</span>
          </button>
          <div className="w-16 h-4 border-l-2 border-r-2 border-slate-400 mx-auto" />

          {/* Aluminum Can */}
          <div className="w-36 h-44 bg-gradient-to-r from-slate-200 via-white to-slate-300 rounded-2xl border-2 border-slate-400 p-2 flex flex-col justify-between shadow-md relative">
            {/* Antenna button */}
            <button
              onClick={() => select(PARTS[1])}
              className={`absolute -top-3 right-2 px-2 py-0.5 rounded-full text-[10px] font-bubbly font-bold cursor-pointer ${
                activePart.id === 'antenna' ? 'bg-rose-600 text-white shadow' : 'bg-white text-slate-800 border'
              }`}
            >
              📡 Antenna
            </button>

            {/* Internal parts pills */}
            <div className="mt-4 space-y-1.5">
              <button
                onClick={() => select(PARTS[2])}
                className={`w-full py-1.5 px-2 rounded-xl text-xs font-bubbly font-semibold flex items-center justify-between cursor-pointer ${
                  activePart.id === 'cpu' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <span>ESP32 Brain</span>
                <span>🧠</span>
              </button>
              <button
                onClick={() => select(PARTS[3])}
                className={`w-full py-1.5 px-2 rounded-xl text-xs font-bubbly font-semibold flex items-center justify-between cursor-pointer ${
                  activePart.id === 'sensors' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <span>Sensors</span>
                <span>🌡️</span>
              </button>
              <button
                onClick={() => select(PARTS[4])}
                className={`w-full py-1.5 px-2 rounded-xl text-xs font-bubbly font-semibold flex items-center justify-between cursor-pointer ${
                  activePart.id === 'battery' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <span>LiPo Battery</span>
                <span>⚡</span>
              </button>
            </div>

            <div className="text-[9px] font-bubbly text-slate-500 font-bold border-t border-slate-300 pt-0.5">
              SKYLINK • 330ml Can
            </div>
          </div>
        </div>

        {/* Cute Explanation Card (1-2 sentences, zero clutter) */}
        <div className="max-w-xs text-left bg-[#FAF0F2] border border-rose-200 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{activePart.emoji}</span>
            <h3 className="font-bubbly text-xl font-bold text-slate-900">
              {activePart.name}
            </h3>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
            {activePart.tip}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PARTS.map(p => (
              <button
                key={p.id}
                onClick={() => select(p)}
                className={`px-3 py-1 rounded-full text-xs font-bubbly font-semibold cursor-pointer ${
                  activePart.id === p.id ? 'bg-rose-500 text-white' : 'bg-white text-slate-600 border border-rose-100'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
