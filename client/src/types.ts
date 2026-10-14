export type SpaceVisibility = 'public' | 'unlisted' | 'private';
export type PostContentType = 'post' | 'idea' | 'opinion' | 'reel';
export type PostAudience = 'public' | 'followers' | 'private';
export type ReactionType = 'like' | 'agree' | 'insightful' | 'collaborate';
export type IdeaStatus = 'concept' | 'research' | 'teaming' | 'building' | 'shipped';

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface SpaceFeedFilters {
  pinned_topics: string[];
  content_types: PostContentType[];
}

export interface Space {
  id: string;
  handle: string;
  name: string;
  bio: string;
  avatar_url?: string;
  cover_url?: string;
  visibility: SpaceVisibility;
  feed_filters: SpaceFeedFilters;
  is_discoverable: boolean;
  active_intent?: string;
  h3_res7?: string;
  city?: string;
  created_at: string;
  updated_at: string;
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
  space: Space;
  user_reaction?: ReactionType;
}

export interface Comment {
  id: string;
  post_id: string;
  space_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  space: Space;
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
  space: Space;
}

export interface ProximityMatch {
  id: string;
  space_id: string;
  intent_type: 'mentor' | 'mentee' | 'collaborator' | 'teammate';
  skills: string[];
  area_label: string;
  distance_approx_km: number;
  space: Space;
}

export interface ConsentRequest {
  id: string;
  sender_space_id: string;
  recipient_space_id: string;
  purpose: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender: Space;
  recipient: Space;
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
  type: string;
  title: string;
  body: string;
  target_id?: string;
  is_read: boolean;
  created_at: string;
  actor?: Space;
}

export interface Bookmark {
  id: string;
  space_id: string;
  post_id: string;
  collection_name: string;
  created_at: string;
  post: Post;
}
