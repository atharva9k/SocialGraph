import React, { useState } from 'react';
import type { Space, User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, 
  Film, 
  Compass, 
  MessageSquare, 
  Bell, 
  Plus, 
  ChevronDown, 
  Sparkles, 
  Sliders, 
  Check,
  User as UserIcon
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeSpace: Space | null;
  spaces: Space[];
  onSelectSpace: (space: Space) => void;
  onOpenCreateSpace: () => void;
  onOpenCreatePost: () => void;
  user: User | null;
  unreadNotifsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeSpace,
  spaces,
  onSelectSpace,
  onOpenCreateSpace,
  onOpenCreatePost,
  user,
  unreadNotifsCount
}) => {
  const [spaceDropdownOpen, setSpaceDropdownOpen] = useState(false);
  const { triggerWarp } = useTheme();

  const navItems: Array<{ id: string; label: string; icon: any; count?: number; badge?: string }> = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifsCount },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 p-4 select-none z-30 border-r border-white/10 glass-panel">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.45)] flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse fill-cyan-400/20" />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="font-brand font-black text-2xl tracking-tight text-white leading-none">
              Social<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Graph</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Your world. Your people.</p>
          </div>
        </div>

        {/* Multi-Space Persona Switcher (Planetary Orb) */}
        <div className="relative mb-5">
          <div
            onClick={() => setSpaceDropdownOpen(!spaceDropdownOpen)}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-violet-500/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={activeSpace?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=sg'}
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-cyan-400/50"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{activeSpace?.name || 'Select Space'}</p>
                <p className="text-[10px] text-cyan-300 font-mono truncate">@{activeSpace?.handle}</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-transform ${spaceDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Spaces Dropdown */}
          {spaceDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-violet-500/30 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Your Orbiting Spaces</span>
                <span className="text-cyan-400 font-mono">{spaces.length}</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 px-1.5 py-1">
                {spaces.map(sp => {
                  const isSelected = activeSpace?.id === sp.id;
                  return (
                    <div
                      key={sp.id}
                      onClick={() => {
                        triggerWarp();
                        onSelectSpace(sp);
                        setSpaceDropdownOpen(false);
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-violet-600/30 text-white border border-violet-500/40 shadow-xs'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <img src={sp.avatar_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{sp.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">@{sp.handle}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 mt-1 border-t border-slate-800/80 px-2">
                <button
                  onClick={() => {
                    setSpaceDropdownOpen(false);
                    onOpenCreateSpace();
                  }}
                  className="w-full py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-violet-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Space</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[9px] font-mono">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Create Post Action Button */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <button
            onClick={onOpenCreatePost}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:brightness-110 active:scale-98 text-white font-black text-xs shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post to Galaxy</span>
          </button>

          {/* User footer info */}
          {user && (
            <div 
              onClick={() => setCurrentTab('settings')}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 cursor-pointer text-xs text-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <span className="truncate font-medium text-[11px] text-slate-800">{user.full_name}</span>
              </div>
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Matching Photo 2 Instagram layout) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-2 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around shadow-2xl">
        {/* Home */}
        <button
          onClick={() => handleTabClick('feed')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'feed' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => handleTabClick('explore')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'explore' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Explore</span>
        </button>

        {/* Floating Center Gradient Plus Button */}
        <button
          onClick={onOpenCreatePost}
          className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 transition-transform flex items-center justify-center text-white"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-700 to-cyan-500 flex items-center justify-center">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
        </button>

        {/* Notifications */}
        <button
          onClick={() => handleTabClick('notifications')}
          className={`flex flex-col items-center gap-1 relative transition-all ${
            currentTab === 'notifications' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </div>
          <span className="text-[10px]">Notifications</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'profile' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className={`p-[1.5px] rounded-full ${currentTab === 'profile' ? 'bg-cyan-400' : 'bg-transparent'}`}>
            <UserIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </>
  );
};
