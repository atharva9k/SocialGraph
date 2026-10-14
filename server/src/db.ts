import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Space,
  Follow,
  Post,
  Comment,
  Reaction,
  ReactionType,
  PostContentType,
  IdeaCanvas,
  Perspective,
  ProximityIntent,
  ConsentRequest,
  Message,
  Notification,
  Bookmark,
  Report,
  Block
} from './types.js';

interface DatabaseSchema {
  users: User[];
  spaces: Space[];
  follows: Follow[];
  posts: Post[];
  comments: Comment[];
  reactions: Reaction[];
  ideas: IdeaCanvas[];
  perspectives: Perspective[];
  proximity_intents: ProximityIntent[];
  consent_requests: ConsentRequest[];
  messages: Message[];
  notifications: Notification[];
  bookmarks: Bookmark[];
  reports: Report[];
  blocks: Block[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'socialgraph.json');

export class Database {
  private data: DatabaseSchema = {
    users: [],
    spaces: [],
    follows: [],
    posts: [],
    comments: [],
    reactions: [],
    ideas: [],
    perspectives: [],
    proximity_intents: [],
    consent_requests: [],
    messages: [],
    notifications: [],
    bookmarks: [],
    reports: [],
    blocks: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Error reading DB file, re-initializing...', err);
      }
    }

