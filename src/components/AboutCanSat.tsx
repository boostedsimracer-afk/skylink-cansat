import React from 'react';

export const AboutCanSat: React.FC = () => {
  const steps = [
    { num: '1', emoji: '🚀', title: 'Launch', desc: 'Sounding rocket to 1000m' },
    { num: '2', emoji: '🪂', title: 'Eject', desc: 'Parachute deploys' },
    { num: '3', emoji: '📡', title: 'Transmit', desc: 'Radio telemetry live' },
    { num: '4', emoji: '🧪', title: 'Science', desc: 'Sensor atmospheric scan' },
    { num: '5', emoji: '🎯', title: 'Recovery', desc: 'Soft safe touchdown' },
  ];

  return (
    <section className="py-12 px-6 sm:px-12 max-w-4xl mx-auto text-center">
      <h2 className="text-3xl sm:text-4xl font-bubbly font-bold text-slate-900 tracking-tight mb-2">
        How CanSat Works 🚀
      </h2>
      <p className="text-slate-500 text-sm font-medium mb-8">
        5 quick steps from launch pad to ground station recovery!
      </p>

      {/* 5 Cute Bubbly Steps (No boxy cards!) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {steps.map(s => (
          <div
            key={s.num}
            className="bg-white/80 border border-rose-100 rounded-3xl p-4 text-center shadow-sm flex flex-col items-center justify-center hover:scale-105 transition-transform"
          >
            <span className="text-3xl mb-1.5">{s.emoji}</span>
            <span className="font-bubbly font-bold text-slate-900 text-sm block">
              {s.title}
            </span>
            <span className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
              {s.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
