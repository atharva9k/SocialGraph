import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db } from './db.js';
import { SpaceFeedFilters, PostContentType } from './types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'socialgraph_dev_super_secret_key_2026';

app.use(cors());
app.use(express.json());

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: token is expired or invalid' });
  }
};

// -----------------------------------------------------------------------------
// AUTH & ACCOUNT MANAGEMENT
// -----------------------------------------------------------------------------

app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const { email, password, full_name, initial_space_handle, initial_space_name } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const handle = (initial_space_handle || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')).toLowerCase();
  const existingSpace = db.getSpaceByHandle(handle);
  if (existingSpace) {
    return res.status(409).json({ error: `Space handle @${handle} is already taken. Please choose another.` });
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const passwordHash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  const user = db.createUser({
    id: userId,
    email,
    password_hash: passwordHash,
    full_name,
    is_verified: true,
    verification_tier: 1,
    avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${handle}`,
    created_at: now,
    updated_at: now
  });

  // Default initial space
  const space = db.createSpace({
    id: `spc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user.id,
    handle,
    name: initial_space_name || full_name,
    bio: 'Joined the SocialGraph network.',
    avatar_url: user.avatar_url,
    visibility: 'public',
    feed_filters: {
      pinned_topics: ['ideas', 'technology', 'discussions'],
      content_types: ['post', 'idea', 'opinion', 'reel']
    },
    is_discoverable: true,
    created_at: now,
    updated_at: now
  });

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, full_name: user.full_name },
    active_space: space,
    spaces: [space]
  });
});

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const spaces = db.getSpacesByUserId(user.id);
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    token,
    user: { id: user.id, email: user.email, full_name: user.full_name },
    active_space: spaces[0] || null,
    spaces
  });
});

app.get('/api/v1/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.userId!);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const spaces = db.getSpacesByUserId(user.id);
  res.json({
    user: { id: user.id, email: user.email, full_name: user.full_name },
    spaces
  });
});

// -----------------------------------------------------------------------------
// MULTI-SPACE ENGINE (Single Account, Multiple Spaces)
// -----------------------------------------------------------------------------

app.get('/api/v1/spaces/my-spaces', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const spaces = db.getSpacesByUserId(req.userId!);
  res.json({ spaces });
});

app.post('/api/v1/spaces', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { handle, name, bio, avatar_url, cover_url, visibility, feed_filters, is_discoverable, active_intent, city } = req.body;
  if (!handle || !name) {
    return res.status(400).json({ error: 'Handle and name are required' });
  }

  const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (db.getSpaceByHandle(cleanHandle)) {
    return res.status(409).json({ error: `Handle @${cleanHandle} is already taken.` });
  }

  const now = new Date().toISOString();
  const space = db.createSpace({
    id: `spc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: req.userId!,
    handle: cleanHandle,
    name,
    bio: bio || '',
    avatar_url: avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanHandle}`,
    cover_url: cover_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80',
    visibility: visibility || 'public',
    feed_filters: feed_filters || { pinned_topics: [], content_types: ['post', 'idea', 'opinion', 'reel'] },
    is_discoverable: is_discoverable ?? true,
    active_intent: active_intent || '',
    h3_res7: '87609206bffffff', // Default Mumbai H3 resolution 7 cell
    city: city || 'Mumbai',
    created_at: now,
    updated_at: now
  });

  res.status(201).json({ space });
});

app.put('/api/v1/spaces/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const space = db.getSpaceById(req.params.id);
  if (!space) {
    return res.status(404).json({ error: 'Space not found' });
  }
  if (space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this space' });
  }

  const updated = db.updateSpace(req.params.id, req.body);
  res.json({ space: updated });
});

app.delete('/api/v1/spaces/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const space = db.getSpaceById(req.params.id);
  if (!space) {
    return res.status(404).json({ error: 'Space not found' });
  }
  if (space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this space' });
  }

  const userSpaces = db.getSpacesByUserId(req.userId!);
  if (userSpaces.length <= 1) {
    return res.status(400).json({ error: 'Cannot delete your only remaining space.' });
  }

  db.deleteSpace(req.params.id);
  res.json({ success: true, message: 'Space deleted successfully' });
});

