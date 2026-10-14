import React, { useState, useEffect } from 'react';
import type { Space, Bookmark as BookmarkType } from '../types';
import { api } from '../api';
import { Bookmark, Trash2 } from 'lucide-react';

interface BookmarksViewProps {
  activeSpace: Space | null;
  onViewSpace: (handle: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  activeSpace,
  onViewSpace
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [activeSpace?.id]);

  const loadBookmarks = async () => {
    if (!activeSpace) return;
    setLoading(true);
    try {
      const res = await api.getBookmarks(activeSpace.id);
      setBookmarks(res.bookmarks);
    } catch (err) {
      console.error('Error loading bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (postId: string) => {
    if (!activeSpace) return;
    try {
      await api.toggleBookmark(postId, activeSpace.id);
      setBookmarks(prev => prev.filter(b => b.post_id !== postId));
    } catch (err) {
      console.error('Error removing bookmark', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-brand-600 fill-brand-600" />
          <span>Private Saved Content</span>
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {bookmarks.length} saved
        </span>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm text-center py-12">Loading bookmarks...</p>
      ) : bookmarks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 text-sm font-semibold">No saved items in this space.</p>
          <p className="text-xs text-slate-400 mt-1">Bookmark posts, ideas, or reels to read later privately.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(b => (
            <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div 
                  onClick={() => onViewSpace(b.post.space.handle)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <img src={b.post.space.avatar_url} alt="" className="w-5 h-5 rounded-md object-cover" />
                  <span className="text-xs font-bold text-slate-900">{b.post.space.name}</span>
                  <span className="text-[10px] text-slate-400">@{b.post.space.handle}</span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                  {b.post.content}
                </p>
                <span className="text-[10px] font-bold text-brand-600 uppercase bg-brand-50 px-2 py-0.5 rounded inline-block">
                  {b.post.content_type}
                </span>
              </div>

              <button
                onClick={() => handleRemove(b.post_id)}
                title="Remove from saved"
                className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
