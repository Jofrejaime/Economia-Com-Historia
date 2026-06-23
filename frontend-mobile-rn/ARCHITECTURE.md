# Arquitetura Frontend Mobile RN - Economia com História

## Visão Geral
Aplicação móvel em React Native com navegação por tabs, autenticação e gerenciamento de contexto centralizado.

---

## Estrutura de Pastas

```
src/
├── app.tsx                 # Ponto de entrada
├── components/             # Componentes reutilizáveis
│   ├── ScreenContainer.tsx
│   ├── BottomNav.tsx
│   ├── FormInput.tsx
│   └── ...
├── screens/               # Telas da aplicação
│   ├── auth/             # Telas de autenticação
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── HomeScreen.tsx
│   └── main/             # Telas autenticadas
│       ├── DashboardScreen.tsx
│       ├── HomeScreen.tsx
│       ├── ContentScreen.tsx
│       ├── NotificationsScreen.tsx
│       └── ...
├── navigation/           # Configuração de navegação
│   ├── RootNavigator.tsx
│   ├── MainNavigator.tsx
│   └── AuthNavigator.tsx
├── context/              # React Context (estado global)
│   ├── AuthContext.tsx
│   ├── CommunityContext.tsx
│   └── NotificationContext.tsx (CRIAR)
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   ├── useCommunity.ts
│   ├── useNotifications.ts (CRIAR)
│   └── ...
├── services/             # Chamadas de API/serviços
│   ├── http/
│   │   ├── client.ts
│   │   └── tokenManager.ts
│   ├── api/
│   │   ├── authService.ts (CRIAR)
│   │   ├── contentService.ts (CRIAR)
│   │   ├── communityService.ts (CRIAR)
│   │   ├── notificationService.ts (CRIAR)
│   │   └── quizService.ts (CRIAR)
│   └── storage/
├── constants/            # Constantes da app
│   ├── theme.ts
│   ├── config.ts
│   ├── navigation.ts (CRIAR)
│   └── api.ts (CRIAR)
├── types/                # Interfaces TypeScript
│   ├── auth.ts
│   ├── navigation.ts
│   ├── content.ts
│   ├── notification.ts (CRIAR)
│   └── ...
├── utils/                # Funções utilitárias
│   ├── formatting.ts
│   ├── validators.ts
│   └── helpers.ts
└── data/                 # Dados mockados (desenvolvimento)
    └── contents.ts
```

---

## Padrões de Desenvolvimento

### 1. **Context + Hooks Pattern**
- Cada domínio tem um **Context** e um **Hook** correspondente
- O Context gerencia o estado global
- O Hook fornece interface simplificada de uso

**Exemplo: NotificationContext (CRIAR)**
```typescript
// src/context/NotificationContext.tsx
interface Notification { id, type, title, description, time, isNew }

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

// src/hooks/useNotifications.ts
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications deve estar dentro de NotificationProvider');
  return context;
};
```

### 2. **Service Layer Pattern**
- Serviços específicos para cada domínio
- Centraliza chamadas HTTP
- Facilita testes e manutenção

**Exemplo: NotificationService (CRIAR)**
```typescript
// src/services/api/notificationService.ts
export class NotificationService {
  static async fetchNotifications(): Promise<Notification[]> {
    const { data } = await httpClient.get('/api/notifications');
    return data;
  }

  static async markAsRead(id: string): Promise<void> {
    await httpClient.patch(`/api/notifications/${id}/read`);
  }

  static async delete(id: string): Promise<void> {
    await httpClient.delete(`/api/notifications/${id}`);
  }
}
```

### 3. **Navigation Constants**
- Centraliza nomes de rotas
- Previne erros de digitação
- Facilita refatoração

**CRIAR: src/constants/navigation.ts**
```typescript
export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Main
  HOME: 'Home',
  CONTENT: 'Content',
  COMMUNITY: 'Community',
  QUIZ_LIST: 'QuizList',
  PROFILE: 'Profile',
  
  // Modals/Stacks
  NOTIFICATIONS: 'Notifications',
  NOTIFICATION_PREFERENCES: 'NotificationPreferences',
  PERSONAL_INFO: 'PersonalInfo',
  ARTICLE: 'Article',
  PODCAST: 'Podcast',
  QUIZ: 'Quiz',
  QUIZ_RESULT: 'QuizResult',
  CREATE_TOPIC: 'CreateTopic',
  TOP_DISCUSSION: 'TopicDiscussion',
  SUPPORT: 'Support',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
```

### 4. **API Constants**
- URLs, endpoints e configurações centralizadas
- Facilita mudança de ambiente

