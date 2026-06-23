# Arquitetura do Sistema

Este documento descreve o padrão arquitetural do backend Laravel do projeto **Economia Com História**. A aplicação adota uma arquitetura clássica baseada em camadas: **Camada de Rotas**, **Camada de Controladores (Controllers)**, **Camada de Lógica de Negócio (Services)** e **Camada de Persistência (Eloquent Models e Query Builder)**.

---

## 1. Estrutura do Projeto

A organização dos principais ficheiros do projeto no diretório `backend/` é apresentada de seguida:

* **`routes/api.php`**: Ponto único de entrada das rotas da API. Define os middlewares de sessão, autenticação JWT e controlo de roles.
* **`app/Http/Controllers/Api/`**: Contém os controladores encarregues de receber os pedidos HTTP, validar os payloads de entrada e devolver as respostas em formato JSON.
* **`app/Services/`**: Camada que centraliza a lógica de negócio pesada, isolando a persistência e orquestrando as operações complexas (ex: regras de gamificação, envio de notificações e controlo de acessos).
* **`app/Models/`**: Ficheiros de mapeamento Objeto-Relacional (ORM) usando o Eloquent para as principais tabelas.
* **`app/Mail/`**: Classes Mailable para formatação e envio de e-mails via servidores SMTP/API (ex: Resend).
* **`tests/`**: Suite de testes automatizados organizados em testes de funcionalidade (Feature) e testes de unidade (Unit).

---

## 2. Camada de Serviços (Services)

A lógica complexa do sistema está delegada a seis serviços principais autónomos:

### 2.1 AccessGateService
* **Responsabilidade**: Validar e filtrar os direitos de visualização de documentos e conteúdos com base nas permissões e níveis do utilizador.
* **Dependências**: Nenhuma (usa queries diretas sobre `user_access_grants`).
* **Métodos Principais**:
  * `canAccess(User $user, string $accessLevelId): bool`: Verifica se o utilizador tem concessão ativa para um nível.
  * `canAccessDocument(User $user, object $document): bool`: Avalia se o utilizador pode ler o documento indicado.
  * `applyDocumentVisibilityFilter(Builder $query, User $user, string $tableAlias)`: Filtra dinamicamente as queries do query builder para incluir apenas documentos autorizados.

### 2.2 GamificationService
* **Responsabilidade**: Controlar o motor de pontos, atribuição de insígnias (badges), progressão de níveis e transações de mérito.
* **Dependências**: `NotificationService`.
* **Métodos Principais**:
  * `awardPoints(User $user, int $points, string $reason, ...): GamificationResult`: Atribui pontos positivos e avalia novos níveis e insígnias.
  * `deductPoints(User $user, int $points, ...): GamificationResult`: Deduz pontos por ações administrativas de penalização.
  * `recordQuizCompletion(User $user, ...): GamificationResult`: Lógica transacional que soma pontos base de quiz, bónus de rapidez e precisão de acerto.
  * `evaluateBadges(User $user): array`: Executa as regras de validação para verificar se o utilizador preencheu os critérios para ganhar novas insígnias.

### 2.3 NotificationService
* **Responsabilidade**: Registar mensagens de notificação no repositório de entrada do utilizador.
* **Dependências**: Nenhuma (escreve na tabela `notifications`).
* **Métodos Principais**:
  * `send(User $user, string $type, string $title, ?string $message, ...): array`: Cria e persiste uma nova notificação estruturada.

### 2.4 QuizAttemptService
* **Responsabilidade**: Gerir o fluxo de tentativas de resolução de questionários, validação de respostas e cálculo final de acertos.
* **Dependências**: `AccessGateService`, `GamificationService`.
* **Métodos Principais**:
  * `startAttempt(string $quizId, User $user): string`: Inicia a sessão de resolução de um questionário.
  * `answerAttempt(string $attemptId, string $questionId, string $selectedOptionId, ...): array`: Grava a escolha do utilizador em tempo real.
  * `completeAttempt(string $attemptId, ...): array`: Finaliza a tentativa, calcula a nota percentual média e invoca o `GamificationService`.