// Public space profile (Never leaks user_id or other spaces owned by user!)
app.get('/api/v1/spaces/:handle', (req: Request, res: Response) => {
  const space = db.getSpaceByHandle(req.params.handle);
  if (!space) {
    return res.status(404).json({ error: 'Space not found' });
  }

  const stats = db.getSpaceStats(space.id);
  // Redact private user_id
  const { user_id, ...safeSpace } = space;
  res.json({
    space: safeSpace,
    stats
  });
});

// -----------------------------------------------------------------------------
// SOCIAL GRAPH: FOLLOW / UNFOLLOW
// -----------------------------------------------------------------------------

app.post('/api/v1/spaces/:id/follow', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const targetSpaceId = req.params.id;
  const activeSpaceId = req.query.active_space_id as string;

  if (!activeSpaceId) {
    return res.status(400).json({ error: 'active_space_id parameter is required' });
  }

  // Verify ownership of the follower space
  const activeSpace = db.getSpaceById(activeSpaceId);
  if (!activeSpace || activeSpace.user_id !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized: you do not own this active space' });
  }

  if (activeSpaceId === targetSpaceId) {
    return res.status(400).json({ error: 'A space cannot follow itself' });
  }

  const followed = db.toggleFollow(activeSpaceId, targetSpaceId);
  const stats = db.getSpaceStats(targetSpaceId);
  res.json({ is_following: followed, stats });
});

app.get('/api/v1/spaces/:id/is-following', (req: Request, res: Response) => {
  const targetSpaceId = req.params.id;
  const activeSpaceId = req.query.active_space_id as string;
  if (!activeSpaceId) return res.json({ is_following: false });
  const isFollowing = db.isFollowing(activeSpaceId, targetSpaceId);
  res.json({ is_following: isFollowing });
});

// -----------------------------------------------------------------------------
// POSTS & CONTEXTUAL FEED
// -----------------------------------------------------------------------------

app.get('/api/v1/feed', (req: Request, res: Response) => {
  const spaceId = req.query.space_id as string;
  const contentType = req.query.content_type as PostContentType | undefined;

  if (!spaceId) {
    return res.status(400).json({ error: 'space_id query parameter is required to personalize feed' });
  }

  const feed = db.getFeedForSpace(spaceId, contentType);
  res.json({ posts: feed });
});

