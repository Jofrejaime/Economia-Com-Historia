// Navigation route constants - centraliza todos os nomes de rotas
export const ROUTES = {
  // Stack raiz
  ROOT: 'Root',
  
  // Auth Stack
  AUTH: 'Auth',
  LOGIN: 'Login',
  REGISTER: 'Register',
  AUTH_HOME: 'AuthHome',
  
  // Main Tabs
  MAIN_TABS: 'MainTabs',
  HOME: 'Home',
  CONTENT: 'Content',
  COMMUNITY: 'Community',
  QUIZ_LIST: 'QuizList',
  PROFILE: 'Profile',
  DASHBOARD: 'Dashboard',
  
  // Stack Screens (Modal/Detail)
  NOTIFICATIONS: 'Notifications',
  NOTIFICATION_PREFERENCES: 'NotificationPreferences',
  PERSONAL_INFO: 'PersonalInfo',
  ARTICLE: 'Article',
  PODCAST: 'Podcast',
  QUIZ: 'Quiz',
  QUIZ_FEEDBACK: 'QuizFeedback',
  QUIZ_RESULT: 'QuizResult',
  CREATE_TOPIC: 'CreateTopic',
  TOPIC_DISCUSSION: 'TopicDiscussion',
  MANAGE_MEMBERS: 'ManageMembers',
  PRIVACY: 'Privacy',
  SUPPORT: 'Support',
  JINDUNGO_PERMISSION: 'JindungoPermission',
  LOGIN_PROMPT: 'LoginPrompt',
} as const;

export type RouteName = typeof ROUTES[keyof typeof ROUTES];

// Agrupa rotas por contexto para melhor legibilidade
export const AUTH_ROUTES = {
  LOGIN: ROUTES.LOGIN,
  REGISTER: ROUTES.REGISTER,
  HOME: ROUTES.AUTH_HOME,
} as const;

export const MAIN_TAB_ROUTES = {
  HOME: ROUTES.HOME,
  CONTENT: ROUTES.CONTENT,
  COMMUNITY: ROUTES.COMMUNITY,
  QUIZ_LIST: ROUTES.QUIZ_LIST,
  PROFILE: ROUTES.PROFILE,
} as const;

export const MODAL_ROUTES = {
  NOTIFICATIONS: ROUTES.NOTIFICATIONS,
  NOTIFICATION_PREFERENCES: ROUTES.NOTIFICATION_PREFERENCES,
  PERSONAL_INFO: ROUTES.PERSONAL_INFO,
  ARTICLE: ROUTES.ARTICLE,
  PODCAST: ROUTES.PODCAST,
  QUIZ: ROUTES.QUIZ,
  QUIZ_FEEDBACK: ROUTES.QUIZ_FEEDBACK,
  QUIZ_RESULT: ROUTES.QUIZ_RESULT,
  CREATE_TOPIC: ROUTES.CREATE_TOPIC,
  TOPIC_DISCUSSION: ROUTES.TOPIC_DISCUSSION,
  MANAGE_MEMBERS: ROUTES.MANAGE_MEMBERS,
  PRIVACY: ROUTES.PRIVACY,
  SUPPORT: ROUTES.SUPPORT,
  JINDUNGO_PERMISSION: ROUTES.JINDUNGO_PERMISSION,
  LOGIN_PROMPT: ROUTES.LOGIN_PROMPT,
} as const;