### 2.5 ReportModerationService
* **Responsabilidade**: Apoiar a moderação administrativa, avaliando a integridade das denúncias e aplicando punições.
* **Dependências**: Nenhuma (executa transações diretas no DB).
* **Métodos Principais**:
  * `flagContent(object $report): void`: Marca documentos, tópicos ou respostas como "sinalizados".
  * `deleteContent(object $report): void`: Remove fisicamente o conteúdo ofensivo ou desativa a conta do utilizador denunciado.

### 2.6 LeaderboardService
* **Responsabilidade**: Consultar de forma rápida (read-only) as classificações nacionais e provinciais.
* **Dependências**: Nenhuma (usa caches inteligentes via Redis/Database).
* **Métodos Principais**:
  * `national(): Collection`: Carrega a tabela cacheada nacional.
  * `provincial(string $province, int $page, int $perPage): array`: Devolve ranking regional paginado.

---

## 3. Camada de Modelos (Models)

Lista dos modelos Eloquent e as suas configurações específicas:

### 3.1 User
* **Tabela**: `users`
* **Casts**: `email_verified` (bool), `is_active` (bool), `last_login_at` (datetime), `password_hash` (hashed).
* **Timestamps**: Sim
* **Propriedades**: Chave primária UUID (não incremental).

### 3.2 UserProfile
* **Tabela**: `user_profiles`
* **Relações**: `user` (BelongsTo).
* **Timestamps**: Sim

### 3.3 AccessLevel
* **Tabela**: `access_levels`
* **Relações**: `grants` (HasMany), `requests` (HasMany).
* **Timestamps**: Não

### 3.4 AccessRequest
* **Tabela**: `access_requests`
* **Relações**: `user` (BelongsTo), `reviewedBy` (BelongsTo a User).
* **Timestamps**: Sim

### 3.5 AccessGrant
* **Tabela**: `user_access_grants`
* **Relações**: `user` (BelongsTo), `grantedBy` (BelongsTo), `accessLevel` (BelongsTo), `request` (BelongsTo).
* **Casts**: `granted_at` (datetime), `expires_at` (datetime), `revoked_at` (datetime), `is_active` (bool).
* **Timestamps**: Não

### 3.6 CommunityCategory
* **Tabela**: `community_categories`
* **Relações**: `topics` (HasMany), `users` (BelongsToMany).
* **Timestamps**: Sim

### 3.7 CategoryMember
* **Tabela**: `community_category_members`
* **Relações**: `category` (BelongsTo), `user` (BelongsTo).
* **Timestamps**: Sim

### 3.8 DiscussionTopic
* **Tabela**: `discussion_topics`
* **Relações**: `category` (BelongsTo), `author` (BelongsTo), `replies` (HasMany), `likers` (BelongsToMany), `followers` (BelongsToMany).
* **Casts**: `is_pinned` (bool), `is_locked` (bool).
* **Timestamps**: Sim

### 3.9 TopicReply
* **Tabela**: `topic_replies`
* **Relações**: `topic` (BelongsTo), `author` (BelongsTo), `parentReply` (BelongsTo), `childReplies` (HasMany), `likers` (BelongsToMany).
* **Casts**: `is_accepted` (bool), `is_flagged` (bool).
* **Timestamps**: Sim

### 3.10 LeaderboardCache
* **Tabela**: `leaderboard_nacional_cache`
* **Relações**: `user` (BelongsTo).
* **Timestamps**: Não

### 3.11 LeaderboardSnapshot
* **Tabela**: `leaderboard_snapshots`
* **Relações**: `user` (BelongsTo).
* **Timestamps**: Não

### 3.12 ProvinceStat
* **Tabela**: `leaderboard_provincial_stats`
* **Timestamps**: Não

---

## 4. Comunicações por E-mail (Mail)

O backend disponibiliza 3 modelos de e-mail estruturados:

1. **`EmailVerificationMail`**: Utilizado no registo e no reenvio de confirmação de conta. Envia um link com o token de validação de e-mail.
2. **`PasswordResetMail`**: Disparado no pedido de recuperação de palavra-passe, fornecendo um token temporário (válido por 1 hora) para redefinição.
3. **`InviteMail`**: Usado por administradores para convidar externamente novos professores ou investigadores autorizados para a plataforma.
