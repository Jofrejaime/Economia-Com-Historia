# 📱 RELATÓRIO DE PÁGINAS - FRONTEND MOBILE REACT NATIVE

**Data:** 2026-07-02  
**Projeto:** Economia com História - Mobile App  
**Framework:** React Native + Expo  

---

## 📑 ÍNDICE
1. [Fluxo Geral de Navegação](#fluxo-geral)
2. [Telas de Autenticação](#telas-autenticação)
3. [Telas Principais (Bottom Tabs)](#telas-principais)
4. [Telas de Detalhe/Modais](#telas-detalhe)
5. [Fluxos de Utilizador](#fluxos-utilizador)
6. [Estrutura de Dados](#estrutura-dados)
7. [Integração com Backend](#integração-backend)
8. [Estado Global (Contextos)](#estado-global)

---

## 🗺️ FLUXO GERAL DE NAVEGAÇÃO {#fluxo-geral}

### Arquitetura de Navegação Completa

```
┌─────────────────────────────────────────────────────────────────┐
│                         RootNavigator                           │
│                    (Verifica Status Auth)                       │
└────────────────┬────────────────────────────────┬───────────────┘
                 │                                │
                 │ authenticated=true             │ authenticated=false
                 ▼                                ▼
        ┌──────────────────┐           ┌──────────────────┐
        │  MainNavigator   │           │  AuthNavigator   │
        │  (5 Bottom Tabs) │           │  (Stack Login)   │
        └──────────────────┘           └──────────────────┘
                 │                              │
    ┌────┬──────┼──────┬──────┬──────┐         ├── LoginScreen
    │    │      │      │      │      │         └── RegisterScreen
    ▼    ▼      ▼      ▼      ▼      ▼
   🏠   📄     💬     🎯     👤   [Modais]
  HOME CONTENT COMM  QUIZ  PROFILE  acima
                              das
                              tabs
```

### Estado de Autenticação

```javascript
// Fluxo de autenticação
App.tsx
  ↓
RootNavigator (AuthContext)
  ├─ status: "loading" → SplashScreen (com ícone Expo)
  ├─ status: "authenticated" → MainNavigator (5 tabs)
  └─ status: "unauthenticated" → AuthNavigator (Login/Register)

// Ao fazer login
POST /auth/login
  ↓
✅ Sucesso: AuthContext atualiza → token + user
  ↓
token armazenado em:
  • AsyncStorage (@auth_token)
  • Secure Storage (tokenManager)
  • Axios header (Bearer token)
  ↓
Navega para MainNavigator
```

### Persistent Login

```typescript
// App.tsx - useEffect ao iniciar
useEffect(() => {
  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        setStatus('authenticated');
      }
    } catch (e) {
      setStatus('unauthenticated');
    }
  };
  bootstrapAsync();
}, []);
```

---

## 🔐 TELAS DE AUTENTICAÇÃO {#telas-autenticação}

### 1. HomeScreen (Splash)

**Caminho:** `src/screens/auth/HomeScreen.tsx`

**Funcionalidade:**
- Tela inicial não autenticada
- 2 botões: "Entrar" (LoginScreen) | "Registar" (RegisterScreen)
- Preview de conteúdo público (opcional)
- Branding (logo, descrição da plataforma)

**Navegação:**
```
HomeScreen
  ├─ [Botão "Entrar"] → LoginScreen
  ├─ [Botão "Registar"] → RegisterScreen
  └─ [Swipe/Preview] → Teaser de documentos
```

**Props:** Nenhuma (screen raiz)

**Dados:** Estáticos (branding)

---

### 2. LoginScreen

**Caminho:** `src/screens/auth/LoginScreen.tsx`

**Funcionalidade:**
- Autenticação por email + senha
- Login social (Google)
- Link para recuperação de senha
- Link para registro

**Fluxo:**

```
LoginScreen (renderiza formulário)
  ↓
Utilizador preenche:
  • email
  • password
  ↓
useAuth().signIn(email, password) [AuthContext]
  ↓
API Call: POST /auth/login
  {
    email: "user@example.com",
    password: "senha123"
  }
  ↓
Backend validação ✅
  ↓
Response:
  {
    access_token: "eyJhbGc...",
    user: {
      id: 1,
      email: "user@example.com",
      full_name: "João Silva",
      role: "user",
      avatar_url: "https://...",
      province: "Luanda",
      institution: "ISPTEC"
    }
  }
  ↓
AuthContext atualiza:
  • status = "authenticated"
  • token = access_token
  • user = user object
  ↓
Token guardado em:
  • AsyncStorage.setItem('@auth_token', token)
  • SecureStore.setItemAsync('auth_token', token)
  • Axios default header
  ↓
Navega para MainNavigator (DashboardScreen)
```

**Validações:**
- Email requerido + formato válido
- Senha requerida (min 6 caracteres)
- Erro 401 → mensagem "Credenciais inválidas"
- Erro de rede → retry automático

**Props:** Nenhuma (recebe de AuthNavigator)

**Estado Local:**
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

---

### 3. RegisterScreen

**Caminho:** `src/screens/auth/RegisterScreen.tsx`

**Funcionalidade:**
- Registro com email, senha e validação de força
- Seleção de nível académico
- Selecionar interesses/categorias
- Link para login

**Fluxo:**

```
RegisterScreen
  ↓
Utilizador preenche:
  • fullName (obrigatório)
  • email (obrigatório, único)
  • password (obrigatório, min 8, complexidade)
  • confirmPassword
  • academicLevel (enum: ["ensino_basico", "ensino_secundario", "licenciatura"])
  • interests (array de categorias selecionadas)
  ↓
react-hook-form + Zod validação
  ├─ Email válido
  ├─ Senha força (Majúscula + número + símbolo)
  ├─ Passwords coincidem
  └─ Termos aceitos
  ↓
useAuth().signUp(fullName, email, password, ...)
  ↓
API Call: POST /auth/register
  {
    full_name: "João Silva",
    email: "joao@example.com",
    password: "Senha@123",
    academic_level: "licenciatura",
    interests: ["história", "economia"]
  }
  ↓
Backend cria user ✅
  ↓
Response:
  {
    access_token: "...",
    user: { ... }
  }
  ↓
Mesmo fluxo de LoginScreen
  ↓
Navega para MainNavigator
```

**Componentes Usados:**
- `FormInput` — input de texto com validação
- `PasswordStrengthIndicator` — visual da força de senha
- `AcademicLevelButton` — seletor de nível
- `InterestChip` — chips clicáveis de categorias

**Estado Local:**
```typescript
const {
  control,
  handleSubmit,
  watch,
  formState: { errors }
} = useForm({
  resolver: zodResolver(registerSchema)
});
```

---

## 🏠 TELAS PRINCIPAIS (BOTTOM TABS) {#telas-principais}

### Estrutura de Abas

```
┌─────────────────────────────────────────────────────┐
│              Conteúdo da Tela                        │
│                                                      │
│                                                      │
│                                                      │
├─────────────────────────────────────────────────────┤
│ 🏠     📄       💬        🎯       👤              │
│ Home  Content Community  Quiz   Profile             │
│ (60)   (25)     (15)      (40)    (25)   (width%)  │
└─────────────────────────────────────────────────────┘
```

---

### 1. DashboardScreen (Home Tab)

**Caminho:** `src/screens/main/DashboardScreen.tsx`

**Funcionalidade:**
- Widget de resumo pessoal (pontos, nível)
- Notificações recentes (3 últimas)
- Quick stats (quizzes completados, documentos favoritos)
- Cards de ações rápidas (Fazer Quiz, Ver Documentos, Comunidade)

**Fluxo:**

```
useEffect(() => {
  GET /me
    ↓
  Response:
    {
      id, email, full_name,
      points: 1250,
      level: "gold",
      quizzes_completed: 15,
      favorites_count: 8,
      reputation: 450
    }
  ↓
  setState({ user, stats })
}, [])

useEffect(() => {
  GET /notifications?limit=3
    ↓
  Response:
    [
      { id: 1, message: "Quiz completed!", read: false },
      { id: 2, message: "New document", read: false },
      { id: 3, message: "Mention in forum", read: true }
    ]
  ↓
  setState({ notifications })
}, [])
```

**Componentes Renderizados:**
```typescript
<ScreenContainer>
  <HeaderBar title="Bem-vindo, João" />
  
  <ScrollView>
    {/* Widget Pontos */}
    <PointsCard points={1250} level="gold" />
    
    {/* Notificações */}
    <NotificationsPreview notifications={notifications} />
    
    {/* Quick Actions */}
    <QuickActionsGrid>
      <ActionCard icon="play" label="Fazer Quiz" onPress={handleQuiz} />
      <ActionCard icon="book" label="Ver Docs" onPress={handleDocs} />
      <ActionCard icon="users" label="Comunidade" onPress={handleCommunity} />
    </QuickActionsGrid>
    
    {/* Stats */}
    <StatsCard stats={stats} />
  </ScrollView>
</ScreenContainer>
```

**Dados Necessários:**
- `GET /me` — Dados do utilizador
- `GET /notifications?limit=3` — 3 notificações recentes
- `GET /me/stats` — Estatísticas

**Interações:**
- Clique em notificação → NotificationsScreen
- Clique em "Fazer Quiz" → QuizListScreen
- Clique em "Ver Docs" → ContentScreen
- Clique em "Comunidade" → CommunityScreen
- Clique em avatar/pontos → ProfileScreen

**Refresh:**
- Pull-to-refresh recarrega dados

---

### 2. ContentScreen (Content Tab)

**Caminho:** `src/screens/main/ContentScreen.tsx`

**Funcionalidade:**
- Lista de documentos (artigos, vídeos, áudio, PDFs)
- Filtros: tipo, categoria, ordenação
- Busca por palavra-chave
- Infinite scroll (paginação)

**Fluxo:**

```
useEffect(() => {
  GET /documents?
    page=1
    per_page=15
    sort=newest
    type=all
  ↓
  Response:
    {
      data: [
        {
          id: 1,
          title: "Inflação em Angola",
          type: "article",
          category: "economia",
          image_url: "...",
          created_at: "2026-06-20",
          likes_count: 45,
          is_favorited: false
        },
        ...
      ],
      pagination: {
        page: 1,
        per_page: 15,
        total: 235,
        last_page: 16
      }
    }
  ↓
  setState({ documents, page, hasMore })
}, [filters])

// Ao chegar ao fim da lista
onEndReached={() => {
  if (hasMore) {
    fetchNextPage()
  }
}}
```

**Filtros Disponíveis:**

```typescript
interface ContentFilters {
  type?: 'all' | 'article' | 'video' | 'audio' | 'pdf';
  category?: string;
  sort?: 'newest' | 'oldest' | 'most_liked' | 'trending';
  search?: string;
}
```

**Componentes Renderizados:**
```typescript
<ScreenContainer>
  <HeaderBar title="Conteúdos" showBackButton={false} />
  
  <SearchBar 
    placeholder="Buscar documentos..."
    onSearch={(q) => handleSearch(q)}
  />
  
  <FilterChips
    types={['all', 'article', 'video', 'audio', 'pdf']}
    categories={['economia', 'história']}
    onFilterChange={handleFilters}
  />
  
  <FlatList
    data={documents}
    renderItem={({ item }) => (
      <ContentCard
        document={item}
        onPress={() => navigateToDetail(item)}
        onLike={() => handleLike(item.id)}
        onFavorite={() => handleFavorite(item.id)}
      />
    )}
    onEndReached={() => loadMore()}
    ListEmptyState={<EmptyState />}
  />
</ScreenContainer>
```

**Interações:**
- Clique em card → ArticleScreen / MediaDetailScreen
- Like button → `POST /documents/{id}/like` + update local
- Favorite button → `POST /documents/{id}/favorite` + update local
- Busca → GET `/documents/search?q=termo`
- Filtros → GET `/documents` com params

**Dados Necessários:**
- `GET /documents` — Lista paginada
- `GET /document-categories` — Para filtros
- Like/Favorite status do utilizador

---

### 3. CommunityScreen (Community Tab)

**Caminho:** `src/screens/main/CommunityScreen.tsx`

**Funcionalidade:**
- Lista de tópicos de discussão
- Ordenação (mais recente, mais popular, mais respondido)
- Botão para criar novo tópico
- Preview de respostas
- Paginação infinita

**Fluxo:**

```
useCommunity() hook (CommunityContext)
  ↓
useEffect(() => {
  GET /topics?
    page=1
    per_page=10
    sort=newest
  ↓
  Response:
    {
      data: [
        {
          id: 1,
          title: "Como interpretar gráficos económicos?",
          description: "Dúvida sobre análise de dados",
          author: { id: 2, name: "João", avatar: "..." },
          category: "economia",
          replies_count: 5,
          likes_count: 12,
          created_at: "2026-06-20",
          last_reply_at: "2026-07-01"
        },
        ...
      ]
    }
  ↓
  CommunityContext.fetchTopics(topics)
}, [])
```

**Componentes Renderizados:**
```typescript
<ScreenContainer>
  <HeaderBar 
    title="Comunidade"
    rightElement={
      <Pressable onPress={navigateToCreateTopic}>
        <Icon name="plus" />
      </Pressable>
    }
  />
  
  <SortButtons
    options={['Recente', 'Popular', 'Respondido']}
    onSelect={handleSort}
  />
  
  <FlatList
    data={topics}
    renderItem={({ item }) => (
      <DebateCard
        topic={item}
        onPress={() => navigateToDetail(item.id)}
      />
    )}
    onEndReached={handleLoadMore}
  />
  
  <FloatingActionButton
    icon="plus"
    onPress={navigateToCreateTopic}
  />
</ScreenContainer>
```

**Interações:**
- Clique em tópico → TopicDiscussionScreen
- Clique no "+" → CreateTopicScreen
- Scroll infinito → carrega mais tópicos
- Like tópico → `POST /topics/{id}/like`

**Dados Necessários:**
- `GET /topics` — Lista paginada
- User info para autor

---

### 4. QuizListScreen (Quiz Tab)

**Caminho:** `src/screens/main/QuizListScreen.tsx`

**Funcionalidade:**
- Lista de quizzes disponíveis
- Filtros por dificuldade, categoria
- Card com progresso do utilizador (se já iniciado)
- Ranking/leaderboard
- Relatório de quiz attempts

**Fluxo:**

```
useEffect(() => {
  Promise.all([
    GET /quizzes?
      difficulty=all
      category=all
      page=1
      per_page=10,
    GET /me/quiz-attempts?
      limit=10
  ])
  ↓
  Response Quizzes:
    [
      {
        id: 1,
        title: "Quiz: Inflação",
        description: "Conceitos de inflação",
        difficulty: "intermediate",
        category: "economia",
        questions_count: 10,
        estimated_time: 15,
        image_url: "..."
      },
      ...
    ]
  
  Response Attempts:
    [
      {
        quiz_id: 1,
        status: "in_progress",
        current_question: 5,
        score: null
      },
      {
        quiz_id: 2,
        status: "completed",
        score: 85,
        completed_at: "2026-06-20"
      }
    ]
  ↓
  Merge: Match attempts com quizzes
}, [filters])
```

**Componentes Renderizados:**
```typescript
<ScreenContainer>
  <HeaderBar title="Quizzes" />
  
  <FilterChips
    difficulties={['Fácil', 'Médio', 'Difícil']}
    categories={categories}
    onFilter={handleFilters}
  />
  
  <TabBar tabs={['Meus', 'Disponíveis', 'Ranking']}>
    {/* Tab 1: Meus Quizzes (em progresso) */}
    <FlatList
      data={myQuizzes}
      renderItem={({ item }) => (
        <QuizCard
          quiz={item}
          status={getStatus(item.id)}
          onPress={() => navigateToQuiz(item.id)}
          showProgress={true}
        />
      )}
    />
    
    {/* Tab 2: Disponíveis */}
    <FlatList
      data={availableQuizzes}
      renderItem={({ item }) => (
        <QuizCard
          quiz={item}
          onPress={() => startQuiz(item.id)}
        />
      )}
    />
    
    {/* Tab 3: Ranking */}
    <LeaderboardList
      data={leaderboardData}
      category={selectedCategory}
    />
  </TabBar>
</ScreenContainer>
```

**Interações:**
- Clique em "Iniciar" → QuizScreen
- Clique em "Continuar" → QuizScreen (retoma onde ficou)
- Clique em "Ver Resultado" → QuizResultScreen
- Filtros → recarrega lista
- Ver Ranking → mostra leaderboard

**Dados Necessários:**
- `GET /quizzes` — Lista paginada
- `GET /me/quiz-attempts` — Meus attempts
- `GET /leaderboard/quizzes/{categoryId}` — Rankings

---

### 5. ProfileScreen (Profile Tab)

**Caminho:** `src/screens/main/ProfileScreen.tsx`

**Funcionalidade:**
- Avatar do utilizador (pode editar)
- Dados pessoais (nome, instituição, província)
- Badges/distintivos conquistados
- Estatísticas pessoais
- Links para preferências, privacidade, suporte
- Botão logout

**Fluxo:**

```
useEffect(() => {
  GET /profile
  ↓
  Response:
    {
      user: {
        id: 1,
        full_name: "João Silva",
        email: "joao@example.com",
        avatar_url: "...",
        institution: "ISPTEC",
        province: "Luanda",
        bio: "Estudante de Economia"
      },
      stats: {
        points: 1250,
        level: "gold",
        quizzes_completed: 15,
        documents_read: 42,
        topics_created: 3,
        replies_count: 15
      },
      badges: [
        { id: 1, name: "First Quiz", icon: "🏅" },
        { id: 2, name: "Quiz Master", icon: "👑" }
      ]
    }
}, [])
```

**Componentes Renderizados:**
```typescript
<ScreenContainer>
  <HeaderBar 
    title="Perfil"
    rightElement={
      <Menu
        options={['Editar Perfil', 'Preferências', 'Privacidade', 'Logout']}
      />
    }
  />
  
  <ScrollView>
    {/* Avatar + Info */}
    <ProfileHeader
      avatar={user.avatar_url}
      name={user.full_name}
      institution={user.institution}
      onEditAvatar={handleEditAvatar}
    />
    
    {/* Stats */}
    <StatsGrid stats={stats} />
    
    {/* Badges */}
    <BadgesSection badges={badges} />
    
    {/* Menu */}
    <MenuList
      items={[
        { icon: 'user', label: 'Dados Pessoais', onPress: goToPersonalInfo },
        { icon: 'bell', label: 'Notificações', onPress: goToNotifications },
        { icon: 'lock', label: 'Privacidade', onPress: goToPrivacy },
        { icon: 'help', label: 'Suporte', onPress: goToSupport },
        { icon: 'log-out', label: 'Logout', onPress: handleLogout }
      ]}
    />
  </ScrollView>
</ScreenContainer>
```

**Interações:**
- Clique em avatar → ImagePicker → `POST /profile/avatar` (upload)
- Clique "Editar Perfil" → PersonalInfoScreen
- Clique "Notificações" → NotificationPreferencesScreen
- Clique "Privacidade" → PrivacyScreen
- Clique "Suporte" → SupportScreen
- Clique "Logout" → useAuth().signOut() → AuthNavigator

**Dados Necessários:**
- `GET /profile` — Dados completos
- `GET /me/badges` — Badges do utilizador

---

## 📄 TELAS DE DETALHE/MODAIS {#telas-detalhe}

### 1. ArticleScreen

**Caminho:** `src/screens/main/ArticleScreen.tsx`

**Navegação:** ContentScreen → clique em artigo

**Funcionalidade:**
- Visualização de conteúdo de artigo
- Ações: Like, Favoritar, Compartilhar
- Related quizzes
- Comentários (se suportado)

**Fluxo:**

```
useEffect(() => {
  GET /documents/{documentId}
  ↓
  Response:
    {
      id: 1,
      title: "Inflação: Conceitos Básicos",
      content: "<p>Inflação é...</p>",
      author: { name: "Dr. Silva" },
      created_at: "2026-06-20",
      likes_count: 45,
      is_liked: false,
      is_favorited: false
    }
  
  GET /documents/{documentId}/quizzes
  ↓
  Response: [{ id: 1, title: "Quiz sobre Inflação" }]
}, [documentId])
```

---

### 2. MediaDetailScreen (Vídeos, Áudio, PDFs)

**Caminho:** `src/screens/main/MediaDetailScreen.tsx`

**Funcionalidade:**
- Player de vídeo/áudio ou visualizador de PDF
- Controles de reprodução
- Informações do documento
- Download (se permitido)

**Fluxo:**

```
Vídeo:
  GET /documents/{id}
  └─ video_url: "https://example.com/video.mp4"
  └─ Video player (expo-av)

Áudio (Podcast):
  GET /documents/{id}
  └─ audio_url: "https://example.com/audio.m4a"
  └─ Audio player com scrubber (expo-audio)

PDF:
  GET /documents/{id}
  └─ pdf_url: "https://example.com/file.pdf"
  └─ WebView para visualização
```

---

### 3. QuizScreen

**Caminho:** `src/screens/main/QuizScreen.tsx`

**Navegação:** QuizListScreen → clique em quiz

**Funcionalidade:**
- Exibe pergunta por pergunta
- Múltipla escolha (A, B, C, D)
- Progress bar (3/10 questões)
- Botões Anterior/Próxima
- Submeter quiz ao fim

**Fluxo:**

```
Iniciar Quiz:
  POST /quizzes/{quizId}/attempts
  ↓
  Response:
    {
      attempt_id: 123,
      quiz_id: 1,
      questions: [
        {
          id: 1,
          question: "O que é inflação?",
          options: [
            { id: 'a', text: "Aumento de preços" },
            { id: 'b', text: "Diminuição de preços" },
            { id: 'c', text: "Estabilidade" },
            { id: 'd', text: "Deflação" }
          ]
        },
        ...
      ]
    }
  ↓
  setState({ attempt, questions, currentIndex: 0 })

Responder Pergunta:
  userSelects('a')
  ↓
  POST /quiz-attempts/{attemptId}/answers
    {
      question_id: 1,
      selected_option: 'a'
    }
  ↓
  Navega para próxima pergunta
  currentIndex++

Última Pergunta:
  [Próxima] → POST /quiz-attempts/{attemptId}/complete
  ↓
  Response:
    {
      score: 85,
      correct: 8,
      total: 10,
      time_spent: 245,
      badge_earned: "Quiz Master"
    }
  ↓
  Navega para QuizFeedbackScreen (feedback)
```

**Componentes Renderizados:**
```typescript
<ScreenContainer>
  <HeaderBar 
    title={`Pergunta ${currentIndex + 1}/${totalQuestions}`}
    subtitle={quiz.title}
  />
  
  {/* Progress Bar */}
  <ProgressBar 
    progress={(currentIndex + 1) / totalQuestions}
  />
  
  {/* Pergunta */}
  <QuestionCard
    question={currentQuestion.question}
    options={currentQuestion.options}
    selected={selectedOption}
    onSelect={setSelectedOption}
  />
  
  {/* Botões */}
  <ButtonGroup>
    <Button
      disabled={currentIndex === 0}
      onPress={goToPrevious}
    >
      Anterior
    </Button>
    <Button
      onPress={
        currentIndex < totalQuestions - 1
          ? goToNext
          : submitQuiz
      }
    >
      {currentIndex < totalQuestions - 1 ? 'Próxima' : 'Submeter'}
    </Button>
  </ButtonGroup>
</ScreenContainer>
```

---

### 4. QuizFeedbackScreen

**Caminho:** `src/screens/main/QuizFeedbackScreen.tsx`

**Funcionalidade:**
- Feedback imediato após responder pergunta
- Indica se está correto ou errado
- Explica a resposta
- Botão para continuar

**Fluxo:** Quiz respondida → feedback de 3-5 segundos → QuizScreen automaticamente ou QuizResultScreen se última pergunta

---

### 5. QuizResultScreen

**Caminho:** `src/screens/main/QuizResultScreen.tsx`

**Navegação:** QuizScreen → submeter última pergunta

**Funcionalidade:**
- Resultado final (85/100)
- Respostas corretas/incorretas
- Pontos ganhos
- Badges conquistadas
- Relatório detalhado
- Botão "Repetir Quiz" ou "Voltar"

**Fluxo:**

```
após POST /complete
  ↓
Exibe:
  ✅ Resultado: 85%
  📊 Detalhes: 8/10 corretas
  ⏱️ Tempo: 4 minutos 5 segundos
  🏆 Pontos: +150 pontos
  🎖️ Badges: "Quiz Master (novo!)"
  
Ações:
  [Voltar] → QuizListScreen
  [Repetir] → POST /quizzes/{id}/attempts (novo)
  [Ver Relatório] → Detalhes de respostas
```

---

### 6. TopicDiscussionScreen

**Caminho:** `src/screens/main/TopicDiscussionScreen.tsx`

**Navegação:** CommunityScreen → clique em tópico

**Funcionalidade:**
- Exibe tópico original
- Lista de respostas/comentários
- Input para adicionar resposta
- Like em respostas
- Editar/deletar próprias respostas

**Fluxo:**

```
useEffect(() => {
  GET /topics/{topicId}
  ↓
  Response:
    {
      topic: {
        id: 1,
        title: "Como interpretar gráficos?",
        content: "Texto da pergunta",
        author: { name: "João" },
        replies_count: 5
      },
      replies: [
        {
          id: 1,
          content: "Resposta 1",
          author: { name: "Maria" },
          likes: 2,
          created_at: "..."
        },
        ...
      ]
    }
}, [topicId])

Adicionar Resposta:
  Utilizador digita no input
  ↓
  POST /topics/{topicId}/replies
    { content: "Minha resposta..." }
  ↓
  Reply adicionada localmente (optimistic update)
  ↓
  GET /topics/{topicId} (refresh)
```

---

### 7. CreateTopicScreen

**Caminho:** `src/screens/main/CreateTopicScreen.tsx`

**Navegação:** CommunityScreen → clique em "+"

**Funcionalidade:**
- Formulário para criar novo tópico
- Campos: Título, Descrição, Categoria
- Validação
- Botão criar

**Fluxo:**

```
Formulário:
  • Título (obrigatório)
  • Descrição (obrigatório, min 20 caracteres)
  • Categoria (seleção)
  ↓
react-hook-form + validação
  ↓
POST /topics
  {
    title: "Novo tópico",
    content: "Descrição...",
    category_id: 1
  }
  ↓
✅ Sucesso → CommunityScreen (atualiza lista)
❌ Erro → Toast com mensagem
```

---

### 8. ManageMembersScreen

**Caminho:** `src/screens/main/ManageMembersScreen.tsx`

**Funcionalidade:**
- Adicionar membros a um tópico/grupo
- Busca de utilizadores
- Lista de membros atuais
- Remover membros (owner only)

---

### 9. NotificationsScreen

**Caminho:** `src/screens/main/NotificationsScreen.tsx`

**Navegação:** DashboardScreen → "Ver Todas" ou ProfileScreen → menu

**Funcionalidade:**
- Lista completa de notificações
- Marcar como lida
- Marcar todas como lidas
- Deletar notificação
- Clique navega para contexto

**Fluxo:**

```
useEffect(() => {
  GET /notifications?page=1&per_page=20
  ↓
  Response:
    {
      data: [
        {
          id: 1,
          type: "quiz_completed",
          message: "Parabéns! Completou Quiz sobre Inflação",
          read: false,
          data: { quiz_id: 1 },
          created_at: "..."
        },
        ...
      ],
      pagination: { ... }
    }
}, [])

Marcar como Lida:
  PATCH /notifications/{id}/read
  ↓
  Atualiza NotificationContext
```

---

### 10. PersonalInfoScreen

**Caminho:** `src/screens/main/PersonalInfoScreen.tsx`

**Navegação:** ProfileScreen → "Dados Pessoais"

**Funcionalidade:**
- Editar nome completo
- Editar instituição
- Editar província
- Editar bio
- Salvar mudanças

**Fluxo:**

```
Preenchimento:
  • full_name
  • institution
  • province
  • bio
  ↓
PUT /profile
  { full_name, institution, province, bio }
  ↓
✅ Atualiza AuthContext.user
```

---

### 11. NotificationPreferencesScreen

**Caminho:** `src/screens/main/NotificationPreferencesScreen.tsx`

**Funcionalidade:**
- Toggles de tipos de notificações
- Email vs Push
- Frequência (sempre, nunca, diário)

**Dados:** `PUT /profile/notification-preferences`

---

### 12. PrivacyScreen

**Caminho:** `src/screens/main/PrivacyScreen.tsx`

**Funcionalidade:**
- Exibe política de privacidade (estático)
- Informação RGPD
- Links para termos

**Dados:** Conteúdo estático

---

### 13. SupportScreen

**Caminho:** `src/screens/main/SupportScreen.tsx`

**Funcionalidade:**
- FAQ (Perguntas Frequentes)
- Links de suporte
- Email de contacto
- Chat (opcional)

**Dados:** Conteúdo estático + contactos

---

### 14. JindungoPermissionScreen

**Caminho:** `src/screens/main/JindungoPermissionScreen.tsx`

**Funcionalidade:**
- Explicação do sistema de gamificação (Jindungo)
- Como ganhar pontos
- Como subir de nível
- Badges e distintivos

**Dados:** Conteúdo educativo estático

---

### 15. LoginPromptScreen

**Caminho:** `src/screens/main/LoginPromptScreen.tsx`

**Funcionalidade:**
- Modal que aparece quando ação requer login
- Botões: "Entrar" (navega para auth) | "Cancelar"

---

## 🔄 FLUXOS DE UTILIZADOR {#fluxos-utilizador}

### Fluxo 1: Primeiro Login → Explorar Conteúdo → Fazer Quiz

```
HomeScreen
  ↓ [Clica "Entrar"]
LoginScreen
  ↓ [Email: joao@example.com, Senha: ...]
POST /auth/login ✅
  ↓
DashboardScreen (autenticado)
  ↓ [Clica tab "Documentos"]
ContentScreen (GET /documents)
  ↓ [Clica em artigo]
ArticleScreen (GET /documents/{id})
  ↓ [Lê artigo]
  ↓ [Clica "Ver Quiz Relacionado"]
QuizScreen (POST /quizzes/{id}/attempts)
  ↓ [Responde 10 perguntas]
QuizResultScreen (POST /quiz-attempts/{id}/complete)
  ↓ [Visualiza resultado: 85%]
  ↓ [Clica "Voltar"]
DashboardScreen (score + badge atualizado)
```

### Fluxo 2: Criar Tópico → Responder em Comunidade

```
DashboardScreen
  ↓ [Clica tab "Comunidade"]
CommunityScreen (GET /topics)
  ↓ [Clica botão "+"]
CreateTopicScreen
  ↓ [Preenche: Título, Descrição, Categoria]
  ↓ [Clica "Criar"]
POST /topics ✅
  ↓
CommunityScreen (lista atualizada com novo tópico)
  ↓ [Outro utilizador clica no tópico]
TopicDiscussionScreen
  ↓ [Digita resposta]
  ↓ [Clica "Enviar"]
POST /topics/{id}/replies ✅
  ↓
TopicDiscussionScreen (resposta aparece)
```

### Fluxo 3: Editar Perfil → Sair

```
DashboardScreen
  ↓ [Clica tab "Perfil"]
ProfileScreen (GET /profile)
  ↓ [Clica "Dados Pessoais"]
PersonalInfoScreen
  ↓ [Edita instituição]
PUT /profile ✅
  ↓
ProfileScreen
  ↓ [Clica menu → "Logout"]
useAuth().signOut()
  ↓
Token removido (AsyncStorage + SecureStore)
  ↓
AuthNavigator (volta ao login)
```

---

## 📦 ESTRUTURA DE DADOS {#estrutura-dados}

### User Object

```typescript
interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  institution?: string;
  province?: string;
  bio?: string;
  role: 'admin' | 'user' | 'moderator';
  created_at: string;
}

interface UserStats {
  points: number;
  level: string;
  quizzes_completed: number;
  documents_read: number;
  topics_created: number;
  replies_count: number;
  reputation: number;
}
```

### Document/Content Object

```typescript
interface Document {
  id: number;
  title: string;
  description?: string;
  content?: string;
  type: 'article' | 'video' | 'audio' | 'pdf';
  category: string;
  image_url?: string;
  media_url?: string;
  author: { id: number; name: string };
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  is_favorited: boolean;
  views_count: number;
}
```

### Quiz Object

```typescript
interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'intermediate' | 'hard';
  questions_count: number;
  estimated_time: number; // minutos
  image_url?: string;
  created_at: string;
}

interface Question {
  id: number;
  question: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correct_option: string;
  explanation?: string;
}

interface QuizAttempt {
  id: number;
  quiz_id: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  score?: number;
  correct_answers: number;
  total_questions: number;
  time_spent: number; // segundos
  started_at: string;
  completed_at?: string;
}
```

### Topic/Discussion Object

```typescript
interface Topic {
  id: number;
  title: string;
  content: string;
  category: string;
  author: { id: number; name: string; avatar: string };
  replies_count: number;
  likes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

interface Reply {
  id: number;
  topic_id: number;
  content: string;
  author: { id: number; name: string; avatar: string };
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at?: string;
  edited: boolean;
}
```

### Notification Object

```typescript
interface Notification {
  id: number;
  type: string; // 'quiz_completed', 'new_reply', 'mention', etc
  title: string;
  message: string;
  data: Record<string, any>; // contexto (quiz_id, topic_id, etc)
  read: boolean;
  created_at: string;
}
```

### Badge Object

```typescript
interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  earned_at: string;
}
```

---

## 🔌 INTEGRAÇÃO COM BACKEND {#integração-backend}

### Base URL
```
EXPO_PUBLIC_API_URL = http://localhost:8000/api
```

### Endpoints Utilizados por Tela

#### DashboardScreen
- `GET /me` — Dados do utilizador
- `GET /notifications?limit=3` — Notificações recentes
- `GET /me/stats` — Estatísticas

#### ContentScreen
- `GET /documents?page=1&per_page=15&sort=newest` — Lista
- `GET /documents/search?q=termo` — Busca
- `GET /document-categories` — Categorias
- `POST /documents/{id}/like` — Like
- `POST /documents/{id}/favorite` — Favoritar

#### CommunityScreen
- `GET /topics?page=1&per_page=10&sort=newest` — Lista

#### QuizListScreen
- `GET /quizzes?difficulty=all&category=all` — Lista
- `GET /me/quiz-attempts?limit=10` — Meus attempts
- `GET /leaderboard/quizzes?category=economia` — Ranking

#### QuizScreen
- `POST /quizzes/{id}/attempts` — Iniciar
- `POST /quiz-attempts/{id}/answers` — Responder
- `POST /quiz-attempts/{id}/complete` — Submeter

#### ProfileScreen
- `GET /profile` — Dados completos
- `GET /me/badges` — Badges
- `POST /profile/avatar` — Upload avatar

#### PersonalInfoScreen
- `PUT /profile` — Atualizar dados

#### TopicDiscussionScreen
- `GET /topics/{id}` — Detalhes + respostas
- `POST /topics/{id}/replies` — Adicionar resposta

#### CreateTopicScreen
- `POST /topics` — Criar novo tópico

#### NotificationsScreen
- `GET /notifications?page=1&per_page=20` — Lista completa
- `PATCH /notifications/{id}/read` — Marcar lida
- `PATCH /notifications/read-all` — Marcar todas lidas
- `DELETE /notifications/{id}` — Deletar

### Headers em Todas as Requisições

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Tratamento de Erros

```typescript
// Interceptador de resposta
if (status === 401) {
  // Token expirado
  useAuth().signOut();
  // Redireciona para login
}

if (status === 403) {
  // Sem permissão
  Toast.show('Acesso negado');
}

if (status >= 500) {
  // Erro servidor
  Toast.show('Erro no servidor. Tente mais tarde.');
}
```

---

## 🎯 ESTADO GLOBAL (CONTEXTOS) {#estado-global}

### AuthContext

```typescript
interface AuthContextType {
  state: {
    status: 'loading' | 'authenticated' | 'unauthenticated';
    token: string | null;
    user: AuthUser | null;
  };
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Uso
const { state, signIn, signOut } = useAuth();
const { status, token, user } = state;
```

### CommunityContext

```typescript
interface CommunityContextType {
  topics: Topic[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  fetchTopics: (reset?: boolean) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  addTopicOptimistic: (topic: Topic) => void;
  updateTopicOptimistic: (id: number, updates: any) => void;
  getTopicById: (id: number) => Topic | undefined;
}

// Uso
const { topics, fetchTopics, addTopicOptimistic } = useCommunity();
```

### NotificationContext

```typescript
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

// Uso
const { notifications, unreadCount, markAsRead } = useNotifications();
```

---

## 📊 RESUMO VISUAL

```
┌─────────────────────────────────────────────────────────┐
│                  MOBILE APP ARCHITECTURE                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         App.tsx (Root)                           │  │
│  │         - AuthContext Provider                   │  │
│  │         - CommunityContext Provider              │  │
│  │         - NotificationContext Provider           │  │
│  └───────────────┬──────────────────────────────────┘  │
│                  │                                      │
│  ┌───────────────┴──────────────────────────────────┐  │
│  │        RootNavigator                             │  │
│  │  ┌────────────────────┐     ┌──────────────────┐ │  │
│  │  │  AuthNavigator     │     │ MainNavigator    │ │  │
│  │  │ ┌────────────────┐ │     │ ┌──────────────┐ │ │  │
│  │  │ │ LoginScreen    │ │     │ │BottomTabs(5) │ │ │  │
│  │  │ │ RegisterScreen │ │     │ ├──────────────┤ │ │  │
│  │  │ │ HomeScreen     │ │     │ │ Dashboard    │ │ │  │
│  │  │ └────────────────┘ │     │ │ Content      │ │ │  │
│  │  └────────────────────┘     │ │ Community    │ │ │  │
│  │                             │ │ Quiz         │ │ │  │
│  │                             │ │ Profile      │ │ │  │
│  │                             │ └──────────────┘ │ │  │
│  │                             │ (+ 18 detail    │ │  │
│  │                             │  screens)       │ │  │
│  │                             └──────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Services Layer                           │  │
│  │  ├─ userService                                  │  │
│  │  ├─ quizService                                  │  │
│  │  ├─ documentService                              │  │
│  │  ├─ communityService                             │  │
│  │  ├─ notificationService                          │  │
│  │  ├─ leaderboardService                           │  │
│  │  └─ http client (axios + interceptadores)        │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Backend API (Laravel)                    │  │
│  │  baseURL: http://localhost:8000/api              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE FUNCIONALIDADES

### Autenticação
- ✅ Login com email/senha
- ✅ Registro com validação
- ✅ Persistent login (AsyncStorage)
- ✅ Logout
- ❓ Login Social (código presente mas não testado)

### Conteúdo
- ✅ Listar documentos com paginação
- ✅ Buscar documentos
- ✅ Like/Favoritar
- ✅ Visualizar artigos/vídeos/áudio/PDFs

### Quizzes
- ✅ Listar quizzes
- ✅ Iniciar quiz
- ✅ Responder perguntas
- ✅ Submeter e ver resultado
- ✅ Leaderboard
- ✅ Histórico de tentativas

### Comunidade
- ✅ Listar tópicos
- ✅ Criar tópico
- ✅ Ver respostas
- ✅ Adicionar resposta
- ✅ Like em tópicos/respostas
- ✅ Paginação

### Perfil
- ✅ Ver dados pessoais
- ✅ Editar dados
- ✅ Upload avatar
- ✅ Ver badges
- ✅ Ver estatísticas

### Notificações
- ✅ Receber notificações
- ✅ Marcar como lida
- ✅ Centro de notificações
- ✅ Preferências de notificações
- ❓ Push notifications (não implementadas)

---

## 🔐 SEGURANÇA

- ✅ Token armazenado em Secure Storage (iOS) e SharedPreferences encriptado (Android)
- ✅ Bearer token automaticamente adicionado às requisições
- ✅ Auto-logout em 401
- ✅ HTTPS em produção (env var)
- ⚠️ Validações no frontend (backend é source of truth)

---

**Fim do Relatório**
