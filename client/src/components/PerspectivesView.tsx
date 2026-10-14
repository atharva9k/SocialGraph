import React, { useState, useEffect } from 'react';
import type { Space, Perspective } from '../types';
import { api } from '../api';
import { BookOpen, PlusCircle } from 'lucide-react';

interface PerspectivesViewProps {
  activeSpace: Space | null;
  onViewSpace: (handle: string) => void;
}

export const PerspectivesView: React.FC<PerspectivesViewProps> = ({
  activeSpace,
  onViewSpace
}) => {
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [argument, setArgument] = useState('');
  const [stanceLabel, setStanceLabel] = useState<'Perspective A' | 'Perspective B' | 'Perspective C'>('Perspective A');
  const [sources, setSources] = useState('');

  useEffect(() => {
    loadPerspectives();
  }, []);

  const loadPerspectives = async () => {
    setLoading(true);
    try {
      const res = await api.getPerspectives('pst_ai_debate_1');
      setPerspectives(res.perspectives);
    } catch (err) {
      console.error('Error loading perspectives', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerspective = async () => {
    if (!title.trim() || !argument.trim() || !activeSpace) return;
    try {
      await api.addPerspective('pst_ai_debate_1', {
        space_id: activeSpace.id,
        stance_label: stanceLabel,
        title: title.trim(),
        argument: argument.trim(),
        evidence_sources: sources.split(',').map(s => s.trim()).filter(Boolean)
      });
      setShowAddModal(false);
      setTitle('');
      setArgument('');
      setSources('');
      loadPerspectives();
    } catch (err) {
      console.error('Error adding perspective', err);
    }
  };

  const stanceBanners: Record<string, { bg: string; text: string; border: string }> = {
    'Perspective A': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'Perspective B': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Perspective C': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/10 backdrop-blur-xs text-indigo-200 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-white/10">
              Discourse Core
            </span>
            <span className="text-indigo-300 text-xs">Don't manufacture consensus. Facilitate informed disagreement.</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Multi-Perspective Discourse</h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
            SocialGraph doesn't tell people what is correct. For complex technological and social questions, we surface balanced arguments side-by-side with verified evidence.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Contribute View</span>
        </button>
      </div>

      {/* Featured Debate Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            Open National Discourse
          </span>
          <span className="text-xs text-slate-400">Curated Topic</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Will Automated Code Synthesis & LLMs Replace Engineers, or Catalyze Systems Engineering?
        </h2>

        {loading ? (
          <p className="text-slate-400 text-sm py-8 text-center">Loading perspective clusters...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {perspectives.map(p => {
              const banner = stanceBanners[p.stance_label] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
              return (
                <div 
                  key={p.id}
                  className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${banner.bg} ${banner.text} ${banner.border}`}>
                        {p.stance_label}
                      </span>
                      <span 
                        onClick={() => onViewSpace(p.space.handle)}
                        className="text-[10px] text-slate-400 hover:text-indigo-600 cursor-pointer font-medium"
                      >
                        @{p.space.handle}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {p.title}
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {p.argument}
                    </p>
                  </div>

                  {/* Sources / Evidence Citations */}
                  {p.evidence_sources && p.evidence_sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        <span>Evidence & References</span>
                      </div>
                      <ul className="space-y-1">
                        {p.evidence_sources.map((s, idx) => (
                          <li key={idx} className="text-[11px] text-indigo-900/80 font-medium bg-white/80 p-1.5 rounded-lg border border-slate-200/50">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Perspective Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Add Stance to Discourse</h3>
            <p className="text-xs text-slate-500">Provide a well-reasoned argument supported by evidence. Avoid abuse or ad-hominem attacks.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Stance Classification</label>
                <div className="flex gap-2">
                  {(['Perspective A', 'Perspective B', 'Perspective C'] as const).map(stance => (
                    <button
                      key={stance}
                      type="button"
                      onClick={() => setStanceLabel(stance)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        stanceLabel === stance 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {stance}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Core Thesis / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Demand elasticity ensures net engineering job expansion"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Argument & Reasoning</label>
                <textarea
                  rows={3}
                  placeholder="Detail the technical or empirical mechanism..."
                  value={argument}
                  onChange={e => setArgument(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Supporting Sources (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. ACM Journal 2025, Bureau of Labor Statistics"
                  value={sources}
                  onChange={e => setSources(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPerspective}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Publish Perspective
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
