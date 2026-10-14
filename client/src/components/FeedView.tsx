import React, { useState } from 'react';
import type { Post, Space } from '../types';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Sparkles
} from 'lucide-react';

interface FeedViewProps {
  posts: Post[];
  activeSpace?: Space | null;
  onRefresh: () => void;
  onViewSpace: (handle: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  onRefresh,
  onViewSpace
}) => {
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [animatingLikePostId, setAnimatingLikePostId] = useState<string | null>(null);

  // Distinct spaces for the top story ring
  const storySpaces = posts
    .map(p => p.space)
    .filter((sp, i, arr) => sp && arr.findIndex(s => s.id === sp.id) === i);

  const handleLike = (postId: string) => {
    setAnimatingLikePostId(postId);
    setTimeout(() => setAnimatingLikePostId(null), 500);
    // Trigger like
    onRefresh();
  };

  const handleBookmark = (postId: string) => {
    setBookmarkedMap(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="max-w-[470px] mx-auto py-3 px-2 sm:px-0 space-y-4">
      {/* Top Instagram-style Story Tray with Cosmic Gradient Halos */}
      <div className="bg-white rounded-xl border border-slate-200/90 py-3 px-3 overflow-hidden shadow-2xs">
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar">
          {storySpaces.map(sp => (
            <div
              key={sp.id}
              onClick={() => onViewSpace(sp.handle)}
              className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0"
            >
              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform">
                <div className="p-[2px] rounded-full bg-white">
                  <img
                    src={sp.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + sp.handle}
                    alt={sp.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-700 tracking-tight truncate max-w-[66px] text-center">
                {sp.handle}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed Posts (Clean, Professional Instagram Card Layout) */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-800 text-sm font-semibold">No Posts in this Orbit Yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your first transmission or follow other spaces!</p>
          </div>
        ) : (
          posts.map(post => {
            const isLiked = post.user_reaction === 'like';
            const isBookmarked = bookmarkedMap[post.id];
            const isHeartBursting = animatingLikePostId === post.id;
            const mediaUrl = post.media_urls?.[0];

            return (
              <article
                key={post.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                {/* Post Author Header */}
                <div className="px-3.5 py-3 flex items-center justify-between">
                  <div
                    onClick={() => onViewSpace(post.space.handle)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 to-purple-600">
                      <img
                        src={post.space.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover bg-white ring-1 ring-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[13px] text-slate-900 group-hover:underline">
                          {post.space.handle}
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-[11px] text-slate-400">1d</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{post.space.name}</p>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-slate-900 p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Media Image or Video preview */}
                {mediaUrl ? (
                  <div className="relative bg-slate-950 aspect-square sm:aspect-[4/5] flex items-center justify-center overflow-hidden">
                    {mediaUrl.endsWith('.mp4') ? (
                      <video
                        src={mediaUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onDoubleClick={() => handleLike(post.id)}
                      />
                    )}
                    {/* Double-tap heart animation overlay */}
                    {isHeartBursting && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-300">
                        <Heart className="w-24 h-24 fill-white text-white drop-shadow-2xl" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white min-h-[220px] flex items-center justify-center text-center p-6 select-none">
                    <p className="text-base font-medium leading-relaxed max-w-sm">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Action Buttons Bar */}
                <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`hover:opacity-60 transition-transform active:scale-125 ${
                        isLiked ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-600' : ''}`} />
                    </button>
                    <button
                      onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                      className="text-slate-800 hover:opacity-60 transition-opacity"
                    >
                      <MessageCircle className="w-6 h-6 -rotate-90" />
                    </button>
                    <button
                      onClick={() => alert('Post link copied to clipboard!')}
                      className="text-slate-800 hover:opacity-60 transition-opacity"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleBookmark(post.id)}
                    className="text-slate-800 hover:opacity-60 transition-opacity"
                  >
                    <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-slate-900' : ''}`} />
                  </button>
                </div>

                {/* Likes count */}
                <div className="px-3.5 pb-1">
                  <span className="font-bold text-[13px] text-slate-900">
                    {(post.like_count || 1) + (isLiked ? 1 : 0)} likes
                  </span>
                </div>

                {/* Caption / Content */}
                <div className="px-3.5 pb-2 text-[13px] leading-relaxed">
                  <span
                    onClick={() => onViewSpace(post.space.handle)}
                    className="font-bold text-slate-900 mr-1.5 cursor-pointer hover:underline"
                  >
                    {post.space.handle}
                  </span>
                  <span className="text-slate-800">{post.content}</span>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {post.tags.map(t => (
                        <span key={t} className="text-indigo-600 hover:underline cursor-pointer text-xs">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments view toggle */}
                <div className="px-3.5 pb-3">
                  <button
                    onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    View all {post.comment_count || 2} comments
                  </button>
                </div>

                {/* Expanded comment box */}
                {activeCommentsPostId === post.id && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-1.5"
                    />
                    <button
                      disabled={!commentInput.trim()}
                      className="text-indigo-600 font-bold text-xs disabled:opacity-40 hover:text-indigo-800"
                    >
                      Post
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
