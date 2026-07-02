// API endpoints aligned with backend/routes/api.php

export const API_ENDPOINTS = {

  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },

  // GET /me, /me/point-transactions, /me/favorites, /me/quiz-attempts
  ME: {
    SHOW: '/me',
    POINT_TRANSACTIONS: '/me/point-transactions',
    FAVORITES: '/me/favorites',
    QUIZ_ATTEMPTS: '/me/quiz-attempts',
  },

  // /profile
  PROFILE: {
    SHOW: '/profile',
    UPDATE: '/profile',
    UPDATE_AVATAR: '/profile/avatar',
    UPDATE_PASSWORD: '/profile/password',
  },

  // /documents, /document-categories
  DOCUMENTS: {
    LIST: '/documents',
    SEARCH: '/documents/search',
    CATEGORIES: '/document-categories',
    DETAIL: (id: string) => `/documents/${id}`,
    RELATED_QUIZZES: (id: string) => `/documents/${id}/quizzes`,
    LIKE: (id: string) => `/documents/${id}/like`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
    FAVORITE: (id: string) => `/documents/${id}/favorite`,
    CITE: (id: string) => `/documents/${id}/citations`,
  },

  // /quizzes, /quiz-attempts
  QUIZZES: {
    LIST: '/quizzes',
    DETAIL: (id: string) => `/quizzes/${id}`,
    QUESTIONS: (id: string) => `/quizzes/${id}/questions`,
    START_ATTEMPT: (id: string) => `/quizzes/${id}/attempts`,
    RELATED_DOCUMENTS: (id: string) => `/quizzes/${id}/documents`,
  },

  QUIZ_ATTEMPTS: {
    SHOW: (id: string) => `/quiz-attempts/${id}`,
    ANSWER: (id: string) => `/quiz-attempts/${id}/answers`,
    COMPLETE: (id: string) => `/quiz-attempts/${id}/complete`,
  },

  // /community/categories, /topics, /replies
  COMMUNITY: {
    CATEGORIES: '/community/categories',
    TOPICS: '/topics',
    TOPIC_DETAIL: (id: string) => `/topics/${id}`,
    TOPIC_LIKE: (id: string) => `/topics/${id}/like`,
    TOPIC_FOLLOW: (id: string) => `/topics/${id}/follow`,
    TOPIC_REPLIES: (id: string) => `/topics/${id}/replies`,
    TOPIC_MEMBERS: (id: string) => `/topics/${id}/members`,
    TOPIC_MEMBER: (topicId: string, userId: string) => `/topics/${topicId}/members/${userId}`,
    TOPIC_JOIN: (id: string) => `/topics/${id}/join`,
    TOPIC_LEAVE: (id: string) => `/topics/${id}/leave`,
  },

  REPLIES: {
    UPDATE: (id: string) => `/replies/${id}`,
    DELETE: (id: string) => `/replies/${id}`,
    LIKE: (id: string) => `/replies/${id}/like`,
    ACCEPT: (id: string) => `/replies/${id}/accept`,
  },

  // /leaderboard/national, /leaderboard/provincial, /stats/provinces
  LEADERBOARD: {
    NATIONAL: '/leaderboard/national',
    PROVINCIAL: '/leaderboard/provincial',
    SNAPSHOTS: '/leaderboard/snapshots',
    PROVINCE_STATS: '/stats/provinces',
  },

  // /notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // /access-levels, /access-requests, /access-grants
  ACCESS: {
    LEVELS: '/access-levels',
    REQUESTS: '/access-requests',
    REQUEST_DETAIL: (id: string) => `/access-requests/${id}`,
    GRANTS: '/access-grants',
  },

  // /users/search
  USERS: {
    SEARCH: '/users/search',
  },

  REPORTS: {
    CREATE: '/reports',
  },

} as const;
