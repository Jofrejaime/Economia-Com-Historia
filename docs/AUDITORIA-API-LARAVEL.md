# Auditoria técnica — API Laravel «Economia com História»

**Data da análise:** 4 de junho de 2026  
**Âmbito:** apenas backend (`backend/`), sem avaliação de frontend ou UX  
**Objetivo:** lacunas entre «o que o sistema deve fazer» e «o que a API faz hoje»

---

## Fontes analisadas

| Prioridade | Fonte | Estado |
|------------|-------|--------|
| 1 | `docs/requisitos/funcionais.md` | **Vazio** (só título) |
| 2 | `docs/requisitos/regras-de-negocio.md` | **Vazio** (só título) |
| 3 | `database/scripts/Economia_Com_Historia_MySQL.sql` | Completo |
| 4 | Código Laravel (`backend/`) | Completo |

Também usados como proxy: `docs/api/*.md`, `docs/VISAO-GERAL-PROJETO.md`, testes Feature.

> Os ficheiros `.docx` em `docs/requisitos/` não foram lidos. Para validação literal de RF/RNF, exportar para Markdown.

---

## Limitação das fontes de requisitos

Os ficheiros indicados como referência máxima estão **vazios** (apenas títulos):

- `docs/requisitos/funcionais.md`
- `docs/requisitos/nao-funcionais.md`
- `docs/requisitos/regras-de-negocio.md`

Para requisitos e regras de negócio, a auditoria baseou-se em:

1. **CHECK constraints, triggers, procedures e VIEW** em `database/scripts/Economia_Com_Historia_MySQL.sql`
2. **Documentação API** em `docs/api/*.md`
3. **Rotas e controladores** em `backend/routes/api.php` e `backend/app/Http/Controllers/Api/`
4. **Testes Feature** existentes (auth, profile, access)

---

## Mapa da API existente

**~68 rotas HTTP** em `backend/routes/api.php` (excl. `/up` do Laravel):

| Módulo | Rotas | Middleware |
|--------|-------|------------|
| Health | `GET /health` | Público |
| Auth | 7 públicas + logout + `/me` | `AuthenticateApiSession` |
| Profile | 4 | Autenticado |
| Access | 7 | Autenticado; review/revoke `role:admin` |
| Documents | 11 leitura/interação + 3 CRUD | CRUD `role:admin,professor` |
| Quiz | 8 | CRUD admin/professor; resto autenticado |
| Community | ~18 | `storeCategory` admin; writes sem role extra |
| Leaderboard | 4 | Autenticado |
| Notifications | 5 | send/invite `role:admin` |
| Reports | 5 | update/action `role:admin` |

**Padrão arquitetural:**

- Quase tudo via `DB::table()` nos controladores
- **1** model Eloquent (`User`)
- **0** `FormRequest`, **0** `Resource`, **0** `Services`

---

## 1. Estado atual da API (percentuais estimados)

Estimativa de **cobertura funcional MVP** (rotas implementadas + regras da BD + testes):

| Área | % | Comentário |
|------|---|------------|
| **Auth** | **~85%** | Registo, login, refresh, logout, forgot/reset, verify/resend; falta envio real de e-mail de verificação e gestão de sessões |
| **Users / Profile** | **~75%** | Perfil, avatar, password; sem CRUD admin de utilizadores nem desativação de conta |
| **Access** | **~80%** | Níveis, pedidos, grants, review, revoke; falta listagem admin global e notificações automáticas |
| **Levels** | **~25%** | Só leitura em `GET /me`; sem subida de nível nem CRUD de definições |
| **Points** | **~10%** | Tabela + seed; sem API nem atribuição automática |
| **Badges** | **~20%** | Leitura em `/me` + seeder; sem concessão automática |
| **Documents** | **~85%** | CRUD + search + interações; falta categorias, enforcement de acesso e pontos |
| **Quiz** | **~40%** | Listagem, detalhe, perguntas, iniciar tentativa; CRUD e conclusão em **501** |
| **Community** | **~35%** | Leitura OK; **todas as escritas e interações em 501** |
| **Leaderboard** | **~65%** | Nacional, snapshots, stats província OK; provincial **501** |
| **Notifications** | **~75%** | Inbox, marcar lidas, enviar, invite; tipos e ownership frágeis |
| **Reports** | **~30%** | Listagem própria; criar e moderar **501** |

