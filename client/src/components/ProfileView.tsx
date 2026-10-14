import React, { useState, useEffect } from 'react';
import type { Space, Post, User } from '../types';
import { api } from '../api';
import { 
  Lock, 
  Globe, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  Settings as SettingsIcon,
  Film,
  Image as ImageIcon,
  Grid,
  Heart,
  Share2,
  Users,
  Zap,
  ShieldCheck,
  Rocket
} from 'lucide-react';

interface ProfileViewProps {
  space: Space | null;
  user: User | null;
  spaces?: Space[];
  posts: Post[];
  onOpenSettings: () => void;
  onOpenCreateSpace: () => void;
  onSelectSpace?: (space: Space) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  space,
  user,
  spaces = [],
  posts,
  onOpenSettings,
  onOpenCreateSpace,
  onSelectSpace
}) => {
  const [activeContentTab, setActiveContentTab] = useState<'posts' | 'reels' | 'photos'>('posts');
  const [stats, setStats] = useState<{ followers: number; following: number; postCount: number }>({
    followers: 8400,
    following: 320,
    postCount: 124
  });

  useEffect(() => {
    if (space?.handle) {
      api.getSpaceProfile(space.handle)
        .then(res => {
          if (res?.stats) {
            setStats({
              followers: res.stats.followers || 8400,
              following: res.stats.following || 320,
              postCount: res.stats.postCount || posts.length
            });
          }
        })
        .catch(() => {});
    }
  }, [space?.handle, posts.length]);

  const spacePosts = posts.filter(p => !space || p.space_id === space.id || p.space?.handle === space.handle);
  const spaceReels = spacePosts.filter(p => p.content_type === 'reel' || p.media_urls?.some(u => u.endsWith('.mp4')));

  // Orbital satellites (nodes in the orbit around the central user globe)
  const orbitalNodes = [
    { label: 'Posts', value: `${stats.postCount}`, icon: ImageIcon, color: 'from-cyan-400 to-blue-500', angle: -90, borderCol: 'border-cyan-400' },
    { label: 'Interests', value: '12+', icon: Sparkles, color: 'from-emerald-400 to-teal-500', angle: -38, borderCol: 'border-emerald-400' },
    { label: 'Likes', value: '1.2K', icon: Heart, color: 'from-pink-500 to-rose-500', angle: 15, borderCol: 'border-pink-500' },
    { label: 'Views', value: '48.7K', icon: Zap, color: 'from-blue-400 to-cyan-500', angle: 65, borderCol: 'border-blue-400' },
    { label: 'Communities', value: '6', icon: Users, color: 'from-cyan-400 to-teal-400', angle: 90, borderCol: 'border-cyan-400' },
    { label: 'Projects', value: '30', icon: Rocket, color: 'from-amber-400 to-orange-500', angle: 140, borderCol: 'border-amber-400' },
    { label: 'Connections', value: `${stats.following}`, icon: Share2, color: 'from-purple-400 to-indigo-500', angle: 195, borderCol: 'border-purple-400' },
  ];

  const isPersonal = space?.visibility === 'private' || space?.handle.includes('personal') || space?.name.toLowerCase().includes('personal');

  return (
    <div className="max-w-[540px] mx-auto py-4 px-3 sm:px-4 text-white pb-24">
      {/* Top Header Card */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <img
              src={space?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + (space?.handle || 'me')}
              alt=""
              className="w-full h-full rounded-[14px] object-cover bg-slate-950"
            />
          </div>
          <div>
            <h1 className="font-brand font-black text-lg text-white leading-tight">
              Social<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Graph</span>
            </h1>
            <p className="text-[11px] text-slate-400">Your world. Your people. Your graph.</p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          title="Account Settings & Log Out"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all shadow-xs"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* PHOTO 2: COSMIC ORBITAL PERSONAL SPACE SPHERE */}
      <div className="relative my-4 flex items-center justify-center min-h-[380px] select-none">
        {/* Orbital Ring Path */}
        <div className="absolute w-[320px] h-[320px] rounded-full border border-cyan-500/25 border-dashed pointer-events-none animate-spin" style={{ animationDuration: '60s' }} />
        <div className="absolute w-[290px] h-[290px] rounded-full border border-purple-500/20 pointer-events-none" />

        {/* Central Luminous Personal Avatar Globe */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_50px_rgba(6,182,212,0.5)]">
            <div className="p-1 rounded-full bg-slate-950">
              <img
                src={space?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={space?.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-2xl"
              />
            </div>
          </div>

          {/* User Name & Verification Badge */}
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-lg font-black text-white tracking-tight">
                {space?.name || user?.full_name || 'Arjun Mehta'}
              </h2>
              <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
            </div>
            <p className="text-[11px] text-cyan-300 font-mono mt-0.5">@{space?.handle || 'arjun_tech'}</p>
            <p className="text-[11px] text-slate-300 max-w-xs mx-auto mt-1 leading-snug">
              {space?.bio || 'Building a better tomorrow\nTechnology · AI · Robotics · Sustainability'}
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-3 text-center">
            <div>
              <span className="block font-black text-sm text-white">{stats.postCount}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Posts</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div>
              <span className="block font-black text-sm text-white">8.4K</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Followers</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div>
              <span className="block font-black text-sm text-white">{stats.following}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Following</span>
            </div>
          </div>
        </div>

        {/* Orbiting Satellite Bubbles */}
        {orbitalNodes.map((node, i) => {
          const Icon = node.icon;
          const rad = (node.angle * Math.PI) / 180;
          const radius = 150;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <div
              key={i}
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
              className="absolute z-20 flex flex-col items-center group cursor-pointer"
            >
              <div className={`p-1.5 rounded-full bg-slate-900 border ${node.borderCol} shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform`}>
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${node.color} flex items-center justify-center text-slate-950 font-bold`}>
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <span className="text-[9px] font-bold text-white mt-1 leading-none drop-shadow-md">
                {node.label}
              </span>
              <span className="text-[8px] text-cyan-300 font-mono">
                {node.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* SPACE SELECTOR CARDS (Public Space vs Personal Space vs + New Space) */}
      <div className="grid grid-cols-3 gap-2.5 my-6">
        {/* Public Space */}
        <div
          onClick={() => {
            const pub = spaces.find(s => s.visibility === 'public') || spaces[0];
            if (pub && onSelectSpace) onSelectSpace(pub);
          }}
          className={`p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all ${
            !isPersonal
              ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/40 via-purple-950/40 to-slate-950 ring-1 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              : 'border-white/10 bg-slate-900/60 hover:border-white/20'
          }`}
        >
          <div className="h-10 rounded-xl mb-2 overflow-hidden relative bg-gradient-to-tr from-indigo-700 via-purple-700 to-cyan-500">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
              alt=""
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-bold text-xs text-white truncate">Public Space</h3>
          </div>
          <p className="text-[9px] text-slate-400">Visible to everyone</p>
        </div>

        {/* Personal Space */}
        <div
          onClick={() => {
            const priv = spaces.find(s => s.visibility !== 'public' || s.handle.includes('personal')) || spaces[1] || spaces[0];
            if (priv && onSelectSpace) onSelectSpace(priv);
          }}
          className={`p-3 rounded-2xl border cursor-pointer relative overflow-hidden transition-all ${
            isPersonal
              ? 'border-purple-400 bg-gradient-to-b from-purple-950/40 via-indigo-950/40 to-slate-950 ring-1 ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'border-white/10 bg-slate-900/60 hover:border-white/20'
          }`}
        >
          <div className="h-10 rounded-xl mb-2 overflow-hidden relative bg-gradient-to-tr from-slate-800 to-indigo-950">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80"
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <h3 className="font-bold text-xs text-white truncate">Personal Space</h3>
          </div>
          <p className="text-[9px] text-slate-400">Visible only to you</p>
        </div>

        {/* + New Space */}
        <div
          onClick={onOpenCreateSpace}
          className="p-3 rounded-2xl border border-white/10 border-dashed hover:border-cyan-400/50 bg-slate-900/40 hover:bg-slate-900/80 cursor-pointer flex flex-col items-center justify-center text-center transition-all group"
        >
          <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform mb-1.5">
            <Plus className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-white">New Space</span>
          <span className="text-[9px] text-slate-400">Spawn planet</span>
        </div>
      </div>

      {/* Your Content Header & Tab Bar */}
      <div className="mt-8 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-white tracking-wide">Your content</h3>
          <Sliders className="w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveContentTab('posts')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeContentTab === 'posts'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Posts</span>
          </button>

          <button
            onClick={() => setActiveContentTab('reels')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeContentTab === 'reels'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Reels</span>
          </button>

          <button
            onClick={() => setActiveContentTab('photos')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeContentTab === 'photos'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>
        </div>
      </div>

      {/* 2-Column Content Grid (Matching Photo 2 cards) */}
      <div className="grid grid-cols-2 gap-3">
        {(activeContentTab === 'reels' ? spaceReels : spacePosts).map((p, i) => {
          const img = p.media_urls?.[0] || [
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80'
          ][i % 4];

          return (
            <div
              key={p.id}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg cursor-pointer"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Like Counter Badge */}
              <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                <span>{p.like_count > 0 ? `${(p.like_count * 100).toLocaleString()}` : '1.2K'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Privacy Banner */}
      <div className="mt-6 p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px]">Your Personal Space is visible only to you.</span>
        </div>
        <span className="text-slate-500 font-bold">&gt;</span>
      </div>
    </div>
  );
};
