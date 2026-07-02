# Sprint 18.0 — Auditoria Global da Plataforma (Admin Foundation)

**Data:** 2026-07-02
**Fase:** 18 — Plataforma Administrativa
**Tipo:** Auditoria Arquitetural (não implementa funcionalidades)
**Fonte única de verdade:** `backend/database/migrations/` (27 migrations). Todos os scripts SQL, dumps e diagramas antigos foram ignorados.

Este documento é o **plano diretor da Fase 18**. Todas as conclusões abaixo foram derivadas diretamente das migrations e do código fonte real (`backend/app`, `backend/routes/api.php`, `frontend-web`, `frontend-painel`).

---

# Módulo 1 — Inventário da Base de Dados

**Total: 41 tabelas + 1 view MySQL (`province_stats`) + 2 triggers + 1 stored procedure.**

## 1.1 Auth / Users

| Tabela | Tipo | Model | Quem cria | Quem administra | Notas |
| --- | --- | --- | --- | --- | --- |
| `users` | Entidade Principal | `User` | registo público / seeder | Admin (`PATCH/DELETE /admin/users/{id}`) | UUID PK, role string (`estudante` default), índices email/role. **Delete é hard delete.** |
| `user_profiles` | Entidade de Apoio (1:1) | `UserProfile` | AuthController no registo | próprio user + Admin | `research_areas` JSON livre; `province` string livre (validada por `Support\AngolaProvinces`) |
| `user_sessions` | Tabela Técnica | **sem model** (DB::table) | login | próprio user (`/auth/sessions`) | refresh tokens; cascade on user delete |
| `verification_tokens` | Tabela Técnica | **sem model** | AuthController | ninguém (interno) | verify-email + reset-password |

## 1.2 Access (níveis de acesso)

| Tabela | Tipo | Model | Notas |
| --- | --- | --- | --- |
| `access_levels` | Configuração | `AccessLevel` (órfão) | **Seeded na migration** (public/jindungo/restricted). Sem CRUD admin — valores fixos no código. |
| `user_access_requests` | Entidade Principal (workflow) | `AccessRequest` (órfão) | Workflow completo: pedido → review (`reviewed_by`, `reviewed_at`, `review_notes`) |
| `user_access_grants` | Entidade Principal (workflow) | `AccessGrant` (órfão) | `granted_by`, `revoked_at`; **2 triggers MySQL** mantêm `is_active` |

## 1.3 Gamification / Leaderboard

| Tabela | Tipo | Model | Notas |
| --- | --- | --- | --- |
| `level_definitions` | Configuração | **sem model** | Seeded (`LevelDefinitionsSeeder`). **Sem qualquer endpoint ou CRUD.** |
| `user_levels` | Apoio (1:1, estado) | **sem model** | contadores: pontos totais/semanais/mensais, quizzes, docs lidos, tópicos, replies |
| `point_transactions` | Auditoria/Histórico | **sem model** | ledger imutável; leitura própria via `/me/point-transactions` |
| `badges` | Configuração | `Badge` | CRUD admin completo ✅ |
| `user_badges` | Histórico/Pivot | `UserBadge` (órfão) | atribuído pelo `GamificationService` |
| `leaderboard_snapshots` | Histórico | `LeaderboardSnapshot` | endpoint dispara snapshot diário |
| `leaderboard_nacional_cache` | Tabela de Cache | `LeaderboardCache` | ⚠️ **CRÍTICO: nunca é refrescada** — ver Módulo 11 |
| `province_stats` (VIEW) | Técnica (leitura) | `ProvinceStat` | usada em `/stats/provinces` |

## 1.4 Documents

| Tabela | Tipo | Model | Notas |
| --- | --- | --- | --- |
| `document_categories` | Configuração | `DocumentCategory` (só relações) | hierarquia (`parent_id`), `requires_subscription`, `sort_order`. **Sem CRUD admin** — apenas `GET /document-categories`. |
| `documents` | Entidade Principal | `Document` | estados draft/published…; auditoria `created_by`/`reviewed_by`; `media_type`/`media_url` (contrato TEXT\|IMAGE\|VIDEO\|AUDIO\|PDF); `pdf_url` legado; `is_pinned`; contadores denormalizados; FULLTEXT MySQL |
| `tags` | Configuração | `Tag` (só relações) | criadas implicitamente no store/update de documentos. **Sem gestão própria.** |
| `document_tags` | Pivot | — | cascade dos dois lados |
| `document_likes` / `document_downloads` / `document_views` / `user_favorites` / `document_citations` | Histórico (interações) | models só usados como relações | `document_views.user_id` nullable (visitantes) |
| `document_subscriptions` | Entidade Principal (workflow) | `DocumentSubscription` (órfão em runtime — service usa DB::table) | status default PENDING; auditoria `approved_by`/`rejected_by`/`cancelled_by` ✅ |

