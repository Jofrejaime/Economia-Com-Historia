import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';
import type { Document, DocumentCategory, Quiz, PaginatedResponse } from '../../types/api';
import { documentCache } from '../storage/documentCache';

export interface DocumentFilters {
  q?: string;
  category_id?: string;
  document_type?: string;
  academic_level?: string;
  access_level_id?: string;
  sort?: 'recent' | 'popular';
  page?: number;
  per_page?: number;
}

export const documentService = {
  async list(filters?: DocumentFilters): Promise<PaginatedResponse<Document>> {
    const { data } = await httpClient.get(API_ENDPOINTS.DOCUMENTS.LIST, { params: filters });
    return data;
  },

  async search(query: string, page = 1): Promise<PaginatedResponse<Document>> {
    const { data } = await httpClient.get(API_ENDPOINTS.DOCUMENTS.SEARCH, {
      params: { q: query, page },
    });
    return data;
  },

  async categories(): Promise<DocumentCategory[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.DOCUMENTS.CATEGORIES);
    return data.data ?? data;
  },

  async detail(id: string): Promise<Document> {
    try {
      const { data } = await httpClient.get(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
      const doc: Document = data.data ?? data;
      if (data.data) {
        doc.is_liked       = data.is_liked ?? false;
        doc.is_favorited   = data.is_favorited ?? false;
        doc.tags           = data.tags ?? [];
        doc.topics_preview = data.topics_preview ?? [];
      }
      void documentCache.save(doc);
      return doc;
    } catch (error: any) {
      // Network unreachable — serve from cache if available
      if (!error.response) {
        const cached = await documentCache.get(id);
        if (cached) return cached;
      }
      throw error;
    }
  },

  async relatedQuizzes(documentId: string): Promise<Quiz[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.DOCUMENTS.RELATED_QUIZZES(documentId));
    return data.data ?? data;
  },

  async like(id: string): Promise<void> {
    await httpClient.post(API_ENDPOINTS.DOCUMENTS.LIKE(id));
  },

  async unlike(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.DOCUMENTS.LIKE(id));
  },

  async favorite(id: string): Promise<void> {
    await httpClient.post(API_ENDPOINTS.DOCUMENTS.FAVORITE(id));
  },

  async unfavorite(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.DOCUMENTS.FAVORITE(id));
  },

  async myFavorites(): Promise<PaginatedResponse<Document>> {
    const { data } = await httpClient.get(API_ENDPOINTS.ME.FAVORITES);
    return data;
  },

  // Subscrição de documentos cuja categoria tem requires_subscription=true —
  // ver o comentário em constants/api.ts sobre a distinção com /access-requests.
  async subscribe(id: string): Promise<{ status: string; already_exists: boolean }> {
    const { data } = await httpClient.post(API_ENDPOINTS.DOCUMENTS.SUBSCRIBE(id));
    return data;
  },

  async getSubscriptionStatus(id: string): Promise<{
    required: boolean;
    status: string | null;
    reason: string | null;
    has_subscription: boolean;
    started_at: string | null;
  }> {
    const { data } = await httpClient.get(API_ENDPOINTS.DOCUMENTS.SUBSCRIPTION_STATUS(id));
    return data;
  },

  async cancelSubscription(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.DOCUMENTS.CANCEL_SUBSCRIPTION(id));
  },
};
