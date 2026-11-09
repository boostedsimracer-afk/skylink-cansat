import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Compass,
  Layers,
  Rocket,
  X,
} from 'lucide-react';
import { sound } from '../utils/audio';

export interface BlogPost {
  id: string;
  title: string;
  category: 'workshop' | 'presentation' | 'engineering';
  date: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  summary: string;
  readTime: string;
  author: string;
  authorRole: string;
  tags: string[];
  fullReport: {
    objectives: string[];
    completedMilestones: string[];
    technicalDetails: { label: string; value: string }[];
    quote?: string;
    nextSteps: string;
  };
}

export const INITIAL_POSTS: BlogPost[] = [
  {
    id: 'induction-session',
    title: 'Induction Session & Team SKYLINK Formation',
    category: 'workshop',
    date: 'October 26, 2026',
    status: 'completed',
    readTime: '3 min read',
    author: 'Zaid Ahmad Khan',
    authorRole: 'Science & Outreach Lead',
    tags: ['Kickoff', 'Team Formation', 'Induction'],
    summary:
      'Attended the official CanSat Bahrain 2026 Induction Workshop organized by the space authorities. Team SKYLINK established at University of Technology Bahrain.',
    fullReport: {
      objectives: [
        'Understand the official CanSat Bahrain 2026 competition regulations and flight envelope.',
        'Define primary mission requirements: barometric altitude, air temperature, and 1Hz radio downlink.',
        'Assemble the core multidisciplinary engineering team across Mechanical, Electrical, and Software disciplines.',
      ],
      completedMilestones: [
        'Team SKYLINK registered under University of Technology Bahrain (UTB).',
        'Appointed Dr. Sateesh Kumar Nataraj as Academic Project Supervisor.',
        'Selected secondary payload mission: real-time atmospheric air quality index (AQI) and descent dynamics modeling.',
      ],
      technicalDetails: [
        { label: 'Envelope Form Factor', value: 'Standard 330ml Aluminum Can' },
        { label: 'Max Mass Allowed', value: '350 grams (±10g tolerance)' },
        { label: 'Rocket Apogee', value: '1,000 meters AGL' },
        { label: 'Downlink Frequency', value: '433 MHz LoRa' },
      ],
      quote:
        '"Our goal is not just to build a CanSat, but to engineer a robust miniature spacecraft that demonstrates precise telemetry and inspires the next generation of Bahraini aerospace engineers."',
      nextSteps:
        'Prepare the formal Mission Concept Review (MCR) presentation and draft initial electrical schematics.',
    },
  },
  {
    id: 'mcr-presentation',
    title: 'Workshop 1: Mission Concept Review (MCR) Defense',
    category: 'presentation',
    date: 'November 6, 2026',
    status: 'completed',
    readTime: '4 min read',
    author: 'Osama Zahid',
    authorRole: 'Project Manager',
    tags: ['MCR', 'Architecture', 'Milestone'],
    summary:
      'Presented Team SKYLINK’s Mission Concept Review to the academic review board, outlining flight computer selection, power budget, and sensor architecture.',
    fullReport: {
      objectives: [
        'Present the conceptual architecture and feasibility study for the 1,000m flight profile.',
        'Validate sensor selection: BMP280/BME280 barometric pressure, MPU6050 6-DOF IMU, and LoRa transceiver.',
        'Establish the Gantt chart, risk mitigation matrix, and component procurement timeline.',
      ],
      completedMilestones: [
        'MCR defense approved with high commendation on power redundancy.',
        'Selected ESP32 dual-core 240MHz microcontroller as primary onboard flight computer.',
        'Established structural modularity using 3D printed PETG interior chassis disks.',
      ],
      technicalDetails: [
        { label: 'Flight Computer', value: 'ESP32 Dual-Core (240MHz)' },
        { label: 'Telemetry Module', value: 'SX1278 LoRa 433MHz' },
        { label: 'Inertial Sensor', value: 'MPU6050 3-Axis Gyro + Accel' },
        { label: 'Environmental Sensor', value: 'BMP280 Barometer + Temp' },
      ],
      quote:
        '"The review panel appreciated our modular stack architecture which allows rapid swap-out of avionics during field trials."',
      nextSteps:
        'Collaborate with the mechanical division on parachute drag calculations and descent rate constraints.',
    },
  },
  {
    id: 'parachute-aerodynamics',
    title: 'Workshop 2: Aerodynamics & Parachute Design Brief',
    category: 'engineering',
    date: 'November 18, 2026',
    status: 'completed',
    readTime: '4 min read',
    author: 'Mohsin Akil',
    authorRole: 'Mechanical Lead',
    tags: ['Aerodynamics', 'Parachute', 'Recovery'],
    summary:
      'Engineered and simulated the cross/hexstar recovery parachute to ensure stable descent below the mandatory 8 m/s impact threshold.',
    fullReport: {
      objectives: [
        'Calculate required canopy surface area based on local air density at sea level (Bahrain ambient temp 28°C).',
        'Limit terminal descent velocity between 6 m/s and 8 m/s for safe recovery and sensor stability.',
        'Design a high-visibility ripstop nylon parachute with aerodynamic spill hole to prevent oscillatory swinging.',
      ],
      completedMilestones: [
        'Selected Hexstar cross-canopy geometry for superior anti-oscillation dampening.',
        'Calculated canopy diameter: 48cm with central spill hole of 6cm diameter.',
        'Completed pull-testing on braided Kevlar suspension lines up to 25 kgf tension load.',
      ],
      technicalDetails: [
        { label: 'Canopy Geometry', value: 'Hexstar Cross Parachute' },
        { label: 'Calculated Descent Rate', value: '6.8 m/s (< 8.0 m/s threshold)' },
        { label: 'Suspension Lines', value: '8x Braided Kevlar Cords' },
        { label: 'Fabric Material', value: 'Ripstop Nylon (40 g/m²)' },
      ],
      quote:
        '"A stable parachute is critical. If the CanSat swings wildly in descent, our antenna radiation pattern drops out. The Hexstar design eliminates pendular oscillations."',
      nextSteps:
        'Fabricate the flight prototype and perform wind-tunnel and vertical drop test measurements.',
    },
  },
  {
    id: 'pdr-presentation',
    title: 'Workshop 3: Preliminary Design Review (PDR) Presentation',
    category: 'presentation',
    date: 'December 14, 2026',
    status: 'completed',
    readTime: '5 min read',
    author: 'Mohammad Shoaib',
    authorRole: 'Electrical Lead',
    tags: ['PDR', 'Electronics', 'Telemetry'],
    summary:
      'Completed and passed the Preliminary Design Review (PDR). Validated link budget for 433MHz LoRa downlink and secondary payload telemetry parser.',
    fullReport: {
      objectives: [
        'Deliver complete electrical schematic and power distribution network.',
        'Demonstrate link budget calculations ensuring ground station reception beyond 1.5 km line-of-sight.',
        'Present the primary and secondary battery safety isolation circuitry.',
      ],
      completedMilestones: [
        'Passed PDR evaluation milestone with 94% technical score.',
        'RF link margin calculated at +18 dB at 1.5 km altitude with 100mW transmission power.',
        'Integrated low-dropout 3.3V step-down regulator with reverse-polarity protection diode.',
      ],
      technicalDetails: [
        { label: 'Battery Chemistry', value: '2S 7.4V 500mAh LiPo' },
        { label: 'Operating Voltage', value: '3.3V Logic / 5V Sensor Rail' },
        { label: 'RF Output Power', value: '+20 dBm (100 mW)' },
        { label: 'Total Current Draw', value: '185 mA (Active Downlink)' },
      ],
      quote:
        '"Our telemetry link budget incorporates conservative atmospheric loss estimates to guarantee continuous ground station lock throughout descent."',
      nextSteps:
        'Begin prototype PCB etching, component surface mounting, and firmware interrupt optimization.',
    },
  },
  {
    id: 'avionics-groundstation',
    title: 'Workshop 4: Sensor Integration & Ground Station Calibration',
    category: 'engineering',
    date: 'January 15, 2026',
    status: 'completed',
    readTime: '4 min read',
    author: 'Mohammad Ali',
    authorRole: 'Software & Data Lead',
    tags: ['Ground Station', 'Firmware', 'Telemetry'],
    summary:
      'Built and calibrated the Ground Station receiver Yagi antenna. Achieved 100% telemetry decoding with live altitude, temperature, and GPS plotting.',
    fullReport: {
      objectives: [
        'Develop real-time packet parsing protocol with checksum validation (CRC-16).',
        'Interface directional handheld Yagi antenna to RTL-SDR / LoRa ground receiver.',
        'Test automated CSV data logging and live telemetry visualization dashboard.',
      ],
      completedMilestones: [
        'Zero packet loss recorded across 20-minute continuous transmitter stress test.',
        'Telemetry rate configured at 1 Hz compliant with official competition mandate.',
        'Integrated audio acoustic buzzer beacon for post-landing recovery locating.',
      ],
      technicalDetails: [
        { label: 'Baud Rate', value: '9600 bps over FSK/LoRa' },
        { label: 'Ground Station Antenna', value: '3-Element Yagi (7 dBi Gain)' },
        { label: 'Packet Checksum', value: 'CRC-16 Hardware Check' },
        { label: 'Recovery Beacon', value: '95 dB Piezo Buzzer' },
      ],
      quote:
        '"Receiving that first live packet from our CanSat avionics across campus with zero dropouts was a huge milestone for the software team!"',
      nextSteps:
        'Conduct outdoor range testing up to 1 km and assemble the flight enclosure for CDR.',
    },
  },
  {
    id: 'cdr-drop-testing',
    title: 'Critical Design Review (CDR) & Drone Drop Testing',
    category: 'engineering',
    date: 'February 2026',
    status: 'in_progress',
    readTime: '3 min read',
    author: 'Dr. Sateesh Kumar Nataraj',
    authorRole: 'Supervisor',
    tags: ['CDR', 'Flight Test', 'Drop Test'],
    summary:
      'Currently preparing the final flight unit for high-altitude tethered drone drop tests and the Critical Design Review (CDR) inspection.',
    fullReport: {
      objectives: [
        'Execute vertical drop tests from 150m and 300m via drone deployment.',
        'Verify instant parachute inflation within 0.8 seconds of ejection.',
        'Inspect structural integrity of 3D chassis upon impact and verify post-landing recovery beacon.',
      ],
      completedMilestones: [
        'Flight chassis printed with carbon-fiber reinforced PETG filament.',
        'Ejection switch mechanism verified with zero false triggers.',
        'Final CDR technical documentation submitted to the competition jury.',
      ],
      technicalDetails: [
        { label: 'Drop Test Platform', value: 'Heavy-Lift Quadcopter' },
        { label: 'Test Drop Altitudes', value: '150m & 300m AGL' },
        { label: 'Chassis Material', value: 'Carbon-PETG (30% infill)' },
        { label: 'Target Touchdown Speed', value: '6.5 m/s' },
      ],
      quote:
        '"The dedication shown by the students across engineering departments exemplifies the aerospace spirit. Team SKYLINK is on track for a spectacular launch!"',
      nextSteps:
        'Complete the final launch readiness review (LRR) and pack flight units for official launch day.',
    },
  },
];

