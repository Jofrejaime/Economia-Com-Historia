// Tipos para autenticação (já existem)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

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
  TopicDiscussion: undefined;
  PersonalInfo: undefined;
  Notifications: undefined;
  NotificationPreferences: undefined;
  Privacy: undefined;
  Support: undefined;
  JindungoPermission: undefined;
  LoginPrompt: { type: 'create-topic' | 'comment' | 'quiz' };
};