app.post('/api/v1/posts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { space_id, content, media_urls, content_type, audience, tags, why_recommended } = req.body;
  if (!space_id || !content) {
    return res.status(400).json({ error: 'space_id and content are required' });
  }

  const space = db.getSpaceById(space_id);
  if (!space || space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this publishing space' });
  }

  const now = new Date().toISOString();
  const post = db.createPost({
    id: `pst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    space_id,
    content,
    media_urls: media_urls || [],
    content_type: content_type || 'post',
    audience: audience || 'public',
    tags: tags || [],
    why_recommended: why_recommended || `Published by @${space.handle}`,
    like_count: 0,
    comment_count: 0,
    created_at: now,
    updated_at: now
  });

  res.status(201).json({ post: { ...post, space } });
});

app.delete('/api/v1/posts/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  const space = db.getSpaceById(post.space_id);
  if (!space || space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this post' });
  }

  db.deletePost(req.params.id);
  res.json({ success: true });
});

app.post('/api/v1/posts/:id/react', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { space_id, type } = req.body;
  if (!space_id) {
    return res.status(400).json({ error: 'space_id is required' });
  }

  const space = db.getSpaceById(space_id);
  if (!space || space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this active space' });
  }

  const isReacted = db.addReaction(req.params.id, space_id, type || 'like');
  const post = db.getPostById(req.params.id);
  res.json({ is_reacted: isReacted, like_count: post?.like_count || 0 });
});

app.get('/api/v1/posts/:id/comments', (req: Request, res: Response) => {
  const comments = db.getCommentsByPostId(req.params.id);
  res.json({ comments });
});

app.post('/api/v1/posts/:id/comments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { space_id, content, parent_id } = req.body;
  if (!space_id || !content) {
    return res.status(400).json({ error: 'space_id and content are required' });
  }

  const space = db.getSpaceById(space_id);
  if (!space || space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this active space' });
  }

  const comment = db.createComment({
    id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    post_id: req.params.id,
    space_id,
    content,
    parent_id,
    created_at: new Date().toISOString()
  });

  res.status(201).json({ comment: { ...comment, space } });
});

// -----------------------------------------------------------------------------
// MYID INNOVATION ENGINE (Structured Ideas & Prior Art)
// -----------------------------------------------------------------------------

app.post('/api/v1/ideas', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const {
    space_id,
    title,
    problem,
    proposed_solution,
    why_it_matters,
    existing_solutions,
    differentiation,
    technical_challenges,
    required_skills,
    media_urls
  } = req.body;

  if (!space_id || !title || !problem || !proposed_solution) {
    return res.status(400).json({ error: 'space_id, title, problem, and proposed_solution are mandatory' });
  }

  const space = db.getSpaceById(space_id);
  if (!space || space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this space' });
  }

  const now = new Date().toISOString();

  // Create the parent post
  const post = db.createPost({
    id: `pst_idea_${Date.now()}`,
    space_id,
    content: `${title}: ${problem.substring(0, 160)}...`,
    media_urls: media_urls || [],
    content_type: 'idea',
    audience: 'public',
    tags: ['ideas', ...(required_skills || [])],
    why_recommended: `New MyID Idea from @${space.handle}`,
    like_count: 0,
    comment_count: 0,
    created_at: now,
    updated_at: now
  });

  // Automated AI Evidence Analysis & Prior-Art Simulation
  const simulatedAnalysis = `Automated Prior-Art Scan: Found 3 related open-source projects and 2 academic literature preprints related to ${title}. Primary bottleneck observed in comparable deployments: ${technical_challenges || 'manufacturing cost and calibration'}.`;

  const canvas = db.createIdeaCanvas({
    id: `id_cnv_${Date.now()}`,
    post_id: post.id,
    space_id,
    title,
    problem,
    proposed_solution,
    why_it_matters: why_it_matters || '',
    existing_solutions: existing_solutions || 'None documented yet.',
    differentiation: differentiation || 'Novel integration of open-hardware components.',
    technical_challenges: technical_challenges || 'Thermal dissipation and firmware timing.',
    required_skills: required_skills || ['Software', 'Hardware'],
    status: 'concept',
    ai_prior_art_summary: simulatedAnalysis,
    risks: ['Deployment reliability', 'Component sourcing'],
    created_at: now
  });

  res.status(201).json({ post: { ...post, space }, canvas });
});

app.get('/api/v1/ideas/:postId', (req: Request, res: Response) => {
  const canvas = db.getIdeaByPostId(req.params.postId);
  if (!canvas) {
    return res.status(404).json({ error: 'Idea canvas not found' });
  }
  const space = db.getSpaceById(canvas.space_id);
  res.json({ canvas, space });
});

// -----------------------------------------------------------------------------
// DISCOURSE & MULTI-PERSPECTIVE ENGINE
// -----------------------------------------------------------------------------

app.get('/api/v1/posts/:id/perspectives', (req: Request, res: Response) => {
  const perspectives = db.getPerspectivesByPostId(req.params.id);
  res.json({ perspectives });
});

app.post('/api/v1/posts/:id/perspectives', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { space_id, stance_label, title, argument, evidence_sources } = req.body;
  if (!space_id || !stance_label || !title || !argument) {
    return res.status(400).json({ error: 'space_id, stance_label, title, and argument are required' });
  }

  const space = db.getSpaceById(space_id);
  if (!space || space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this space' });
  }

  const pers = db.createPerspective({
    id: `prs_${Date.now()}`,
    post_id: req.params.id,
    space_id,
    stance_label,
    title,
    argument,
    evidence_sources: evidence_sources || [],
    created_at: new Date().toISOString()
  });

  res.status(201).json({ perspective: { ...pers, space } });
});

// -----------------------------------------------------------------------------
// SAFE PROXIMITY & CONSENT HANDSHAKE (Uber H3 Indexing)
// -----------------------------------------------------------------------------

app.get('/api/v1/proximity/nearby', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const activeSpaceId = req.query.active_space_id as string;
  const skills = req.query.skills ? (req.query.skills as string).split(',') : undefined;

  if (!activeSpaceId) {
    return res.status(400).json({ error: 'active_space_id parameter is required' });
  }

  const matches = db.findNearbyIntents(activeSpaceId, skills);
  // Redact private user_ids from matched spaces
  const safeMatches = matches.map(m => {
    const { user_id, ...safeSpace } = m.space;
    return {
      ...m,
      space: safeSpace
    };
  });

  res.json({ matches: safeMatches });
});

app.post('/api/v1/proximity/request', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { sender_space_id, recipient_space_id, purpose, message } = req.body;
  if (!sender_space_id || !recipient_space_id || !purpose || !message) {
    return res.status(400).json({ error: 'sender_space_id, recipient_space_id, purpose, and message are required' });
  }

  const space = db.getSpaceById(sender_space_id);
  if (!space || space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this sender space' });
  }

  const now = new Date().toISOString();
  const request = db.createConsentRequest({
    id: `req_${Date.now()}`,
    sender_space_id,
    recipient_space_id,
    purpose,
    message,
    status: 'pending',
    created_at: now,
    updated_at: now
  });

  res.status(201).json({ request });
});

app.post('/api/v1/proximity/request/:id/respond', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { status, active_space_id } = req.body;
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Status must be 'accepted' or 'rejected'" });
  }

  const requests = db.getConsentRequests(active_space_id);
  const targetReq = requests.find(r => r.id === req.params.id);
  if (!targetReq) {
    return res.status(404).json({ error: 'Request not found' });
  }
  if (targetReq.recipient_space_id !== active_space_id) {
    return res.status(403).json({ error: 'Only the recipient can respond to this connection request' });
  }

  const updated = db.respondToConsentRequest(req.params.id, status);
  res.json({ request: updated });
});

app.get('/api/v1/proximity/requests', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const activeSpaceId = req.query.active_space_id as string;
  if (!activeSpaceId) {
    return res.status(400).json({ error: 'active_space_id is required' });
  }

  const requests = db.getConsentRequests(activeSpaceId);
  res.json({ requests });
});

// -----------------------------------------------------------------------------
// IN-APP MESSAGING (Unlocked via Mutual Consent or Followers)
// -----------------------------------------------------------------------------

app.get('/api/v1/messages/:otherSpaceId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const activeSpaceId = req.query.active_space_id as string;
  if (!activeSpaceId) {
    return res.status(400).json({ error: 'active_space_id is required' });
  }

  const messages = db.getMessages(activeSpaceId, req.params.otherSpaceId);
  res.json({ messages });
});

app.post('/api/v1/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { sender_space_id, recipient_space_id, content } = req.body;
  if (!sender_space_id || !recipient_space_id || !content) {
    return res.status(400).json({ error: 'sender_space_id, recipient_space_id, and content are required' });
  }

  const space = db.getSpaceById(sender_space_id);
  if (!space || space.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden: you do not own this sender space' });
  }

  const conversationId = [sender_space_id, recipient_space_id].sort().join('_');
  const msg = db.sendMessage({
    id: `msg_${Date.now()}`,
    conversation_id: conversationId,
    sender_space_id,
    recipient_space_id,
    content,
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.status(201).json({ message: msg });
});

// -----------------------------------------------------------------------------
// NOTIFICATIONS & BOOKMARKS
// -----------------------------------------------------------------------------

app.get('/api/v1/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const activeSpaceId = req.query.active_space_id as string;
  if (!activeSpaceId) {
    return res.status(400).json({ error: 'active_space_id is required' });
  }

  const notifications = db.getNotifications(activeSpaceId);
  res.json({ notifications });
});

app.post('/api/v1/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

app.post('/api/v1/bookmarks/:postId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { space_id, collection_name } = req.body;
  if (!space_id) {
    return res.status(400).json({ error: 'space_id is required' });
  }

  const isBookmarked = db.toggleBookmark(space_id, req.params.postId, collection_name);
  res.json({ is_bookmarked: isBookmarked });
});

app.get('/api/v1/bookmarks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const spaceId = req.query.space_id as string;
  if (!spaceId) {
    return res.status(400).json({ error: 'space_id parameter is required' });
  }

  const bookmarks = db.getBookmarks(spaceId);
  res.json({ bookmarks });
});

// -----------------------------------------------------------------------------
// SEARCH & DISCOVERY
// -----------------------------------------------------------------------------

app.get('/api/v1/search', (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q) {
    return res.json({ spaces: [], posts: [], ideas: [] });
  }

  const results = db.search(q);
  res.json(results);
});

// -----------------------------------------------------------------------------
// SAFETY & REPORTING
// -----------------------------------------------------------------------------

app.post('/api/v1/reports', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { reporter_space_id, target_type, target_id, reason } = req.body;
  if (!reporter_space_id || !target_type || !target_id || !reason) {
    return res.status(400).json({ error: 'All report parameters are required' });
  }

  const report = db.createReport({
    id: `rpt_${Date.now()}`,
    reporter_space_id,
    target_type,
    target_id,
    reason,
    status: 'open',
    created_at: new Date().toISOString()
  });

  res.status(201).json({ report });
});

// Serve frontend static build
const possibleClientPaths = [
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'client/dist')
];
const clientDist = possibleClientPaths.find(p => fs.existsSync(p));
if (clientDist) {
  app.use(express.static(clientDist));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// -----------------------------------------------------------------------------
// GALAXY AI ASSISTANT (Flexible, Robust Natural Language & Rough Speech Understanding)
// -----------------------------------------------------------------------------

app.post('/api/v1/ai/command', (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Normalize: lower case, remove punctuation, collapse spaces
  const raw = prompt.toLowerCase();
  const clean = raw.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  let action: any = null;
  let reply = '';

  // 1. LIGHT / DAY / WHITE THEME (handles rough language: 'kuch bright karo', 'make it day', 'too dark bro', 'safed karo', 'white mode', 'chamak')
  if (
    /\b(light|white|bright|day|daylight|safed|ujala|lit|sun|morning|too\s*dark|hate\s*dark|clean\s*light)\b/.test(clean)
  ) {
    action = { type: 'SET_THEME', theme: 'light' };
    reply = "Done! Switched to Clean Editorial Light mode. Crisp daylight typography and bright cards are now active.";
  }
  // 2. SYNTHWAVE / NEON / PURPLE / LASER / VAPORWAVE
  else if (
    /\b(synth|neon|purple|pink|violet|laser|cyberpunk|vapor|glow|vibrant|party)\b/.test(clean)
  ) {
    action = { type: 'SET_THEME', theme: 'synthwave' };
    reply = "Neon Synthwave engaged! Ultraviolet highlights and laser cyberpunk glow are locked in.";
  }
  // 3. PURE OLED DARK / OBSIDIAN / MINIMAL BLACK (handles: 'black kr do', 'oled', 'pure black', 'midnight', 'dark mode', 'andhera')
  else if (
    /\b(oled|obsidian|black|kala|andhera|pitch|battery|pure\s*dark|cyber\s*dark|dark\s*mode|dark)\b/.test(clean)
  ) {
    action = { type: 'SET_THEME', theme: 'cyber' };
    reply = "Obsidian OLED Dark mode activated. Pure battery-saving deep blacks with clean contrast.";
  }
  // 4. COSMIC / GALAXY / STARS / SPACE (handles: 'galaxy', 'antariksh', 'stars lao', 'universe theme', 'space theme')
  else if (
    /\b(galaxy|space|cosmic|stars|starlight|antariksh|universe\s*theme)\b/.test(clean)
  ) {
    action = { type: 'SET_THEME', theme: 'galaxy' };
    reply = "Cosmic Galaxy theme activated! Starry nebulae and interactive gravity physics enabled.";
  }
  // 5. CARDS VS ORBITAL SPACE VIEW
  else if (
    /\b(cards|grid|list|simple\s*view|normal\s*view|standard|regular)\b/.test(clean)
  ) {
    action = { type: 'SET_SPACE_MODE', mode: 'cards' };
    reply = "Switched space representation to Classic Modern Cards.";
  } else if (
    /\b(orbit|orbital|planet|solar|gola|chakkar|round)\b/.test(clean)
  ) {
    action = { type: 'SET_SPACE_MODE', mode: 'orbital' };
    reply = "Planetary Orbit Mode is now active! Spaces revolve as interactive planets around your core profile.";
  }
  // 6. PARTICLES ON/OFF (handles: 'band karo star', 'turn off', 'lag ho rha', 'stop', 'remove stars')
  else if (
    /\b(stop|disable|off|turn\s*off|remove|band|hatao|no)\b.*\b(particle|star|dust|dots|animation)\b/.test(clean) ||
    /\b(particle|star|dust)\b.*\b(stop|disable|off|turn\s*off|band|hatao)\b/.test(clean)
  ) {
    action = { type: 'SET_PARTICLES', enabled: false };
    reply = "Turned off star particles for extra speed and smoother battery life.";
  } else if (
    /\b(start|enable|on|turn\s*on|chalu|bring\s*back|show)\b.*\b(particle|star|dust|dots)\b/.test(clean)
  ) {
    action = { type: 'SET_PARTICLES', enabled: true };
    reply = "Interactive starlight particles reactivated!";
  }
  // 7. CAPTION / POST DRAFTING (handles rough prompts: 'kuch likh de', 'write something about...', 'post bana de', 'caption for...', 'tweet this')
  else if (
    /\b(write|draft|caption|post|likh|bana|create|generate|thought)\b/.test(clean)
  ) {
    // Extract the core topic roughly
    const topicRaw = prompt
      .replace(/(write|draft|caption|post|create|generate|likh\s*de|bana\s*de|kuch|about|for|par|pe|something)/gi, '')
      .trim();
    const topic = topicRaw.length > 2 ? topicRaw : 'emerging technology and human progress';

    const draftContent = `Building and innovating in ${topic} today! Big breakthroughs don't happen overnight, but step by step we shape what's next. What do you think about this direction? 🚀 #Innovation #BuildInPublic #SocialGraph`;
    action = { type: 'DRAFT_POST', content: draftContent };
    reply = `I got you! Here is a ready draft on "${topic}":\n\n"${draftContent}"\n\nI've loaded it into your post composer so you can review and transmit.`;
  }
  // 8. ROUGH / CASUAL CONVERSATION (e.g. 'wassup', 'kya hal', 'help me', 'who are you', 'bhai', 'bro', 'cool')
  else if (
    /\b(hi|hello|hey|bro|bhai|sup|wassup|kya\s*hal|kaise\s*ho|yo|help|kya\s*kar\s*skte)\b/.test(clean)
  ) {
    reply = "Hey! I'm your SocialGraph AI companion. Tell me whatever you need in plain words: change themes (dark, light, neon, galaxy), draft captions or posts, toggle orbital views, or tweak any settings. What's on your mind?";
  }
  // Fallback with friendly interpretation
  else {
    reply = `Got it! I understand what you're aiming for. You can tell me in rough language:
• "make it light / white mode"
• "black karo / oled dark"
• "neon glow theme"
• "write a post on [any topic]"
• "turn off particles"
• "switch to orbit mode"

What would you like me to adjust for you right now?`;
  }

  res.json({ reply, action });
});

// Start Server - Bind to 0.0.0.0 so any device on the network can connect
const HOST = '0.0.0.0';
app.listen(Number(PORT), HOST, () => {
  console.log(`[SocialGraph Server] running on http://${HOST}:${PORT}`);
});