export const BlogSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'workshop' | 'presentation' | 'engineering'>('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const filteredPosts = INITIAL_POSTS.filter(post => {
    if (selectedCategory === 'all') return true;
    return post.category === selectedCategory;
  });

  const getCategoryBadge = (cat: BlogPost['category']) => {
    switch (cat) {
      case 'workshop':
        return { label: 'Workshop', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'presentation':
        return { label: 'Defense & PDR', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'engineering':
        return { label: 'Engineering Log', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const getStatusBadge = (status: BlogPost['status']) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed ✅', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'in_progress':
        return { label: 'In Progress 🚀', color: 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse' };
      case 'upcoming':
        return { label: 'Upcoming ⏳', color: 'text-slate-500 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <section id="blog" className="py-16 px-4 sm:px-12 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bubbly font-semibold shadow-sm mb-3">
          <Rocket size={14} className="text-rose-500" />
          <span>OFFICIAL MISSION LOG & TIMELINE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bubbly font-bold text-slate-900 tracking-tight mb-3">
          The Road to 1,000 Meters 🛰️
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto font-medium">
          Follow our journey through every workshop, technical defense, parachute drop test, and engineering breakthrough for CanSat Bahrain 2026.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 font-bubbly text-xs font-semibold">
        <button
          onClick={() => {
            sound.playClick(600);
            setSelectedCategory('all');
          }}
          className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-rose-100'
          }`}
        >
          All Milestones ({INITIAL_POSTS.length})
        </button>
        <button
          onClick={() => {
            sound.playClick(600);
            setSelectedCategory('workshop');
          }}
          className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
            selectedCategory === 'workshop'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-rose-100'
          }`}
        >
          🛠️ Workshops
        </button>
        <button
          onClick={() => {
            sound.playClick(600);
            setSelectedCategory('presentation');
          }}
          className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
            selectedCategory === 'presentation'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-rose-100'
          }`}
        >
          📊 Presentations & PDR
        </button>
        <button
          onClick={() => {
            sound.playClick(600);
            setSelectedCategory('engineering');
          }}
          className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
            selectedCategory === 'engineering'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-rose-100'
          }`}
        >
          ⚡ Engineering Logs
        </button>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {filteredPosts.map(post => {
          const cat = getCategoryBadge(post.category);
          const stat = getStatusBadge(post.status);

          return (
            <div
              key={post.id}
              onClick={() => {
                sound.playClick(750);
                setSelectedPost(post);
              }}
              className="group bg-white/90 hover:bg-white border border-rose-100 hover:border-rose-300 rounded-[28px] p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Meta Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-bubbly font-semibold px-2.5 py-0.5 rounded-full border ${cat.bg}`}>
                    {cat.label}
                  </span>
                  <span className={`text-[10px] font-bubbly font-bold px-2.5 py-0.5 rounded-full border ${stat.color}`}>
                    {stat.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bubbly font-bold text-slate-900 text-lg group-hover:text-rose-600 transition-colors mb-2 leading-snug">
                  {post.title}
                </h3>

                {/* Summary */}
                <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
                  {post.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-rose-50 flex items-center justify-between text-xs text-slate-400 font-sans">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-rose-500" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1 font-bubbly font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
                  <span>Read Log</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL MISSION REPORT MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-rose-100 rounded-[32px] p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
            <button
              onClick={() => {
                sound.playClick(500);
                setSelectedPost(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto pr-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-bubbly font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(selectedPost.category).bg}`}>
                  {getCategoryBadge(selectedPost.category).label}
                </span>
                <span className={`text-[10px] font-bubbly font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(selectedPost.status).color}`}>
                  {getStatusBadge(selectedPost.status).label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono ml-auto">
                  {selectedPost.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bubbly font-bold text-slate-900 mb-2">
                {selectedPost.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-500 pb-4 mb-5 border-b border-rose-100">
                <span>By <strong className="text-slate-800">{selectedPost.author}</strong> ({selectedPost.authorRole})</span>
                <span>•</span>
                <span>{selectedPost.date}</span>
              </div>

              {/* Quote if present */}
              {selectedPost.fullReport.quote && (
                <div className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 border-l-4 border-rose-500 rounded-r-2xl mb-6 text-xs italic text-slate-700 leading-relaxed font-sans">
                  {selectedPost.fullReport.quote}
                </div>
              )}

              {/* Objectives */}
              <div className="mb-6">
                <h4 className="font-bubbly font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                  <Compass size={16} className="text-rose-500" />
                  <span>Workshop Objectives</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedPost.fullReport.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Completed Milestones */}
              <div className="mb-6">
                <h4 className="font-bubbly font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Milestones Completed</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedPost.fullReport.completedMilestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Specifications Grid */}
              <div className="mb-6">
                <h4 className="font-bubbly font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                  <Layers size={16} className="text-rose-500" />
                  <span>Technical Baseline</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedPost.fullReport.technicalDetails.map((item, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <span className="text-[10px] text-slate-400 block font-mono">{item.label}</span>
                      <span className="font-bold text-slate-800 text-xs">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs">
                <span className="font-bubbly font-bold text-rose-400 block mb-1">
                  Next Milestone Objective:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedPost.fullReport.nextSteps}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
