import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Compass,
  Layers,
  Rocket,
  Search,
  X,
} from 'lucide-react';
import { getStoredBlogPosts } from '../utils/blogStorage';
import type { BlogPost } from '../utils/blogStorage';
import { sound } from '../utils/audio';

interface BlogPageProps {
  onBackToArcade: () => void;
  onOpenGame?: (gameId: any) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onBackToArcade }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'workshop' | 'presentation' | 'engineering'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const refreshPosts = () => {
    setPosts(getStoredBlogPosts());
  };

  useEffect(() => {
    refreshPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredPosts = posts.filter(post => {
    if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryBadge = (cat: BlogPost['category']) => {
    switch (cat) {
      case 'workshop':
        return { label: '🛠️ Workshop', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'presentation':
        return { label: '📊 Milestone Review', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'engineering':
        return { label: '⚡ Engineering & CAD', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { label: 'Outreach', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <div className="w-full font-sans pb-16">
      {/* Top Banner Navigation - Clean & Official */}
      <div className="pt-6 pb-4 px-6 sm:px-12 flex items-center justify-between border-b border-rose-100/60">
        <button
          onClick={() => {
            sound.playClick(800);
            onBackToArcade();
          }}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bubbly font-bold rounded-full border border-rose-200/80 shadow-sm flex items-center gap-2 cursor-pointer text-xs sm:text-sm bubble-btn"
        >
          <ArrowLeft size={16} className="text-rose-500" />
          <span>Back to Home</span>
        </button>

        <div className="text-xs font-bubbly font-semibold text-slate-500 flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Official Mission Journal</span>
        </div>
      </div>

      {/* Main Page Hero */}
      <div className="pt-10 pb-8 px-6 sm:px-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bubbly font-semibold shadow-sm mb-4">
          <Rocket size={14} className="text-rose-500 animate-bounce" />
          <span>CanSat Bahrain Competition 2026 • Official Mission Log</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bubbly font-bold text-slate-900 tracking-tight mb-3">
          Team SKYLINK Mission Blog 🛰️
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Documenting team progress, technical workshops, and our active transition into the Critical Design Review (CDR) following our successful PDR defense.
        </p>

        {/* Milestone Progress Bar */}
        <div className="mt-8 p-5 bg-white/95 border border-rose-100 rounded-3xl shadow-sm text-left">
          <div className="flex items-center justify-between mb-3 text-xs font-bubbly font-bold text-slate-800">
            <span>Competition Milestones Progress</span>
            <span className="text-rose-600 font-bold">Active Phase: Critical Design Review (CDR) ⚙️</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-sans text-[11px]">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
              <span className="text-emerald-700 font-bold block">1. MCR Review</span>
              <span className="text-slate-400 text-[10px]">Sun 1 Nov</span>
              <span className="text-emerald-600 font-bold text-[10px] block mt-0.5">COMPLETED ✓</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 shadow-sm">
              <span className="text-emerald-700 font-bold block">2. PDR Review</span>
              <span className="text-slate-400 text-[10px]">Mid Nov</span>
              <span className="text-emerald-600 font-bold text-[10px] block mt-0.5">COMPLETED ✓</span>
            </div>
            <div className="bg-rose-50 border-2 border-rose-400 rounded-xl p-2.5 shadow-sm">
              <span className="text-rose-700 font-bold block">3. CDR Review</span>
              <span className="text-rose-600 text-[10px] font-semibold">Late Nov (Now)</span>
              <span className="text-rose-600 font-bold text-[10px] block mt-0.5 animate-pulse">UNDERWAY ⚙️</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 opacity-80">
              <span className="text-slate-700 font-bold block">4. SIR / FRR</span>
              <span className="text-slate-400 text-[10px]">Early Dec</span>
              <span className="text-slate-400 font-bold text-[10px] block mt-0.5">UPCOMING</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 opacity-60 col-span-2 sm:col-span-1">
              <span className="text-slate-700 font-bold block">5. Launch Day 🚀</span>
              <span className="text-slate-400 text-[10px]">December 2026</span>
              <span className="text-slate-400 text-[10px] block mt-0.5">FINALS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 sm:px-12 max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-bubbly text-xs font-semibold">
          <button
            onClick={() => {
              sound.playClick(600);
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-rose-100'
            }`}
          >
            All Logs ({posts.length})
          </button>
          <button
            onClick={() => {
              sound.playClick(600);
              setSelectedCategory('workshop');
            }}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              selectedCategory === 'workshop'
                ? 'bg-rose-500 text-white shadow-sm'
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
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              selectedCategory === 'presentation'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-rose-100'
            }`}
          >
            📊 Presentations
          </button>
          <button
            onClick={() => {
              sound.playClick(600);
              setSelectedCategory('engineering');
            }}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              selectedCategory === 'engineering'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-rose-100'
            }`}
          >
            ⚡ Engineering & CAD
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search CDR, PDR, parachute, CAD..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-rose-100 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 shadow-sm"
          />
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="px-6 sm:px-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {filteredPosts.map(post => {
          const cat = getCategoryBadge(post.category);

          return (
            <div
              key={post.id}
              onClick={() => {
                sound.playClick(750);
                setSelectedPost(post);
              }}
              className="group bg-white hover:bg-slate-50/50 border border-rose-100/90 hover:border-rose-300 rounded-[28px] p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Meta Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bubbly font-semibold px-2.5 py-0.5 rounded-full border ${cat.bg}`}>
                      {cat.label}
                    </span>
                    {post.sessionNumber && (
                      <span className="text-[10px] font-mono text-slate-400 font-medium">
                        {post.sessionNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {post.status === 'in_progress' ? (
                      <span className="text-[10px] font-bubbly font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full animate-pulse">
                        Active Phase ⚡
                      </span>
                    ) : post.status === 'upcoming' ? (
                      <span className="text-[10px] font-bubbly font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        Upcoming ⏳
                      </span>
                    ) : (
                      <span className="text-[10px] font-bubbly font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Completed ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bubbly font-bold text-slate-900 text-lg group-hover:text-rose-600 transition-colors mb-2 leading-snug">
                  {post.title}
                </h3>

                {/* Summary */}
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-4">
                  {post.summary}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-rose-50/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-rose-400" />
                  <span>{post.date}</span>
                </div>
                <div className="font-bubbly font-bold text-rose-500 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Read Report →
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-rose-100 rounded-[32px] p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col font-sans">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1.5 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="mb-4 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`text-[11px] font-bubbly font-semibold px-2.5 py-0.5 rounded-full border ${
                    getCategoryBadge(selectedPost.category).bg
                  }`}
                >
                  {getCategoryBadge(selectedPost.category).label}
                </span>
                {selectedPost.sessionNumber && (
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedPost.sessionNumber}
                  </span>
                )}
                <span className="text-[11px] text-slate-400">• {selectedPost.date}</span>
              </div>

              <h2 className="font-bubbly font-bold text-xl sm:text-2xl text-slate-900 leading-snug">
                {selectedPost.title}
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Authored by{' '}
                <strong className="text-slate-700">{selectedPost.author}</strong> ({selectedPost.authorRole})
                {selectedPost.trainerOrLocation && (
                  <span> • {selectedPost.trainerOrLocation}</span>
                )}
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto space-y-5 pr-1 scrollbar-thin text-xs text-slate-700 leading-relaxed">
              {/* Executive Summary */}
              <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl">
                <h4 className="font-bubbly font-bold text-slate-800 text-xs mb-1 flex items-center gap-1.5">
                  <Compass size={14} className="text-rose-500" />
                  Mission Executive Summary
                </h4>
                <p className="text-slate-700">{selectedPost.summary}</p>
              </div>

              {/* Objectives */}
              {selectedPost.fullReport.objectives && selectedPost.fullReport.objectives.length > 0 && (
                <div>
                  <h4 className="font-bubbly font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                    <Layers size={14} className="text-rose-500" />
                    Key Session Objectives
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {selectedPost.fullReport.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Completed Milestones */}
              {selectedPost.fullReport.completedMilestones &&
                selectedPost.fullReport.completedMilestones.length > 0 && (
                  <div>
                    <h4 className="font-bubbly font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Key Milestones & Deliverables
                    </h4>
                    <div className="space-y-1.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl p-3.5">
                      {selectedPost.fullReport.completedMilestones.map((ms, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-800">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{ms}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Quote */}
              {selectedPost.fullReport.quote && (
                <blockquote className="border-l-4 border-rose-400 pl-3.5 italic text-slate-600 py-1 bg-slate-50/70 rounded-r-xl">
                  {selectedPost.fullReport.quote}
                </blockquote>
              )}

              {/* Technical Specifications Matrix */}
              <div>
                <h4 className="font-bubbly font-bold text-slate-900 text-xs mb-2">
                  Technical Specifications & Review Matrix
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
              <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs mb-4">
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
    </div>
  );
};