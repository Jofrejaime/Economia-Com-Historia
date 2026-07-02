import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';
import type { Document, DocumentCategory, Quiz, PaginatedResponse } from '../../types/api';

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
    const { data } = await httpClient.get(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
    return data.data ?? data;
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
};
