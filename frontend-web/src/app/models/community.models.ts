export interface ApiResult<T> {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
  meta?: Record<string, number>;
}

export interface ApiEnvelope<T> {
  data?: T;
  message?: string;
  meta?: Record<string, number>;
}

export interface CommunityCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  access_level_id: 'public' | 'jindungo' | 'restricted' | string;
  color_bg: string | null;
  color_text: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_active: boolean;
  members_count?: number;
  topics_count?: number;
  created_at?: string;
}

export interface CommunityUser {
  id: string;
  email: string;
  display_name?: string | null;
  full_name?: string | null;
  role?: string;
}

export interface TopicMember {
  id: string;
  topic_id: string;
  user_id: string;
  role: 'owner' | 'moderator' | 'member' | string;
  invited_by: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  user?: CommunityUser;
  inviter?: CommunityUser;
}

export interface DiscussionTopic {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'RESTRICTED' | 'PRIVATE' | string;
  status: 'open' | 'locked' | 'archived' | 'published' | 'draft' | string;
  is_pinned: boolean;
  is_featured: boolean;
  last_reply_at: string | null;
  replies_count: number;
  views_count: number;
  likes_count: number;
  followers_count: number;
  created_at: string;
  updated_at: string;
  author?: CommunityUser;
  category?: CommunityCategory;
  members?: TopicMember[];
}

export interface TopicReply {
  id: string;
  topic_id: string;
  author_id: string;
  parent_reply_id: string | null;
  content: string;
  is_accepted: boolean;
  is_flagged: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author?: CommunityUser;
}

export interface TopicMemberPayload {
  user_id: string;
  role?: 'member' | 'moderator';
}

export interface CreateTopicPayload {
  category_id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'RESTRICTED' | 'PRIVATE';
  member_ids?: string[];
  members?: TopicMemberPayload[];
}

export interface UpdateTopicPayload {
  title: string;
  content: string;
  status?: 'open' | 'locked' | 'archived' | 'published' | 'draft';
  visibility?: 'PUBLIC' | 'RESTRICTED' | 'PRIVATE';
}

export interface ReplyPayload {
  content: string;
  parent_reply_id?: string | null;
}

export interface PaginatedTopicResponse {
  data: DiscussionTopic[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface UserLookupResult {
  id: string;
  display_name: string;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
}
