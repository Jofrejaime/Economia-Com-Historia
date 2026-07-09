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
  requires_subscription: boolean;
}

/** Objecto de categoria aninhado devolvido em Document.category (DocumentResource). */
export interface DocumentCategoryRef {
  id: string;
  name: string;
  slug: string | null;
  color_bg: string | null;
  color_text: string | null;
  icon: string | null;
  requires_subscription: boolean;
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
  /** Objecto aninhado (inclui requires_subscription) — usar em preferência aos campos category_* acima. */
  category?: DocumentCategoryRef | null;
  document_type: string;
  media_type: string | null;
  media_url: string | null;
  academic_level: 'intro' | 'advanced' | 'doctorate';
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
  is_liked: boolean;
  is_favorited: boolean;
  tags: DocumentTag[];
}

/** Item de media (galeria de fotos) devolvido em GET /documents/{id} → media.gallery. */
export interface DocumentMediaItem {
  id: string;
  url: string;
  thumbnail: string | null;
  preview: string | null;
  filename: string | null;
  width: number | null;
  height: number | null;
}

export interface DocumentDetail extends Document {
  content: string | null;
  pdf_url: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
  /** Galeria de fotos (coleção 'gallery'); [] quando não há. */
  gallery: DocumentMediaItem[];
}

// GET /documents pagina de facto (DocumentSearchService::paginate(), 15/página,
// tecto 50) — ver PageMeta/getDocumentsPage abaixo. Só GET /me/favorites usa um
// limit(50) simples sem paginação real.
export interface DocumentsResponse {
  data: Document[];
}

export interface PageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Estado da subscrição devolvido por GET /documents/{id}/subscription.
 * `required = true` quando a categoria do documento exige subscrição
 * (requires_subscription); o desbloqueio é feito por subscrição de documento
 * (POST /documents/{id}/subscribe → admin aprova). Categorias públicas → livre.
 */
export interface SubscriptionStatus {
  required: boolean;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CANCELLED' | null;
  reason: string | null;
  has_subscription: boolean;
  started_at: string | null;
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
    academic_level?: string;
    document_type?: string;
    media_type?: string;
    status?: string;
    per_page?: number;
  } = {}): Promise<Document[]> {
    let httpParams = new HttpParams();
    if (params.category_id)     httpParams = httpParams.set('category_id', params.category_id);
    if (params.academic_level)  httpParams = httpParams.set('academic_level', params.academic_level);
    if (params.document_type)   httpParams = httpParams.set('document_type', params.document_type);
    if (params.media_type)      httpParams = httpParams.set('media_type', params.media_type);
    if (params.status)          httpParams = httpParams.set('status', params.status);
    if (params.per_page)        httpParams = httpParams.set('per_page', String(params.per_page));

    const res = await firstValueFrom(
      this.http.get<{ data: Document[] }>(`${this.base}/documents`, {
        headers: this.headers,
        params: httpParams,
      })
    );
    return res.data;
  }

  /**
   * Igual a getDocuments(), mas devolve também a meta de paginação real do
   * backend (DocumentSearchService::paginate()) — usar quando for preciso
   * "carregar mais" em vez de assumir que a primeira página é tudo.
   */
  async getDocumentsPage(params: {
    category_id?: string;
    academic_level?: string;
    document_type?: string;
    media_type?: string;
    status?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<{ data: Document[]; meta: PageMeta }> {
    let httpParams = new HttpParams();
    if (params.category_id)     httpParams = httpParams.set('category_id', params.category_id);
    if (params.academic_level)  httpParams = httpParams.set('academic_level', params.academic_level);
    if (params.document_type)   httpParams = httpParams.set('document_type', params.document_type);
    if (params.media_type)      httpParams = httpParams.set('media_type', params.media_type);
    if (params.status)          httpParams = httpParams.set('status', params.status);
    if (params.per_page)        httpParams = httpParams.set('per_page', String(params.per_page));
    if (params.page)            httpParams = httpParams.set('page', String(params.page));

    return firstValueFrom(
      this.http.get<{ data: Document[]; meta: PageMeta }>(`${this.base}/documents`, {
        headers: this.headers,
        params: httpParams,
      })
    );
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

  /** Igual a searchDocuments(), mas devolve também a meta de paginação real do backend. */
  async searchDocumentsPage(params: {
    q?: string;
    category_id?: string;
    document_type?: string;
    media_type?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<{ data: Document[]; meta: PageMeta }> {
    let httpParams = new HttpParams();
    if (params.q)             httpParams = httpParams.set('q', params.q);
    if (params.category_id)   httpParams = httpParams.set('category_id', params.category_id);
    if (params.document_type) httpParams = httpParams.set('document_type', params.document_type);
    if (params.media_type)    httpParams = httpParams.set('media_type', params.media_type);
    if (params.per_page)      httpParams = httpParams.set('per_page', String(params.per_page));
    if (params.page)          httpParams = httpParams.set('page', String(params.page));

    return firstValueFrom(
      this.http.get<{ data: Document[]; meta: PageMeta }>(`${this.base}/documents/search`, {
        headers: this.headers,
        params: httpParams,
      })
    );
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

  // ==========================================
  // SUBSCRIÇÕES (categorias com requires_subscription)
  // ==========================================

  /** Pede subscrição de um documento cuja categoria exige subscrição. */
  async subscribeDocument(id: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.base}/documents/${id}/subscribe`, {}, { headers: this.headers })
    );
  }

  /**
   * Estado da subscrição do utilizador para este documento.
   * O campo `required` indica se o documento é, de facto, gerido por
   * subscrição (true) ou por nível de acesso (false) — ver SubscriptionStatus.
   */
  async getSubscriptionStatus(id: string): Promise<SubscriptionStatus> {
    return firstValueFrom(
      this.http.get<SubscriptionStatus>(
        `${this.base}/documents/${id}/subscription`,
        { headers: this.headers }
      )
    );
  }

  /** Cancela o pedido/subscrição deste documento. */
  async cancelSubscription(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.base}/documents/${id}/subscription`, { headers: this.headers })
    );
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
      this.http.get<{
        data: any;
        media?: { gallery?: DocumentMediaItem[] } | null;
        tags: DocumentTag[];
        is_liked: boolean;
        is_favorited: boolean;
      }>(
        `${this.base}/documents/${id}`,
        { headers: this.headers }
      )
    );

    // A galeria vem no bloco `media` (agrupado por coleção no backend); a
    // coleção 'gallery' é sempre uma lista. Normalizamos para [] se ausente.
    const gallery = Array.isArray(res.media?.gallery) ? res.media!.gallery! : [];

    return {
      ...res.data,
      tags: res.tags,
      is_liked: res.is_liked,
      is_favorited: res.is_favorited,
      gallery,
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

  /** Documentos guardados pelo utilizador — GET /me/favorites (limit(50) simples, sem paginação). */
  async getFavorites(): Promise<Document[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: Document[] } | Document[]>(`${this.base}/me/favorites`, {
        headers: this.headers,
      })
    );
    return Array.isArray(res) ? res : (res?.data ?? []);
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

}