    this.seed();
    this.save();
  }

  public save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  private seed() {
    const passwordHash = bcrypt.hashSync('Password123!', 10);
    const now = new Date().toISOString();

    const u1: User = {
      id: 'usr_arjun_100',
      email: 'arjun@socialgraph.dev',
      password_hash: passwordHash,
      full_name: 'Arjun Rao',
      is_verified: true,
      verification_tier: 2,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      created_at: now,
      updated_at: now
    };

    const u2: User = {
      id: 'usr_priya_200',
      email: 'priya@socialgraph.dev',
      password_hash: passwordHash,
      full_name: 'Dr. Priya Sharma',
      is_verified: true,
      verification_tier: 3,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      created_at: now,
      updated_at: now
    };

    const u3: User = {
      id: 'usr_rohit_300',
      email: 'rohit@socialgraph.dev',
      password_hash: passwordHash,
      full_name: 'Rohit Verma',
      is_verified: true,
      verification_tier: 2,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      created_at: now,
      updated_at: now
    };

    this.data.users = [u1, u2, u3];

    // Spaces
    const sp1: Space = {
      id: 'spc_arjun_robotics',
      user_id: u1.id,
      handle: 'arjun_robotics',
      name: 'Hardware & IoT Lab',
      bio: 'Building low-cost environmental telemetry sensors & autonomous rovers. #robotics #embedded #iot',
      avatar_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=256&q=80',
      cover_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      visibility: 'public',
      feed_filters: {
        pinned_topics: ['robotics', 'embedded', 'iot', 'hardware', 'sensors'],
        content_types: ['post', 'idea', 'opinion']
      },
      is_discoverable: true,
      active_intent: 'Looking for PCB layout & embedded C++ collaborator in Mumbai',
      h3_res7: '87609206bffffff',
      city: 'Mumbai',
      created_at: now,
      updated_at: now
    };

    const sp2: Space = {
      id: 'spc_arjun_ideas',
      user_id: u1.id,
      handle: 'arjun_ideas',
      name: "Arjun's MyID Canvas",
      bio: 'Documenting practical problems, prior-art research, and prototype specs. #ideas #water-tech #cleantech',
      avatar_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=256&q=80',
      cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      visibility: 'public',
      feed_filters: {
        pinned_topics: ['ideas', 'innovation', 'water-tech', 'cleantech'],
        content_types: ['idea', 'post']
      },
      is_discoverable: true,
      active_intent: 'Seeking environmental science co-researcher',
      h3_res7: '87609206bffffff',
      city: 'Mumbai',
      created_at: now,
      updated_at: now
    };

    const sp3: Space = {
      id: 'spc_arjun_personal',
      user_id: u1.id,
      handle: 'arjun_personal',
      name: 'Arjun Rao',
      bio: 'Street photography, espresso notes, road trips. #photography #travel #thoughts',
      avatar_url: u1.avatar_url,
      visibility: 'public',
      feed_filters: {
        pinned_topics: ['photography', 'travel', 'books'],
        content_types: ['post', 'reel']
      },
      is_discoverable: false,
      created_at: now,
      updated_at: now
    };

    const sp4: Space = {
      id: 'spc_priya_ai',
      user_id: u2.id,
      handle: 'priya_ai',
      name: 'Dr. Priya | Multilingual AI',
      bio: 'Researcher in Indian language NLP & model alignment. Open for student mentorship. #ai #nlp #research',
      avatar_url: u2.avatar_url,
      cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      visibility: 'public',
      feed_filters: {
        pinned_topics: ['ai', 'nlp', 'research', 'bhashini', 'deeplearning'],
        content_types: ['post', 'opinion', 'idea']
      },
      is_discoverable: true,
      active_intent: 'Mentoring engineering students in PyTorch & transformer fine-tuning',
      h3_res7: '87609206affffff',
      city: 'Mumbai',
      created_at: now,
      updated_at: now
    };

    const sp5: Space = {
      id: 'spc_rohit_hardware',
      user_id: u3.id,
      handle: 'rohit_hardware',
      name: 'Rohit Verma | Firmware Eng',
      bio: 'Firmware hacker, STM32 & ESP32 developer. #embedded #firmware #pcb',
      avatar_url: u3.avatar_url,
      visibility: 'public',
      feed_filters: {
        pinned_topics: ['embedded', 'firmware', 'pcb', 'robotics'],
        content_types: ['post', 'idea', 'opinion']
      },
      is_discoverable: true,
      active_intent: 'Looking for IoT telemetry partner',
      h3_res7: '87609206bffffff',
      city: 'Mumbai',
      created_at: now,
      updated_at: now
    };

    this.data.spaces = [sp1, sp2, sp3, sp4, sp5];

    // Follows
    this.data.follows = [
      { id: 'fol_1', follower_space_id: sp1.id, following_space_id: sp4.id, created_at: now },
      { id: 'fol_2', follower_space_id: sp5.id, following_space_id: sp1.id, created_at: now }
    ];

    // Posts & Ideas
    const postIdea: Post = {
      id: 'pst_idea_water_sensor',
      space_id: sp2.id,
      content: 'Low-cost optical and turbidity water-quality probe for real-time river monitoring across rural districts.',
      media_urls: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'],
      content_type: 'idea',
      audience: 'public',
      tags: ['water-tech', 'embedded', 'iot', 'cleantech', 'ideas'],
      why_recommended: 'Matches your interest in embedded sensors and cleantech',
      like_count: 24,
      comment_count: 5,
      created_at: now,
      updated_at: now
    };

    const canvas: IdeaCanvas = {
      id: 'id_canvas_water',
      post_id: postIdea.id,
      space_id: sp2.id,
      title: 'Sub-\u20B91500 Multi-Parameter Water Quality Telemetry Node',
      problem: 'Commercial river water monitoring stations cost > \u20B980,000 and require frequent calibration, resulting in massive geographic telemetry blind spots across peri-urban and rural water bodies in Maharashtra.',
      proposed_solution: 'A solar-harvested floating buoy using multi-wavelength nephelometric turbidity sensing, pH probe with auto-cleaning wiper, and cellular NB-IoT/LoRa telemetry backhaul.',
      why_it_matters: 'Enables high-density spatial mapping of industrial effluent dumping before contaminated water enters municipal drinking water intakes.',
      existing_solutions: 'YSI ProDSS (commercial lab-grade, >$4000), basic Arduino turbidity sensors (rapid photodiode fouling after 48h, uncalibrated).',
      differentiation: 'Integrated ultrasonic antifouling transducer + differential optical calibration curve accounting for ambient temperature drift.',
      technical_challenges: 'Low-power sleep state under high turbidity, long-term biofouling on optical window, waterproof sealing at IP68 under thermal expansion.',
      required_skills: ['Embedded C / FreeRTOS', 'Optical Sensor Calibration', 'SolidWorks / IP68 Enclosure Design', 'LoRaWAN Packet Forwarding'],
      status: 'teaming',
      ai_prior_art_summary: 'Literature review identifies 4 comparable IEEE papers on low-cost nephelometry (e.g. Wang et al. 2023). Key failure mode observed in prior art was optical photodiode degradation after 3 weeks in field deployment.',
      risks: ['Biofilm buildup on optical emitter', 'Cellular coverage deadzones along riverbanks'],
      created_at: now
    };

    const postDebate: Post = {
      id: 'pst_ai_debate_1',
      space_id: sp4.id,
      content: 'Open Discourse: Will automated code synthesis replace software engineers, or elevate systems engineering?',
      media_urls: [],
      content_type: 'opinion',
      audience: 'public',
      tags: ['ai', 'perspectives', 'software', 'discourse'],
      why_recommended: 'Controversial topic with balanced community viewpoints',
      like_count: 42,
      comment_count: 12,
      created_at: now,
      updated_at: now
    };

    const persA: Perspective = {
      id: 'prs_a',
      post_id: postDebate.id,
      space_id: sp4.id,
      stance_label: 'Perspective A',
      title: 'Rapid Commodity of Routine Syntax & Boilerplate',
      argument: 'Large language models have reduced unit economics of standard CRUD logic to near zero. Entry-level engineering hiring for plain syntax translation will contract significantly.',
      evidence_sources: ['Metaculus AI benchmark forecasts 2025-2026', 'GitHub Copilot enterprise developer velocity surveys'],
      created_at: now
    };

    const persB: Perspective = {
      id: 'prs_b',
      post_id: postDebate.id,
      space_id: sp5.id,
      stance_label: 'Perspective B',
      title: 'Jevons Paradox: Software Demand Outpaces Supply',
      argument: 'Cheaper software creation unlocks orders of magnitude more custom software, firmware, and domain automation that was previously economically unviable. Net engineering demand grows.',
      evidence_sources: ['Economic analysis on Jevons Paradox in computing', 'ACM Communications: The expanding scope of domain systems'],
      created_at: now
    };

    const persC: Perspective = {
      id: 'prs_c',
      post_id: postDebate.id,
      space_id: sp1.id,
      stance_label: 'Perspective C',
      title: 'Shift from Coding to Verification & Hardware Interfacing',
      argument: 'The bottleneck moves from writing code to specifications, deterministic verification, safety boundaries, and interfacing with messy physical hardware where simulators fail.',
      evidence_sources: ['IEEE Software: Formal verification in the age of generative models'],
      created_at: now
    };

    const postReel: Post = {
      id: 'pst_reel_rover_test',
      space_id: sp1.id,
      content: 'Field testing differential drive slip compensation on loose gravel! Watch the wheel torque adjustments in real-time. #robotics #rover #embedded',
      media_urls: ['https://assets.mixkit.co/videos/preview/mixkit-circuit-board-details-41315-large.mp4'],
      content_type: 'reel',
      audience: 'public',
      tags: ['robotics', 'rover', 'reels', 'hardware'],
      why_recommended: 'Trending reel in the Mumbai Robotics community',
      like_count: 89,
      comment_count: 14,
      created_at: now,
      updated_at: now
    };

    this.data.posts = [postIdea, postDebate, postReel];
    this.data.ideas = [canvas];
    this.data.perspectives = [persA, persB, persC];

    // Proximity Intents
    this.data.proximity_intents = [
      {
        id: 'prx_1',
        space_id: sp1.id,
        intent_type: 'collaborator',
        skills: ['Embedded C', 'PCB Design', 'SolidWorks'],
        h3_index: '87609206bffffff',
        area_label: 'Mumbai Suburban (~10km)',
        is_active: true,
        created_at: now
      },
      {
        id: 'prx_2',
        space_id: sp4.id,
        intent_type: 'mentor',
        skills: ['PyTorch', 'NLP', 'Research Methodology'],
        h3_index: '87609206affffff',
        area_label: 'Mumbai Central (~8km)',
        is_active: true,
        created_at: now
      },
      {
        id: 'prx_3',
        space_id: sp5.id,
        intent_type: 'collaborator',
        skills: ['STM32', 'Firmware', 'FreeRTOS'],
        h3_index: '87609206bffffff',
        area_label: 'Mumbai Suburban (~12km)',
        is_active: true,
        created_at: now
      }
    ];

    // Comments
    this.data.comments = [
      {
        id: 'cmt_1',
        post_id: postIdea.id,
        space_id: sp5.id,
        content: 'Have you considered using an STM32WB55? It has BLE onboard and deep sleep down to 2uA which solves your battery budget.',
        created_at: now
      },
      {
        id: 'cmt_2',
        post_id: postIdea.id,
        space_id: sp2.id,
        content: 'Great pointer Rohit! The sleep current was indeed our biggest concern. Would love to collaborate on the power rail schematic.',
        parent_id: 'cmt_1',
        created_at: now
      }
    ];

    // Notifications
    this.data.notifications = [
      {
        id: 'notif_1',
        recipient_space_id: sp1.id,
        actor_space_id: sp5.id,
        type: 'follow',
        title: 'New Connection',
        body: '@rohit_hardware started following your Hardware & IoT Lab space',
        target_id: sp5.id,
        is_read: false,
        created_at: now
      },
      {
        id: 'notif_2',
        recipient_space_id: sp2.id,
        actor_space_id: sp5.id,
        type: 'comment',
        title: 'Idea Discussion',
        body: '@rohit_hardware commented on your Water Quality Telemetry Node',
        target_id: postIdea.id,
        is_read: false,
        created_at: now
      }
    ];
  }

  // User Methods
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Space Methods
  getSpacesByUserId(userId: string): Space[] {
    return this.data.spaces.filter(s => s.user_id === userId);
  }

  getSpaceById(id: string): Space | undefined {
    return this.data.spaces.find(s => s.id === id);
  }

  getSpaceByHandle(handle: string): Space | undefined {
    return this.data.spaces.find(s => s.handle.toLowerCase() === handle.toLowerCase());
  }

  createSpace(space: Space): Space {
    this.data.spaces.push(space);
    this.save();
    return space;
  }

  updateSpace(id: string, updates: Partial<Space>): Space | undefined {
    const idx = this.data.spaces.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.data.spaces[idx] = { ...this.data.spaces[idx], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return this.data.spaces[idx];
  }

  deleteSpace(id: string): boolean {
    const initialLen = this.data.spaces.length;
    this.data.spaces = this.data.spaces.filter(s => s.id !== id);
    if (this.data.spaces.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  getPublicSpaces(): Space[] {
    return this.data.spaces.filter(s => s.visibility === 'public');
  }

  // Posts & Feeds
  createPost(post: Post): Post {
    this.data.posts.unshift(post);
    this.save();
    return post;
  }

  getPostById(id: string): Post | undefined {
    return this.data.posts.find(p => p.id === id);
  }

  deletePost(id: string): boolean {
    const initialLen = this.data.posts.length;
    this.data.posts = this.data.posts.filter(p => p.id !== id);
    if (this.data.posts.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  getFeedForSpace(spaceId: string, filterContentType?: PostContentType): Array<Post & { space: Space; user_reaction?: ReactionType }> {
    const activeSpace = this.getSpaceById(spaceId);
    const pinnedTopics = activeSpace?.feed_filters?.pinned_topics || [];
    const allowedTypes = activeSpace?.feed_filters?.content_types || ['post', 'idea', 'opinion', 'reel'];

    const followingSpaceIds = this.data.follows
      .filter(f => f.follower_space_id === spaceId)
      .map(f => f.following_space_id);

    return this.data.posts
      .filter(post => {
        if (filterContentType && post.content_type !== filterContentType) return false;
        if (!filterContentType && !allowedTypes.includes(post.content_type)) return false;

        // Visibility rules
        if (post.audience === 'private' && post.space_id !== spaceId) return false;
        if (post.audience === 'followers' && post.space_id !== spaceId && !followingSpaceIds.includes(post.space_id)) return false;

        return true;
      })
      .map(post => {
        const creatorSpace = this.getSpaceById(post.space_id)!;
        const reaction = this.data.reactions.find(r => r.post_id === post.id && r.space_id === spaceId);
        
        let whyBadge = post.why_recommended;
        if (!whyBadge) {
          const matchingTopic = post.tags.find(t => pinnedTopics.includes(t));
          if (matchingTopic) {
            whyBadge = `Matches #${matchingTopic} pinned in your ${activeSpace?.name || 'active'} space`;
          } else if (followingSpaceIds.includes(post.space_id)) {
            whyBadge = `From a space you follow: @${creatorSpace.handle}`;
          } else {
            whyBadge = `Shared in the public SocialGraph network`;
          }
        }

        return {
          ...post,
          why_recommended: whyBadge,
          space: creatorSpace,
          user_reaction: reaction?.type
        };
      });
  }

  // Reactions & Comments
  addReaction(postId: string, spaceId: string, type: ReactionType): boolean {
    const existingIdx = this.data.reactions.findIndex(r => r.post_id === postId && r.space_id === spaceId);
    const post = this.getPostById(postId);
    if (!post) return false;

    if (existingIdx !== -1) {
      if (this.data.reactions[existingIdx].type === type) {
        // Toggle off
        this.data.reactions.splice(existingIdx, 1);
        post.like_count = Math.max(0, post.like_count - 1);
        this.save();
        return false;
      } else {
        this.data.reactions[existingIdx].type = type;
        this.save();
        return true;
      }
    } else {
      this.data.reactions.push({
        id: `rxn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        post_id: postId,
        space_id: spaceId,
        type,
        created_at: new Date().toISOString()
      });
      post.like_count += 1;
      this.save();
      return true;
    }
  }

  createComment(comment: Comment): Comment {
    this.data.comments.push(comment);
    const post = this.getPostById(comment.post_id);
    if (post) {
      post.comment_count += 1;
    }
    this.save();
    return comment;
  }

  getCommentsByPostId(postId: string): Array<Comment & { space: Space }> {
    return this.data.comments
      .filter(c => c.post_id === postId)
      .map(c => ({
        ...c,
        space: this.getSpaceById(c.space_id)!
      }));
  }

  // Ideas & Perspectives
  createIdeaCanvas(canvas: IdeaCanvas): IdeaCanvas {
    this.data.ideas.push(canvas);
    this.save();
    return canvas;
  }

  getIdeaByPostId(postId: string): IdeaCanvas | undefined {
    return this.data.ideas.find(i => i.post_id === postId);
  }

  getPerspectivesByPostId(postId: string): Array<Perspective & { space: Space }> {
    return this.data.perspectives
      .filter(p => p.post_id === postId)
      .map(p => ({
        ...p,
        space: this.getSpaceById(p.space_id)!
      }));
  }

  createPerspective(perspective: Perspective): Perspective {
    this.data.perspectives.push(perspective);
    this.save();
    return perspective;
  }

  // Proximity & Consent Handshake
  findNearbyIntents(currentSpaceId: string, querySkills?: string[]): Array<ProximityIntent & { space: Space; distance_approx_km: number }> {
    const currentSpace = this.getSpaceById(currentSpaceId);
    return this.data.proximity_intents
      .filter(pi => pi.is_active && pi.space_id !== currentSpaceId)
      .filter(pi => {
        if (!querySkills || querySkills.length === 0) return true;
        return pi.skills.some(s => querySkills.map(q => q.toLowerCase()).includes(s.toLowerCase()));
      })
      .map(pi => {
        const space = this.getSpaceById(pi.space_id)!;
        // Deterministic fuzzy distance simulation for H3 neighbors
        const distance_approx_km = pi.h3_index === currentSpace?.h3_res7 ? 4.5 : 12.0;
        return {
          ...pi,
          space,
          distance_approx_km
        };
      });
  }

  createConsentRequest(req: ConsentRequest): ConsentRequest {
    this.data.consent_requests.push(req);
    // Auto-create notification for recipient
    this.createNotification({
      id: `notif_${Date.now()}`,
      recipient_space_id: req.recipient_space_id,
      actor_space_id: req.sender_space_id,
      type: 'consent_request',
      title: 'New Connection Request',
      body: `A verified peer requested in-app collaboration: "${req.purpose}"`,
      target_id: req.id,
      is_read: false,
      created_at: new Date().toISOString()
    });
    this.save();
    return req;
  }

  respondToConsentRequest(requestId: string, status: 'accepted' | 'rejected'): ConsentRequest | undefined {
    const req = this.data.consent_requests.find(r => r.id === requestId);
    if (!req) return undefined;
    req.status = status;
    req.updated_at = new Date().toISOString();
    this.save();
    return req;
  }

  getConsentRequests(spaceId: string): Array<ConsentRequest & { sender: Space; recipient: Space }> {
    return this.data.consent_requests
      .filter(r => r.recipient_space_id === spaceId || r.sender_space_id === spaceId)
      .map(r => ({
        ...r,
        sender: this.getSpaceById(r.sender_space_id)!,
        recipient: this.getSpaceById(r.recipient_space_id)!
      }));
  }

  // Messaging
  sendMessage(msg: Message): Message {
    this.data.messages.push(msg);
    this.save();
    return msg;
  }

  getMessages(spaceId1: string, spaceId2: string): Message[] {
    return this.data.messages
      .filter(m => 
        (m.sender_space_id === spaceId1 && m.recipient_space_id === spaceId2) ||
        (m.sender_space_id === spaceId2 && m.recipient_space_id === spaceId1)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Follows
  toggleFollow(followerSpaceId: string, followingSpaceId: string): boolean {
    const idx = this.data.follows.findIndex(f => f.follower_space_id === followerSpaceId && f.following_space_id === followingSpaceId);
    if (idx !== -1) {
      this.data.follows.splice(idx, 1);
      this.save();
      return false; // unfollowed
    } else {
      this.data.follows.push({
        id: `fol_${Date.now()}`,
        follower_space_id: followerSpaceId,
        following_space_id: followingSpaceId,
        created_at: new Date().toISOString()
      });
      this.createNotification({
        id: `notif_${Date.now()}`,
        recipient_space_id: followingSpaceId,
        actor_space_id: followerSpaceId,
        type: 'follow',
        title: 'New Follower',
        body: `@${this.getSpaceById(followerSpaceId)?.handle} started following your space.`,
        target_id: followerSpaceId,
        is_read: false,
        created_at: new Date().toISOString()
      });
      this.save();
      return true; // followed
    }
  }

  isFollowing(followerSpaceId: string, followingSpaceId: string): boolean {
    return this.data.follows.some(f => f.follower_space_id === followerSpaceId && f.following_space_id === followingSpaceId);
  }

  getSpaceStats(spaceId: string) {
    const followers = this.data.follows.filter(f => f.following_space_id === spaceId).length;
    const following = this.data.follows.filter(f => f.follower_space_id === spaceId).length;
    const postCount = this.data.posts.filter(p => p.space_id === spaceId).length;
    return { followers, following, postCount };
  }

  // Notifications
  createNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  getNotifications(spaceId: string): Array<Notification & { actor?: Space }> {
    return this.data.notifications
      .filter(n => n.recipient_space_id === spaceId)
      .map(n => ({
        ...n,
        actor: n.actor_space_id ? this.getSpaceById(n.actor_space_id) : undefined
      }));
  }

  markNotificationRead(id: string): void {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.save();
    }
  }

  // Bookmarks
  toggleBookmark(spaceId: string, postId: string, collectionName = 'General'): boolean {
    const idx = this.data.bookmarks.findIndex(b => b.space_id === spaceId && b.post_id === postId);
    if (idx !== -1) {
      this.data.bookmarks.splice(idx, 1);
      this.save();
      return false;
    } else {
      this.data.bookmarks.push({
        id: `bmk_${Date.now()}`,
        space_id: spaceId,
        post_id: postId,
        collection_name: collectionName,
        created_at: new Date().toISOString()
      });
      this.save();
      return true;
    }
  }

  getBookmarks(spaceId: string): Array<Bookmark & { post: Post & { space: Space } }> {
    return this.data.bookmarks
      .filter(b => b.space_id === spaceId)
      .map(b => {
        const post = this.getPostById(b.post_id)!;
        const space = this.getSpaceById(post.space_id)!;
        return {
          ...b,
          post: {
            ...post,
            space
          }
        };
      })
      .filter(b => !!b.post);
  }

  // Reports
  createReport(report: Report): Report {
    this.data.reports.push(report);
    this.save();
    return report;
  }

  // Search
  search(query: string, filterDomain?: string) {
    const q = query.toLowerCase();
    const spaces = this.data.spaces.filter(s => 
      s.visibility === 'public' && 
      (s.name.toLowerCase().includes(q) || s.handle.toLowerCase().includes(q) || s.bio.toLowerCase().includes(q))
    );

    const posts = this.data.posts.filter(p => 
      p.audience === 'public' && 
      (p.content.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)))
    ).map(p => ({ ...p, space: this.getSpaceById(p.space_id)! }));

    const ideas = this.data.ideas.filter(i => 
      i.title.toLowerCase().includes(q) || 
      i.problem.toLowerCase().includes(q) || 
      i.required_skills.some(s => s.toLowerCase().includes(q))
    ).map(i => ({ ...i, space: this.getSpaceById(i.space_id)! }));

    return { spaces, posts, ideas };
  }
}

export const db = new Database();
