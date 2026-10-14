import React, { useState, useEffect } from 'react';
import type { User, Space, Post } from './types';
import { api } from './api';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { GalaxyCanvas } from './components/GalaxyCanvas';
import { GalaxyAIAssistant } from './components/GalaxyAIAssistant';
import { SettingsView } from './components/SettingsView';
import { Navbar } from './components/Navbar';
import { FeedView } from './components/FeedView';
import { ReelsView } from './components/ReelsView';
import { MessagesView } from './components/MessagesView';
import { NotificationsView } from './components/NotificationsView';
import { BookmarksView } from './components/BookmarksView';
import { ProfileView } from './components/ProfileView';
import { 
  Plus, 
  X, 
  Search, 
  Sparkles, 
  Lock, 
  Globe, 
  EyeOff, 
  Users, 
  Send, 
  UserCheck, 
  Orbit 
} from 'lucide-react';

const SocialGraphApp: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [, setLoadingFeed] = useState<boolean>(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [chatTargetSpaceId, setChatTargetSpaceId] = useState<string | undefined>(undefined);

  // Modals state
  const [showCreatePostModal, setShowCreatePostModal] = useState<boolean>(false);
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [viewProfileHandle, setViewProfileHandle] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{ space: Space; stats: { followers: number; following: number; postCount: number } } | null>(null);
  const [isFollowingProfile, setIsFollowingProfile] = useState<boolean>(false);

  // Search state for Explore tab
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ spaces: Space[]; posts: Post[] } | null>(null);
  const [searching, setSearching] = useState(false);

  // Post form fields
  const [postContentType, setPostContentType] = useState<'post' | 'reel' | 'opinion'>('post');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');

  // Space form fields
  const [newSpaceHandle, setNewSpaceHandle] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceBio, setNewSpaceBio] = useState('');
  const [newSpaceVisibility, setNewSpaceVisibility] = useState<'public' | 'unlisted' | 'private'>('public');

  // Auth form fields
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState('');

  const { triggerWarp } = useTheme();

  // Initial bootstrap: try existing token or auto demo login
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const token = api.getToken();
      if (token) {
        const me = await api.getMe();
        setUser(me.user);
        setSpaces(me.spaces);
        if (me.spaces.length > 0) {
          setActiveSpace(me.spaces[0]);
        }
      } else {
        // Automatic login as demo user Arjun for immediate frictionless preview
        const data = await api.login('arjun@socialgraph.dev', 'Password123!');
        setUser(data.user);
        setSpaces(data.spaces);
        setActiveSpace(data.active_space || data.spaces[0]);
      }
    } catch {
      setShowAuthModal(true);
    }
  };

  // Load Feed whenever active space changes
  useEffect(() => {
    if (activeSpace) {
      loadFeed();
      loadNotificationCount();
    }
  }, [activeSpace?.id]);

  const loadFeed = async () => {
    if (!activeSpace) return;
    setLoadingFeed(true);
    try {
      const res = await api.getFeed(activeSpace.id);
      setFeedPosts(res.posts);
    } catch (err) {
      console.error('Error loading feed', err);
    } finally {
      setLoadingFeed(false);
    }
  };

  const loadNotificationCount = async () => {
    if (!activeSpace) return;
    try {
      const res = await api.getNotifications(activeSpace.id);
      const unread = res.notifications.filter(n => !n.is_read).length;
      setUnreadNotifsCount(unread);
    } catch (err) {
      console.error('Error loading notifs', err);
    }
  };

  const handleSelectSpace = (space: Space) => {
    triggerWarp();
    setActiveSpace(space);
  };

  const handleOpenSpaceProfile = async (handle: string) => {
    try {
      const cleanHandle = handle.replace('@', '');
      const data = await api.getSpaceProfile(cleanHandle);
      setProfileData(data);
      setViewProfileHandle(cleanHandle);
      if (activeSpace) {
        const followStatus = await api.checkIsFollowing(data.space.id, activeSpace.id).catch(() => ({ is_following: false }));
        setIsFollowingProfile(followStatus.is_following);
      }
    } catch (err) {
      console.error('Error loading space profile', err);
    }
  };

  const handleToggleProfileFollow = async () => {
    if (!activeSpace || !profileData) return;
    try {
      const res = await api.toggleFollow(profileData.space.id, activeSpace.id);
      setIsFollowingProfile(res.is_following);
      setProfileData({ ...profileData, stats: res.stats });
    } catch (err) {
      console.error('Error toggling follow', err);
    }
  };

  const handleCreatePost = async () => {
    if (!activeSpace || !postContent.trim()) return;
    try {
      const tags = postTags.split(',').map(t => t.trim()).filter(Boolean);
      await api.createPost({
        space_id: activeSpace.id,
        content: postContent.trim(),
        content_type: postContentType,
        tags,
        media_urls: postMediaUrl ? [postMediaUrl.trim()] : []
      });
      setShowCreatePostModal(false);
      setPostContent('');
      setPostTags('');
      setPostMediaUrl('');
      loadFeed();
    } catch (err: any) {
      alert(err.message || 'Error creating post');
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceHandle.trim() || !newSpaceName.trim()) return;
    try {
      const res = await api.createSpace({
        handle: newSpaceHandle.trim(),
        name: newSpaceName.trim(),
        bio: newSpaceBio.trim(),
        visibility: newSpaceVisibility
      });
      setSpaces([...spaces, res.space]);
      setActiveSpace(res.space);
      setShowCreateSpaceModal(false);
      setNewSpaceHandle('');
      setNewSpaceName('');
      setNewSpaceBio('');
    } catch (err: any) {
      alert(err.message || 'Error creating space');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await api.search(searchQuery.trim());
      setSearchResults({ spaces: results.spaces, posts: results.posts });
    } catch (err) {
      console.error('Error executing search', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        const data = await api.login(authEmail, authPassword);
        setUser(data.user);
        setSpaces(data.spaces);
        setActiveSpace(data.active_space || data.spaces[0]);
      } else {
        const data = await api.register(authEmail, authPassword, authFullName);
        setUser(data.user);
        setSpaces(data.spaces);
        setActiveSpace(data.active_space || data.spaces[0]);
      }
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleQuickLogin = async (email: string) => {
    setAuthError('');
    try {
      const data = await api.login(email, 'Password123!');
      setUser(data.user);
      setSpaces(data.spaces);
      setActiveSpace(data.active_space || data.spaces[0]);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || 'Quick login failed');
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    setUser(null);
    setSpaces([]);
    setActiveSpace(null);
    setShowAuthModal(true);
  };

  const handleAiDraftPost = (content: string) => {
    setPostContent(content);
    setShowCreatePostModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* 60fps Starfield Canvas */}
      <GalaxyCanvas />

      {/* Omnipresent Meta AI-style Galaxy AI Assistant */}
      <GalaxyAIAssistant onDraftPost={handleAiDraftPost} />

      {/* Navigation Shell */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeSpace={activeSpace}
        spaces={spaces}
        onSelectSpace={handleSelectSpace}
        onOpenCreateSpace={() => setShowCreateSpaceModal(true)}
        onOpenCreatePost={() => setShowCreatePostModal(true)}
        user={user}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Viewport */}
      <main className="flex-1 min-w-0 pb-24 md:pb-6 overflow-y-auto max-h-screen relative z-10">
        {/* Mobile Top Bar */}
        <div className="md:hidden sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between z-20 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(168,85,247,0.4)] flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-brand font-black text-lg text-white leading-none tracking-tight">
                Social<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Graph</span>
              </span>
              <p className="text-[9px] text-slate-400 font-medium">Your world. Your people. Your graph.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="p-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreateSpaceModal(true)}
              className="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1.5 rounded-xl border border-cyan-500/30"
            >
              + Space
            </button>
          </div>
        </div>

        {/* Tab Routing */}
        {currentTab === 'feed' && (
          <FeedView
            posts={feedPosts}
            activeSpace={activeSpace}
            onRefresh={loadFeed}
            onViewSpace={handleOpenSpaceProfile}
          />
        )}

        {currentTab === 'reels' && (
          <ReelsView
            posts={feedPosts}
            activeSpace={activeSpace}
            onViewSpace={handleOpenSpaceProfile}
            onReact={loadFeed}
          />
        )}

        {currentTab === 'messages' && (
          <MessagesView
            activeSpace={activeSpace}
            targetSpaceId={chatTargetSpaceId}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsView
            activeSpace={activeSpace}
            onRefreshCount={loadNotificationCount}
          />
        )}

        {currentTab === 'bookmarks' && (
          <BookmarksView
            activeSpace={activeSpace}
            onViewSpace={handleOpenSpaceProfile}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            space={activeSpace}
            user={user}
            spaces={spaces}
            posts={feedPosts}
            onOpenSettings={() => setCurrentTab('settings')}
            onOpenCreateSpace={() => setShowCreateSpaceModal(true)}
            onSelectSpace={handleSelectSpace}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            user={user}
            activeSpace={activeSpace}
            spaces={spaces}
            onSelectSpace={handleSelectSpace}
            onOpenCreateSpace={() => setShowCreateSpaceModal(true)}
            onLogout={handleLogout}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onViewSpace={handleOpenSpaceProfile}
          />
        )}

        {currentTab === 'explore' && (
          <div className="max-w-3xl mx-auto py-8 px-4">
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">Galactic Discovery</h2>
            <p className="text-xs text-slate-400 mb-6">Explore signals, trending spaces, and transmissions across the galaxy.</p>
            
            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search spaces, hardware, reels, AI, or clean energy..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full glass-panel rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-xs"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
              >
                {searching ? 'Scanning...' : 'Search'}
              </button>
            </form>

            {searchResults && (
              <div className="space-y-6">
                {searchResults.spaces.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 font-mono">Discovered Spaces</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchResults.spaces.map(sp => (
                        <div
                          key={sp.id}
                          onClick={() => handleOpenSpaceProfile(sp.handle)}
                          className="glass-panel p-3.5 rounded-2xl hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all cursor-pointer flex items-center gap-3"
                        >
                          <img src={sp.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-violet-500/30" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-white truncate">{sp.name}</h4>
                            <p className="text-[11px] text-cyan-300 font-mono truncate">@{sp.handle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.posts.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 font-mono">Matched Transmissions</h3>
                    <div className="space-y-3">
                      {searchResults.posts.map(post => (
                        <div key={post.id} className="glass-panel p-4 rounded-2xl">
                          <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE POST MODAL */}
      {showCreatePostModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-violet-500/30">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Transmit to Galaxy</h3>
              </div>
              <button onClick={() => setShowCreatePostModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-bold">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['post', 'reel', 'opinion'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPostContentType(type)}
                      className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                        postContentType === type
                          ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-transparent shadow-md'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-bold">Content</label>
                <textarea
                  rows={4}
                  placeholder={`What are you broadcasting as @${activeSpace?.handle}?`}
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-bold">Topic Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Robotics, Space, NeuralNet, Cosmos"
                  value={postTags}
                  onChange={e => setPostTags(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-bold">Media / Video URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://... image or mp4 URL"
                  value={postMediaUrl}
                  onChange={e => setPostMediaUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={!postContent.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110 disabled:opacity-40 rounded-xl shadow-md"
                >
                  Transmit Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SPACE MODAL */}
      {showCreateSpaceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 shadow-2xl border border-violet-500/30">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Orbit className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">Create New Space (Planet)</h3>
                  <p className="text-[10px] text-slate-400">Independent persona orbiting your account</p>
                </div>
              </div>
              <button onClick={() => setShowCreateSpaceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-bold">Handle</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-bold font-mono">@</span>
                  <input
                    type="text"
                    placeholder="quantum_realm"
                    value={newSpaceHandle}
                    onChange={e => setNewSpaceHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-bold">Space Name</label>
                <input
                  type="text"
                  placeholder="e.g. Quantum Computing & Physics"
                  value={newSpaceName}
                  onChange={e => setNewSpaceName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-bold">Bio</label>
                <textarea
                  rows={2}
                  placeholder="Planetary mission, research focus, or thoughts..."
                  value={newSpaceBio}
                  onChange={e => setNewSpaceBio(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-bold">Visibility</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'public', label: 'Public', icon: Globe },
                    { id: 'unlisted', label: 'Unlisted', icon: EyeOff },
                    { id: 'private', label: 'Private', icon: Lock }
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setNewSpaceVisibility(item.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          newSpaceVisibility === item.id
                            ? 'bg-violet-600/30 border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSpaceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSpace}
                  disabled={!newSpaceHandle.trim() || !newSpaceName.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110 disabled:opacity-40 rounded-xl shadow-md"
                >
                  Spawn Planet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPACE PROFILE MODAL */}
      {viewProfileHandle && profileData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-violet-500/30">
            <div className="h-28 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 relative">
              <button
                onClick={() => setViewProfileHandle(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex items-end justify-between -mt-12 mb-4">
                <img
                  src={profileData.space.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=sg'}
                  alt=""
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-950 shadow-xl bg-slate-900"
                />
                {activeSpace?.id !== profileData.space.id && (
                  <button
                    onClick={handleToggleProfileFollow}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isFollowingProfile
                        ? 'bg-white/10 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400'
                        : 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md'
                    }`}
                  >
                    {isFollowingProfile ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        <span>Follow Space</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <h3 className="font-black text-base text-white">{profileData.space.name}</h3>
                <p className="text-xs text-cyan-400 font-mono">@{profileData.space.handle}</p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{profileData.space.bio || 'Galactic traveler realm.'}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-white/5 border border-white/5 rounded-2xl my-4 text-center">
                <div>
                  <span className="block font-black text-white text-sm">{profileData.stats.postCount}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Transmissions</span>
                </div>
                <div>
                  <span className="block font-black text-white text-sm">{profileData.stats.followers}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Followers</span>
                </div>
                <div>
                  <span className="block font-black text-white text-sm">{profileData.stats.following}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Following</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewProfileHandle(null);
                    setChatTargetSpaceId(profileData.space.id);
                    setCurrentTab('messages');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-violet-500/30 text-white font-bold text-xs hover:bg-violet-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Send Subspace Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 shadow-2xl border border-violet-500/30">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-3 shadow-[0_0_30px_rgba(168,85,247,0.6)]">
                <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">Enter the SocialGraph Universe</h2>
              <p className="text-xs text-slate-400 mt-1">Multi-space decentralized network accessible from all your devices.</p>
            </div>

            {/* Quick Demo Logins */}
            <div className="mb-6 bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">Instant Demo Authentication</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('arjun@socialgraph.dev')}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-left transition-all"
                >
                  <p className="font-bold text-xs text-white truncate">Arjun Rao</p>
                  <p className="text-[10px] text-slate-400 truncate">Robotics</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('priya@socialgraph.dev')}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-left transition-all"
                >
                  <p className="font-bold text-xs text-white truncate">Dr. Priya</p>
                  <p className="text-[10px] text-slate-400 truncate">Policy & AI</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('rohit@socialgraph.dev')}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-left transition-all"
                >
                  <p className="font-bold text-xs text-white truncate">Rohit Verma</p>
                  <p className="text-[10px] text-slate-400 truncate">Hardware</p>
                </button>
              </div>
            </div>

            <div className="flex border-b border-white/10 mb-4">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all ${
                  authMode === 'login' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all ${
                  authMode === 'register' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Arjun Rao"
                    value={authFullName}
                    onChange={e => setAuthFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@socialgraph.dev"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all mt-2"
              >
                {authMode === 'login' ? 'Sign In to Account' : 'Register & Setup Space'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SocialGraphApp />
    </ThemeProvider>
  );
};

export default App;
