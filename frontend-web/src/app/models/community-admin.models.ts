export interface ApiResult<T> {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
}

export interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

export type TopicVisibility = 'PUBLIC' | 'CATEGORY' | 'INVITE_ONLY';

export interface Category {
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

export interface CategoryCreatePayload {
  slug: string;
  name: string;
  description?: string | null;
  access_level_id?: string;
  color_bg?: string | null;
  color_text?: string | null;
  cover_image_url?: string | null;
  sort_order?: number;
}

export interface DiscussionTopicAuthor {
  id?: string;
  display_name?: string;
  email?: string;
}

export interface DiscussionTopicCategory {
  id?: string;
  name?: string;
  slug?: string;
}

export interface DiscussionTopic {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  visibility: TopicVisibility | string;
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
  author?: DiscussionTopicAuthor;
  category?: DiscussionTopicCategory;
}

export interface DiscussionTopicPayload {
  title: string;
  content: string;
  status?: 'open' | 'locked' | 'archived' | 'published' | 'draft';
  category_id?: string | null;
  is_pinned?: boolean;
  is_featured?: boolean;
  visibility?: TopicVisibility;
}

export interface TopicReplyAuthor {
  id?: string;
  display_name?: string;
  email?: string;
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
  author?: TopicReplyAuthor;
}

export interface TopicReplyPayload {
  content: string;
}
