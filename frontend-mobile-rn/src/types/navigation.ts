import type { DocumentType, AccessLevelId, AcademicLevel } from "./api";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Content tab params aligned with documents table filters
export interface ContentParams {
  searchQuery?: string;
  document_type?: DocumentType;
  access_level_id?: AccessLevelId;
  academic_level?: AcademicLevel;
  category_id?: string;
}

export type MainTabParamList = {
  Home: undefined;
  Content: ContentParams | undefined;
  Community: undefined;
  QuizList: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  MainTabs: { screen: keyof MainTabParamList; params?: ContentParams } | undefined;
  Login: undefined;
  Register: undefined;
  Article: { id: string };
  Quiz: { quizId: string; attemptId?: string };
  QuizFeedback: { isCorrect: boolean; explanation: string | null; onNext?: () => void };
  QuizResult: { attemptId: string };
  CreateTopic: { initialTitle?: string };
  TopicDiscussion: { id: string };
  ManageMembers: { topicId: string; initialMembers?: Array<{ id: string; name: string; username: string; avatarUri: string | null }> };
  PersonalInfo: undefined;
  Notifications: undefined;
  NotificationPreferences: undefined;
  Privacy: { isFromRecovery?: boolean; recoveryEmail?: string } | undefined;
  Support: undefined;
  JindungoPermission: undefined;
  LoginPrompt: { type: 'create-topic' | 'comment' | 'quiz' };
};
