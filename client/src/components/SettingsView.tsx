import React, { useState } from 'react';
import type { Space, User } from '../types';
import type { AppTheme } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { BookmarksView } from './BookmarksView';
import { 
  Palette, 
  Orbit, 
  Sparkles, 
  Sliders, 
  Check, 
  Sun, 
  Moon, 
  Zap,
  Bookmark,
  User as UserIcon,
  LogOut,
  LogIn,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface SettingsViewProps {
  user: User | null;
  activeSpace: Space | null;
  spaces: Space[];
  onSelectSpace: (space: Space) => void;
  onOpenCreateSpace: () => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  onViewSpace: (handle: string) => void;
  initialTab?: 'customise' | 'saved' | 'account';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  activeSpace,
  spaces,
  onSelectSpace,
  onOpenCreateSpace,
  onLogout,
  onOpenAuthModal,
  onViewSpace,
  initialTab = 'customise'
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'customise' | 'saved' | 'account'>(initialTab);

  const {
    theme,
    setTheme,
    spaceMode,
    setSpaceMode,
    particlesEnabled,
    setParticlesEnabled,
    soundEnabled,
    setSoundEnabled,
    triggerWarp
  } = useTheme();

  const themes: Array<{ id: AppTheme; label: string; desc: string; icon: any; badge: string }> = [
    {
      id: 'light',
      label: 'Clean Editorial Light (Default)',
      desc: 'Crisp daylight Instagram-style layout with clean typography, high readability, and clean white cards.',
      icon: Sun,
      badge: 'Instagram Style'
    },
    {
      id: 'galaxy',
      label: 'Cosmic Galaxy Space',
      desc: 'Deep cosmic void with 60fps starry nebulae, orbital auras, and warp drive physics.',
      icon: Sparkles,
      badge: 'Universe Theme'
    },
    {
      id: 'synthwave',
      label: 'Neon Synthwave',
      desc: 'Laser cyberpunk aesthetic with ultraviolet, neon cyan, and high-voltage highlights.',
      icon: Zap,
      badge: 'Neon Glow'
    },
    {
      id: 'cyber',
      label: 'Obsidian OLED Dark',
      desc: 'Minimalist pitch-black OLED dark mode without star particles. Clean, sharp, battery-efficient.',
      icon: Moon,
      badge: 'OLED Pure Dark'
    }
  ];

  const handleThemeChange = (newTheme: AppTheme) => {
    triggerWarp();
    setTheme(newTheme);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Settings & Control Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your app customization, saved content, and account authentication.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveSettingsTab('customise')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
            activeSettingsTab === 'customise'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-600" />
          <span>Customise App</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab('saved')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
            activeSettingsTab === 'saved'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span>Saved Reels & Posts</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab('account')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
            activeSettingsTab === 'account'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <UserIcon className="w-4 h-4 text-indigo-600" />
          <span>Account & Auth</span>
        </button>
      </div>

      {/* TAB 1: CUSTOMISE */}
      {activeSettingsTab === 'customise' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Theme Selector */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Visual Experience & Theme
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {themes.map(t => {
                const Icon = t.icon;
                const isSelected = theme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{t.label}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">{t.badge}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-2">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Space Representation Mode */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Orbit className="w-4 h-4 text-cyan-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Space Navigation Architecture
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div
                onClick={() => setSpaceMode('cards')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  spaceMode === 'cards'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-900">🗂️ Classic Modern Grid (Professional)</span>
                  {spaceMode === 'cards' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-600">
                  Clean, structured cards and dropdowns with minimal visual noise for day-to-day work.
                </p>
              </div>

              <div
                onClick={() => setSpaceMode('orbital')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  spaceMode === 'orbital'
                    ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-900">🪐 Planetary Solar System</span>
                  {spaceMode === 'orbital' && <Check className="w-4 h-4 text-purple-600" />}
                </div>
                <p className="text-[11px] text-slate-600">
                  Spaces orbit your core account as glowing planets with interactive orbital physics in the Universe tab.
                </p>
              </div>
            </div>
          </div>

          {/* Performance & Particles */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Physics & Performance
              </h3>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-xs text-slate-900">Starfield Particle Engine</h4>
                <p className="text-[11px] text-slate-500">Render real-time reactive cursor starfield in galaxy view.</p>
              </div>
              <button
                onClick={() => setParticlesEnabled(!particlesEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  particlesEnabled ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  particlesEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="font-bold text-xs text-slate-900">Reels Audio Default</h4>
                <p className="text-[11px] text-slate-500">Autoplay audio when opening video reels.</p>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  soundEnabled ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAVED REELS & POSTS */}
      {activeSettingsTab === 'saved' && (
        <div className="animate-in fade-in duration-150">
          <BookmarksView
            activeSpace={activeSpace}
            onViewSpace={onViewSpace}
          />
        </div>
      )}

      {/* TAB 3: ACCOUNT & AUTHENTICATION */}
      {activeSettingsTab === 'account' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Active Profile Info */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                  <img
                    src={activeSpace?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                    alt=""
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{user?.full_name || 'Logged In Account'}</h3>
                  <p className="text-xs text-slate-500">{user?.email || 'user@socialgraph.dev'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Connected</span>
              </div>
            </div>

            {/* Orbiting Spaces Switcher */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Orbiting Spaces ({spaces.length})
                </span>
                <button
                  onClick={onOpenCreateSpace}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Space</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {spaces.map(sp => {
                  const isSelected = activeSpace?.id === sp.id;
                  return (
                    <div
                      key={sp.id}
                      onClick={() => onSelectSpace(sp)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={sp.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{sp.name}</p>
                          <p className="text-[11px] text-slate-500 truncate font-mono">@{sp.handle}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Authentication Actions */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Authentication & Sessions
            </h3>
            <p className="text-xs text-slate-500">
              Your account sessions and multi-device database state are synchronized securely across devices.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              {user ? (
                <button
                  onClick={onLogout}
                  className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In or Switch Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
