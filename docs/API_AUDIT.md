# Auditoria Final da API

Este documento apresenta uma auditoria detalhada de todas as rotas registadas no backend Laravel para o projeto **Economia Com História**. O objetivo é garantir o congelamento da API (API Freeze) e certificar que todos os endpoints estão documentados com a sua devida autenticação, roles de segurança e responsabilidades.

## Resumo Estatístico de Rotas
* **Total de rotas expostas**: 84
* **Públicas**: 8
* **Autenticadas (Qualquer Utilizador)**: 63
* **Professor + Admin**: 6
* **Admin Exclusivo**: 7

---

## Tabela de Auditoria das Rotas

| # | Método | Endpoint | Autenticação | Role Requerida | Controller & Método | Descrição |
|---|--------|----------|--------------|----------------|---------------------|-----------|
| 1 | `GET` | `/api/health` | Não | Pública | `HealthController` | Verifica a integridade básica do sistema e ligação à base de dados. |
| 2 | `POST` | `/api/auth/register` | Não | Pública | `AuthController@register` | Cria uma conta de utilizador com perfil inicial e nível base. |
| 3 | `POST` | `/api/auth/login` | Não | Pública | `AuthController@login` | Valida credenciais e emite um token JWT para a sessão. |
| 4 | `POST` | `/api/auth/refresh` | Não | Pública | `AuthController@refresh` | Emite um novo token JWT a partir de um token válido/expirado próximo. |
| 5 | `POST` | `/api/auth/forgot-password` | Não | Pública | `AuthController@forgotPassword` | Envia e-mail com token/link para redefinição de palavra-passe. |
| 6 | `POST` | `/api/auth/reset-password` | Não | Pública | `AuthController@resetPassword` | Define nova palavra-passe usando token de redefinição. |
| 7 | `POST` | `/api/auth/verify-email` | Não | Pública | `AuthController@verifyEmail` | Confirma o endereço de e-mail do utilizador com base num token recebido. |
| 8 | `POST` | `/api/auth/resend-verification` | Não | Pública | `AuthController@resendVerification` | Reenvia o e-mail de verificação de conta pendente. |
| 9 | `POST` | `/api/auth/logout` | Sim | Autenticado (Qualquer) | `AuthController@logout` | Invalida o token JWT e termina a sessão atual do utilizador. |
| 10 | `GET` | `/api/auth/sessions` | Sim | Autenticado (Qualquer) | `AuthController@sessions` | Devolve lista de sessões ativas (tokens) ligadas ao utilizador. |
| 11 | `DELETE`| `/api/auth/sessions/others` | Sim | Autenticado (Qualquer) | `AuthController@destroyOtherSessions` | Termina todos os outros tokens de sessão ativos do utilizador. |
| 12 | `DELETE`| `/api/auth/sessions/{id}` | Sim | Autenticado (Qualquer) | `AuthController@destroySession` | Termina um token de sessão ativo específico através do seu ID. |
| 13 | `GET` | `/api/me` | Sim | Autenticado (Qualquer) | `AuthController@me` | Devolve dados do utilizador logado, perfil, nível atual e insígnias ganhas. |
| 14 | `GET` | `/api/me/point-transactions` | Sim | Autenticado (Qualquer) | `GamificationController@pointTransactions` | Lista o histórico de transações de pontos recebidos pelo utilizador. |
| 15 | `GET` | `/api/me/favorites` | Sim | Autenticado (Qualquer) | `DocumentController@myFavorites` | Lista documentos favoritados pelo utilizador logado. |
| 16 | `GET` | `/api/profile` | Sim | Autenticado (Qualquer) | `ProfileController@show` | Devolve dados do perfil do utilizador autenticado. |
| 17 | `PUT` | `/api/profile` | Sim | Autenticado (Qualquer) | `ProfileController@update` | Atualiza informações do perfil (nome, biografia, província, etc.). |
| 18 | `POST` | `/api/profile/avatar` | Sim | Autenticado (Qualquer) | `ProfileController@updateAvatar` | Faz o upload e associa uma imagem de avatar ao perfil. |
| 19 | `PUT` | `/api/profile/password` | Sim | Autenticado (Qualquer) | `ProfileController@updatePassword` | Permite alterar a senha mediante a confirmação da senha atual. |
| 20 | `GET` | `/api/access-levels` | Sim | Autenticado (Qualquer) | `AccessController@index` | Lista todos os níveis de acesso (ex: Público, Restricted, Jindungo). |
| 21 | `GET` | `/api/access-requests` | Sim | Autenticado (Qualquer) | `AccessController@requests` | Lista os pedidos de acesso efetuados pelo próprio utilizador. |
| 22 | `POST` | `/api/access-requests` | Sim | Autenticado (Qualquer) | `AccessController@storeRequest` | Cria um pedido de acesso a um determinado nível (ex: Jindungo). |
| 23 | `GET` | `/api/access-requests/{id}` | Sim | Autenticado (Qualquer) | `AccessController@showRequest` | Mostra detalhes de um pedido de acesso próprio. |
| 24 | `GET` | `/api/access-grants` | Sim | Autenticado (Qualquer) | `AccessController@grants` | Lista as concessões de acesso ativas do próprio utilizador. |
| 25 | `GET` | `/api/document-categories`| Sim | Autenticado (Qualquer) | `DocumentController@categories` | Lista as categorias existentes para organização de documentos. |
| 26 | `GET` | `/api/documents` | Sim | Autenticado (Qualquer) | `DocumentController@index` | Lista documentos com paginação e filtros (filtrados por nível de acesso). |
| 27 | `GET` | `/api/documents/search` | Sim | Autenticado (Qualquer) | `DocumentController@search` | Executa pesquisa em documentos por palavras-chave (título, autor, resumo). |
| 28 | `GET` | `/api/documents/{id}` | Sim | Autenticado (Qualquer) | `DocumentController@show` | Devolve um documento específico (incrementando views_count). |
| 29 | `POST` | `/api/documents/{id}/like` | Sim | Autenticado (Qualquer) | `DocumentController@like` | Regista um "gosto" num documento e atribui pontos de gamificação. |
| 30 | `DELETE`| `/api/documents/{id}/like` | Sim | Autenticado (Qualquer) | `DocumentController@unlike` | Remove o "gosto" dado a um determinado documento. |
| 31 | `POST` | `/api/documents/{id}/download` | Sim | Autenticado (Qualquer) | `DocumentController@download` | Regista o download e devolve o link do PDF correspondente. |
| 32 | `POST` | `/api/documents/{id}/favorite` | Sim | Autenticado (Qualquer) | `DocumentController@favorite` | Adiciona um documento à lista de favoritos do utilizador. |
| 33 | `DELETE`| `/api/documents/{id}/favorite`| Sim | Autenticado (Qualquer) | `DocumentController@unfavorite` | Remove o documento da lista de favoritos do utilizador. |
| 34 | `POST` | `/api/documents/{id}/citations`| Sim | Autenticado (Qualquer) | `DocumentController@createCitation` | Cria uma citação académica (APA, MLA, ABNT, Chicago) do documento. |
| 35 | `GET` | `/api/quizzes` | Sim | Autenticado (Qualquer) | `QuizController@index` | Lista todos os quizzes ativos e a sua dificuldade associada. |
| 36 | `GET` | `/api/quizzes/{id}` | Sim | Autenticado (Qualquer) | `QuizController@show` | Mostra informações gerais sobre um quiz. |
| 37 | `GET` | `/api/quizzes/{id}/questions`| Sim | Autenticado (Qualquer) | `QuizController@questions` | Mostra as perguntas de um quiz sem revelar as respostas corretas. |
| 38 | `POST` | `/api/quizzes/{id}/attempts`| Sim | Autenticado (Qualquer) | `QuizController@startAttempt` | Inicia uma nova tentativa de quiz para o utilizador autenticado. |
| 39 | `GET` | `/api/quiz-attempts/{id}` | Sim | Autenticado (Qualquer) | `QuizController@showAttempt` | Mostra o progresso e perguntas da tentativa de quiz. |
| 40 | `POST` | `/api/quiz-attempts/{id}/answers`| Sim | Autenticado (Qualquer) | `QuizController@answerAttempt` | Grava a resposta dada pelo utilizador a uma pergunta do quiz. |
| 41 | `POST` | `/api/quiz-attempts/{id}/complete`| Sim | Autenticado (Qualquer) | `QuizController@completeAttempt`| Conclui a tentativa do quiz, calcula a nota e pontua o utilizador. |
| 42 | `GET` | `/api/me/quiz-attempts` | Sim | Autenticado (Qualquer) | `QuizController@myAttempts` | Devolve lista de tentativas de quiz efetuadas pelo utilizador logado. |
| 43 | `GET` | `/api/community/categories`| Sim | Autenticado (Qualquer) | `CommunityController@categories` | Lista as categorias principais do fórum de discussão. |
| 44 | `GET` | `/api/topics` | Sim | Autenticado (Qualquer) | `CommunityController@indexTopics` | Lista todos os tópicos de discussão ativos do fórum. |
| 45 | `GET` | `/api/topics/{id}` | Sim | Autenticado (Qualquer) | `CommunityController@showTopic` | Mostra um tópico de discussão e incrementa o seu contador de vistas. |
| 46 | `POST` | `/api/topics/{id}/like` | Sim | Autenticado (Qualquer) | `CommunityController@likeTopic` | Regista o "gosto" do utilizador num tópico de discussão. |
| 47 | `DELETE`| `/api/topics/{id}/like` | Sim | Autenticado (Qualquer) | `CommunityController@unlikeTopic` | Remove o "gosto" dado a um tópico de discussão. |
| 48 | `POST` | `/api/topics/{id}/follow` | Sim | Autenticado (Qualquer) | `CommunityController@followTopic` | Permite ao utilizador seguir as novidades de um tópico. |
| 49 | `DELETE`| `/api/topics/{id}/follow`| Sim | Autenticado (Qualquer) | `CommunityController@unfollowTopic`| Faz o utilizador deixar de seguir um tópico de discussão. |
| 50 | `GET` | `/api/topics/{id}/replies` | Sim | Autenticado (Qualquer) | `CommunityController@topicReplies` | Lista as respostas de um determinado tópico de discussão. |
| 51 | `POST` | `/api/topics` | Sim | Autenticado (Qualquer) | `CommunityController@storeTopic` | Cria um novo tópico numa categoria da comunidade. |
| 52 | `PATCH` | `/api/topics/{id}` | Sim | Autenticado (Qualquer/Owner) | `CommunityController@updateTopic` | Atualiza o conteúdo ou título de um tópico próprio. |
| 53 | `DELETE`| `/api/topics/{id}` | Sim | Autenticado (Qualquer/Owner) | `CommunityController@destroyTopic` | Remove permanentemente um tópico próprio da comunidade. |
| 54 | `POST` | `/api/topics/{id}/replies`| Sim | Autenticado (Qualquer) | `CommunityController@storeReply` | Responde a um tópico de discussão (envia notificações aos seguidores). |
| 55 | `PATCH` | `/api/replies/{id}` | Sim | Autenticado (Qualquer/Owner) | `CommunityController@updateReply` | Atualiza o conteúdo de uma resposta própria do fórum. |
| 56 | `DELETE`| `/api/replies/{id}` | Sim | Autenticado (Qualquer/Owner) | `CommunityController@destroyReply` | Remove uma resposta própria do fórum. |
| 57 | `POST` | `/api/replies/{id}/like` | Sim | Autenticado (Qualquer) | `CommunityController@likeReply` | Regista um "gosto" na resposta indicada. |
| 58 | `DELETE`| `/api/replies/{id}/like` | Sim | Autenticado (Qualquer) | `CommunityController@unlikeReply` | Remove o "gosto" de uma determinada resposta. |
| 59 | `POST` | `/api/replies/{id}/accept`| Sim | Autenticado (Qualquer/Owner) | `CommunityController@acceptReply` | Marca uma resposta como aceite (solução) do tópico, dando pontos. |
| 60 | `GET` | `/api/leaderboard/national`| Sim | Autenticado (Qualquer) | `LeaderboardController@national` | Devolve a classificação nacional de gamificação (pontos acumulados). |
| 61 | `GET` | `/api/leaderboard/provincial`| Sim | Autenticado (Qualquer) | `LeaderboardController@provincial`| Devolve a classificação de gamificação filtrada pela província do user. |
| 62 | `GET` | `/api/leaderboard/snapshots`| Sim | Autenticado (Qualquer) | `LeaderboardController@snapshots` | Lista registos de pódio e históricos anteriores de líderes. |
| 63 | `GET` | `/api/stats/provinces` | Sim | Autenticado (Qualquer) | `LeaderboardController@provinceStats` | Devolve dados agregados (total de pontos) por província angolana. |
| 64 | `GET` | `/api/notifications` | Sim | Autenticado (Qualquer) | `NotificationController@index` | Lista as notificações do utilizador com status lido/não lido. |
| 65 | `PATCH` | `/api/notifications/{id}/read`| Sim | Autenticado (Qualquer) | `NotificationController@markRead` | Marca uma notificação do próprio utilizador como lida. |
| 66 | `PATCH` | `/api/notifications/read-all`| Sim | Autenticado (Qualquer) | `NotificationController@markAllRead`| Marca todas as notificações do utilizador de uma só vez como lidas. |
| 67 | `DELETE`| `/api/notifications/{id}`| Sim | Autenticado (Qualquer) | `NotificationController@destroy` | Elimina uma notificação da caixa de entrada do utilizador. |
| 68 | `POST` | `/api/reports` | Sim | Autenticado (Qualquer) | `ReportController@store` | Cria uma denúncia sobre abuso em tópico, resposta, doc ou utilizador. |
| 69 | `GET` | `/api/reports` | Sim | Autenticado (Qualquer) | `ReportController@index` | Lista as denúncias criadas pelo próprio utilizador. |
| 70 | `GET` | `/api/reports/pending` | Sim | Autenticado (Qualquer) | `ReportController@pending` | Lista denúncias em estado aberto/pendente enviadas pelo utilizador. |
| 71 | `GET` | `/api/reports/{id}` | Sim | Autenticado (Owner/Moderador)| `ReportController@show` | Devolve os detalhes de uma denúncia específica. |
| 72 | `POST` | `/api/documents` | Sim | Admin, Professor | `DocumentController@store` | Cria a base de um novo documento em estado de rascunho (draft). |
| 73 | `PATCH` | `/api/documents/{id}` | Sim | Admin, Professor | `DocumentController@update` | Permite editar os metadados de um documento ou publicá-lo. |
| 74 | `DELETE`| `/api/documents/{id}` | Sim | Admin, Professor | `DocumentController@destroy` | Remove fisicamente um documento do repositório. |
| 75 | `POST` | `/api/quizzes` | Sim | Admin, Professor | `QuizController@store` | Cria um novo quiz com título, categoria, tempo e perguntas. |
| 76 | `PATCH` | `/api/quizzes/{id}` | Sim | Admin, Professor | `QuizController@update` | Modifica parâmetros e dados do quiz ou das suas perguntas. |
| 77 | `DELETE`| `/api/quizzes/{id}` | Sim | Admin, Professor | `QuizController@destroy` | Remove um quiz e as suas perguntas/respostas associadas. |
| 78 | `PATCH` | `/api/access-requests/{id}`| Sim | Admin | `AccessController@reviewRequest` | Permite aceitar ou rejeitar um pedido de acesso feito por estudante. |
| 79 | `POST` | `/api/access-grants/{id}/revoke`| Sim | Admin | `AccessController@revokeGrant` | Revoga imediatamente a concessão de acesso ativa a um utilizador. |
| 80 | `POST` | `/api/community/categories`| Sim | Admin | `CommunityController@storeCategory` | Cria uma categoria no fórum para estruturar novos tópicos. |
| 81 | `POST` | `/api/notifications/send`| Sim | Admin | `NotificationController@send` | Envia notificação forçada para utilizadores específicos ou em lote. |
| 82 | `POST` | `/api/notifications/invite`| Sim | Admin | `NotificationController@sendInvite` | Envia convite de email para novos membros externos entrarem no portal. |
| 83 | `PATCH` | `/api/reports/{id}` | Sim | Admin | `ReportController@update` | Atualiza o estado/notas internas de moderação sobre uma denúncia. |
| 84 | `POST` | `/api/reports/{id}/action`| Sim | Admin | `ReportController@action` | Executa a ação resolutiva de uma denúncia (ex: apagar conteúdo, banir). |

---

## Middlewares Ativos nas Rotas

1. **`AuthenticateApiSession`** (`Auth`):
   * Aplicado a partir da rota nº 9 até à nº 84.
   * Verifica a assinatura JWT e valida a sessão.
   * Associa o `User` e o token à sessão.
2. **`EnsureRole`** (`role:x`):
   * **`role:admin,professor`**: Garante que o utilizador autenticado possui role de `admin` ou `professor`. Aplicado nas rotas nº 72 a 77.
   * **`role:admin`**: Garante acesso exclusivo a administradores. Aplicado nas rotas nº 78 a 84.