## 1.5 Quizzes

| Tabela | Tipo | Model | Notas |
| --- | --- | --- | --- |
| `quizzes` | Entidade Principal | `Quiz` | auditoria completa: `created_by`, `published_by`, `reviewed_by`, `archived_by` ✅; contadores attempts/completions/avg_score |
| `quiz_questions` / `quiz_options` | Apoio | `QuizQuestion`/`QuizOption` | geridas via QuizService (payload aninhado) |
| `quiz_attempts` | Histórico | `QuizAttempt` | cascade on quiz delete (migration 2026_07_01) |
| `quiz_attempt_answers` | Histórico | **sem model** | só visualização via attempt |
| `quiz_documents` | Pivot N:N | `QuizDocument` | ⚠️ colunas `quiz_id`/`document_id` criadas como `string` (255) e não `uuid`/`char(36)` — inconsistência de tipo com as PKs; FK adicionada na sprint 17 |

## 1.6 Community

| Tabela | Tipo | Model | Notas |
| --- | --- | --- | --- |
| `community_categories` | Configuração | `CommunityCategory` | `access_level_id` **deprecado** desde sprint 13 (nullable, ignorado na autorização — mantido só por histórico) |
| `discussion_topics` | Entidade Principal | `DiscussionTopic` | `visibility` (CATEGORY \| INVITE_ONLY); `document_id` FK nullable (sprint 17.3, nullOnDelete); contadores denormalizados |
| `topic_replies` | Entidade de Apoio | `TopicReply` | threading via `parent_reply_id`; `is_accepted`, `is_flagged` |
| `topic_likes` / `reply_likes` / `topic_followers` | Histórico (interações) | usados | uniques compostos |
| `category_members` | Pivot | `CategoryMember` | gerida indiretamente |
| `discussion_topic_members` | Pivot com papel | `DiscussionTopicMember` | role, `invited_by`, `accepted_at` — gestão completa via endpoints de tópico ✅ |

## 1.7 Notifications / Moderação

| Tabela | Tipo | Model | Notas |
| --- | --- | --- | --- |
| `notifications` | Entidade de Apoio | `Notification` (**órfão** — controller usa DB::table) | leitura própria; admin envia (`/notifications/send`, `/invite`) |
| `content_reports` | Entidade Principal (workflow) | **sem model** | workflow completo: pending → review + action; auditoria `reviewed_by`/`reviewed_at`/`action_taken` ✅ |

## 1.8 Framework (técnicas)

`cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs` — infraestrutura Laravel, sem model, sem administração (correto). Nota: **não existe tabela `personal_access_tokens`** — a autenticação não usa Sanctum (ver Módulo 7).

---

# Módulo 2 — Inventário dos Domínios

| Domínio | Aggregate Root | Controllers | Services | Policies | Requests | Resources | Enums | Exceptions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Auth | User | AuthController (12 métodos) | — (lógica no controller) | — | inline | — | — | — |
| Users/Profiles | User | ProfileController, UserController, AdminController | UserDirectoryService, DashboardService | — | inline | — | — | — |
| Access | AccessRequest | AccessController | AccessGateService | — | inline | — | — | — |
| Documents | Document | DocumentController | DocumentAccessService, DocumentStatisticsService, CategoryStatisticsService | DocumentPolicy ✅ | Store/UpdateDocumentRequest ✅ | DocumentResource, QuizSummaryResource ✅ | DocumentStatus | — |
| Subscriptions | DocumentSubscription | AdminDocumentSubscriptionController + DocumentController | DocumentSubscriptionService, SubscriptionStatisticsService | — | inline | — | SubscriptionStatus, SubscriptionReason | InvalidSubscriptionTransition, SubscriptionNotFound |
| Quizzes | Quiz | QuizController, QuizAdminController | QuizService, QuizAttemptService, QuizDocumentService | — | inline | — | QuizStatus, QuizAttemptStatus | InvalidQuizTransition, QuizNotFound |
| Community | DiscussionTopic | CommunityController (27 métodos ⚠️) | CommunityAuthorizationService | DiscussionTopicPolicy ✅ | inline | — | — | — |
| Gamification | user_levels (sem model) | GamificationController, BadgeController | GamificationService (+ Gamification/GamificationResult) | — | inline | — | — | — |
| Leaderboard | LeaderboardCache | LeaderboardController | LeaderboardService | — | — | — | — | — |
| Notifications | Notification | NotificationController | NotificationService | — | inline | — | — | — |
| Moderation | content_reports | ReportController | ReportModerationService | — | inline | — | — | — |
| System | — | HealthController | — | — | — | — | — | — |

**Observações arquiteturais transversais:**

