import type { DocumentType, MediaType, GamificationResult } from "./api";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Content tab params aligned with documents table filters
export interface ContentParams {
  searchQuery?: string;
  document_type?: DocumentType;
  // Filtro por tipo de conteúdo (Texto/Vídeo/Podcast) — coerente com o web.
  media_type?: MediaType;
  category_id?: string;
}

export type MainTabParamList = {
  Home: undefined;
  Content: ContentParams | undefined;
  Community: undefined;
  QuizList: { initialTab?: 'quizzes' | 'ranking' } | undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  MainTabs: { screen: keyof MainTabParamList; params?: ContentParams } | undefined;
  Login: undefined;
  Register: undefined;
  Podcast: undefined;
  Article: { id: string };
  MediaDetail: { id: string };
  Quiz: { quizId: string; attemptId?: string };
  QuizFeedback: { isCorrect: boolean; explanation: string | null; isLast: boolean; attemptId: string; quizId: string; gamification?: GamificationResult };
  QuizResult: { attemptId: string; quizId: string; gamification?: GamificationResult };
  CreateTopic: { initialTitle?: string; initialCategoryId?: string };
  TopicDiscussion: { id: string };
  ManageMembers: { topicId: string; topicTitle?: string; initialMembers?: Array<{ id: string; name: string; username: string; avatarUri: string | null }> };
  PersonalInfo: undefined;
  Notifications: undefined;
  NotificationPreferences: undefined;
  Privacy: { isFromRecovery?: boolean; recoveryEmail?: string } | undefined;
  Support: undefined;
  LoginPrompt: { type: 'create-topic' | 'comment' | 'quiz' };
};
