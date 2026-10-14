import React, { useState } from 'react';
import type { Space } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Orbit, Radio, ArrowUpRight } from 'lucide-react';

interface GalaxyMapViewProps {
  spaces: Space[];
  activeSpace: Space | null;
  onSelectSpace: (space: Space) => void;
  onViewSpace: (handle: string) => void;
}

export const GalaxyMapView: React.FC<GalaxyMapViewProps> = ({
  spaces,
  activeSpace,
  onSelectSpace,
  onViewSpace
}) => {
  const { triggerWarp } = useTheme();
  const [hoveredSpace, setHoveredSpace] = useState<Space | null>(null);

  const planetPalette = [
    { bg: 'from-violet-500 via-indigo-600 to-purple-900', ring: 'border-violet-400/50', glow: 'rgba(139, 92, 246, 0.6)' },
    { bg: 'from-cyan-400 via-teal-600 to-blue-900', ring: 'border-cyan-400/50', glow: 'rgba(6, 182, 212, 0.6)' },
    { bg: 'from-amber-400 via-orange-600 to-red-900', ring: 'border-amber-400/50', glow: 'rgba(245, 158, 11, 0.6)' },
    { bg: 'from-emerald-400 via-green-600 to-teal-900', ring: 'border-emerald-400/50', glow: 'rgba(16, 185, 129, 0.6)' },
    { bg: 'from-pink-400 via-rose-600 to-purple-900', ring: 'border-pink-400/50', glow: 'rgba(236, 72, 153, 0.6)' }
  ];

  const handleWarpToSpace = (space: Space) => {
    triggerWarp();
    onSelectSpace(space);
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Header telemetry */}
      <div className="text-center z-10 mb-4 max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-mono mb-2 backdrop-blur-md">
          <Orbit className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>GALACTIC ORBITAL RADAR • SECTOR H3-7</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Planetary Universe Map
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Every space is an orbiting planet in your solar system. Click any celestial body to warp jump directly into that realm.
        </p>
      </div>

      {/* Orbit Visualization Arena */}
      <div className="relative w-full max-w-3xl aspect-square flex items-center justify-center">
        {/* Orbital concentric rings */}
        <div className="absolute w-[85%] aspect-square rounded-full border border-dashed border-violet-500/20 animate-spin" style={{ animationDuration: '90s' }} />
        <div className="absolute w-[65%] aspect-square rounded-full border border-dashed border-cyan-500/20 animate-spin" style={{ animationDuration: '60s', animationDirection: 'reverse' }} />
        <div className="absolute w-[45%] aspect-square rounded-full border border-violet-400/25 animate-spin" style={{ animationDuration: '40s' }} />

        {/* Central Sun / Stellar Core (User's Root Consciousness) */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-200 p-1 shadow-[0_0_60px_rgba(245,158,11,0.8)] animate-pulse flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-amber-300">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '15s' }} />
              <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Core</span>
            </div>
          </div>
          <span className="mt-2 text-[10px] font-mono uppercase text-amber-300/80 font-bold tracking-widest">
            STELLAR PULSAR
          </span>
        </div>

        {/* Orbiting Planetary Spaces */}
        {spaces.map((sp, idx) => {
          const total = spaces.length || 1;
          const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
          const radiusPercent = 32 + (idx % 2) * 10; // Alternate orbit radii
          const x = 50 + radiusPercent * Math.cos(angle);
          const y = 50 + radiusPercent * Math.sin(angle);
          const palette = planetPalette[idx % planetPalette.length];
          const isActive = activeSpace?.id === sp.id;

          return (
            <div
              key={sp.id}
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setHoveredSpace(sp)}
              onMouseLeave={() => setHoveredSpace(null)}
              onClick={() => handleWarpToSpace(sp)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group transition-all duration-300"
            >
              {/* Planetary Aura & Rings */}
              <div
                className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr ${palette.bg} p-0.5 transition-transform duration-300 group-hover:scale-125 ${
                  isActive ? 'ring-4 ring-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.9)] scale-110' : 'shadow-lg'
                }`}
                style={{ boxShadow: isActive ? `0 0 35px ${palette.glow}` : undefined }}
              >
                {/* Orbital Ring overlay */}
                <div className={`absolute -inset-2 rounded-full border-2 border-dashed ${palette.ring} pointer-events-none group-hover:rotate-45 transition-transform duration-700`} />
                
                {/* Planet surface */}
                <img
                  src={sp.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + sp.handle}
                  alt={sp.name}
                  className="w-full h-full rounded-full object-cover"
                />

                {isActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 flex items-center justify-center">
                    <Radio className="w-2.5 h-2.5 text-slate-950 animate-ping" />
                  </div>
                )}
              </div>

              {/* Planet Tag Label */}
              <div className="mt-2 text-center">
                <span className={`block text-[11px] font-bold truncate max-w-[100px] transition-colors ${
                  isActive ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
                }`}>
                  {sp.name}
                </span>
                <span className="text-[9px] font-mono text-slate-400 block truncate max-w-[100px]">
                  @{sp.handle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hovered Planet Telemetry HUD */}
      {hoveredSpace && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={hoveredSpace.avatar_url}
                alt=""
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-violet-500/50"
              />
              <div>
                <h4 className="text-white font-bold text-sm">{hoveredSpace.name}</h4>
                <p className="text-violet-400 text-xs font-mono">@{hoveredSpace.handle}</p>
              </div>
            </div>
            <button
              onClick={() => onViewSpace(hoveredSpace.handle)}
              className="p-2 rounded-xl bg-violet-600/30 hover:bg-violet-600 text-violet-200 hover:text-white transition-all text-xs flex items-center gap-1 font-semibold"
            >
              <span>Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-2 line-clamp-2">{hoveredSpace.bio || 'Galactic subspace beacon.'}</p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>SECTOR: {hoveredSpace.city || 'MUMBAI-H3'}</span>
            <span className="text-cyan-400 font-bold">CLICK TO WARP</span>
          </div>
        </div>
      )}
    </div>
  );
};
