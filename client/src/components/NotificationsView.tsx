import React, { useState, useEffect } from 'react';
import type { Space, Notification } from '../types';
import { api } from '../api';
import { Bell, Heart, MessageCircle, UserPlus, Sparkles } from 'lucide-react';

interface NotificationsViewProps {
  activeSpace: Space | null;
  onRefreshCount: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  activeSpace,
  onRefreshCount
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifs();
  }, [activeSpace?.id]);

  const loadNotifs = async () => {
    if (!activeSpace) return;
    setLoading(true);
    try {
      const res = await api.getNotifications(activeSpace.id);
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Error loading notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      onRefreshCount();
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-600" />
          <span>Notifications for @{activeSpace?.handle}</span>
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {notifications.filter(n => !n.is_read).length} unread
        </span>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm text-center py-12">Loading activity...</p>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 text-sm font-semibold">No notifications yet.</p>
          <p className="text-xs text-slate-400 mt-1">Interactions with your space will be listed here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                n.is_read 
                  ? 'bg-white border-slate-200/70 text-slate-700' 
                  : 'bg-brand-50/50 border-brand-200 text-slate-900 font-semibold'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600 flex-shrink-0 shadow-2xs">
                  {n.type === 'follow' && <UserPlus className="w-4 h-4 text-brand-600" />}
                  {n.type === 'like' && <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />}
                  {n.type === 'comment' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                  {n.type === 'consent_request' && <Sparkles className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{n.body}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <div className="w-2.5 h-2.5 rounded-full bg-brand-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