**CRIAR: src/constants/api.ts**
```typescript
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Content
  CONTENT_LIST: '/content',
  CONTENT_DETAIL: (id: string) => `/content/${id}`,
  CONTENT_BY_CATEGORY: (category: string) => `/content/category/${category}`,
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_MARK_READ: (id: string) => `/notifications/${id}/read`,
  
  // Community
  TOPICS: '/community/topics',
  TOPICS_CREATE: '/community/topics',
  TOPIC_DETAIL: (id: string) => `/community/topics/${id}`,
  
  // Quiz
  QUIZZES: '/quiz',
  QUIZ_DETAIL: (id: string) => `/quiz/${id}`,
  QUIZ_SUBMIT: (id: string) => `/quiz/${id}/submit`,
} as const;
```

---

## Fluxo de Dados

### Exemplo: Notificações

```
DashboardScreen
    ↓
  [Clica ícone]
    ↓
navigation.navigate('Notifications')
    ↓
NotificationsScreen
    ↓
  useNotifications() ← (Hook)
    ↓
NotificationContext ← (Gerencia estado)
    ↓
NotificationService.fetchNotifications() ← (Serviço API)
    ↓
httpClient ← (Cliente HTTP com autenticação)
    ↓
Backend API
```

---

## Checklist de Implementação (Próximas Fases)

### Fase 1: Refatoração Base
- [ ] Criar `NotificationContext` + `useNotifications` hook
- [ ] Criar `notificationService.ts`
- [ ] Criar `constants/navigation.ts`
- [ ] Criar `constants/api.ts`
- [ ] Atualizar `MainNavigator.tsx` para usar `ROUTES` constantes

### Fase 2: Serviços Específicos
- [ ] Criar `authService.ts`
- [ ] Criar `contentService.ts`
- [ ] Criar `communityService.ts`
- [ ] Criar `quizService.ts`
- [ ] Atualizar contextos para usar serviços

### Fase 3: Melhorias de UX
- [ ] Real-time notifications com WebSocket
- [ ] Badge count de notificações
- [ ] Push notifications (Expo)
- [ ] Offline-first com sincronização

### Fase 4: Observabilidade
- [ ] Logging centralizado
- [ ] Error tracking (Sentry)
- [ ] Analytics
- [ ] Performance monitoring

---

## Boas Práticas

### 1. **Tipos TypeScript**
- Sempre tipificar props e retornos
- Usar `interface` para contracts públicos
- Usar `type` para aliases de tipos

### 2. **Nomeação**
- Componentes: PascalCase (`NotificationBell.tsx`)
- Funções/Hooks: camelCase (`useNotifications`)
- Constantes: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Pastas: kebab-case (`notification-service/`)

### 3. **Separação de Concerns**
- Screens: **renderização + orquestração**
- Components: **UI reutilizável**
- Hooks: **lógica de estado**
- Services: **chamadas de API**
- Context: **estado global**

### 4. **Tratamento de Erros**
```typescript
try {
  await notificationService.fetchNotifications();
} catch (error) {
  if (error instanceof NetworkError) {
    // Tratar erro de rede
  } else if (error instanceof AuthError) {
    // Redirecionar para login
  } else {
    // Erro genérico
  }
}
```

### 5. **Performance**
- Usar `useMemo` para operações pesadas
- Memoizar componentes com `React.memo`
- Lazy-load telas com `React.lazy`
- Otimizar listas com `FlatList` ao invés de `ScrollView`

---

## Integração com Backend

### Fluxo de Autenticação
```
1. Usuário faz login
2. Backend retorna token + user data
3. Token armazenado em AsyncStorage + memória
4. httpClient intercepta requests e adiciona header Authorization
5. Quando token expira → redirecionar para login
```

### Formato de Respostas de API
```typescript
// Sucesso
{ status: 200, data: {...}, message?: "Ok" }

// Erro
{ status: 400, error: "campo_invalido", message: "Descrição do erro" }

// Lista paginada
{ status: 200, data: [...], pagination: { page, total, limit } }
```

---

## Próximos Passos

1. **Implementar NotificationContext + Hook**
2. **Criar constants/navigation.ts**
3. **Criar constants/api.ts**
4. **Criar serviços específicos por domínio**
5. **Adicionar tratamento de erros global**
6. **Configurar logging e analytics**
7. **Adicionar testes unitários**
8. **Documentar APIs REST do backend**

---

## Referências

- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Context API](https://react.dev/reference/react/useContext)
- [AsyncStorage](https://react-native-async-storage.github.io/)
