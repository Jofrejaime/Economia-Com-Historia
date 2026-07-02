export interface LeaderboardEntry {
  user_id: string;
  rank: number;
  name: string;
  score: number;
  province?: string | null;
  institution?: string | null;
  badges_count: number;
  level: number;
}

export interface Leaderboard {
  scope: string;
  province?: string | null;
  institution?: string | null;
  last_updated: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardSnapshot {
  id: string;
  snapshot_date: string;
  user_id: string;
  rank: number;
  score: number;
  user_name: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  user_name: string;
  points: number;
  reason: string;
  type: 'earn' | 'spend' | 'bonus' | 'penalty';
  created_at: string;
  audit_log?: string | null;
}

export interface QuizAttemptAnswer {
  question_id: string;
  question_text: string;
  selected_option_id: string;
  selected_option_text: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  user_name: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  percentage: number;
  status: 'started' | 'completed' | 'failed';
  completed_at: string | null;
  answers?: QuizAttemptAnswer[];
}

export interface RecentEarnedBadge {
  id: string;
  user_name: string;
  badge_name: string;
  icon_url: string | null;
  earned_at: string;
}

export interface GamificationDashboard {
  total_users: number;
  total_badges: number;
  total_points: number;
  recent_earned_badges: RecentEarnedBadge[];
  top_users: LeaderboardEntry[];
  quizzes_count: number;
  total_attempts: number;
  snapshots: LeaderboardSnapshot[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats?: any;
}