1. **O padrão dominante é `DB::table()` (query builder), não Eloquent.** Os models existem mas a maioria só é usada para definir relações — 100+ chamadas `DB::table` em controllers e services. Consequência: casts, relations e enums declarados nos models não são aplicados na maior parte dos fluxos.
2. Apenas o domínio Documents tem a tríade completa Policy + FormRequest + Resource. Todos os outros validam inline e montam arrays à mão.
3. `CommunityController` com 27 métodos públicos é o maior hotspot de refatoração (candidato a split: Categories / Topics / Replies / Members).
4. Auth tem toda a lógica de negócio no controller (12 métodos, sem service).

---

# Módulo 3 — Cobertura Administrativa por Entidade Principal

| Entidade | Listagem | Detalhe | Criação | Edição | Eliminação | Pesquisa | Filtros | Paginação | Export | Import | Bulk | Auditoria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Users | SIM (`/admin/users`) | PARCIAL (payload no update) | **NÃO** | SIM | SIM (hard) | SIM | SIM (role/status) | **NÃO** (limit 200 fixo) | NÃO | NÃO | NÃO | PARCIAL (`last_login_at`; sem `created_by`) |
| Documents | SIM | SIM | SIM (admin+professor) | SIM | SIM | SIM (fulltext) | SIM | SIM | NÃO | NÃO | NÃO | SIM (`created_by`, `reviewed_by`, `published_at`) |
| Document Categories | SIM (pública) | NÃO | **NÃO** | **NÃO** | **NÃO** | NÃO | NÃO | NÃO | NÃO | NÃO | NÃO | NÃO |
| Quizzes | SIM (`/admin/quizzes`) | SIM | SIM | SIM | SIM | SIM | SIM | SIM | NÃO | NÃO | NÃO | SIM (4 colunas *_by) ✅ |
| Community Categories | SIM (pública) | NÃO | SIM (`POST /community/categories`) | **NÃO** | **NÃO** | NÃO | NÃO | NÃO | NÃO | NÃO | NÃO | NÃO |
| Topics | SIM (pública) | SIM | SIM | SIM (autor/admin via policy) | SIM | SIM | SIM | SIM | NÃO | NÃO | NÃO | PARCIAL (autor sim; sem deleted_by) |
| Subscriptions | SIM (`/admin/document-subscriptions`) | PARCIAL | n/a (user pede) | SIM (approve/reject/cancel) | n/a | NÃO | SIM (status) | SIM | NÃO | NÃO | NÃO | SIM (3 colunas *_by) ✅ |
| Access Requests | SIM | SIM | n/a (user pede) | SIM (review) | n/a | NÃO | SIM | NÃO | NÃO | NÃO | NÃO | SIM (`reviewed_by`) ✅ |
| Badges | SIM | NÃO | SIM | SIM | SIM (+ toggle) | NÃO | NÃO | NÃO | NÃO | NÃO | NÃO | NÃO |
| Level Definitions | **NÃO** | **NÃO** | **NÃO** | **NÃO** | **NÃO** | — | — | — | — | — | — | — |
| Access Levels | SIM (`/access-levels`) | NÃO | **NÃO** | **NÃO** | **NÃO** | — | — | — | — | — | — | — |
| Tags | **NÃO** (só implícito) | NÃO | implícita | NÃO | NÃO | — | — | — | — | — | — | — |
| Reports | SIM | SIM | n/a | SIM (review+action) | NÃO | NÃO | SIM (pending) | NÃO | NÃO | NÃO | NÃO | SIM ✅ |
| Notifications | PARCIAL (só próprias) | — | SIM (send/invite) | — | SIM (própria) | NÃO | NÃO | SIM | NÃO | NÃO | NÃO | NÃO |

**Export/Import/Bulk actions não existem em nenhum domínio da plataforma.**

---

# Módulo 4 — Inventário de Endpoints

Total: **~120 registos de rota** em `routes/api.php` (251 linhas). Separação:

## 4.1 Públicos (sem autenticação)
`GET /health` · `POST /auth/{register,login,refresh,forgot-password,reset-password,verify-email,resend-verification}` (7)

## 4.2 Públicos com auth opcional (`OptionalAuthenticateApiSession`)
Documents: categorias, index, search, show (4) · Community: categorias, topics index/show/replies (4) · Quizzes: index, show, questions, documents (4)

## 4.3 Autenticados (mobile/web — utilizador)
Sessões (4) · `/me` + point-transactions + favorites + quiz-attempts (4) · Profile (4) · Access requests/grants próprios (5) · Badges list (1) · Interações documents: like/download/favorite/citations/topics/quizzes (9) · Subscrição de documento: status/subscribe/cancel (3) · Quiz attempts: start/show/answer/complete (4) · Community: likes/follow/topics CRUD/members/join/leave/replies CRUD/accept (17) · Leaderboard + stats (4) · Notifications próprias (4) · Reports: store/index/pending/show (4) · `GET /users/search` (1)

