import React, { useState, useEffect } from 'react';
import type { Space, ProximityMatch, ConsentRequest } from '../types';
import { api } from '../api';
import { MapPin, Shield, Check, X, Send, MessageSquare } from 'lucide-react';

interface ProximityViewProps {
  activeSpace: Space | null;
  onViewSpace: (handle: string) => void;
  onOpenChat: (otherSpaceId: string) => void;
}

export const ProximityView: React.FC<ProximityViewProps> = ({
  activeSpace,
  onViewSpace,
  onOpenChat
}) => {
  const [matches, setMatches] = useState<ProximityMatch[]>([]);
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetMatch, setTargetMatch] = useState<ProximityMatch | null>(null);
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProximityData();
  }, [activeSpace?.id]);

  const loadProximityData = async () => {
    if (!activeSpace) return;
    setLoading(true);
    try {
      const [matchesRes, reqsRes] = await Promise.all([
        api.getNearbyMatches(activeSpace.id),
        api.getConsentRequests(activeSpace.id)
      ]);
      setMatches(matchesRes.matches);
      setRequests(reqsRes.requests);
    } catch (err) {
      console.error('Error loading proximity data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!targetMatch || !purpose.trim() || !message.trim() || !activeSpace) return;
    setSubmitting(true);
    try {
      await api.sendConsentRequest({
        sender_space_id: activeSpace.id,
        recipient_space_id: targetMatch.space_id,
        purpose: purpose.trim(),
        message: message.trim()
      });
      setTargetMatch(null);
      setPurpose('');
      setMessage('');
      loadProximityData();
      alert('Collaboration request sent securely! Once accepted, messaging will be unlocked.');
    } catch (err) {
      console.error('Error sending consent request', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!activeSpace) return;
    try {
      await api.respondConsentRequest(requestId, status, activeSpace.id);
      loadProximityData();
    } catch (err) {
      console.error('Error responding to consent request', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Privacy Guarantee Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-teal-700/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Privacy-First Proximity
            </span>
            <span className="text-white/80 text-xs">Uber H3 Spatial Hexagonal Mesh</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Who Should You Know Nearby?</h1>
          <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-xl">
            Match with mentors, researchers, and technical collaborators in your city based on intent + verified skills. Exact locations and phone numbers are never stored or exposed.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 self-start sm:self-center">
          <Shield className="w-5 h-5 text-emerald-200" />
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Zero-Doxxing Shield</p>
            <p className="text-xs font-semibold text-white">Double-Blind Consent Active</p>
          </div>
        </div>
      </div>

      {/* Incoming Connection Requests */}
      {requests.filter(r => r.recipient_space_id === activeSpace?.id && r.status === 'pending').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <span>Pending Inbound Requests ({requests.filter(r => r.recipient_space_id === activeSpace?.id && r.status === 'pending').length})</span>
          </h3>
          <div className="space-y-2">
            {requests
              .filter(r => r.recipient_space_id === activeSpace?.id && r.status === 'pending')
              .map(req => (
                <div key={req.id} className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <img src={req.sender.avatar_url} alt="" className="w-6 h-6 rounded-md object-cover" />
                      <span className="text-xs font-bold text-slate-900">{req.sender.name}</span>
                      <span className="text-[11px] text-slate-400">@{req.sender.handle}</span>
                    </div>
                    <p className="text-xs font-semibold text-amber-900 mt-1">Goal: {req.purpose}</p>
                    <p className="text-xs text-slate-600 mt-0.5">"{req.message}"</p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleRespondRequest(req.id, 'accepted')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept & Chat
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req.id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Accepted Active Connections (Unlocked Chats) */}
      {requests.filter(r => r.status === 'accepted').length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Unlocked Connections & Collaborations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {requests.filter(r => r.status === 'accepted').map(req => {
              const otherSpace = req.sender_space_id === activeSpace?.id ? req.recipient : req.sender;
              return (
                <div key={req.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={otherSpace.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{otherSpace.name}</h4>
                      <p className="text-[10px] text-slate-400">@{otherSpace.handle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenChat(otherSpace.id)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-brand-600 shadow-2xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nearby Matches Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Nearby Discovered Peers ({matches.length})
        </h3>

        {loading ? (
          <p className="text-slate-400 text-sm py-8 text-center">Scanning nearby H3 hexagonal clusters...</p>
        ) : matches.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">No nearby peers discovered with current filters.</p>
            <p className="text-xs text-slate-400 mt-1">Make sure discoverability is toggled on in your active space settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(match => (
              <div 
                key={match.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div 
                    onClick={() => onViewSpace(match.space.handle)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={match.space.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 group-hover:ring-emerald-500 transition-all"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {match.space.name}
                      </h4>
                      <span className="text-xs text-slate-400">@{match.space.handle}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    ~{match.distance_approx_km} km away
                  </span>
                </div>

                {/* Intent Statement */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Active Collaboration Intent:
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {match.space.active_intent || 'Open for technical discussion and collaboration'}
                  </p>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {match.skills.map(s => (
                    <span key={s} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Connect Action */}
                <button
                  onClick={() => setTargetMatch(match)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Connection Request</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Structured Connection Request Modal */}
      {targetMatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Request Connection with @{targetMatch.space.handle}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              SocialGraph uses a double-blind handshake. Your request must describe your concrete collaboration purpose or academic query.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Purpose / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Seeking guidance on LoRaWAN antenna impedance"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Context & Background (min 20 characters)</label>
                <textarea
                  rows={3}
                  placeholder="Explain why your skills or idea align with this peer..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTargetMatch(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={submitting || !purpose.trim() || message.trim().length < 20}
                onClick={handleSendRequest}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
