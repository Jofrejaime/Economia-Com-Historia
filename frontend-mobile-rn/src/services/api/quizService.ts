import { httpClient } from '../http/client';
import { API_ENDPOINTS } from '../../constants/api';
import type { Quiz, QuizQuestion, QuizAttempt, Document, PaginatedResponse, GamificationResult } from '../../types/api';

export interface QuizFilters {
  difficulty?: 'Básico' | 'Intermédio' | 'Avançado';
  category_id?: string;
  is_featured?: boolean;
  page?: number;
  per_page?: number;
}

export const quizService = {
  async list(filters?: QuizFilters): Promise<PaginatedResponse<Quiz>> {
    const { data } = await httpClient.get(API_ENDPOINTS.QUIZZES.LIST, { params: filters });
    return data;
  },

  async detail(id: string): Promise<Quiz> {
    const { data } = await httpClient.get(API_ENDPOINTS.QUIZZES.DETAIL(id));
    return data.data ?? data;
  },

  async questions(quizId: string): Promise<QuizQuestion[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.QUIZZES.QUESTIONS(quizId));
    return data.data ?? data;
  },

  async startAttempt(quizId: string): Promise<{ id: string }> {
    const { data } = await httpClient.post(API_ENDPOINTS.QUIZZES.START_ATTEMPT(quizId));
    return data.data ?? data;
  },

  async getAttempt(attemptId: string): Promise<QuizAttempt> {
    const { data } = await httpClient.get(API_ENDPOINTS.QUIZ_ATTEMPTS.SHOW(attemptId));
    return data.data ?? data;
  },

  async submitAnswer(
    attemptId: string,
    payload: { question_id: string; selected_option_id: string; time_spent_secs?: number }
  ): Promise<{ is_correct: boolean; points_earned: number; explanation: string | null; correct_option_id?: string | null }> {
    const { data } = await httpClient.post(API_ENDPOINTS.QUIZ_ATTEMPTS.ANSWER(attemptId), payload);
    return data.data ?? data;
  },

  async completeAttempt(
    attemptId: string,
    timeSpentSecs?: number
  ): Promise<{ attempt: QuizAttempt; gamification: GamificationResult | null }> {
    const { data } = await httpClient.post(
      API_ENDPOINTS.QUIZ_ATTEMPTS.COMPLETE(attemptId),
      timeSpentSecs != null ? { time_spent_secs: timeSpentSecs } : {}
    );
    return {
      attempt: data.data ?? data,
      gamification: data.gamification ?? null,
    };
  },

  async myAttempts(params?: {
    status?: 'in_progress' | 'completed';
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<QuizAttempt>> {
    const { data } = await httpClient.get(API_ENDPOINTS.ME.QUIZ_ATTEMPTS, { params });
    return data;
  },

  async relatedDocuments(quizId: string): Promise<Document[]> {
    const { data } = await httpClient.get(API_ENDPOINTS.QUIZZES.RELATED_DOCUMENTS(quizId));
    return data.data ?? data;
  },
};