## 4.4 Admin (`role:admin`) e Admin+Professor
- **Prefixo `/admin`:** dashboard/summary · users (GET/PATCH/DELETE) · document-subscriptions (GET + approve/reject/cancel) · quizzes: CRUD completo + publish/review/archive + dashboard + sync/detach documents (24 registos)
- **Sem prefixo (role:admin):** documents pin/unpin · access-requests review · grants revoke · community categories store · notifications send/invite · reports update/action · badges CRUD+toggle (13)
- **Admin+Professor:** documents store/update/destroy (3)

## 4.5 Problemas encontrados

| Problema | Detalhe |
| --- | --- |
| **Grupo duplicado integral** | `Route::prefix('v1/admin')` ([api.php:102-127](backend/routes/api.php#L102-L127)) duplica **22 registos** do grupo `/admin` (quizzes). Dois prefixes ativos para as mesmas operações. Decidir contrato (`/api/admin` vs `/api/v1/admin`) e remover um. |
| **Verbos duplicados** | publish/review/archive registados como PATCH **e** POST (6 duplicações × 2 prefixos = 12 registos redundantes). |
| **Rota pública duplicada em admin** | `GET /quizzes/{id}/documents` existe na área pública e admin (justificável, mas documentar a diferença). |
| **Endpoints mortos** | Nenhum controller sem rota. Nenhuma rota sem controller. ✅ |
| **Consumo verificado** | O painel Angular consome `/api/admin/*` (não `/api/v1/admin/*`) — o grupo `v1/admin` aparenta estar **sem utilização**. |

---

# Módulo 5 — Cobertura do Painel

Existem **dois frontends administrativos**:

1. **`frontend-web` (Angular)** — dashboard admin real em `/admin/dashboard`, protegido por `adminGuard`, com 13 páginas e serviços HTTP dedicados (`admin-api`, `badge-admin`, `community-admin`, `document-admin`, `report-admin`). **É o Backoffice efetivo.**
2. **`frontend-painel` (React/Vite)** — apenas 2 páginas (Dashboard, Requests), **sem uma única chamada HTTP** — é um protótipo estático. ⚠️ Decidir: adotar como futuro painel ou arquivar (candidato a código morto).

Cobertura do painel Angular:

| Página | Estado | Observação |
| --- | --- | --- |
| Visão Geral (overview) | **Completo** | consome `/admin/dashboard/summary` |
| Pedidos (access requests) | **Completo** | review de pedidos |
| Concessões (grants) | **Completo** | revoke |
| Utilizadores | **Completo** | search/filtros; sem paginação (limitação da API) |
| Categorias | **Parcial** | usa `CommunityAdminService` — só categorias da comunidade, só criação; **document_categories sem gestão** |
| Conteúdos (documents) | **Completo** | CRUD + pin |
| Comunidade | **Parcial** | moderação básica |
| Quizzes Manager | **Completo** | CRUD + transições + N:N documentos |
| Denúncias (reports) | **Completo** | workflow completo |
| Badges | **Completo** | CRUD + toggle |
| Níveis (levels) | **Inexistente (mock)** | página sem chamadas HTTP; **não existe endpoint de level_definitions** |
| Configurações (settings) | **Inexistente (mock)** | página sem chamadas HTTP; **não existe tabela/endpoint de settings** |
| Notificações | **Completo** | send/invite |
| Subscrições | **Em falta como página dedicada** | endpoints existem; gestão embutida em conteúdos |
| Logs / Auditoria | **Inexistente** | não há visualização de point_transactions, sessions, views |

---

# Módulo 6 — Operações Administrativas por Domínio

Legenda: ✅ existe · ⚠️ parcial/indireto · ❌ não existe

**Users:** Editar ✅ · Bloquear/Desbloquear ⚠️ (via `is_active` no update; sem endpoint dedicado) · Eliminar ✅ (hard) · Alterar Role ✅ · Criar ❌ · Alterar Nível ❌ · Recalcular Pontos ❌ · Ver sessões de outro user ❌ · Forçar verificação de email ✅ (via update)

**Documents:** Criar/Editar/Eliminar ✅ · Publicar ⚠️ (via `status` no update; sem transição dedicada como quizzes) · Arquivar ⚠️ (idem) · Pin/Unpin ✅ · Duplicar ❌ · Mover Categoria ⚠️ (via update) · Export/Import ❌ · Bulk ❌

**Quizzes:** CRUD ✅ · Publish/Review/Archive ✅ (transições dedicadas com máquina de estados) · Associar documentos (sync/detach) ✅ · Dashboard ✅ · Duplicar ❌ · Bulk ❌ · **Modelo de referência para os restantes domínios.**

**Community:** Criar categoria ✅ · Editar/Eliminar/Desativar categoria ❌ · Moderar tópico (editar/eliminar via policy) ✅ · Pin/Feature tópico ❌ (colunas `is_pinned`/`is_featured` existem mas **sem endpoint admin**) · Lock tópico ⚠️ (coluna `status` existe; sem endpoint dedicado) · Apagar spam em massa ❌

**Subscriptions:** Listar ✅ · Approve/Reject/Cancel ✅ · Stats ✅ (dashboard) · Export ❌

**Gamification:** Badges CRUD+toggle ✅ · Atribuir badge manualmente ❌ · Levels (definições) ❌ · Ajustar/recalcular pontos ❌ · Ver ledger de pontos de um user ❌ (só o próprio via `/me`)

**Leaderboard:** Consultar ✅ · **Refrescar cache ❌ (nem manual nem agendado — ver Módulo 11)** · Snapshots ⚠️ (endpoint dispara snapshot do dia)

**Access:** Review de pedidos ✅ · Revoke de grants ✅ · CRUD de access_levels ❌ (fixos por seed)

**Moderation:** Review ✅ · Action (remove/flag/dismiss) ✅

**Notifications:** Send ✅ · Invite ✅ · Broadcast a todos ❌ · Ver notificações de outros ❌

---

# Módulo 7 — Segurança

- **Autenticação:** custom, baseada em `user_sessions` + refresh tokens via middleware próprios `AuthenticateApiSession` / `OptionalAuthenticateApiSession`. **Não é Sanctum** — o item "auth:sanctum" do checklist não se aplica; não existe `personal_access_tokens`.
- **Autorização:** middleware `role:` (`EnsureRole`) registado em [bootstrap/app.php](backend/bootstrap/app.php). Policies: apenas `DocumentPolicy` e `DiscussionTopicPolicy` (registadas no `AuthServiceProvider`).
- **Rotas admin:** todas dentro de `AuthenticateApiSession` + `role:admin` ✅. Documents store/update/destroy: `role:admin,professor` ✅. **Nenhuma rota administrativa desprotegida foi encontrada.**
- ⚠️ **Sem rate limiting:** nenhuma rota usa `throttle` — `/auth/login`, `/auth/register` e `/auth/forgot-password` estão expostos a brute force. **Recomendação: prioridade alta na 18.1.**
- ⚠️ Autorização de quizzes/badges/reports/subscriptions assenta só no middleware de role — sem Policies (aceitável, mas heterogéneo face a Documents/Topics).

---

# Módulo 8 — Auditoria (colunas *_by)

| Domínio | created_by | updated_by | deleted_by | published_by | reviewed_by | archived_by |
| --- | --- | --- | --- | --- | --- | --- |
| Documents | ✅ | ❌ | ❌ | ❌ (só `published_at`) | ✅ | ❌ |
| Quizzes | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Subscriptions | (user_id) | — | — | ✅ approved_by/rejected_by/cancelled_by | — | — |
| Access requests/grants | (user_id) | — | — | — | ✅ reviewed_by / granted_by | — |
| Reports | reporter_id | — | — | — | ✅ | — |
| Users | ❌ | ❌ | ❌ | — | — | — |
| Community (categorias/tópicos/replies) | ⚠️ author_id | ❌ | ❌ | — | — | ❌ |
| Badges / Levels / Categories | ❌ | ❌ | ❌ | — | — | — |

**Lacunas:** não existe **soft delete em nenhuma tabela** (nenhum `deleted_at` nas migrations); eliminações de users/documents/topics são destrutivas e sem rasto. Quizzes é o padrão de referência (sprint 17.2); Documents deve ser alinhado (adicionar `published_by`/`archived_by`) numa sprint futura.

---

# Módulo 9 — Estatísticas

**Existentes (calculadas on-demand):**
- `GET /admin/dashboard/summary` (DashboardService): users (total/ativos/novos/admins), access_requests, documents (via DocumentStatisticsService), categories (CategoryStatisticsService), subscriptions (SubscriptionStatisticsService), community (tópicos por estado, replies), moderação (reports por estado), atividade recente.
- `GET /admin/quizzes/dashboard` (QuizAdminController): métricas de quizzes.
- `GET /stats/provinces`: via VIEW MySQL `province_stats`.

**Persistidas (denormalizadas):** contadores em `documents` (views/likes/downloads), `quizzes` (attempts/completions/avg_score), `discussion_topics` (replies/views/likes/followers), `community_categories` (members/topics), `user_levels` (todos os contadores de atividade).

**Inexistentes:** revenue (não aplicável — sem pagamentos) · série temporal de crescimento (novos users/docs por semana) · taxa de aprovação de quizzes por quiz no tempo · estatísticas de gamificação para admin (distribuição por nível, badges mais atribuídos) · métricas de notificações.

---

# Módulo 10 — Código Morto

**Nada deve ser removido nesta sprint — apenas documentado.**

| Categoria | Achados |
| --- | --- |
| Controllers sem rotas | Nenhum ✅ |
| Rotas sem controller | Nenhuma ✅ |
| Rotas sem utilização | Grupo inteiro `prefix('v1/admin')` (22 registos) — nenhum frontend o consome; verbos POST duplicados de publish/review/archive |
| Models órfãos (nunca importados fora de `Models/`; runtime usa `DB::table`) | `Notification`, `DocumentSubscription`, `AccessGrant`, `AccessLevel`, `AccessRequest`, `UserBadge` |
| Models usados apenas como relações | `DocumentCategory`, `Tag`, `DocumentLike`, `DocumentDownload`, `DocumentView`, `UserFavorite`, `DocumentCitation`, `QuizDocument`, `UserProfile`, `QuizQuestion`, `QuizOption` |
| Tabelas sem model | `user_sessions`, `verification_tokens`, `level_definitions`, `user_levels`, `point_transactions`, `quiz_attempt_answers`, `content_reports` (+ tabelas framework) |
| Coluna deprecada | `community_categories.access_level_id` — nullable e ignorada na autorização desde a sprint 13 (mantida por decisão documentada) |
| Coluna legada | `documents.pdf_url` — substituída por `media_url` (mantida por compatibilidade, decisão sprint 14.3) |
| Services sem utilização | Nenhum — todos os 16 services são injetados ✅ |
| Frontend morto | `frontend-painel` (React): protótipo estático sem integração API, funcionalmente duplicado pelo dashboard Angular |
| Páginas mock no painel Angular | `levels-page` e `settings-page` (sem chamadas HTTP) |
| Migrations órfãs | Nenhuma — todas consistentes e reversíveis ✅ |
| Factories em falta | Só existem 6 (User, AccessRequest, CommunityCategory, DiscussionTopic, Notification, TopicReply). Faltam Document, Quiz, Badge, DocumentSubscription — os testes contornam com inserts diretos |

---

# Módulo 11 — Performance

| Item | Estado | Detalhe |
| --- | --- | --- |
| **Leaderboard nacional** | **CRÍTICO** | `LeaderboardService::national()` lê `leaderboard_nacional_cache`, mas a procedure `sp_refresh_leaderboard_nacional` **nunca é chamada**: o EVENT MySQL foi comentado na migration "usar Laravel Scheduler", e `routes/console.php` não tem nenhum agendamento. O ranking nacional está permanentemente vazio/obsoleto em produção. |
| Reset de pontos semanais/mensais | **CRÍTICO** | `user_levels.weekly_points`/`monthly_points` acumulam sem reset — existe lógica de reset no `GamificationService` mas nenhum comando/agendamento a invoca. |
| `GET /admin/users` | Melhoria | `limit(200)` fixo sem paginação — não escala e o painel não consegue ver além dos 200 mais recentes. |
| DashboardService | Melhoria | ~20 queries `count()` independentes por chamada; candidato a cache curto (60s) ou a consolidação. |
| N+1 | OK | o estilo query-builder com joins explícitos evita N+1 na prática; sem lazy loading Eloquent relevante |
| Índices | OK | boa cobertura: índices dedicados por migration + FULLTEXT em documents + índices DESC em user_levels |
| Contadores denormalizados | OK | likes/views/replies mantidos por increment — evita agregações pesadas |
| Paginação | Melhoria | documents/quizzes/topics paginam; admin users e badges não |

---

# Módulo 12 — Swagger

Gerado por `darkaonline/l5-swagger`; `storage/api-docs/api-docs.json` contém **76 paths / 103 operações**.

| Controller | Operações anotadas | Estado |
| --- | --- | --- |
| CommunityController | 24 | ✅ Completo |
| DocumentController | 13 | ⚠️ Parcial (13 de ~21) |
| AuthController | 10 | ✅ Quase completo |
| QuizAdminController | 8 | ⚠️ Parcial |
| NotificationController | 5 | ✅ |
| AdminDocumentSubscriptionController | 3 | ⚠️ Parcial |
| ReportController | 3 | ⚠️ Parcial |
| AccessController | 3 | ⚠️ Parcial (3 de 8) |
| ProfileController | 1 | ❌ Quase nada |
| **AdminController** | **0** | ❌ Sem documentação (dashboard, users) |
| **BadgeController** | **0** | ❌ Sem documentação |
| **QuizController (público)** | **0** | ❌ Sem documentação |
| **LeaderboardController** | **0** | ❌ Sem documentação |
| **GamificationController** | **0** | ❌ |
| **UserController** | **0** | ❌ |
| HealthController | 0 | ❌ |

---

# Módulo 13 — Testes

**359 métodos de teste** (28 ficheiros Feature + 3 Unit). PHPUnit; sem testes de arquitetura (Pest Arch ou similar).

| Domínio | Feature | Unit | Lacunas |
| --- | --- | --- | --- |
| Auth | ✅ AuthenticationTest | — | rate limiting (não existe) |
| Access | ✅ AccessControlTest | ✅ AccessGateServiceTest | — |
| Documents | ✅ 3 ficheiros | — | store/update com media types |
| Subscriptions | ✅ 5 ficheiros (state machine, idempotência, admin) | — | ✅ melhor cobertura da plataforma |
| Quizzes | ✅ 6 ficheiros | — | — |
| Community | ✅ 2 + sprints | — | moderação admin de categorias |
| Gamification | ✅ 2 ficheiros | ✅ GamificationServiceTest | reset semanal/mensal (não implementado) |
| Leaderboard | ✅ LeaderboardTest | — | **refresh do cache nacional (o bug crítico não tem teste)** |
| Notifications | ✅ | ✅ NotificationServiceTest | — |
| Reports | ✅ | — | — |
| **AdminController (users)** | **❌ nenhum** | — | **CRUD admin de users sem qualquer teste** |
| Badges (admin CRUD) | ⚠️ indireto | — | CRUD dedicado |
| Integration/Architecture | ❌ | ❌ | inexistentes |

---

# Módulo 14 — Inventário das Entidades Administrativas (classificação)

## Categoria A — Gestão Administrativa Completa (obrigatória)

| Entidade | Estado atual |
| --- | --- |
| Users | ⚠️ falta criar, paginação, soft delete |
| Documents | ✅ quase completo (falta transições dedicadas + bulk) |
| Document Categories | ❌ **sem qualquer CRUD** |
| Quizzes (+ questions/options) | ✅ completo — referência |
| Community Categories | ⚠️ só criação |
| Discussion Topics / Replies | ⚠️ moderação via policy; falta pin/feature/lock admin |
| Badges | ✅ completo (falta Swagger) |
| Level Definitions | ❌ **nada existe** |
| Document Subscriptions | ✅ workflow completo |
| Access Levels | ❌ fixos por seed |
| Access Requests/Grants | ✅ workflow completo |
| Tags | ❌ só implícito |
| Settings / Feature Flags | ❌ **não existem** (nem tabela) |

## Categoria B — Administráveis Indiretamente (visualização/filtros, sem criação manual)

`quiz_attempts`, `quiz_attempt_answers`, `point_transactions`, `user_badges`, `user_levels`, `notifications`, `document_views/likes/downloads/citations`, `user_favorites`, `user_sessions`, `leaderboard_snapshots`, `content_reports` (workflow já existe). **Hoje nenhuma tem visualização admin dedicada** exceto reports.

## Categoria C — Técnicas (sem CRUD, correto como está)

`cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `verification_tokens`, `leaderboard_nacional_cache`, view `province_stats`.

## Categoria D — Entidades em Falta (propostas com justificação funcional)

| Entidade proposta | Justificação | Evidência no código |
| --- | --- | --- |
| **`provinces`** | Hoje hardcoded em [app/Support/AngolaProvinces.php](backend/app/Support/AngolaProvinces.php); usada na validação de perfis, no leaderboard provincial e na view `province_stats`. Tabela permite ativar/desativar/ordenar sem deploy. | `user_profiles.province` é string livre validada por constante |
| **`interest_areas`** (áreas de investigação) | `user_profiles.research_areas` é JSON de strings livres — sem catálogo, sem consistência, impossível de usar em recomendações. Tabela + pivot `user_interest_areas` normaliza. | coluna JSON em user_profiles |
| **`settings`** | O painel Angular já tem página de Configurações (mock). Sem tabela, toda a configuração fica hardcoded. | settings-page sem backend |
| Municípios | **NÃO proposta** — nenhum requisito ou referência no código a suporta. | — |
| Subscription plans | **NÃO proposta agora** — o modelo atual é subscrição por documento (decisão MVP sprint 15); planos só se surgir requisito de pagamento. | — |

---

# Módulo 15 — Matriz Administrativa Consolidada

| Domínio | CRUD | Painel | Stats | Pesquisa | Paginação | Export | Import | Bulk | Auditoria | Swagger | Testes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Users | ⚠️ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ |
| Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Document Categories | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quizzes | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Community | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Subscriptions | ✅ | ⚠️ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Access | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Badges | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| Levels | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Leaderboard | n/a | ❌ | ✅ | n/a | ✅ | ❌ | — | — | — | ❌ | ✅ |
| Notifications | ⚠️ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Moderation | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Settings | ❌ | ❌ | — | — | — | — | — | — | — | — | — |

**Resposta à pergunta central:** Sim, existem entidades importantes ainda não administráveis: **document_categories, level_definitions, access_levels, tags, community_categories (edição/remoção), settings** — mais as entidades de Categoria D (provinces, interest_areas).

---

# Módulo 16 — Consistência Backend ↔ Migrations

Verificações executadas com migrations como fonte única:

| Verificação | Resultado |
| --- | --- |
| Models sem tabela | Nenhum (ProvinceStat mapeia a VIEW — ok) ✅ |
| Tabelas sem model | 7 de domínio (ver Módulo 10) — coerente com o estilo DB::table, mas bloqueia policies/casts futuros |
| Campos usados no código inexistentes na BD | Nenhum encontrado ✅ |
| Colunas nunca usadas pelo backend | `community_categories.access_level_id` (deprecada de propósito); `documents.pdf_url` (legada de propósito); `level_definitions.perks` (nunca lida) |
| FKs ausentes | `point_transactions.reference_id` e `notifications.reference_id` são polimórficas sem FK (aceitável); `leaderboard_snapshots.province` string livre |
| Inconsistência de tipos | `quiz_documents.quiz_id/document_id` são `string(255)` referenciando PKs `uuid/char(36)` — funciona mas viola a convenção; normalizar em sprint futura |
| Seeders | 8 seeders coerentes com o schema ✅ |
| Triggers/procedures fora do Laravel | 2 triggers (`user_access_grants.is_active`) + 1 procedure (`sp_refresh_leaderboard_nacional`) + 1 view — lógica invisível ao ORM; documentar como dependência MySQL (testes SQLite não a exercitam) |
| Scheduler | **Vazio** — nenhuma tarefa agendada apesar de o sistema depender de: refresh do leaderboard, reset weekly/monthly points, snapshots diários |

---

# Roadmap Proposto da Fase 18

A ordem reflete dependências reais: primeiro corrigir fundações (segurança, jobs agendados, contrato de rotas), depois expor entidades de configuração (das quais os outros domínios dependem), e só então completar os módulos de gestão.

| Sprint | Âmbito | Justificação de dependência |
| --- | --- | --- |
| **18.1 — Fundações** | Rate limiting no auth; Laravel Scheduler (refresh leaderboard, reset weekly/monthly, snapshot diário); remover grupo `v1/admin` duplicado e verbos POST redundantes; decidir destino do `frontend-painel` React | Bugs críticos e contrato de API — bloqueiam tudo o resto |
| **18.2 — Configuração da Plataforma** | Tabela + CRUD `settings`; CRUD `level_definitions`; CRUD `access_levels` (ou decisão explícita de mantê-los fixos); criar `provinces` e `interest_areas` (Categoria D) | Users/Documents/Gamification dependem destes catálogos |
| **18.3 — Users** | Paginação real em `/admin/users`; criação de user pelo admin; endpoints dedicados block/unblock; soft delete + `deleted_by`; visualização de sessões; testes do AdminController (hoje zero) | Base de todos os outros módulos |
| **18.4 — Categorias & Tags** | CRUD completo `document_categories` (hierarquia + requires_subscription); CRUD `community_categories` (update/delete/toggle); gestão de `tags` | Documents e Community dependem |
| **18.5 — Documents** | Transições dedicadas publish/archive com `published_by`/`archived_by` (alinhar com padrão Quizzes); bulk publish/archive; export | Depende de 18.4 |
| **18.6 — Community** | Endpoints admin pin/feature/lock de tópicos; moderação em massa (spam); split do CommunityController | Depende de 18.4 |
| **18.7 — Gamificação** | Visualização admin de `point_transactions`/`user_levels`; atribuição manual de badge; recalcular pontos; stats de distribuição | Depende de 18.2 (levels) |
| **18.8 — Subscriptions & Access** | Página dedicada de subscrições no painel; pesquisa/filtros; histórico | Endpoints já existem — só painel/refino |
| **18.9 — Logs & Observabilidade** | Página de auditoria (Categoria B: attempts, sessions, views, transactions); atividade administrativa | Depende dos dados dos módulos anteriores |
| **18.10 — Swagger & Qualidade** | Documentar os 7 controllers sem anotações; completar parciais; testes de arquitetura | Transversal — fecha a fase |
| **18.11 — Cobertura Total** | Verificação final contra esta matriz; export/import onde fizer sentido | Critério de saída da Fase 18 |

---

# Critérios de Aceitação da Sprint 18.0 — Verificação

- ✅ Todas as 27 migrations auditadas (41 tabelas + view + triggers + procedure)
- ✅ Todas as tabelas classificadas (Módulos 1 e 14)
- ✅ Recursos administráveis identificados e classificados em A/B/C/D
- ✅ Lacunas de CRUD, endpoints, Swagger e painel documentadas (Módulos 3–5, 12)
- ✅ Scripts SQL antigos explicitamente ignorados como fonte de verdade
- ✅ Documento mestre produzido (este ficheiro)

## Top 5 de achados que exigem ação imediata (18.1)

1. **Leaderboard nacional nunca é refrescado** — procedure existe, nada a invoca.
2. **Pontos semanais/mensais nunca são resetados** — scheduler vazio.
3. **Sem rate limiting** em login/registo/recuperação de password.
4. **Grupo de rotas `v1/admin` duplicado** (22 registos) sem consumidores.
5. **`GET /admin/users` sem paginação** (limit 200 fixo) e sem testes.
