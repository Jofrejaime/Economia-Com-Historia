export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  color_hex: string | null;
  category: string | null;
  criteria_type: 'points' | 'quizzes' | 'documents';
  criteria_value: number;
  is_active: boolean;
  earned_count: number;
}

export interface BadgeStats {
  total: number;
  active: number;
  earned: number;
}

export interface BadgePayload {
  name: string;
  description: string;
  icon_url?: string | null;
  color_hex?: string | null;
  category?: string | null;
  criteria_type: 'points' | 'quizzes' | 'documents';
  criteria_value: number;
  is_active?: boolean;
}

export interface ApiEnvelope<T> {
  data?: T;
  message?: string;
  stats?: BadgeStats;
}

export interface ApiResult<T> {
  ok: boolean;
  status?: number;
  message?: string;
  data?: T;
  stats?: BadgeStats;
}