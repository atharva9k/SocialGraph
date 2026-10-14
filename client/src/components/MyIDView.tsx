import React, { useState, useEffect } from 'react';
import type { Space, IdeaCanvas } from '../types';
import { api } from '../api';
import { Lightbulb, Wrench, AlertTriangle, ShieldCheck, UserPlus, CheckCircle2 } from 'lucide-react';

interface MyIDViewProps {
  activeSpace: Space | null;
  onOpenCreateIdea: () => void;
  onSendCollaborationRequest: (targetSpaceId: string, ideaTitle: string) => void;
}

export const MyIDView: React.FC<MyIDViewProps> = ({
  activeSpace,
  onOpenCreateIdea,
  onSendCollaborationRequest
}) => {
  const [ideas, setIdeas] = useState<Array<{ canvas: IdeaCanvas; space: Space }>>([]);
  const [selectedCanvas, setSelectedCanvas] = useState<IdeaCanvas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const res = await api.getFeed(activeSpace?.id || 'spc_arjun_robotics', 'idea');
      const loaded: Array<{ canvas: IdeaCanvas; space: Space }> = [];
      for (const p of res.posts) {
        try {
          const detail = await api.getIdea(p.id);
          loaded.push({ canvas: detail.canvas, space: p.space });
        } catch (e) {
          // ignore post if no canvas
        }
      }
      setIdeas(loaded);
      if (loaded.length > 0 && !selectedCanvas) {
        setSelectedCanvas(loaded[0].canvas);
      }
    } catch (err) {
      console.error('Error fetching MyID ideas', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    concept: 'bg-amber-100 text-amber-800 border-amber-200',
    research: 'bg-sky-100 text-sky-800 border-sky-200',
    teaming: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    building: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Innovation Engine
            </span>
            <span className="text-white/80 text-xs">Ideas → Research → People → Projects</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">MyID Problem & Idea Canvas</h1>
          <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-xl">
            Not every idea has to be built by the person who imagined it. Document practical problems, review prior-art, and assemble engineering teams.
          </p>
        </div>

        <button
          onClick={onOpenCreateIdea}
          className="self-start sm:self-center px-5 py-2.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Lightbulb className="w-4 h-4" />
          <span>Publish MyID Idea</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading MyID innovation canvases...
        </div>
      ) : ideas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 text-sm font-semibold">No MyID canvases published yet.</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to publish a structured engineering problem!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ideas List Sidebar */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Project Canvases ({ideas.length})
            </h3>
            {ideas.map(({ canvas, space }) => (
              <div
                key={canvas.id}
                onClick={() => setSelectedCanvas(canvas)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedCanvas?.id === canvas.id
                    ? 'bg-amber-50/70 border-amber-300 shadow-sm ring-1 ring-amber-400'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${statusColors[canvas.status] || 'bg-slate-100 text-slate-700'}`}>
                    {canvas.status}
                  </span>
                  <span className="text-[10px] text-slate-400">@{space.handle}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                  {canvas.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {canvas.problem}
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Idea Canvas Card */}
          {selectedCanvas && (
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${statusColors[selectedCanvas.status]}`}>
                      Status: {selectedCanvas.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {selectedCanvas.title}
                  </h2>
                </div>

                <button
                  onClick={() => onSendCollaborationRequest(selectedCanvas.space_id, selectedCanvas.title)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all self-start whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Request to Collaborate</span>
                </button>
              </div>

              {/* 1. Problem Statement */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Real-World Problem</span>
                </h4>
                <p className="text-sm text-slate-800 bg-rose-50/40 border border-rose-100 p-3.5 rounded-xl leading-relaxed">
                  {selectedCanvas.problem}
                </p>
              </div>

              {/* 2. Proposed Solution */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proposed Solution & Architecture</span>
                </h4>
                <p className="text-sm text-slate-800 bg-emerald-50/40 border border-emerald-100 p-3.5 rounded-xl leading-relaxed">
                  {selectedCanvas.proposed_solution}
                </p>
              </div>

              {/* 3. Grid: Existing Prior Art & Differentiation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Known Existing Solutions (Prior Art)
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedCanvas.existing_solutions}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
                    What Makes This Different
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedCanvas.differentiation}
                  </p>
                </div>
              </div>

              {/* 4. AI Prior-Art & Evidence Synthesis */}
              {selectedCanvas.ai_prior_art_summary && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <h5 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                      Automated Prior-Art & Risk Analysis
                    </h5>
                  </div>
                  <p className="text-xs text-blue-900 leading-relaxed">
                    {selectedCanvas.ai_prior_art_summary}
                  </p>
                </div>
              )}

              {/* 5. Required Skillsets for Teaming */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <Wrench className="w-4 h-4" />
                  <span>Teaming Needs: Required Engineering Skills</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCanvas.required_skills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
