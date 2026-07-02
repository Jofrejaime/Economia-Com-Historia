import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface DocumentCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color_bg: string | null;
  color_text: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
}

export interface DocumentTag {
  id: string;
  name: string;
  slug: string;
}

export interface Document {
  id: string;
  title: string;
  slug: string | null;
  author: string;
  institution: string | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  category_color_bg: string | null;
  category_icon: string | null;
  document_type: string;
  media_type: string | null;
  media_url: string | null;
  academic_level: 'intro' | 'advanced' | 'doctorate';
  access_level_id: string;
  access_level_name: string | null;
  publication_date: string | null;
  period_start: number | null;
  period_end: number | null;
  summary: string;
  cover_image_url: string | null;
  unique_id: string | null;
  physical_location: string | null;
  record_type: string | null;
  status: string;
  published_at: string | null;
  views_count: number;
  likes_count: number;
  downloads_count: number;
  is_liked: boolean;
  is_favorited: boolean;
  tags: DocumentTag[];
}

export interface DocumentDetail extends Document {
  content: string | null;
  pdf_url: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
}

// Sem paginação real — backend usa limit(50)
export interface DocumentsResponse {
  data: Document[];
}

export interface RelatedQuiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  category_id: string | null;
  published_at: string | null;
  sort_order: number;
}

export interface RelatedTopicAuthor {
  display_name: string | null;
  avatar_url: string | null;
}

export interface RelatedTopic {
  id: string;
  title: string;
  replies_count: number;
  created_at: string;
  author: RelatedTopicAuthor | null;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): Record<string, string> {
    const token = this.auth.getToken();
    return token ? this.auth.getAuthHeaders(token) : { Accept: 'application/json' };
  }

  async getDocuments(params: {
  category_id?: string;
  access_level_id?: string;
  academic_level?: string;
  document_type?: string;
  media_type?: string;
  status?: string;
} = {}): Promise<Document[]> {
  let httpParams = new HttpParams();
  if (params.category_id)     httpParams = httpParams.set('category_id', params.category_id);
  if (params.access_level_id) httpParams = httpParams.set('access_level_id', params.access_level_id);
  if (params.academic_level)  httpParams = httpParams.set('academic_level', params.academic_level);
  if (params.document_type)   httpParams = httpParams.set('document_type', params.document_type);
  if (params.media_type)      httpParams = httpParams.set('media_type', params.media_type);
  if (params.status)          httpParams = httpParams.set('status', params.status);

  const res = await firstValueFrom(
    this.http.get<{ data: Document[] }>(`${this.base}/documents`, {
      headers: this.headers,
      params: httpParams,
    })
  );
  return res.data;
}

  async searchDocuments(params: {
  q?: string;
  category_id?: string;
  document_type?: string;
  media_type?: string;
} = {}): Promise<Document[]> {
  let httpParams = new HttpParams();
  if (params.q)             httpParams = httpParams.set('q', params.q);
  if (params.category_id)   httpParams = httpParams.set('category_id', params.category_id);
  if (params.document_type) httpParams = httpParams.set('document_type', params.document_type);
  if (params.media_type)    httpParams = httpParams.set('media_type', params.media_type);

  const res = await firstValueFrom(
    this.http.get<{ data: Document[] }>(`${this.base}/documents/search`, {
      headers: this.headers,
      params: httpParams,
    })
  );
  return res.data;
}

/**
   * Quizzes relacionados com este documento — associação primariamente por
   * categoria, complementada por associação directa opcional (quiz_documents).
   * Endpoint: GET /documents/{id}/quizzes
   */
  async getRelatedQuizzes(documentId: string): Promise<RelatedQuiz[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: RelatedQuiz[] }>(
          `${this.base}/documents/${documentId}/quizzes`,
          { headers: this.headers }
        )
      );
      return res.data ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Tópicos de fórum relacionados com este documento — associação directa e
   * explícita, definida no momento em que o tópico é criado a partir desta
   * página (document_id em discussion_topics).
   * Endpoint: GET /documents/{id}/topics
   */
  async getRelatedTopics(documentId: string): Promise<RelatedTopic[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ data: RelatedTopic[] }>(
          `${this.base}/documents/${documentId}/topics`,
          { headers: this.headers }
        )
      );
      return res.data ?? [];
    } catch {
      return [];
    }
  }
  async getDocument(id: string): Promise<DocumentDetail> {
    const res = await firstValueFrom(
      this.http.get<{ data: any; tags: DocumentTag[]; is_liked: boolean; is_favorited: boolean }>(
        `${this.base}/documents/${id}`,
        { headers: this.headers }
      )
    );

    return {
      ...res.data,
      tags: res.tags,
      is_liked: res.is_liked,
      is_favorited: res.is_favorited,
    };
  }

  async getCategories(): Promise<DocumentCategory[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: DocumentCategory[] }>(`${this.base}/document-categories`, {
        headers: this.headers,
      })
    );
    return res.data ?? (res as any);
  }

  async likeDocument(id: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.base}/documents/${id}/like`, {}, { headers: this.headers })
    );
  }

  async unlikeDocument(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.base}/documents/${id}/like`, { headers: this.headers })
    );
  }

  async favoriteDocument(id: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.base}/documents/${id}/favorite`, {}, { headers: this.headers })
    );
  }

  async unfavoriteDocument(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.base}/documents/${id}/favorite`, { headers: this.headers })
    );
  }

  async downloadDocument(id: string): Promise<string | null> {
    const res = await firstValueFrom(
      this.http.post<{ pdf_url: string | null }>(
        `${this.base}/documents/${id}/download`, {}, { headers: this.headers }
      )
    );
    return res.pdf_url;
  }
}
