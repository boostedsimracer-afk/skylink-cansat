import React from 'react';
import { Mail, GraduationCap, ExternalLink } from 'lucide-react';
import type { TeamMember } from '../types';

const MEMBERS: TeamMember[] = [
  {
    name: 'Dr. Sateesh Kumar Nataraj',
    role: 'Supervisor',
    subsystem: 'Faculty Advisor',
    bio: '',
    favoriteSensor: '',
    avatarColor: 'bg-slate-900',
  },
  {
    name: 'Osama Zahid',
    role: 'Project Manager',
    subsystem: 'Management',
    bio: '',
    favoriteSensor: '',
    avatarColor: 'bg-rose-600',
  },
  {
    name: 'Mohammad Shoaib',
    role: 'Electrical Lead',
    subsystem: 'Avionics & Power',
    bio: '',
    favoriteSensor: '',
    avatarColor: 'bg-slate-800',
  },
  {
    name: 'Mohsin Akil',
    role: 'Mechanical Lead',
    subsystem: 'Structures & Recovery',
    bio: '',
    favoriteSensor: '',
    avatarColor: 'bg-rose-600',
  },
  {
    name: 'Mohammad Ali',
    role: 'Software & Data Lead',
    subsystem: 'Ground Station & Telemetry',
    bio: '',
    favoriteSensor: '',
    avatarColor: 'bg-slate-800',
  },
  {
    name: 'Zaid Ahmad Khan',
    role: 'Science & Outreach',
    subsystem: 'Payload & STEM Outreach',
    bio: '',
    favoriteSensor: '',
    avatarColor: 'bg-rose-600',
  },
];

export const TeamSection: React.FC = () => {
  return (
    <section id="team" className="py-14 px-4 sm:px-12 max-w-5xl mx-auto text-center">
      <h2 className="text-3xl sm:text-4xl font-bubbly font-bold text-slate-900 tracking-tight mb-2">
        The SKYLINK Crew 👥
      </h2>
      <p className="text-slate-500 text-sm font-medium mb-8">
        University of Technology Bahrain CanSat 2026 Team.
      </p>

      {/* 6 Team Member Bubbles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {MEMBERS.map(m => (
          <div
            key={m.name}
            className="bg-white/80 border border-rose-100 rounded-3xl p-4 flex items-center gap-3.5 shadow-sm hover:scale-105 transition-transform"
          >
            <div className={`w-11 h-11 rounded-2xl ${m.avatarColor} text-white font-bubbly font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
              {m.role === 'Supervisor' ? (
                <GraduationCap size={18} />
              ) : (
                m.name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
              )}
            </div>
            <div className="text-left font-sans truncate">
              <span className="font-bubbly font-bold text-slate-900 text-sm block leading-snug truncate">
                {m.name}
              </span>
              <span className="text-xs text-rose-600 font-semibold block">
                {m.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Workshop request CTA & Linktree */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white/90 border border-rose-200 rounded-3xl sm:rounded-full px-6 py-3.5 shadow-sm text-xs font-medium text-slate-600">
        <span>Want a live CanSat launch demo or STEM presentation at your school?</span>
        <div className="flex items-center gap-2">
          <a
            href="mailto:skylinkutb@gmail.com"
            className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bubbly font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Mail size={12} /> Contact Team
          </a>
          <a
            href="https://linktr.ee/qr/2a450f9d-f8f9-4041-bca6-d3176b9d65b6"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full font-bubbly font-semibold transition-all inline-flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <ExternalLink size={11} /> Linktree
          </a>
        </div>
      </div>
    </section>
  );
};
