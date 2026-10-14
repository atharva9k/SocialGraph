import React, { useState, useEffect } from 'react';
import type { Space, Message } from '../types';
import { api } from '../api';
import { Send, Shield, User } from 'lucide-react';

interface MessagesViewProps {
  activeSpace: Space | null;
  targetSpaceId?: string;
  spaces?: Space[];
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  activeSpace,
  targetSpaceId: initialTarget
}) => {
  const [targetSpaceId, setTargetSpaceId] = useState<string>(initialTarget || 'spc_rohit_hardware');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [targetSpace, setTargetSpace] = useState<Space | null>(null);

  useEffect(() => {
    if (initialTarget) {
      setTargetSpaceId(initialTarget);
    }
  }, [initialTarget]);

  useEffect(() => {
    if (activeSpace && targetSpaceId) {
      loadMessages();
    }
  }, [activeSpace?.id, targetSpaceId]);

  const loadMessages = async () => {
    if (!activeSpace) return;
    try {
      const res = await api.getMessages(targetSpaceId, activeSpace.id);
      setMessages(res.messages);
      // Fetch target space info
      const handle = targetSpaceId.replace('spc_', '');
      const profile = await api.getSpaceProfile(handle).catch(() => null);
      if (profile) setTargetSpace(profile.space);
    } catch (err) {
      console.error('Error loading messages', err);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeSpace) return;
    try {
      await api.sendMessage(activeSpace.id, targetSpaceId, inputText.trim());
      setInputText('');
      loadMessages();
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col h-[75vh]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
              {targetSpace?.avatar_url ? (
                <img src={targetSpace.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <User className="w-5 h-5 text-brand-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{targetSpace?.name || targetSpaceId}</h3>
              <p className="text-[11px] text-slate-400">In-App Encrypted Sandbox (as @{activeSpace?.handle})</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mutual Consent Verified</span>
          </div>
        </div>

        {/* Message Bubble Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <p className="font-semibold text-slate-600">No messages yet.</p>
              <p className="mt-1">In-app communication begins here. Phone numbers are kept private.</p>
            </div>
          ) : (
            messages.map(m => {
              const isMine = m.sender_space_id === activeSpace?.id;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isMine 
                      ? 'bg-brand-600 text-white rounded-br-xs shadow-xs' 
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs'
                  }`}>
                    <p>{m.content}</p>
                    <span className={`text-[9px] block text-right mt-1 ${isMine ? 'text-white/70' : 'text-slate-400'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-xs transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
