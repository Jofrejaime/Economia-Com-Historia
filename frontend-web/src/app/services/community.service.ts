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
}