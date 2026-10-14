export type SpaceVisibility = 'public' | 'unlisted' | 'private';
export type PostContentType = 'post' | 'idea' | 'opinion' | 'reel';
export type PostAudience = 'public' | 'followers' | 'private';
export type ReactionType = 'like' | 'agree' | 'insightful' | 'collaborate';
export type IdeaStatus = 'concept' | 'research' | 'teaming' | 'building' | 'shipped';
export type ConsentStatus = 'pending' | 'accepted' | 'rejected';
export type ReportStatus = 'open' | 'reviewed' | 'actioned';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  is_verified: boolean;
  verification_tier: number; // 0=Guest, 1=Phone/Email, 2=Contributor/Student, 3=Org
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SpaceFeedFilters {
  pinned_topics: string[];
  content_types: PostContentType[];
  excluded_topics?: string[];
}

export interface Space {
  id: string;
  user_id: string; // Private link - never exposed in public space endpoints
  handle: string; // e.g., 'arjun_dev'
  name: string; // e.g., 'Robotics & Embedded'
  bio: string;
  avatar_url?: string;
  cover_url?: string;
  visibility: SpaceVisibility;
  feed_filters: SpaceFeedFilters;
  is_discoverable: boolean;
  active_intent?: string; // e.g. 'Looking for PCB designer in Mumbai'
  h3_res7?: string; // Fuzzy Uber H3 index
  city?: string;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_space_id: string;
  following_space_id: string;
  created_at: string;
}

export interface Post {
  id: string;
  space_id: string;
  content: string;
  media_urls: string[];
  content_type: PostContentType;
  audience: PostAudience;
  tags: string[];
  why_recommended?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  space_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  post_id: string;
  space_id: string;
  type: ReactionType;
  created_at: string;
}

export interface IdeaCanvas {
  id: string;
  post_id: string;
  space_id: string;
  title: string;
  problem: string;
  proposed_solution: string;
  why_it_matters: string;
  existing_solutions: string;
  differentiation: string;
  technical_challenges: string;
  required_skills: string[];
  status: IdeaStatus;
  ai_prior_art_summary?: string;
  risks?: string[];
  created_at: string;
}

export interface Perspective {
  id: string;
  post_id: string;
  space_id: string;
  stance_label: 'Perspective A' | 'Perspective B' | 'Perspective C';
  title: string;
  argument: string;
  evidence_sources: string[];
  created_at: string;
}

export interface ProximityIntent {
  id: string;
  space_id: string;
  intent_type: 'mentor' | 'mentee' | 'collaborator' | 'teammate';
  skills: string[];
  h3_index: string;
  area_label: string;
  is_active: boolean;
  created_at: string;
}

export interface ConsentRequest {
  id: string;
  sender_space_id: string;
  recipient_space_id: string;
  purpose: string;
  message: string;
  status: ConsentStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_space_id: string;
  recipient_space_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_space_id: string;
  actor_space_id?: string;
  type: 'follow' | 'like' | 'comment' | 'consent_request' | 'idea_match' | 'system';
  title: string;
  body: string;
  target_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  space_id: string;
  post_id: string;
  collection_name: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_space_id: string;
  target_type: 'post' | 'space' | 'comment';
  target_id: string;
  reason: string;
  status: ReportStatus;
  action_taken?: string;
  created_at: string;
}

export interface Block {
  id: string;
  blocker_space_id: string;
  blocked_space_id: string;
  created_at: string;
}
