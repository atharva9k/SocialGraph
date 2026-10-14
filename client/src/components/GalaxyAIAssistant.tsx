import React, { useState } from 'react';
import { api } from '../api';
import type { AppTheme, SpaceDisplayMode } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  CheckCircle2
} from 'lucide-react';

interface GalaxyAIAssistantProps {
  onDraftPost?: (content: string) => void;
}

export const GalaxyAIAssistant: React.FC<GalaxyAIAssistantProps> = ({ onDraftPost }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; action?: any }>>([
    {
      sender: 'ai',
      text: "Greetings, Commander! I am your in-app Galaxy AI. Tell me to customize your theme (Galaxy, Cyber Dark, Light, Synthwave), switch space views to planetary orbits, write posts, or explore trending signals. What would you like to command?"
    }
  ]);

  const { setTheme, setSpaceMode, setParticlesEnabled, triggerWarp } = useTheme();

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.askGalaxyAi(userMsg);
      
      // Execute any returned action dynamically!
      if (res.action) {
        if (res.action.type === 'SET_THEME') {
          triggerWarp();
          setTheme(res.action.theme as AppTheme);
        } else if (res.action.type === 'SET_SPACE_MODE') {
          setSpaceMode(res.action.mode as SpaceDisplayMode);
        } else if (res.action.type === 'SET_PARTICLES') {
          setParticlesEnabled(res.action.enabled);
        } else if (res.action.type === 'DRAFT_POST' && onDraftPost) {
          onDraftPost(res.action.content);
        }
      }

      setMessages(prev => [...prev, { sender: 'ai', text: res.reply, action: res.action }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "Subspace link interrupted. Please try another command, Commander!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🌌 Cosmic Galaxy Theme', prompt: 'Change theme to cosmic galaxy with stars' },
    { label: '⚡ Neon Synthwave', prompt: 'Switch theme to neon synthwave' },
    { label: '🌑 Minimalist Obsidian', prompt: 'Switch to obsidian cyber dark theme' },
    { label: '☀️ Clean Light', prompt: 'Switch to clean editorial light theme' },
    { label: '🪐 Planetary Orbit Mode', prompt: 'Switch my spaces to planetary orbit mode' },
    { label: '✍️ Draft Tech Post', prompt: 'Write a cool post about robotics and quantum sensors' }
  ];

  return (
    <>
      {/* Floating Meta-AI style Cosmic Orb Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 group flex items-center gap-2 p-1 pl-3.5 pr-4 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 shadow-[0_0_35px_rgba(168,85,247,0.7)] hover:shadow-[0_0_50px_rgba(6,182,212,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 select-none cursor-pointer"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="absolute -inset-1 rounded-full border border-cyan-400/60 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
          </div>
          <span className="font-extrabold text-xs text-white tracking-wide">Galaxy AI</span>
        </button>
      )}

      {/* Slide-out Meta-AI Command Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[85vh] h-[600px] flex flex-col rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-violet-500/30 shadow-[0_0_60px_rgba(139,92,246,0.35)] overflow-hidden select-none animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-900/40 via-fuchsia-900/20 to-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-violet-500 to-fuchsia-500 p-0.5 shadow-md shadow-violet-500/50">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  Galaxy AI
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-mono border border-cyan-500/40">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Meta AI-style app customizer & copilot</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Command Chips */}
          <div className="p-2.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-violet-500/10 hover:bg-violet-500/25 border border-violet-500/30 text-[10px] font-semibold text-violet-200 transition-all active:scale-95 flex items-center gap-1 flex-shrink-0"
              >
                <span>{q.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => {
              const isAi = m.sender === 'ai';
              return (
                <div key={idx} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    isAi
                      ? 'bg-slate-900/90 text-slate-200 border border-violet-500/30 rounded-tl-xs shadow-md'
                      : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-tr-xs shadow-md shadow-violet-500/30'
                  }`}>
                    {isAi && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1 font-bold">
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        <span>Galaxy AI</span>
                      </div>
                    )}
                    <p>{m.text}</p>
                    {m.action && (
                      <div className="mt-2 pt-2 border-t border-violet-500/20 text-[10px] text-cyan-300 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Executed: {m.action.type}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-slate-900 border border-violet-500/30 text-cyan-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Synthesizing command...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center gap-2">
            <input
              type="text"
              placeholder="Command AI (e.g. 'Make it neon synthwave', 'Write a post')..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-950 border border-violet-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40 text-white shadow-md shadow-violet-500/30 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