**Média ponderada (MVP global da API): ~55–60%**

> `docs/VISAO-GERAL-PROJETO.md` declara backend «100%» — **não corresponde** ao código (23 métodos devolvem HTTP 501).

---

## 2. Funcionalidades concluídas

### Authentication

- `POST /auth/register` — user + profile + `user_levels`, token, token de verificação (JSON)
- `POST /auth/login` — credenciais, `last_login_at`, token
- `POST /auth/refresh` — rotação de token em `user_sessions`
- `POST /auth/logout` — revoga sessão atual
- `POST /auth/forgot-password` / `reset-password` — tokens + e-mail (`PasswordResetMail`)
- `POST /auth/verify-email` / `resend-verification` — lógica de token (sem envio de e-mail)
- `GET /me` — user, profile, access_grants, user_level, level_definition, badges
- Middleware `AuthenticateApiSession` (Bearer / `X-Session-Token`, `is_active`)

### User / Profile

- `GET/PUT /profile`, `POST /profile/avatar`, `PUT /profile/password`
- Validações alinhadas à BD (províncias, bio, research_areas, password forte)

### Access control

- `GET /access-levels`
- `GET/POST /access-requests`, `GET /access-requests/{id}`
- `PATCH /access-requests/{id}` (admin) — aprovar/rejeitar + grant transacional
- `GET /access-grants`, `POST /access-grants/{id}/revoke` (admin)
- Auto-grant para nível `public`

### Documents

- `GET /documents`, `/documents/search`, `/documents/{id}` (tags, views, liked/favorited)
- `POST/PATCH/DELETE /documents` (admin/professor)
- Like/unlike, download, favorite/unfavorite, citation

### Quiz (parcial)

- `GET /quizzes`, `/quizzes/{id}`, `/quizzes/{id}/questions`
- `POST /quizzes/{id}/attempts`, `GET /quiz-attempts/{id}`, `GET /me/quiz-attempts`

### Community (leitura)

- `GET /community/categories`, `/topics`, `/topics/{id}`, `/topics/{id}/replies`

### Leaderboard (parcial)

- `GET /leaderboard/national`, `/leaderboard/snapshots`, `/stats/provinces`

### Notifications

- `GET /notifications`, marcar lida(s), apagar, `POST /notifications/send`, `/notifications/invite`

### Infraestrutura

- Migrations para todas as tabelas de domínio do script SQL
- Seeders: `LevelDefinitions`, `User`, `Badges`, `Document`, `Quiz`, `Community`
- Middleware `EnsureRole`
- Testes: `AuthenticationTest`, `ProfileTest`, `AccessControlTest`

---

## 3. Funcionalidades incompletas (parciais)

| Área | O que existe | O que falta |
|------|----------------|-------------|
| **Auth** | Tokens em `verification_tokens` | E-mail de verificação no registo/resend; obrigar `email_verified` no login; listar/revogar sessões |
| **Access** | Fluxo user + admin review | `GET /access-requests` só do user; admin sem fila global; `showRequest` sem ownership; notificações grant/reject |
| **Documents** | CRUD e interações | Filtrar por grant no `show`/download; `document_categories`; status `flagged` na BD; pontos |
| **Quiz** | Leitura + `startAttempt` | `questions` sem `quiz_options`; `answerAttempt`, `completeAttempt`; pontos/badges; acesso por `access_level_id` |
| **Community** | Listagens | Filtros, paginação, joins autor, `views_count` |
| **Leaderboard** | Leitura cache | Popular cache (`sp_refresh_leaderboard_nacional`); ranking provincial |
| **Notifications** | CRUD básico | Ownership em mark/delete; tipo `content_notification` vs CHECK SQL |
| **Reports** | `index`/`show` reporter | `store`, `update`, `action` |
| **Gamificação** | Dados em `/me` | `point_transactions`, level-up, `user_badges` automáticos |
| **Testes** | 3 suites | Sem documents, quiz, community, etc. |

---

## 4. Funcionalidades ausentes

- Gestão de utilizadores (admin): listar, editar role, `is_active`
- API de gamificação dedicada (`level_definitions`, `point_transactions`, award badges)
- `GET /document-categories`
- `category_members` (join/leave)
- Listagem global de favoritos (`user_favorites`)
- Refresh manual do leaderboard (procedure/event só na BD)
- Dashboard / KPIs admin
- Settings globais
- Desativação de conta (`is_active` sem endpoint)
- Convites com `verification_tokens.type = invite`

