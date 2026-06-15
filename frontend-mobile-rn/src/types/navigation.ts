// Tipos para autenticação (já existem)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export interface CommunityTopic {
  id: string;
  author: string;
  authorInitials: string;
  time: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  quote?: string;
  replies: number;
  views: string;
  isPinned?: boolean;
  isPrivate?: boolean;
  isActive?: boolean;
  createdAt: string;
  comments: {
    id: string;
    author: string;
    authorAvatar: string;
    time: string;
    content: string;
    likes: number;
    replies: number;
    isLiked?: boolean;
  }[];
}

// Tipos para as tabs principais
export type MainTabParamList = {
  Home: undefined;
  Content: undefined;
  Community: undefined;
  QuizList: undefined;
  Profile: undefined;
};

// Tipos para o stack dentro do MainNavigator (novas telas)
export type MainStackParamList = {
  Dashboard: undefined;
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  // Novas telas
  Podcast: undefined;
  Article: { type: 'jindungo' | 'micro' };
  Quiz: undefined;
  QuizFeedback: { isCorrect: boolean; onNext?: () => void };
  QuizResult: undefined;
  CreateTopic: { initialTitle?: string; initialCategory?: string };
  TopicDiscussion: { id: string };
  PersonalInfo: undefined;
  Notifications: undefined;
  NotificationPreferences: undefined;
  Privacy: undefined;
  Support: undefined;
  JindungoPermission: undefined;
  LoginPrompt: { type: 'create-topic' | 'comment' | 'quiz' };
};