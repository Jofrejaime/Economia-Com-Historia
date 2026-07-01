import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';
import type { MeResponse, UserProfile, UserSearchResult, PointTransaction, QuizAttempt, PaginatedResponse } from '../../types/api';

export const userService = {
  async me(): Promise<MeResponse> {
    const { data } = await httpClient.get(API_ENDPOINTS.ME.SHOW);
    return data.data ?? data;
  },

  async profile(): Promise<UserProfile> {
    const { data } = await httpClient.get(API_ENDPOINTS.PROFILE.SHOW);
    // backend returns { profile: UserProfile } — unwrap it
    return (data.profile ?? data.data?.profile ?? data.data ?? data) as UserProfile;
  },

  async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await httpClient.put(API_ENDPOINTS.PROFILE.UPDATE, payload);
    // backend returns { message, profile: UserProfile } — unwrap it
    return (data.profile ?? data.data?.profile ?? data.data ?? data) as UserProfile;
  },

  async updateAvatar(formData: FormData): Promise<{ avatar_url: string }> {
    // Do NOT set Content-Type manually — Axios + React Native XHR sets multipart/form-data
    // with the correct boundary automatically. An explicit header without boundary causes 422.
    const { data } = await httpClient.post(API_ENDPOINTS.PROFILE.UPDATE_AVATAR, formData);
    return data.data ?? data;
  },

  async updatePassword(payload: {
    current_password?: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await httpClient.put(API_ENDPOINTS.PROFILE.UPDATE_PASSWORD, payload);
  },

  async pointTransactions(page = 1): Promise<PaginatedResponse<PointTransaction>> {
    const { data } = await httpClient.get(API_ENDPOINTS.ME.POINT_TRANSACTIONS, {
      params: { page },
    });
    return data;
  },

  async quizAttempts(params?: { status?: 'in_progress' | 'completed'; page?: number }): Promise<PaginatedResponse<QuizAttempt>> {
    const { data } = await httpClient.get(API_ENDPOINTS.ME.QUIZ_ATTEMPTS, { params });
    return data;
  },

  async search(query: string, limit = 10): Promise<UserSearchResult[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.USERS.SEARCH, { params: { q: query, limit } });
    return data;
  },
};