---

## 5. Tabelas sem cobertura de API

Legenda: ✅ completo · 🟡 parcial · 🔴 ausente

| Tabela | Migration | Model | Seeder | Controller | Endpoint |
|--------|-----------|-------|--------|------------|----------|
| `users` | ✅ | ✅ | ✅ | Auth, Profile | 🟡 |
| `user_profiles` | ✅ | 🔴 | ✅ | Profile, Auth | ✅ |
| `user_sessions` | ✅ | 🔴 | — | Auth (interno) | 🟡 |
| `verification_tokens` | ✅ | 🔴 | — | Auth (interno) | 🟡 |
| `level_definitions` | ✅ | 🔴 | ✅ | — | 🔴 |
| `user_levels` | ✅ | 🔴 | ✅ | Auth | 🟡 |
| `point_transactions` | ✅ | 🔴 | — | — | 🔴 |
| `badges` | ✅ | 🔴 | ✅ | — | 🔴 |
| `user_badges` | ✅ | 🔴 | — | — | 🔴 |
| `access_levels` | ✅ | 🔴 | ✅ | Access | ✅ |
| `user_access_requests` | ✅ | 🔴 | — | Access | 🟡 |
| `user_access_grants` | ✅ | 🔴 | — | Access | 🟡 |
| `document_categories` | ✅ | 🔴 | ✅ | — | 🔴 |
| `documents` | ✅ | 🔴 | ✅ | Document | ✅ |
| `tags` / `document_tags` | ✅ | 🔴 | ✅ | Document | 🟡 |
| `document_likes` | ✅ | 🔴 | — | Document | ✅ |
| `document_downloads` | ✅ | 🔴 | — | Document | ✅ |
| `document_views` | ✅ | 🔴 | — | Document | 🟡 |
| `user_favorites` | ✅ | 🔴 | — | Document | 🟡 |
| `document_citations` | ✅ | 🔴 | — | Document | ✅ |
| `quizzes` | ✅ | 🔴 | ✅ | Quiz | 🟡 |
| `quiz_questions` | ✅ | 🔴 | ✅ | Quiz | 🟡 |
| `quiz_options` | ✅ | 🔴 | ✅ | — | 🔴 |
| `quiz_attempts` | ✅ | 🔴 | — | Quiz | 🟡 |
| `quiz_attempt_answers` | ✅ | 🔴 | — | — | 🔴 |
| `community_categories` | ✅ | 🔴 | ✅ | Community | 🟡 |
| `discussion_topics` | ✅ | 🔴 | ✅ | Community | 🟡 |
| `topic_replies` | ✅ | 🔴 | ✅ | Community | 🟡 |
| `topic_likes` | ✅ | 🔴 | — | Community | 🔴 (501) |
| `reply_likes` | ✅ | 🔴 | — | Community | 🔴 (501) |
| `topic_followers` | ✅ | 🔴 | — | Community | 🔴 (501) |
| `category_members` | ✅ | 🔴 | — | — | 🔴 |
| `leaderboard_snapshots` | ✅ | 🔴 | — | Leaderboard | 🟡 |
| `leaderboard_nacional_cache` | ✅ | 🔴 | — | Leaderboard | 🟡 |
| `province_stats` (VIEW) | ✅ | — | — | Leaderboard | ✅ |
| `notifications` | ✅ | 🔴 | — | Notification | 🟡 |
| `content_reports` | ✅ | 🔴 | — | Report | 🟡 |

**Factories:** apenas `UserFactory`.

---

## 6. Controllers incompletos

| Controller | Métodos 501 / stub | Observações |
|------------|-------------------|-------------|
| `CommunityController` | **14/17** escritas/interações | Só leitura funcional |
| `QuizController` | `store`, `update`, `destroy`, `answerAttempt`, `completeAttempt` | Fluxo MVP bloqueado |
| `ReportController` | `store`, `update`, `action` | Moderação inexistente |
| `LeaderboardController` | `provincial` | Cache pode estar vazio |
| `AccessController` | — | Falta listagem admin global |

---

## 7. Services faltantes

