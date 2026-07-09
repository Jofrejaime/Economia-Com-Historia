// Types aligned with the database schema (source of truth)

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'professor' | 'investigador' | 'estudante';
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

// user_profiles table
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  full_name: string | null;
  institution: string | null;
  province: string | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  research_areas: string[] | null;
  created_at: string;
  updated_at: string;
}

// Response from GET /me — actual structure returned by AuthController::me
export interface MeResponse {
  user: {
    id: string;
    email: string;
    role: string;
    email_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  profile: UserProfile | null;
  user_level: UserLevel | null;
  level_definition: LevelDefinition | null;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon_url: string | null;
    color_hex: string | null;
    category: string | null;
    earned_at: string;
  }>;
}

// level_definitions table
export interface LevelDefinition {
  level: number;
  name: string;
  min_points: number;
  max_points: number | null;
  color_hex: string | null;
  icon_url: string | null;
  perks: string[] | null;
}

// user_levels table
export interface UserLevel {
  id: string;
  user_id: string;
  current_level: number;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  quizzes_completed: number;
  documents_read: number;
  topics_created: number;
  replies_posted: number;
  updated_at: string;
  level_definition?: LevelDefinition;
}

// badges table
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  color_hex: string | null;
  category: string | null;
  criteria_type: string;
  criteria_value: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

// user_badges table
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  reference_id: string | null;
  badge?: Badge;
}

// document_categories table
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
  requires_subscription?: boolean;
  created_at: string;
}

// tags table
export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export type DocumentType = 'article' | 'thesis' | 'report' | 'manuscript' | 'archive';
export type AcademicLevel = 'intro' | 'advanced' | 'doctorate';
/** Tipo de conteúdo determinado pelo ficheiro carregado (fonte de verdade da apresentação). */
export type MediaType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF';

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

export interface DocumentQuizPreview {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'Básico' | 'Intermédio' | 'Avançado';
  base_points: number;
  questions_count: number;
  estimated_time: number;
  estimated_minutes: number;
  status: 'draft' | 'published';
}

export interface DocumentTopicPreview {
  id: string;
  title: string;
  replies_count: number;
  created_at: string;
  category_color_bg?: string | null;
  author?: { display_name: string | null; avatar_url: string | null } | null;
}

// documents table
export interface Document {
  id: string;
  title: string;
  slug: string | null;
  author: string;
  institution: string | null;
  category_id: string | null;
  document_type: DocumentType;
  academic_level: AcademicLevel;
  publication_date: string | null;
  period_start: number | null;
  period_end: number | null;
  summary: string;
  content: string | null;
  cover_image_url: string | null;
  media_type: MediaType | null;
  media_url: string | null;
  pdf_url: string | null;
  /** Galeria de fotos (coleção 'gallery'); presente no detalhe do documento. */
  gallery?: DocumentMediaItem[];
  status: 'draft' | 'published';
  created_by: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  category?: DocumentCategory;
  tags?: Tag[];
  is_liked?: boolean;
  is_favorited?: boolean;
  quizzes?: DocumentQuizPreview[];
  topics_preview?: DocumentTopicPreview[];
  quizzes_count?: number;
  topics_count?: number;
  learning?: { category_documents: number; quizzes: number; discussions: number } | null;
}

// quizzes table
export interface Quiz {
  id: string;
  title: string;
  module: string | null;
  description: string | null;
  cover_image_url: string | null;
  difficulty: 'Básico' | 'Intermédio' | 'Avançado';
  base_points: number;
  time_limit_secs: number | null;
  is_featured: boolean;
  status: 'draft' | 'published';
  category_id: string | null;
  created_by: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  attempts_count: number;
  completions_count: number;
  avg_score: number;
  category?: DocumentCategory;
}

// quiz_questions table
export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_order: number;
  title: string;
  subtitle: string | null;
  module_label: string | null;
  question_type: 'multiple_choice';
  points: number;
  hint_title: string | null;
  hint_quote: string | null;
  expert_name: string | null;
  expert_role: string | null;
  reading_title: string | null;
  reading_text: string | null;
  created_at: string;
  options?: QuizOption[];
}

// quiz_options table
export interface QuizOption {
  id: string;
  question_id: string;
  option_key: string;
  option_text: string;
  is_correct: boolean;
  explanation: string | null;
}

// quiz_attempts table
export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  status: 'in_progress' | 'completed';
  score: number;
  correct_answers: number;
  time_spent_secs: number | null;
  points_earned: number;
  bonus_points: number;
  performance_rating: string | null;
  started_at: string;
  completed_at: string | null;
  quiz?: Quiz;
}

// community_categories table
export interface CommunityCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color_bg: string | null;
  color_text: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  topics_count: number;
}

// discussion_topic_members table (Sprint 18.5.1 — sem roles nem convites pendentes)
export interface DiscussionTopicMember {
  id: string;
  topic_id: string;
  user_id: string;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

// Result from GET /users/search
export interface UserSearchResult {
  id: string;
  display_name: string;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
}

// discussion_topics table
export interface DiscussionTopic {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'INVITE_ONLY';
  status: 'open' | 'closed';
  is_pinned: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  last_reply_at: string | null;
  replies_count: number;
  views_count: number;
  likes_count: number;
  followers_count: number;
  category?: CommunityCategory;
  author?: UserProfile;
  members?: DiscussionTopicMember[];
  is_liked?: boolean;
  is_followed?: boolean;
}

// topic_replies table
export interface TopicReply {
  id: string;
  topic_id: string;
  author_id: string;
  parent_reply_id: string | null;
  content: string;
  is_accepted: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  likes_count: number;
  author?: UserProfile;
  is_liked?: boolean;
}

// leaderboard_nacional_cache table
export interface LeaderboardEntry {
  rank_position: number;
  user_id: string;
  display_name: string;
  province: string | null;
  avatar_url: string | null;
  total_points: number;
  quizzes_completed: number;
  weekly_points: number;
  current_level: number;
  prev_rank: number;
  refreshed_at: string;
}

// notifications table
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: string | null;
  data: { document_id?: string; media_type?: string | null; [key: string]: unknown } | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

// point_transactions table
export interface PointTransaction {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  reference_id: string | null;
  reference_type: string | null;
  description: string | null;
  created_at: string;
}

// Result from POST /quiz-attempts/{id}/complete → gamification key (snake_case from backend)
export interface GamificationResult {
  points_delta: number;
  total_points: number;
  current_level: number;
  level_changed: boolean;
  previous_level: number | null;
  badges_earned: Array<{
    id: string;
    name: string;
    description: string;
    icon_url: string | null;
    color_hex: string | null;
    category: string | null;
  }>;
}

// Paginated API response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
