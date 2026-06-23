// API Endpoints - centraliza todas as rotas da API
export const API_ENDPOINTS = {
  // ============ AUTH ============
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // ============ CONTENT ============
  CONTENT: {
    LIST: '/content',
    DETAIL: (id: string) => `/content/${id}`,
    BY_CATEGORY: (category: string) => `/content/category/${category}`,
    BY_THEME: (theme: string) => `/content/theme/${theme}`,
    SEARCH: '/content/search',
    TRENDING: '/content/trending',
    RECENT: '/content/recent',
    LIKE: (id: string) => `/content/${id}/like`,
    UNLIKE: (id: string) => `/content/${id}/unlike`,
    VIEW: (id: string) => `/content/${id}/view`,
  },

  // ============ NOTIFICATIONS ============
  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAIL: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    DELETE_ALL: '/notifications/delete-all',
    PREFERENCES: '/notifications/preferences',
    UPDATE_PREFERENCES: '/notifications/preferences',
  },

  // ============ COMMUNITY ============
  COMMUNITY: {
    TOPICS: '/community/topics',
    TOPIC_CREATE: '/community/topics',
    TOPIC_DETAIL: (id: string) => `/community/topics/${id}`,
    TOPIC_UPDATE: (id: string) => `/community/topics/${id}`,
    TOPIC_DELETE: (id: string) => `/community/topics/${id}`,
    COMMENTS: (topicId: string) => `/community/topics/${topicId}/comments`,
    COMMENT_CREATE: (topicId: string) => `/community/topics/${topicId}/comments`,
    COMMENT_DELETE: (topicId: string, commentId: string) => `/community/topics/${topicId}/comments/${commentId}`,
    MEMBERS: (topicId: string) => `/community/topics/${topicId}/members`,
    MEMBERS_ADD: (topicId: string) => `/community/topics/${topicId}/members`,
    MEMBERS_REMOVE: (topicId: string, memberId: string) => `/community/topics/${topicId}/members/${memberId}`,
    LIKE_COMMENT: (topicId: string, commentId: string) => `/community/topics/${topicId}/comments/${commentId}/like`,
  },

  // ============ QUIZ ============
  QUIZ: {
    LIST: '/quiz',
    DETAIL: (id: string) => `/quiz/${id}`,
    START: (id: string) => `/quiz/${id}/start`,
    SUBMIT: (id: string) => `/quiz/${id}/submit`,
    RESULT: (id: string) => `/quiz/${id}/result`,
    HISTORY: '/quiz/history',
    LEADERBOARD: '/quiz/leaderboard',
  },

  // ============ USER ============
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    AVATAR: '/user/avatar',
    PREFERENCES: '/user/preferences',
    UPDATE_PREFERENCES: '/user/preferences',
    CHANGE_PASSWORD: '/user/change-password',
    DELETE_ACCOUNT: '/user/delete-account',
    LEARNING_PROGRESS: '/user/learning-progress',
    ACHIEVEMENTS: '/user/achievements',
  },

  // ============ SEARCH ============
  SEARCH: {
    GLOBAL: '/search',
    CONTENT: '/search/content',
    COMMUNITY: '/search/community',
    USERS: '/search/users',
  },
} as const;

// Tipo para type-safety ao acessar endpoints
export type ApiEndpoint = typeof API_ENDPOINTS;

/**
 * Helper function para construir URLs com parâmetros
 * @example
 * buildUrl(API_ENDPOINTS.CONTENT.DETAIL, '123')
 * buildUrl(API_ENDPOINTS.CONTENT.BY_CATEGORY, 'jindungo')
 */
export const buildUrl = (
  endpoint: string | ((param: string) => string),
  param?: string
): string => {
  if (typeof endpoint === 'function' && param) {
    return endpoint(param);
  }
  return endpoint as string;
};
