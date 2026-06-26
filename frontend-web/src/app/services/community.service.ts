import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CommunityCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  access_level_id: string;
  color_bg: string | null;
  color_text: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_active: boolean;
  members_count: number;
  topics_count: number;
}

// Adiciona ao community.service.ts existente

export interface TopicReply {
  id: string;
  topic_id: string;
  author_id: string;
  parent_reply_id: string | null;
  content: string;
  is_accepted: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author: TopicAuthor | null;
  is_liked?: boolean;
}

export interface TopicDetail extends DiscussionTopic {
  is_liked?: boolean;
  is_following?: boolean;
}

export interface TopicAuthor {
  id: string;
  display_name: string;
  avatar_url: string | null;
  institution: string | null;
}

export interface DiscussionTopic {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  status: string;
  is_pinned: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  last_reply_at: string | null;
  replies_count: number;
  views_count: number;
  likes_count: number;
  followers_count: number;
  author: TopicAuthor | null;
  category: CommunityCategory | null;
}

@Injectable({ providedIn: 'root' })
export class CommunityService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): Record<string, string> {
    const token = this.auth.getToken();
    return token ? this.auth.getAuthHeaders(token) : { Accept: 'application/json' };
  }

  async getCategories(): Promise<CommunityCategory[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: CommunityCategory[] }>(`${this.base}/community/categories`, {
        headers: this.headers,
      })
    );
    return res.data;
  }

  async getTopics(): Promise<DiscussionTopic[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: DiscussionTopic[] }>(`${this.base}/topics`, {
        headers: this.headers,
      })
    );
    return res.data;
  }

  async getTopic(id: string): Promise<TopicDetail> {
  const res = await firstValueFrom(
    this.http.get<{ data: TopicDetail }>(`${this.base}/topics/${id}`, {
      headers: this.headers,
    })
  );
  return res.data;
}

async getReplies(topicId: string): Promise<TopicReply[]> {
  const res = await firstValueFrom(
    this.http.get<{ data: TopicReply[] }>(`${this.base}/topics/${topicId}/replies`, {
      headers: this.headers,
    })
  );
  return res.data;
}

async postReply(topicId: string, content: string, parentReplyId?: string): Promise<TopicReply> {
  const body: any = { content };
  if (parentReplyId) body.parent_reply_id = parentReplyId;
  const res = await firstValueFrom(
    this.http.post<{ data: TopicReply }>(`${this.base}/topics/${topicId}/replies`, body, {
      headers: this.headers,
    })
  );
  return res.data;
}

async likeTopic(topicId: string): Promise<void> {
  await firstValueFrom(
    this.http.post(`${this.base}/topics/${topicId}/like`, {}, { headers: this.headers })
  );
}

async unlikeTopic(topicId: string): Promise<void> {
  await firstValueFrom(
    this.http.delete(`${this.base}/topics/${topicId}/like`, { headers: this.headers })
  );
}

async likeReply(replyId: string): Promise<void> {
  await firstValueFrom(
    this.http.post(`${this.base}/replies/${replyId}/like`, {}, { headers: this.headers })
  );
}

async unlikeReply(replyId: string): Promise<void> {
  await firstValueFrom(
    this.http.delete(`${this.base}/replies/${replyId}/like`, { headers: this.headers })
  );
}

async deleteTopic(topicId: string): Promise<void> {
  await firstValueFrom(
    this.http.delete(`${this.base}/topics/${topicId}`, { headers: this.headers })
  );
}

async deleteReply(replyId: string): Promise<void> {
  await firstValueFrom(
    this.http.delete(`${this.base}/replies/${replyId}`, { headers: this.headers })
  );
}
}