import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Compass,
  Layers,
  PlusCircle,
  Rocket,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  deleteBlogPost,
  getStoredBlogPosts,
  saveBlogPost,
} from '../utils/blogStorage';
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

  // Authoring Modal State
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // New Post Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'workshop' | 'presentation' | 'engineering'>('workshop');
  const [newDate, setNewDate] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newObjectives, setNewObjectives] = useState('');
  const [newMilestones, setNewMilestones] = useState('');
  const [newNextSteps, setNewNextSteps] = useState('');

  const refreshPosts = () => {
    setPosts(getStoredBlogPosts());
  };

  useEffect(() => {
    refreshPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredPosts = posts
    .filter(post => {
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

  const handleUnlockAuthoring = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'cansat2026' || passcode === 'admin') {
      setIsUnlocked(true);
      setAuthError('');
      sound.playFanfare();
    } else {
      setAuthError('Incorrect organizer passcode (default: cansat2026)');
      sound.playCrash();
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const postObj: BlogPost = {
      id: 'post-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      date: newDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'completed',
      author: newAuthor.trim() || 'Team SKYLINK',
      authorRole: newRole.trim() || 'Engineering Team',
      tags: ['SKYLINK', 'CanSat2026', newCategory],
      summary: newSummary.trim(),
      fullReport: {
        objectives: newObjectives.split('\n').filter(s => s.trim().length > 0),
        completedMilestones: newMilestones.split('\n').filter(s => s.trim().length > 0),
        technicalDetails: [
          { label: 'Category', value: newCategory.toUpperCase() },
          { label: 'Logged Date', value: newDate.trim() || 'Today' },
        ],
        nextSteps: newNextSteps.trim() || 'Continue technical integration for next milestone.',
      },
    };

    saveBlogPost(postObj);
    refreshPosts();
    sound.playFanfare();
    setCreateModalOpen(false);

    // Reset fields
    setNewTitle('');
    setNewSummary('');
    setNewObjectives('');
    setNewMilestones('');
    setNewNextSteps('');
  };

  const handleDeletePost = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this mission log?')) {
      deleteBlogPost(id);
      refreshPosts();
      sound.playClick(400);
      if (selectedPost?.id === id) setSelectedPost(null);
    }
  };

  return (
    <div className="w-full font-sans pb-16">
      {/* Top Banner Navigation - Ultra Clean & Minimal */}
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

        <button
          onClick={() => {
            sound.playClick(750);
            setCreateModalOpen(true);
          }}
          className="px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white font-bubbly text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle size={14} className="text-rose-400" />
          <span>Add Mission Log</span>
        </button>
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
          Documenting team progress, technical workshops, and our current CAD & 3D printing prototyping session toward the Preliminary Design Review.
        </p>

        {/* Milestone Progress Bar */}
        <div className="mt-8 p-5 bg-white/95 border border-rose-100 rounded-3xl shadow-sm text-left">
          <div className="flex items-center justify-between mb-3 text-xs font-bubbly font-bold text-slate-800">
            <span>Competition Milestones Progress</span>
            <span className="text-rose-600">Current Phase: CAD & 3D Printing Prototyping 🛠️</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-sans text-[11px]">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
              <span className="text-emerald-700 font-bold block">1. MCR Review</span>
              <span className="text-slate-400 text-[10px]">Sun 1 Nov</span>
              <span className="text-emerald-600 font-bold text-[10px] block mt-0.5">COMPLETED ✓</span>
            </div>
            <div className="bg-rose-50 border-2 border-rose-400 rounded-xl p-2.5 shadow-sm">
              <span className="text-rose-700 font-bold block">2. PDR Review</span>
              <span className="text-rose-500 text-[10px]">Sun 15 Nov</span>
              <span className="text-rose-600 font-bold text-[10px] block mt-0.5 animate-pulse">CAD PRINTING 🛠️</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 opacity-80">
              <span className="text-slate-700 font-bold block">3. CDR Review</span>
              <span className="text-slate-400 text-[10px]">Sun 22 Nov</span>
              <span className="text-slate-400 font-bold text-[10px] block mt-0.5">UPCOMING</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 opacity-60">
              <span className="text-slate-700 font-bold block">4. SIR / FRR</span>
              <span className="text-slate-400 text-[10px]">Wed 9 Dec</span>
              <span className="text-slate-400 text-[10px] block mt-0.5">PENDING</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 opacity-60 col-span-2 sm:col-span-1">
              <span className="text-slate-700 font-bold block">5. Launch Day 🚀</span>
              <span className="text-slate-400 text-[10px]">Sat 12 Dec</span>
              <span className="text-slate-400 text-[10px] block mt-0.5">FINALS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 sm:px-12 max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Pills */}
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
            placeholder="Search workshops, CAD, PDR..."
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
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        {post.sessionNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {post.status === 'in_progress' ? (
                      <span className="text-[10px] font-bubbly font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full animate-pulse">
                        In Progress 🛠️
                      </span>
                    ) : post.status === 'upcoming' ? (
                      <span className="text-[10px] font-bubbly font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                        Upcoming ⏳
                      </span>
                    ) : (
                      <span className="text-[10px] font-bubbly font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Completed ✓
                      </span>
                    )}
                    {post.id.startsWith('custom-') && (
                      <button
                        onClick={(e) => handleDeletePost(post.id, e)}
                        title="Delete log entry"
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
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
                <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-3">
                  {post.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-mono"
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
                  <span>Read Full Report</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL REPORT MODAL */}
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

            {/* Modal Body */}
            <div className="overflow-y-auto pr-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-bubbly font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(selectedPost.category).bg}`}>
                  {getCategoryBadge(selectedPost.category).label}
                </span>
                {selectedPost.sessionNumber && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
                    {selectedPost.sessionNumber}
                  </span>
                )}
                {selectedPost.status === 'in_progress' ? (
                  <span className="text-[10px] font-bubbly font-bold px-2.5 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 ml-auto animate-pulse">
                    Current Active Session 🛠️
                  </span>
                ) : selectedPost.status === 'upcoming' ? (
                  <span className="text-[10px] font-bubbly font-bold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 ml-auto">
                    Scheduled / Upcoming ⏳
                  </span>
                ) : (
                  <span className="text-[10px] font-bubbly font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 ml-auto">
                    Completed & Verified ✓
                  </span>
                )}
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

              {/* Quote */}
              {selectedPost.fullReport.quote && (
                <div className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 border-l-4 border-rose-500 rounded-r-2xl mb-6 text-xs italic text-slate-700 leading-relaxed">
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

              {/* Milestones Completed */}
              <div className="mb-6">
                <h4 className="font-bubbly font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Deliverables & Milestones Completed</span>
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

              {/* Technical Specifications */}
              <div className="mb-6">
                <h4 className="font-bubbly font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                  <Layers size={16} className="text-rose-500" />
                  <span>Technical Data & Verified Budgets</span>
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

      {/* CREATE LOG MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-rose-100 rounded-[32px] p-6 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col font-sans">
            <button
              onClick={() => {
                setCreateModalOpen(false);
                setIsUnlocked(false);
                setPasscode('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            {!isUnlocked ? (
              <form onSubmit={handleUnlockAuthoring} className="py-6 text-center max-w-sm mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
                  <Sparkles size={28} />
                </div>
                <h3 className="font-bubbly font-bold text-xl text-slate-900">
                  Organizer & Lead Authoring
                </h3>
                <p className="text-xs text-slate-500">
                  Enter team passcode to publish a new mission log or workshop report.
                </p>
                <input
                  type="password"
                  placeholder="Passcode (default: cansat2026)"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-xs font-mono"
                  autoFocus
                />
                {authError && <div className="text-rose-600 text-xs font-mono">{authError}</div>}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Unlock Authoring
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreatePost} className="overflow-y-auto space-y-3.5 pr-1">
                <h3 className="font-bubbly font-bold text-lg text-slate-900 mb-1">
                  Publish New Mission Update
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Critical Design Review Presentation"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="workshop">Workshop</option>
                      <option value="presentation">Presentation & Review</option>
                      <option value="engineering">Engineering & CAD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nov 22, 2026"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                      Author Lead
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mohsin Akil"
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mechanical Lead"
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                    Summary / Key Findings <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Brief description of the workshop or presentation results..."
                    value={newSummary}
                    onChange={e => setNewSummary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                    Completed Milestones (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Milestone 1&#10;Milestone 2"
                    value={newMilestones}
                    onChange={e => setNewMilestones(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 font-bubbly mb-1">
                    Next Steps
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prepare flight hardware for CDR drop test"
                    value={newNextSteps}
                    onChange={e => setNewNextSteps(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bubbly font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bubbly font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                  >
                    Publish Log Live 🚀
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
