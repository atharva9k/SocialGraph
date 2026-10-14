import type {
  User,
  Space,
  Post,
  Comment,
  IdeaCanvas,
  Perspective,
  ProximityMatch,
  ConsentRequest,
  Message,
  Notification,
  Bookmark,
  PostContentType,
  ReactionType
} from './types';

// Dynamically resolve API host so phones/tablets on the LAN connect to the correct server IP
const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:4000/api/v1`;
  }
  return 'http://localhost:4000/api/v1';
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || getApiBase();

class ApiService {
  private token: string | null = localStorage.getItem('sg_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('sg_token', token);
    } else {
      localStorage.removeItem('sg_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Network request failed' }));
      throw new Error(errorData.error || `HTTP error ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.fetchJson<{ token: string; user: User; active_space: Space; spaces: Space[] }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async register(email: string, password: string, full_name: string, initial_space_handle?: string, initial_space_name?: string) {
    const data = await this.fetchJson<{ token: string; user: User; active_space: Space; spaces: Space[] }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, initial_space_handle, initial_space_name })
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.fetchJson<{ user: User; spaces: Space[] }>('/auth/me');
  }

  // Spaces
  async getMySpaces() {
    return this.fetchJson<{ spaces: Space[] }>('/spaces/my-spaces');
  }

  async createSpace(spaceData: Partial<Space>) {
    return this.fetchJson<{ space: Space }>('/spaces', {
      method: 'POST',
      body: JSON.stringify(spaceData)
    });
  }

  async updateSpace(spaceId: string, updates: Partial<Space>) {
    return this.fetchJson<{ space: Space }>(`/spaces/${spaceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async getSpaceProfile(handle: string) {
    return this.fetchJson<{ space: Space; stats: { followers: number; following: number; postCount: number } }>(`/spaces/${handle}`);
  }

  async toggleFollow(targetSpaceId: string, activeSpaceId: string) {
    return this.fetchJson<{ is_following: boolean; stats: { followers: number; following: number; postCount: number } }>(
      `/spaces/${targetSpaceId}/follow?active_space_id=${activeSpaceId}`,
      { method: 'POST' }
    );
  }

  async checkIsFollowing(targetSpaceId: string, activeSpaceId: string) {
    return this.fetchJson<{ is_following: boolean }>(`/spaces/${targetSpaceId}/is-following?active_space_id=${activeSpaceId}`);
  }

  // Posts & Feeds
  async getFeed(spaceId: string, contentType?: PostContentType) {
    const query = contentType ? `?space_id=${spaceId}&content_type=${contentType}` : `?space_id=${spaceId}`;
    return this.fetchJson<{ posts: Post[] }>(`/feed${query}`);
  }

  async createPost(postData: {
    space_id: string;
    content: string;
    media_urls?: string[];
    content_type?: PostContentType;
    tags?: string[];
  }) {
    return this.fetchJson<{ post: Post }>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async reactToPost(postId: string, spaceId: string, type: ReactionType = 'like') {
    return this.fetchJson<{ is_reacted: boolean; like_count: number }>(`/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ space_id: spaceId, type })
    });
  }

  async getComments(postId: string) {
    return this.fetchJson<{ comments: Comment[] }>(`/posts/${postId}/comments`);
  }

  async addComment(postId: string, spaceId: string, content: string) {
    return this.fetchJson<{ comment: Comment }>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ space_id: spaceId, content })
    });
  }

  // MyID Ideas
  async createIdea(ideaData: {
    space_id: string;
    title: string;
    problem: string;
    proposed_solution: string;
    why_it_matters: string;
    existing_solutions: string;
    differentiation: string;
    technical_challenges: string;
    required_skills: string[];
    media_urls?: string[];
  }) {
    return this.fetchJson<{ post: Post; canvas: IdeaCanvas }>('/ideas', {
      method: 'POST',
      body: JSON.stringify(ideaData)
    });
  }

  async getIdea(postId: string) {
    return this.fetchJson<{ canvas: IdeaCanvas; space: Space }>(`/ideas/${postId}`);
  }

  // Perspectives
  async getPerspectives(postId: string) {
    return this.fetchJson<{ perspectives: Perspective[] }>(`/posts/${postId}/perspectives`);
  }

  async addPerspective(postId: string, data: {
    space_id: string;
    stance_label: 'Perspective A' | 'Perspective B' | 'Perspective C';
    title: string;
    argument: string;
    evidence_sources: string[];
  }) {
    return this.fetchJson<{ perspective: Perspective }>(`/posts/${postId}/perspectives`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Proximity & Mentorship
  async getNearbyMatches(activeSpaceId: string, skills?: string[]) {
    const query = skills && skills.length > 0 ? `?active_space_id=${activeSpaceId}&skills=${skills.join(',')}` : `?active_space_id=${activeSpaceId}`;
    return this.fetchJson<{ matches: ProximityMatch[] }>(`/proximity/nearby${query}`);
  }

  async sendConsentRequest(data: {
    sender_space_id: string;
    recipient_space_id: string;
    purpose: string;
    message: string;
  }) {
    return this.fetchJson<{ request: ConsentRequest }>('/proximity/request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async respondConsentRequest(requestId: string, status: 'accepted' | 'rejected', activeSpaceId: string) {
    return this.fetchJson<{ request: ConsentRequest }>(`/proximity/request/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status, active_space_id: activeSpaceId })
    });
  }

  async getConsentRequests(activeSpaceId: string) {
    return this.fetchJson<{ requests: ConsentRequest[] }>(`/proximity/requests?active_space_id=${activeSpaceId}`);
  }

  // Messaging
  async getMessages(otherSpaceId: string, activeSpaceId: string) {
    return this.fetchJson<{ messages: Message[] }>(`/messages/${otherSpaceId}?active_space_id=${activeSpaceId}`);
  }

  async sendMessage(senderSpaceId: string, recipientSpaceId: string, content: string) {
    return this.fetchJson<{ message: Message }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ sender_space_id: senderSpaceId, recipient_space_id: recipientSpaceId, content })
    });
  }

  // Notifications & Bookmarks
  async getNotifications(activeSpaceId: string) {
    return this.fetchJson<{ notifications: Notification[] }>(`/notifications?active_space_id=${activeSpaceId}`);
  }

  async markNotificationRead(id: string) {
    return this.fetchJson<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' });
  }

  async toggleBookmark(postId: string, spaceId: string) {
    return this.fetchJson<{ is_bookmarked: boolean }>(`/bookmarks/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ space_id: spaceId })
    });
  }

  async getBookmarks(spaceId: string) {
    return this.fetchJson<{ bookmarks: Bookmark[] }>(`/bookmarks?space_id=${spaceId}`);
  }

  // Search
  async search(query: string) {
    return this.fetchJson<{ spaces: Space[]; posts: Post[]; ideas: IdeaCanvas[] }>(`/search?q=${encodeURIComponent(query)}`);
  }

  // Reports
  async reportContent(reporterSpaceId: string, targetType: 'post' | 'space' | 'comment', targetId: string, reason: string) {
    return this.fetchJson<{ report: any }>('/reports', {
      method: 'POST',
      body: JSON.stringify({ reporter_space_id: reporterSpaceId, target_type: targetType, target_id: targetId, reason })
    });
  }

  // Galaxy AI
  async askGalaxyAi(prompt: string) {
    return this.fetchJson<{ reply: string; action?: { type: string; [key: string]: any } }>('/ai/command', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  }
}

export const api = new ApiService();
