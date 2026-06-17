# MIGRATION CHECKLIST

Resumo da migração: web (Vite + React) → React Native (Expo)

## Paridade de telas (Web → React Native)
- Home: Web `Home` → RN [frontend-mobile-rn/src/screens/main/HomeScreen.tsx](frontend-mobile-rn/src/screens/main/HomeScreen.tsx)
- Login: Web `Login` → RN [frontend-mobile-rn/src/screens/auth/LoginScreen.tsx](frontend-mobile-rn/src/screens/auth/LoginScreen.tsx)
- Register: Web `Register` → RN [frontend-mobile-rn/src/screens/auth/RegisterScreen.tsx](frontend-mobile-rn/src/screens/auth/RegisterScreen.tsx)
- Dashboard: Web `Dashboard` → RN [frontend-mobile-rn/src/screens/main/DashboardScreen.tsx](frontend-mobile-rn/src/screens/main/DashboardScreen.tsx)
- Content: Web `Content` → RN [frontend-mobile-rn/src/screens/main/ContentScreen.tsx](frontend-mobile-rn/src/screens/main/ContentScreen.tsx)
- Podcast: Web `Podcast` → RN [frontend-mobile-rn/src/screens/main/PodcastScreen.tsx](frontend-mobile-rn/src/screens/main/PodcastScreen.tsx)
- Article (Jindungo / Micro): Web `Article` → RN [frontend-mobile-rn/src/screens/main/ArticleScreen.tsx](frontend-mobile-rn/src/screens/main/ArticleScreen.tsx)
- Quiz: Web `Quiz` → RN [frontend-mobile-rn/src/screens/main/QuizScreen.tsx](frontend-mobile-rn/src/screens/main/QuizScreen.tsx)
- Quiz Feedback: Web `QuizFeedback` → RN [frontend-mobile-rn/src/screens/main/QuizFeedbackScreen.tsx](frontend-mobile-rn/src/screens/main/QuizFeedbackScreen.tsx)
- Quiz List / Result: Web `QuizList` / `QuizResult` → RN [frontend-mobile-rn/src/screens/main/QuizListScreen.tsx](frontend-mobile-rn/src/screens/main/QuizListScreen.tsx) / [frontend-mobile-rn/src/screens/main/QuizResultScreen.tsx](frontend-mobile-rn/src/screens/main/QuizResultScreen.tsx)
- Community: Web `Community` → RN [frontend-mobile-rn/src/screens/main/CommunityScreen.tsx](frontend-mobile-rn/src/screens/main/CommunityScreen.tsx)
- Create Topic: Web `CreateTopic` → RN [frontend-mobile-rn/src/screens/main/CreateTopicScreen.tsx](frontend-mobile-rn/src/screens/main/CreateTopicScreen.tsx)
- Topic Discussion: Web `TopicDiscussion` → RN [frontend-mobile-rn/src/screens/main/TopicDiscussionScreen.tsx](frontend-mobile-rn/src/screens/main/TopicDiscussionScreen.tsx)
- Profile: Web `Profile` → RN [frontend-mobile-rn/src/screens/main/ProfileScreen.tsx](frontend-mobile-rn/src/screens/main/ProfileScreen.tsx)
- Personal Info: Web `PersonalInfo` → RN [frontend-mobile-rn/src/screens/main/PersonalInfoScreen.tsx](frontend-mobile-rn/src/screens/main/PersonalInfoScreen.tsx)
- Notifications / Preferences: Web `Notifications` / `NotificationPreferences` → RN [frontend-mobile-rn/src/screens/main/NotificationsScreen.tsx](frontend-mobile-rn/src/screens/main/NotificationsScreen.tsx) / [frontend-mobile-rn/src/screens/main/NotificationPreferencesScreen.tsx](frontend-mobile-rn/src/screens/main/NotificationPreferencesScreen.tsx)
- Privacy / Support: Web `Privacy` / `Support` → RN [frontend-mobile-rn/src/screens/main/PrivacyScreen.tsx](frontend-mobile-rn/src/screens/main/PrivacyScreen.tsx) / [frontend-mobile-rn/src/screens/main/SupportScreen.tsx](frontend-mobile-rn/src/screens/main/SupportScreen.tsx)
- Jindungo Permission: Web `JindungoPermission` → RN [frontend-mobile-rn/src/screens/main/JindungoPermissionScreen.tsx](frontend-mobile-rn/src/screens/main/JindungoPermissionScreen.tsx)
- Login Prompts: Web `LoginPrompt` → RN [frontend-mobile-rn/src/screens/main/LoginPromptScreen.tsx](frontend-mobile-rn/src/screens/main/LoginPromptScreen.tsx)

