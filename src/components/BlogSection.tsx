import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Compass,
  ExternalLink,
  Layers,
  Mail,
  Rocket,
  X,
} from 'lucide-react';
import { getStoredBlogPosts } from '../utils/blogStorage';
import type { BlogPost } from '../utils/blogStorage';
import { sound } from '../utils/audio';

interface BlogSectionProps {
  onOpenFullBlog?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onOpenFullBlog }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'workshop' | 'presentation' | 'engineering'
  >('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    setPosts(getStoredBlogPosts());
  }, []);

  const filteredPosts = posts.filter(post => {
    if (selectedCategory === 'all') return true;
    return post.category === selectedCategory;
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
    <section id="blog" className="py-16 px-4 sm:px-12 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bubbly font-semibold shadow-sm mb-3">
          <Rocket size={14} className="text-rose-500" />
          <span>CAN-SAT BAHRAIN 2026 • OFFICIAL OUTREACH LOG</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bubbly font-bold text-slate-900 tracking-tight mb-3">
          Mission Blog & Engineering Logs 🛰️
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto font-medium">
          Follow Team SKYLINK’s journey through every workshop, technical defense, and prototype milestone completed until the week of PDR.
        </p>

        {/* Outreach Evidence Links (Linktree & Official Email) */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <a
            href="https://linktr.ee/qr/2a450f9d-f8f9-4041-bca6-d3176b9d65b6"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bubbly font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span>🌲</span>
            <span>Linktree Link-in-Bio</span>
            <ExternalLink size={12} className="opacity-70" />
          </a>

          <a
            href="mailto:skylinkutb@gmail.com"
            className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bubbly font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Mail size={13} className="text-rose-500" />
            <span>skylinkutb@gmail.com</span>
          </a>

          {onOpenFullBlog && (
            <button
              onClick={() => {
                sound.playClick(800);
                onOpenFullBlog();
              }}
              className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white font-bubbly font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Dedicated Blog Page →</span>
            </button>
          )}
        </div>
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
          All Completed Milestones ({posts.length})
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
          ⚡ Engineering & CAD
        </button>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {filteredPosts.slice(0, 6).map(post => {
          const cat = getCategoryBadge(post.category);

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
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bubbly font-semibold px-2.5 py-0.5 rounded-full border ${cat.bg}`}>
                      {cat.label}
                    </span>
                    {post.sessionNumber && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        {post.sessionNumber}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bubbly font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Completed ✓
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bubbly font-bold text-slate-900 text-lg group-hover:text-rose-600 transition-colors mb-2 leading-snug">
                  {post.title}
                </h3>

                {/* Trainer / Location info */}
                {post.trainerOrLocation && (
                  <p className="text-[11px] text-slate-400 mb-2 font-medium">
                    📍 {post.trainerOrLocation}
                  </p>
                )}

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

      {/* Button to view all posts on dedicated page */}
      {onOpenFullBlog && posts.length > 6 && (
        <div className="text-center pt-2">
          <button
            onClick={() => {
              sound.playClick(800);
              onOpenFullBlog();
            }}
            className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bubbly font-bold rounded-full border border-rose-200 shadow-sm transition-all bubble-btn cursor-pointer text-xs sm:text-sm"
          >
            View All {posts.length} Milestone Reports on Dedicated Blog Page →
          </button>
        </div>
      )}

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
                {selectedPost.sessionNumber && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                    {selectedPost.sessionNumber}
                  </span>
                )}
                <span className="text-[10px] font-bubbly font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 ml-auto">
                  Completed & Verified ✓
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bubbly font-bold text-slate-900 mb-2">
                {selectedPost.title}
              </h2>

              {selectedPost.trainerOrLocation && (
                <p className="text-xs text-rose-600 font-medium mb-3">
                  📍 {selectedPost.trainerOrLocation}
                </p>
              )}

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
                  <span>Session Objectives</span>
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
                  <span>Technical Data & Budgets</span>
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
