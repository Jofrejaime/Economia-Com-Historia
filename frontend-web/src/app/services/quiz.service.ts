import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Quiz {
  id: string;
  title: string;
  module: string | null;
  description: string | null;
  cover_image_url: string | null;
  difficulty: string;
  base_points: number;
  time_limit_secs: number | null;
  access_level_id: string;
  is_featured: boolean;
  status: string;
  attempts_count: number;
  completions_count: number;
  avg_score: number;
  category_id: string | null;
  category?: { id: string; name: string } | null;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_order: number;
  title: string;
  question: string;
  subtitle: string | null;
  module_label: string | null;
  question_type: string;
  points: number;
  hint_title: string | null;
  hint_quote: string | null;
  expert_name: string | null;
  expert_role: string | null;
  reading_title: string | null;
  reading_text: string | null;
  options: QuizOption[];
}

export interface QuizRelatedDocument {
  id: string;
  title: string;
  author: string | null;
  summary: string | null;
  document_type: string | null;
  academic_level: string | null;
  access_level_id: string;
  cover_image_url: string | null;
  views_count: number;
  likes_count: number;
  published_at: string | null;
  created_at: string;
  category_name: string | null;
  category: { name: string } | null;
  sort_order: number;
}

export interface QuizOption {
  id: string;
  option_key: string;
  option_text: string;
  is_correct?: boolean;
  explanation?: string | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  status: string;
  score: number | null;
  correct_answers: number | null;
  total_questions: number | null;
  time_spent_secs: number | null;
  points_earned: number;
  bonus_points: number;
  performance_rating: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  level: number;
  province: string | null;
}

export interface QuizOptionInput {
  option_key: string;
  text: string;
  is_correct: boolean;
  explanation?: string;
}

export interface QuizQuestionInput {
  question_order: number;
  title: string;
  subtitle?: string;
  module_label?: string;
  question_type?: string;
  points?: number;
  hint_title?: string;
  hint_quote?: string;
  expert_name?: string;
  expert_role?: string;
  reading_title?: string;
  reading_text?: string;
  options: QuizOptionInput[];
}

export interface QuizPayload {
  title: string;
  module?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  difficulty?: string;
  base_points?: number;
  time_limit_secs?: number | null;
  access_level_id?: string;
  is_featured?: boolean;
  status?: string;
  category_id?: string | null;
  questions?: QuizQuestionInput[];
  /** IDs de documentos a associar (pivot quiz_documents). */
  documents?: string[];
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly base = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): Record<string, string> {
    const token = this.auth.getToken();
    return token ? this.auth.getAuthHeaders(token) : { Accept: 'application/json' };
  }

  async getQuizzes(): Promise<Quiz[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: Quiz[] }>(`${this.base}/quizzes`, { headers: this.headers })
    );
    return res.data;
  }

  async getQuiz(id: string): Promise<Quiz> {
    const res = await firstValueFrom(
      this.http.get<{ data: Quiz }>(`${this.base}/quizzes/${id}`, { headers: this.headers })
    );
    return res.data;
  }

  async getRelatedDocuments(quizId: string): Promise<QuizRelatedDocument[]> {
  const res = await firstValueFrom(
    this.http.get<{ data: QuizRelatedDocument[] }>(
      `${this.base}/quizzes/${quizId}/documents`,
      { headers: this.headers }
    )
  );
  return res.data;
}

  async getQuestions(quizId: string): Promise<QuizQuestion[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: QuizQuestion[] }>(
        `${this.base}/quizzes/${quizId}/questions`,
        { headers: this.headers }
      )
    );
    return res.data;
  }

  async createQuiz(payload: QuizPayload): Promise<Quiz> {
    const res = await firstValueFrom(
      this.http.post<{ message: string; data: Quiz }>(
        `${this.base}/admin/quizzes`,
        payload,
        { headers: this.headers }
      )
    );
    return res.data;
  }

  async updateQuiz(id: string, payload: QuizPayload): Promise<Quiz> {
    const res = await firstValueFrom(
      this.http.patch<{ message: string; data: Quiz }>(
        `${this.base}/admin/quizzes/${id}`,
        payload,
        { headers: this.headers }
      )
    );
    return res.data;
  }

  async deleteQuiz(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.base}/admin/quizzes/${id}`, { headers: this.headers })
    );
  }

  async startAttempt(quizId: string): Promise<string> {
    const res = await firstValueFrom(
      this.http.post<{ id: string }>(
        `${this.base}/quizzes/${quizId}/attempts`,
        {},
        { headers: this.headers }
      )
    );
    return res.id;
  }

  async answerAttempt(
    attemptId: string,
    questionId: string,
    selectedOptionId: string,
    timeSpentSecs?: number
  ): Promise<{ is_correct: boolean }> {
    return firstValueFrom(
      this.http.post<{ is_correct: boolean }>(
        `${this.base}/quiz-attempts/${attemptId}/answers`,
        { question_id: questionId, selected_option_id: selectedOptionId, time_spent_secs: timeSpentSecs },
        { headers: this.headers }
      )
    );
  }

  async completeAttempt(attemptId: string, timeSpentSecs?: number): Promise<{ attempt: QuizAttempt; gamification: any }> {
    return firstValueFrom(
      this.http.post<{ attempt: QuizAttempt; gamification: any }>(
        `${this.base}/quiz-attempts/${attemptId}/complete`,
        { time_spent_secs: timeSpentSecs },
        { headers: this.headers }
      )
    );
  }

  async getAttempt(attemptId: string): Promise<QuizAttempt> {
    const res = await firstValueFrom(
      this.http.get<{ data: QuizAttempt }>(
        `${this.base}/quiz-attempts/${attemptId}`,
        { headers: this.headers }
      )
    );
    return res.data;
  }

  async getMyAttempts(): Promise<QuizAttempt[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: QuizAttempt[] }>(`${this.base}/me/quiz-attempts`, { headers: this.headers })
    );
    return res.data;
  }

  async getNationalLeaderboard(): Promise<LeaderboardEntry[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: LeaderboardEntry[] }>(
        `${this.base}/leaderboard/national`,
        { headers: this.headers }
      )
    );
    return res.data;
  }

  async getProvincialLeaderboard(province: string): Promise<LeaderboardEntry[]> {
  const res = await firstValueFrom(
    this.http.get<{ data: LeaderboardEntry[] }>(
      `${this.base}/leaderboard/provincial?province=${encodeURIComponent(province)}`,
      { headers: this.headers }
    )
  );
  return res.data;
}
}