| Service sugerido | Responsabilidade |
|------------------|------------------|
| `GamificationService` | Pontos, level-up, badges, `point_transactions` |
| `AccessGateService` | `user_access_grants` vs `access_level_id` |
| `QuizAttemptService` | Responder, corrigir, completar, `user_levels` |
| `CommunityInteractionService` | Likes, follows, replies, contadores |
| `LeaderboardService` | Refresh de cache / snapshots |
| `NotificationService` | Tipos válidos, ownership, templates |
| `ReportModerationService` | Denúncias e workflow admin |
| `SessionService` | Listar/revogar sessões |

---

## 8. Rotas faltantes

Não declaradas em `api.php`:

```
GET    /document-categories
GET    /me/favorites
GET    /me/point-transactions
GET    /level-definitions
GET    /admin/users
PATCH  /admin/users/{id}
GET    /admin/access-requests          (todos pending)
POST   /leaderboard/refresh
GET    /community/categories/{id}/members
POST   /community/categories/{id}/join
DELETE /community/categories/{id}/leave
```

Rotas **declaradas mas 501:** Community (escrita), Quiz (conclusão + CRUD), Reports (criação/moderação).

---

## 9. Inconsistências

### Com a base de dados

| Tema | Script SQL | Código Laravel |
|------|------------|----------------|
| Token verificação | `email_verify` | `email_verification` |
| Tipos notificação | CHECK lista fechada | `content_notification` |
| Status documento | inclui `flagged` | só `draft,published,archived` |
| Enforcement acesso | grants + `access_level_id` | não verificado em show/download |
| Leaderboard | procedure + EVENT | sem job Artisan |
| `quiz_options` | tabela central | não em `questions()` |

### Com documentação

| Documento | Afirmação | Realidade |
|-----------|-----------|-----------|
| `docs/api/README.md` | Production Ready | ~23 endpoints 501 |
| `VISAO-GERAL` | Backend 100% | Community/Quiz/Reports stubs |
| `funcionais.md` | — | Vazio |

### Segurança

- `showRequest`, notifications mark/delete, reports `show`: ownership fraco
- Login não exige `email_verified`
- Conteúdo `jindungo`/`restricted` visível sem grant
- Registo aceita `role: admin` no payload

---

## 10. Pendências para MVP

### Críticas

1. Implementar Community (14× 501)
2. Quiz `answerAttempt` + `completeAttempt` + options + gamificação
3. Reports `store` + fila admin + `action`
4. Access gate em documents/quizzes/categories
5. `GET /admin/access-requests` (todos)
6. Alinhar tipos tokens e notificações com SQL

### Importantes

7. Quiz CRUD admin  
8. `GET /document-categories`  
9. Leaderboard provincial + popular cache  
10. E-mails de verificação  
11. `GamificationService`  
12. Testes Feature por módulo  
13. FormRequests + ownership  

### Futuras

14. CRUD admin utilizadores  
15. `category_members`  
16. Dashboard KPIs  
17. Settings globais  
18. Rate limiting / 2FA  
19. Models Eloquent + Resources  

---

## 11. Plano de execução (roadmap MVP)

| Passo | Conteúdo | Estimativa |
|-------|----------|------------|
| **1** | Exportar RF/RNF; corrigir tipos; `AccessGateService` | 1–2 dias |
| **2** | Access admin + ownership + notificações | 1 dia |
| **3** | Documents: categorias + enforcement + testes | 1 dia |
| **4** | Quiz fluxo completo + gamificação | 2–3 dias |
| **5** | Community (todos os 501) | 2–3 dias |
| **6** | Reports e moderação | 1–2 dias |
| **7** | Gamificação transversal | 1–2 dias |
| **8** | Leaderboard refresh + provincial | 1 dia |
| **9** | Notifications + Auth polish | 1 dia |
| **10** | FormRequests, Resources, testes, docs API | 1–2 dias |

**Total estimado:** ~12–18 dias (1 dev).

---

## Resumo executivo

A API tem **fundação sólida** em autenticação, perfil, controlo de acesso e **documentos quase completos**. O gap MVP concentra-se em **comunidade (escrita)**, **conclusão de quizzes**, **denúncias**, **enforcement de acesso** e **pontos/badges automáticos**. Existem **23 endpoints** com resposta `501 Endpoint ready.`

Os requisitos em Markdown estão vazios — validar contra os DOCX ou preencher `funcionais.md` antes de fechar o MVP formalmente.

---

*Documento gerado por auditoria de código. Não altera o repositório de aplicação.*
