import React, { useState } from 'react';
import type { Post, Space } from '../types';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play } from 'lucide-react';

interface ReelsViewProps {
  posts: Post[];
  activeSpace?: Space | null;
  onViewSpace: (handle: string) => void;
  onReact: (postId: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  posts,
  onViewSpace,
  onReact
}) => {
  const reelPosts = posts.filter(p => p.content_type === 'reel' || (p.media_urls && p.media_urls.some(u => u.endsWith('.mp4'))));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  if (reelPosts.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          🎬
        </div>
        <h3 className="font-bold text-slate-800 text-base">No Reels Published Yet</h3>
        <p className="text-xs text-slate-500 mt-1">Short-form videos and technical demos will appear here.</p>
      </div>
    );
  }

  const currentReel = reelPosts[currentIndex];
  const videoUrl = currentReel.media_urls?.[0] || 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-details-41315-large.mp4';

  const handleNext = () => {
    if (currentIndex < reelPosts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-5rem)] md:h-[calc(100vh-2rem)] my-2 relative rounded-3xl overflow-hidden bg-black shadow-2xl flex items-center justify-center select-none">
      {/* Video Element */}
      <video
        key={videoUrl}
        src={videoUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover"
        onClick={() => setIsPlaying(!isPlaying)}
      />

      {/* Play/Pause Overlay indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Play className="w-8 h-8 fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Top Controls: Sound Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Vertical Action Bar (Right side) */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4">
        {/* Creator Avatar */}
        <div 
          onClick={() => onViewSpace(currentReel.space.handle)}
          className="relative cursor-pointer group"
        >
          <img
            src={currentReel.space.avatar_url}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
          />
        </div>

        {/* Like */}
        <button
          onClick={() => onReact(currentReel.id)}
          className="flex flex-col items-center gap-1 text-white group"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-rose-600 transition-colors">
            <Heart className={`w-5 h-5 ${currentReel.user_reaction === 'like' ? 'fill-rose-500 text-rose-500' : ''}`} />
          </div>
          <span className="text-[11px] font-bold">{currentReel.like_count}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1 text-white group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-brand-600 transition-colors">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold">{currentReel.comment_count}</span>
        </button>

        {/* Share */}
        <button 
          onClick={() => alert('Reel link copied to clipboard!')}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-4 left-4 right-16 z-20 text-white space-y-2 pointer-events-none">
        <div 
          onClick={() => onViewSpace(currentReel.space.handle)}
          className="pointer-events-auto cursor-pointer inline-flex items-center gap-2"
        >
          <span className="font-extrabold text-sm hover:underline">{currentReel.space.name}</span>
          <span className="text-xs text-white/70">@{currentReel.space.handle}</span>
        </div>

        <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
          {currentReel.content}
        </p>

        {currentReel.tags && (
          <div className="flex flex-wrap gap-1">
            {currentReel.tags.map(t => (
              <span key={t} className="text-[10px] font-bold text-white/80 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Indicators (Up / Down) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white/80">
        <span>{currentIndex + 1} / {reelPosts.length}</span>
        {currentIndex > 0 && (
          <button onClick={handlePrev} className="hover:text-white underline ml-1 cursor-pointer">▲ Prev</button>
        )}
        {currentIndex < reelPosts.length - 1 && (
          <button onClick={handleNext} className="hover:text-white underline ml-1 cursor-pointer">▼ Next</button>
        )}
      </div>
    </div>
  );
};