> Observação: a lista de telas web está em [frontend-mobile/src/app/App.tsx](frontend-mobile/src/app/App.tsx).

---

## Checklist de migração (detalhado)

### 1) Autenticação & API (Prioridade: Alta)
- [x] Confirmar persistência de token em `AsyncStorage` e sincronizar com `tokenManager`.
- [ ] Testar que `httpClient` envia `Authorization` após login e após reload.
- [ ] Implementar refresh token flow se necessário (rotina e storage seguro).
- [ ] Criar wrappers de API (ex.: `src/services/api/auth.ts`, `src/services/api/articles.ts`).

### 2) Navegação & Fluxos (Prioridade: Alta)
- [ ] Mapear rotas e fluxos críticos (login → dashboard → conteúdo → quiz → resultado).
- [ ] Garantir separação de stacks `Auth` vs `Main` e comportamento de back navigation.
- [ ] Verificar deep links e parâmetros de rota (abrir artigo direto, abrir tópico).

### 3) Estado e Persistência (Prioridade: Alta)
- [ ] Revisar estados globais do web (se houver) e migrar para Contexts RN existentes.
- [ ] Usar `SecureStore` para dados sensíveis (tokens, credenciais) quando necessário.

### 4) UI / Componentes (Prioridade: Alta→Média)
- [ ] Substituir componentes web-only (Radix, MUI, Tailwind) por componentes RN ou customizados.
- [ ] Consolidar tokens de design no `src/constants/theme.ts` e aplicar consistentemente.
- [ ] Testar e ajustar layout/typography para diferentes tamanhos de tela.

### 5) Formulários e Validações (Prioridade: Média)
- [ ] Verificar integração `react-hook-form` com inputs RN e validação `zod`.
- [ ] Padronizar mensagens de erro e UX de validação.

### 6) Assets & Imagens (Prioridade: Média)
- [ ] Converter imagens para múltiplas densidades (@1x/@2x/@3x) quando necessário.
- [ ] Otimizar imagens e atualizar paths nas telas RN.

### 7) Funcionalidades específicas (Prioridade: Média)
- [ ] Podcasts / Áudio: garantir player RN compatível (expo-av ou similar).
- [ ] Uploads e permissões (câmera, galeria, arquivos) — ajustar permissões Expo e fluxo.
- [ ] Notificações push: configurar com Expo / Firebase (se aplicável).

### 8) Web target com `react-native-web` (Opcional)
- [ ] Testar `expo start --web` e ajustar componentes que dependem de APIs nativas.
- [ ] Resolver incompatibilidades com libs web-only.

### 9) Testes & QA (Prioridade: Alta)
- Plano de testes manuais essenciais:
  - Autenticação: login/logout, persistência de sessão, token no header.
  - Fluxos: iniciar quiz, submeter, ver resultado; criar tópico; comentar.
  - Offline: verificar mensagens e retries.
- [ ] Adicionar e2e quando estável (Detox / Playwright / Cypress via web).

### 10) Observabilidade & Logs (Prioridade: Média)
- [ ] Adicionar logs no `httpClient` (interceptors) para debugar headers e erros.
- [ ] Integrar Sentry ou outra ferramenta de captura de erros (opcional).

### 11) CI / Build (Prioridade: Média)
- [ ] Documentar scripts de start/build em `package.json` e instruções no README.
- [ ] Configurar pipeline de build/test (se aplicável).

### 12) Documentação & Release (Prioridade: Baixa→Média)
- [ ] Documentar decisões: libs substituídas, temas, endpoints, permissões.
- [ ] Checklist de release mobile (permissões, versão, changelog).

---

## Ações imediatas recomendadas
- Executar testes manuais no Expo: login → abrir uma rota que faz requisição HTTP → confirmar header Authorization.
- Adicionar logs temporários no `src/services/http/client.ts` para verificar token no request.
- Gerar wrappers de API e mover lógica de chamadas para `src/services/api/*`.

---

Arquivo gerado automaticamente para orientar a migração.
