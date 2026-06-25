import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';
import type { MeResponse, UserProfile, PointTransaction, QuizAttempt, UserBadge, PaginatedResponse } from '../../types/api';

export const userService = {
  async me(): Promise<MeResponse> {
    const { data } = await httpClient.get(API_ENDPOINTS.ME.SHOW);
    return data.data ?? data;
  },

  async profile(): Promise<UserProfile> {
    const { data } = await httpClient.get(API_ENDPOINTS.PROFILE.SHOW);
    return data.data ?? data;
  },

  async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await httpClient.put(API_ENDPOINTS.PROFILE.UPDATE, payload);
    return data.data ?? data;
  },

  async updateAvatar(formData: FormData): Promise<{ avatar_url: string }> {
    const { data } = await httpClient.post(API_ENDPOINTS.PROFILE.UPDATE_AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data ?? data;
  },

  async updatePassword(payload: {
    current_password: string;
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
};
