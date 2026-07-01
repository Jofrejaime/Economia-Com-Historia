# Auditoria Técnica — Backend (Análise Arquitetural Profunda)

**Data:** 2026-07-01
**Tipo:** Auditoria de leitura — nenhum ficheiro de código foi alterado durante esta análise.
**Escopo:** Backend Laravel completo (`backend/app`, `backend/routes`, `backend/database/migrations`, `backend/tests`). Frontend fora de escopo.

Este relatório é complementar ao `docs/API_AUDIT_2026-07.md` (achados ao nível de endpoint/contrato de API). Aqui o foco é **arquitetural**: responsabilidades, acoplamento, contratos legados, integridade do fluxo de aprendizagem e maturidade por domínio. Alguns achados do relatório anterior são referenciados (não repetidos) onde relevante.

---

## 1. Arquitetura — consistência geral

**Padrão dominante:** Controller fino → Service com regra de negócio → `DB::table()` (query builder puro na maior parte da escrita) ou Eloquent (na maior parte da leitura/relacionamentos). Isto é seguido de forma bastante consistente em `DocumentSubscriptionService`, `QuizAttemptService`, `CommunityAuthorizationService`, `AccessGateService`, `GamificationService`.

### Responsabilidades duplicadas encontradas

| Duplicação | Onde | Detalhe |
|---|---|---|
| Autorização de criação de documento | `StoreDocumentRequest::authorize()` **e** `routes/api.php` (`role:admin,professor`) **e** `DocumentPolicy::create()` | Três mecanismos verificam a mesma regra (`role in [admin, professor]`), mas só os dois primeiros são efetivamente exercitados — `DocumentPolicy` nunca é chamado (ver secção 17). |
| Verificação de acesso a documento | `DocumentAccessService::canReadDocument()` **e** `AccessGateService::canAccessDocument()` | Duas implementações paralelas do "pode este utilizador ler este documento?". `DocumentController` usa exclusivamente `DocumentAccessService` (o serviço "novo", ciente de subscrições). `AccessGateService::canAccessDocument()` só é chamado a partir de `DocumentPolicy::view()` — que, por sua vez, nunca é invocado (secção 17). Ou seja, existe uma segunda implementação de autorização de documentos, mais simples e **sem suporte a subscrições**, que ninguém chama em produção mas que continua a existir e podia ser chamada por engano no futuro (ex.: um novo endpoint que use `$this->authorize('view', $document)` ativaria silenciosamente a lógica antiga, sem subscrições). |
| Autorização de tópicos de comunidade | `CommunityAuthorizationService` **e** `DiscussionTopicPolicy` (wrapper 1:1 sobre o serviço) | Ver secção 17 — o Policy nunca é invocado, apenas o Service é chamado diretamente pelo Controller. |

### Services que fazem mais do que deveriam

- **`GamificationService`** (466 linhas) acumula: gestão de pontos (`awardPoints`/`deductPoints`/`applyPointsChange`), gestão de nível (`calculateLevel`/`updateLevel`), avaliação de badges (`evaluateBadges`/`badgeCriteriaMet`), pipeline de conclusão de quiz (`recordQuizCompletion`, com cálculo de bónus de precisão/velocidade embutido), e histórico (`pointTransactionHistory`/`reconcileUserPoints`). São pelo menos **três responsabilidades** (pontos, níveis, badges) mais uma **lógica de negócio de domínio alheio** (as regras de bónus de quiz — precisão ≥80%, velocidade <50% do tempo limite — deviam estar em `QuizAttemptService` ou num `QuizScoringService` dedicado, não no serviço de gamificação genérico). Isto viola SRP e acopla Gamificação a detalhes específicos de Quiz.
- **`AccessController`** (558 linhas) e **`AuthController`** (894 linhas) são os maiores ficheiros de Controller depois de `CommunityController` (1579) e `DocumentController` (1152) — ver secção 9 para detalhe.

### Controllers com lógica de negócio (deviam estar em Services)

- `DocumentController::generateCitation()` (privado, gera o texto formatado da citação APA/MLA/Chicago/ABNT diretamente no controller) — lógica de formatação de domínio que deveria estar num `CitationFormatterService` ou similar.
- `DocumentController::store()`/`update()` fazem gestão de tags inline (procurar/criar/associar) diretamente com `DB::table()`, em vez de delegar a um `TagService`.
- `QuizController::store()`/`update()` contêm ~150 linhas de lógica de sincronização de perguntas/opções (diff manual via `whereNotIn`/`updateOrInsert`) diretamente no controller — candidato natural a um `QuizCompositionService`.

### Dependências circulares

Não foram encontradas dependências circulares entre Services (o grafo de injeção é: `GamificationService → NotificationService`; `QuizAttemptService → AccessGateService, GamificationService`; `DocumentController → DocumentAccessService, DocumentSubscriptionService, GamificationService, QuizDocumentService`; `DashboardService → DocumentStatisticsService, SubscriptionStatisticsService, CategoryStatisticsService`). O grafo é acíclico.

### Domínios acoplados

- **Community → Gamificação**: `CommunityController` chama `$this->gamification->awardPoints(...)` e `incrementCounters(...)` diretamente, em vez de emitir eventos de domínio (`TopicCreated`, `ReplyPosted`) que a Gamificação escutaria. Funciona, mas acopla o controller de Community aos detalhes de nomes de razão (`'topic_created'`, `'reply_posted'`) e valores de pontos (20, 10, 50) hard-coded no controller em vez de centralizados (comparar com `PointTransactionReason`, que já existe como enum de razões mas não centraliza os valores/pontos de cada razão).
- **Quiz → Documentos**: acoplamento via tabela pivot `quiz_documents`, correto e intencional (é a relação de domínio "fluxo de aprendizagem"), mas ver secção 3/11 sobre a inconsistência de tipo.

---

## 2. Contratos legados

| Item | Onde | Porque ainda existe | Necessário? | Impacto da remoção |
|---|---|---|---|---|
| `documents.pdf_url` | Coluna + `$fillable` em `Document.php` + campo em `DocumentResource` | Substituído por `media_type`/`media_url` na Sprint 14.3; mantido "para compatibilidade com registos existentes" (comentário na migration) | Só se existirem clientes/frontends antigos a ler `pdf_url` | Baixo — pode ser removido após confirmar que todos os frontends migraram para `media_url`; até lá, é duplicação de dado (mesmo PDF acessível por dois campos) |
| `documents.unique_id`, `physical_location`, `record_type` | Colunas na tabela `documents` | Nunca removidas da migration original; **confirmado dead**: não aparecem em `StoreDocumentRequest`/`UpdateDocumentRequest` (nunca escritas) nem em `DocumentResource` (nunca lidas) — o próprio docblock do Resource admite "Dead fields... intentionally excluded" | Não | Nenhum — são colunas mortas, seguras para remover numa migration futura |
| `documents.reviewed_by` | Coluna + fillable | Escrita em `DocumentController::update()` ao publicar, mas nunca lida/exposta em `DocumentResource` | Parcial — é escrita mas não lida pela API | Se a intenção é auditoria interna, considerar expor pelo menos para admins, ou documentar que é só para uso interno/BI |
| `discussion_topics.visibility = 'RESTRICTED'`/`'PRIVATE'` | Valores antigos, renomeados para `CATEGORY`/`INVITE_ONLY` na migration `sprint13_rename_topic_visibility_values` | Migration de dados já correu; **confirmado que nenhum código atual usa os valores antigos** (grep negativo em `app/`) | Não | Nenhum — a migração de dados já foi feita, os valores antigos não existem mais na BD nem no código |
| `community_categories.access_level_id` | Coluna, agora nullable | Mantida "por compatibilidade retroativa" desde a Sprint 13, mas a arquitetura documentada diz para ser ignorada | Não — **ainda estava a ser usada indevidamente** em `CommunityController::storeTopic()` até este turno (ver correção aplicada). Após a correção, a coluna já não é lida por nenhum código. | Segura para remover numa migration futura; hoje é 100% vestigial |
| `content_reports.status = 'resolved'` | Referenciado em `DashboardService::buildRecentActivity`/`summary` | Nunca foi um valor de facto usado — os valores reais são `pending/reviewed/dismissed/actioned` (ver `ReportController::update()`) | Não | É um contrato que nunca existiu de facto — corrigir a métrica do dashboard (ver secção 7) |
| `documents.status = 'flagged'` / `discussion_topics.status = 'flagged'` | Escrito por `ReportModerationService::flagContent()` | Introduzido para a moderação, mas nunca adicionado ao enum `DocumentStatus` nem às regras de validação de `status` em `CommunityController` | **Sim, a funcionalidade é necessária**, mas o valor não está oficialmente contratado em lado nenhum | Sem correção, qualquer código que valide `status` contra o enum/lista oficial vai rejeitar ou ignorar documentos/tópicos sinalizados — ver Crítico na secção 7/16 |
| Rotas antigas | — | Não foram encontradas rotas mortas em `routes/api.php` — todas as 90+ rotas têm método de controller correspondente | — | — |
| `AuthController`/docs antigos mencionam "JWT" | `docs/API_AUDIT.md` e outros | O mecanismo real (`AuthenticateApiSession`) é um **token opaco de sessão** validado por lookup em `user_sessions`, não um JWT verificável sem BD | Terminologia desatualizada nos docs antigos | Já assinalado no relatório anterior (ficheiros antigos mantidos só como histórico) |

---

## 3. Documentos — auditoria completa do domínio

**Ficheiros:** `Document`, `DocumentCategory`, `DocumentSubscription`, `DocumentAccessService`, `DocumentSubscriptionService`.

- **`requires_subscription` é de facto a única origem da regra de subscrição** — confirmado: `DocumentAccessService::canReadDocument()` só invoca `DocumentSubscriptionService` quando `$category->requires_subscription` é verdadeiro; não há nenhum outro sítio no código que decida "este documento precisa de subscrição" de forma independente. Isto é uma boa notícia — fonte única da verdade, bem aplicada.
- **Regra legada em paralelo:** quando `requires_subscription` é falso (o "normal"), o acesso cai para a lógica antiga baseada em `access_level_id`/`AccessGateService`. Isto significa que o domínio Documentos tem **dois sistemas de autorização coexistentes** (subscrição vs. access-level/grants), que se combinam com um `if/else`, não uma composição clara. Funciona, mas é uma arquitetura em transição, não uma decisão final — vale a pena decidir explicitamente se `access_level_id` vai desaparecer a favor de subscrições em todas as categorias, ou se ambos os modelos vão coexistir permanentemente (e nesse caso, documentar a regra de precedência mais explicitamente do que um comentário no código).
- **Duplicação de queries:** `index()`, `search()` e `myFavorites()` em `DocumentController` repetem literalmente o mesmo bloco de 15 linhas de `SELECT`/`JOIN` (mesmas colunas, mesmos joins a `document_categories`, `access_levels`, `user_profiles`) três vezes. Isto é uma violação clara de DRY — devia ser um método privado `baseDocumentQuery()` ou um Query Builder/Scope reutilizável no Model `Document`.
- **Validações duplicadas:** `StoreDocumentRequest` e `UpdateDocumentRequest` repetem as mesmas regras (`document_type`, `academic_level`, `media_type` in-lists) em vez de partilhar uma constante/trait comum — se um valor de enum mudar, é preciso lembrar de atualizar os dois ficheiros.
- **Estados inconsistentes confirmados:**
  1. `status = 'flagged'` (ver secção 2) não está no enum `DocumentStatus` — um documento sinalizado por moderação fica num estado que a própria aplicação não reconhece oficialmente.
  2. `published_at` pode ficar preenchido mesmo que o documento seja re-editado de volta para `draft` (o código só define `published_at` na transição draft→published, nunca o limpa se o status regressar a draft) — um documento em rascunho pode ter `published_at` não-nulo, o que é logicamente contraditório.

---

## 4. Community — desacoplamento de categorias

Confirmado (após leitura de `CommunityAuthorizationService`, `CommunityController`, migrations `sprint13_rename_topic_visibility_values`):

- ✅ Categorias servem apenas para organização (`sort_order`, `name`, agrupamento visual).
- ✅ `access_level_id` **não participa em nenhuma regra de autorização de leitura/resposta/moderação** — confirmado por grep completo em `app/`, a única leitura de `community_categories.access_level_id` que restava era em `CommunityController::storeTopic()`, **já removida nesta sessão** (ver correção aplicada ao ficheiro).
- ✅ `AccessGateService` não interfere na autorização de Community — `CommunityAuthorizationService` é autossuficiente e não injeta/chama `AccessGateService` em lado nenhum.
- 🔴 **Achado crítico (novo, não estava no relatório anterior de contrato de API):** apesar do desacoplamento estar correto a nível de _leitura_ de `access_level_id`, o modelo de visibilidade `CATEGORY` (o valor por omissão) depende de `category_members`, tabela para a qual **não existe nenhum endpoint de escrita** em toda a API. Isto está detalhado no `docs/API_AUDIT_2026-07.md` (achado C1) — repetido aqui porque é também uma inconsistência arquitetural: a arquitetura *documentada* (comentário em `CommunityAuthorizationService.php:19-22`) descreve 3 modos de visibilidade plenamente funcionais, mas só 2 (`PUBLIC`, `INVITE_ONLY`) são de facto alcançáveis por um utilizador normal.

---

## 5. Quizzes — auditoria completa

**Ficheiros:** `Quiz`, `QuizAttempt` (tabela, sem Model Eloquent dedicado — ver nota abaixo), `Leaderboard`, `Gamification`.

- **Nota de nomenclatura:** não existe um Model `QuizAttempt` nem `QuizResult` (mencionados no pedido de auditoria) — a tabela `quiz_attempts` é manipulada inteiramente via `DB::table()` em `QuizAttemptService`, sem um Model Eloquent correspondente. Isto é consistente com o padrão do resto do domínio de tentativas/respostas (também sem Models: `quiz_attempt_answers` idem), mas é uma assimetria notável face a `Quiz`/`QuizDocument`, que têm Models Eloquent completos. Não é um bug, mas dificulta reutilização (ex.: não há `$attempt->answers`, `$attempt->quiz` como relações Eloquent — tudo é reconstruído manualmente com queries a cada chamada).
- ✅ **Quiz pode existir sem documento** — confirmado, `quiz_documents` é uma tabela pivot opcional, nenhuma constraint obriga um quiz a ter documentos associados.
- ✅ **Quiz pode possuir vários documentos** e **documento pode possuir vários quizzes** — confirmado via `Quiz::documents()` e `Document::quizzes()`, ambos `belongsToMany` corretos sobre `quiz_documents`.
- 🟠 **Inconsistência de tipo já identificada:** `quiz_documents.quiz_id`/`document_id` são `VARCHAR(255)` em vez de `CHAR(36)` como todo o resto do schema (ver `docs/API_AUDIT_2026-07.md`, achado M4).
- 🔴 **Achado novo:** `QuizAttemptService::startAttempt()` bloqueia corretamente tentativas em quizzes não publicados (`status !== 'published'`) para não-autores/não-admins — mas `QuizController::show()` e `questions()` (endpoints de leitura) **não replicam esta verificação** (só verificam `access_level_id`, nunca `status`). Ou seja, a ação que efetivamente importa (começar a tentativa) está protegida, mas o conteúdo do quiz em rascunho pode ser lido antes de publicado — inconsistência entre a proteção de escrita e a proteção de leitura no mesmo domínio.
- 🟠 **Nenhuma validação de que cada pergunta tem pelo menos uma opção correta** (`QuizController::store`/`update`) — ver relatório anterior, achado A4.
- 🟠 **`quizzes.published_at` nunca é escrito** por `QuizController` (ver relatório anterior, achado A5) — quebra qualquer ordenação por data de publicação.

---

## 6. Fluxo de Aprendizagem — Categoria → Documento → Quiz → Tentativa → Resultado → Leaderboard → Gamificação

Percorrendo o fluxo passo a passo com base no código lido:

1. **Categoria → Documento:** ✅ funcional. `DocumentCategory` → `Document` via `category_id`; `requires_subscription` gate corretamente aplicado.
2. **Documento → Quiz:** ✅ funcional. Pivot `quiz_documents`, `QuizDocumentService` bem implementado (paginação, ordenação configurável, `attachDocuments`/`syncDocuments`/`detachDocument` transacional).
3. **Quiz → Tentativa:** ✅ funcional, com uma ressalva já assinalada (draft quiz legível mas não iniciável).
4. **Tentativa → Resultado:** ✅ funcional. `QuizAttemptService::completeAttempt()` calcula `score`, `correct_answers`, `performance_rating`, atualiza `quizzes.avg_score`/`completions_count`, e invoca `GamificationService::recordQuizCompletion()` dentro da mesma transação.
5. **Resultado → Leaderboard:** 🔴 **PONTO QUEBRADO — o mais grave encontrado em toda a auditoria de fluxo.** `recordQuizCompletion()` atualiza corretamente `user_levels.total_points`/`weekly_points`/`monthly_points`, mas o **ranking nacional exibido pela API (`GET /leaderboard/national`) lê exclusivamente da tabela `leaderboard_nacional_cache`**, que só é populada pela stored procedure `sp_refresh_leaderboard_nacional()`. Essa procedure:
   - Foi desenhada para ser chamada por um evento MySQL (`evt_refresh_leaderboard`, a cada hora) que foi **explicitamente comentado/desativado** na migration original, com a nota "usar Laravel Scheduler em vez do MySQL Event Scheduler";
   - **Nunca foi substituída por um agendamento Laravel** — `routes/console.php` só contém o comando `inspire` de exemplo; não há `Schedule::call(...)` nem Artisan Command que invoque `CALL sp_refresh_leaderboard_nacional()` em lado nenhum do código.
   - Consequência: **`leaderboard_nacional_cache` fica vazia desde o primeiro deploy** (a menos que alguém a tenha corrido manualmente via SQL) — um utilizador pode completar quizzes, ganhar pontos, subir de nível, e o seu resultado **nunca aparecerá no ranking nacional**. Os comentários em `LeaderboardService.php:19` e `LeaderboardCache.php:11-12` descrevem uma automação que simplesmente não existe em produção.
   - O ranking **provincial** (`LeaderboardController::provincial`) não sofre deste problema — lê diretamente de `user_levels`/`user_profiles` em tempo real (com cache de 5 min via `Cache::remember`), não depende da tabela de cache pré-computada.
6. **Leaderboard → Gamificação:** ✅ funcional (avaliação de badges, notificações de level-up/badge, tudo disparado corretamente dentro de `recordQuizCompletion`/`updateLevel`).

**Conclusão da secção:** o fluxo está corretamente implementado ponta a ponta **exceto** pelo passo 5, que está completamente inoperante em produção sem qualquer erro visível (não há exceção — a tabela simplesmente fica vazia, silenciosamente).

---

## 7. Admin — auditoria

- **Dashboard (`DashboardService`):**
  - 🔴 `moderation.reports_resolved` conta `content_reports.status = 'resolved'`, valor que nenhum código escreve — sempre 0 (ver secção 2).
  - 🟠 `buildRecentActivity()` — as sub-queries de tópicos e utilizadores recentes não usam `->select()` explícito ao fazer `leftJoin` com `user_profiles`; como ambas as tabelas do join têm coluna `created_at`, existe risco de colisão de nomes e o campo `time` exibido no widget "atividade recente" pode não corresponder à data real do tópico/utilizador. A query de pedidos de acesso (a primeira do método) já faz `->select()` explícito corretamente — a inconsistência é só nas duas últimas sub-queries.
  - 🟡 `summary()` faz 4 chamadas a serviços de estatística diferentes (`DocumentStatisticsService`, `CategoryStatisticsService`, `SubscriptionStatisticsService`) mais ~15 queries `DB::table()->count()` inline no próprio método — falta simetria: por que `documents`/`categories`/`subscriptions` têm Service dedicado mas `users`/`access_requests`/`community`/`moderation` não? Considerar extrair `UserStatisticsService`, `CommunityStatisticsService`, `ModerationStatisticsService` para consistência.
- **Documentos (admin):** sem endpoints de listagem/filtro dedicados para admin — `AdminController` não tem métodos de documentos; a gestão de documentos usa os mesmos endpoints `POST/PATCH/DELETE /documents` partilhados com professores (correto, não é uma lacuna, é uma decisão de design razoável).
- **Subscrições (`AdminDocumentSubscriptionController`):** bem implementado — filtros ricos (status, documento, utilizador, categoria, datas, pesquisa textual), paginação, ordenação configurável, máquina de estados validada por exceções de domínio (`InvalidSubscriptionTransitionException`, `SubscriptionNotFoundException`). Um dos módulos mais maduros do backend.
- **Categorias:** `storeCategory()` só permite criar (`POST`), não existe `PATCH`/`DELETE` para categorias de comunidade nem de documentos — se for necessário corrigir um erro de digitação no nome/slug de uma categoria, não há endpoint para isso (só via acesso direto à BD). Lacuna funcional, não um bug.
- **Quizzes (admin):** `syncDocuments`/`detachDocument` bem cobertos; falta um endpoint de estatísticas de quiz dedicado ao admin (taxa de conclusão agregada, distribuição de scores) — hoje só existe `quizzes.avg_score`/`completions_count`/`attempts_count` por quiz individual, sem agregação global.
- **Duplicação de consultas:** `AdminController::users()` e `UserDirectoryService::search()` implementam pesquisa de utilizadores com lógica semelhante mas separada (um para admin, outro para pesquisa geral) — aceitável dado que os campos devolvidos e as permissões são diferentes, mas vale a pena documentar explicitamente porque não foi unificado.

---

## 8. Services — avaliação individual

| Service | Avaliação | Nota |
|---|---|---|
| `DocumentSubscriptionService` | Excelente — máquina de estados clara, lock pessimista (`lockForUpdate`) contra race conditions, exceções de domínio dedicadas, single responsibility perfeito | 9/10 |
| `CommunityAuthorizationService` | Excelente — centraliza toda a lógica de visibilidade num único sítio, bem documentado, testável isoladamente | 9/10 |
| `AccessGateService` | Bom, mas parcialmente órfão — `canAccessDocument()`/`applyDocumentVisibilityFilter()` não são chamados por nenhum controller ativo (substituídos por `DocumentAccessService`); só `canAccess()`/`activeGrantLevelIds()` continuam em uso real | 6/10 |
| `QuizAttemptService` | Muito bom — state machine clara, validações de pertença (pergunta pertence ao quiz, opção pertence à pergunta), transações onde importa | 8/10 |
| `QuizDocumentService` | Muito bom — pequeno, focado, paginação/ordenação bem parametrizadas | 8/10 |
| `GamificationService` | Funcional mas sobrecarregado — mistura 3+ responsabilidades (ver secção 1); deveria ser dividido em `PointsService`, `LevelService`, `BadgeService`, com a lógica de bónus de quiz movida para fora | 5/10 |
| `ReportModerationService` | Incompleto — `warnUser()` não faz nada de facto (ver secção 16), `flagContent()` escreve um valor de status não contratado | 4/10 |
| `LeaderboardService` | Bem escrito, mas a premissa documentada no docblock (refresh automático via evento MySQL) está errada/desatualizada — o serviço em si está correto, o problema é a infraestrutura de refresh em falta | 6/10 (funcionalidade nacional efetivamente quebrada) |
| `NotificationService` | Pequeno, direto, cumpre o que promete — mas nenhuma validação de que `$referenceType` corresponde a um tipo conhecido (qualquer string é aceite) | 7/10 |
| `CategoryStatisticsService`, `DocumentStatisticsService`, `SubscriptionStatisticsService` | Excelentes exemplos de SRP — pequenos, um método, uma responsabilidade | 9/10 |
| `UserDirectoryService` | Muito bom, pequeno e focado | 8/10 |
| `DashboardService` | Razoável, mas mistura orquestração de outros services com muitas queries `DB::table()` inline e tem o bug do `->select()` ausente (secção 7) | 5/10 |
| `DocumentAccessService` | Bom — única fonte de decisão de acesso a documentos em uso real, mas coexiste com o `AccessGateService::canAccessDocument()` órfão (duplicação, secção 1) | 7/10 |

**Deveriam ser divididos:** `GamificationService` (em Points/Level/Badge), possivelmente `DashboardService` (extrair `UserStatisticsService`/`ModerationStatisticsService` para simetria com os já existentes).

**Podem ser simplificados:** `ReportModerationService::warnUser()` deveria ou implementar o envio de aviso de facto, ou ser removido/renomeado até ser implementado — hoje é uma promessa não cumprida no código.

---

## 9. Controllers — avaliação individual

| Controller | Linhas | Avaliação |
|---|---|---|
| `CommunityController` | 1579 | **Grande demais.** Mistura 6 sub-domínios (categorias, tópicos, membros, likes, follows, replies) num único ficheiro. Já é internamente bem organizado com separadores de secção (`// ─── TOPICS ───`), mas seria mais manutenível dividido em `CommunityCategoryController`, `DiscussionTopicController`, `TopicMembershipController`, `TopicReplyController`. |
| `AuthController` | 894 | Grande — mas a maior parte é registo/login/verificação/reset de password/sessões, que são de facto um domínio coeso (autenticação). Aceitável, embora `sessions()`/`destroySession()`/`destroyOtherSessions()` pudessem viver num `SessionController` dedicado. |
| `DocumentController` | 1152 | Grande — mistura CRUD de documentos, interações (like/favorite/download/citation), subscrições e pin. Contém lógica de negócio (citação, tags) que deveria estar em Services (secção 1). Boa candidata a split: `DocumentController` (CRUD+listagem) + `DocumentInteractionController` (like/favorite/download/citation) + já existe `AdminDocumentSubscriptionController` separado para o lado admin, mas o lado utilizador das subscrições continua dentro de `DocumentController`. |
| `AccessController` | 558 | Coordena bem os Services subjacentes, mas tem escrita direta a `is_active` (ver relatório anterior, achado C4) — é lógica que devia estar encapsulada num `AccessGrantService` dedicado, não espalhada em métodos de controller. |
| `QuizController` | 521 | Grande devido à composição aninhada de perguntas/opções em `store`/`update` (~150 linhas cada) — boa candidata a extrair para um `QuizCompositionService`. |
| `ProfileController` | 317 | Tamanho razoável. |
| `ReportController`, `NotificationController`, `LeaderboardController`, `AdminController`, `BadgeController`, `AdminDocumentSubscriptionController`, `GamificationController`, `UserController`, `HealthController` | 52–398 | Tamanhos adequados; a maioria **apenas coordena Services** (padrão correto) — `LeaderboardController`, `GamificationController` e `AdminDocumentSubscriptionController` são exemplos particularmente limpos de "controller fino". |

**Que ainda têm lógica de negócio (não deviam):** `DocumentController` (citação, tags), `QuizController` (diff de perguntas/opções), `AccessController` (escrita de `is_active`).

**Que apenas coordenam Services (correto):** `LeaderboardController`, `GamificationController`, `AdminDocumentSubscriptionController`, `NotificationController` (exceto `send`/`sendInvite`, que fazem a construção do payload inline — aceitável, é simples).

---

## 10. Models — auditoria

- **Relações incorretas/duplicadas:** não encontradas em `Document`/`Quiz` (verificados em detalhe) — `belongsTo`/`belongsToMany` apontam para as FKs corretas.
- **Assimetria de pivot:** `Quiz::documents()` usa `->orderByPivot('sort_order')`; `Document::quizzes()` (relação inversa, mesma pivot) **não** tem o `orderByPivot` equivalente — se algum código chamar `$document->quizzes` diretamente (sem passar pelo `QuizDocumentService`, que aplica a sua própria ordenação), a ordem não será garantida. Pequena inconsistência, sem impacto atual porque o único consumidor é o Service.
- **Casts ausentes:** `Quiz` não faz cast de `access_level_id`/`category_id` (esperado, são strings/uuids, não precisam), mas `Document::casts()` também não inclui `content`/`summary` (esperado, são texto livre) — nada de errado aqui.
- **Fillables incorretos:** não encontrados em `Document`/`Quiz`. **Já identificado no relatório anterior**: `AccessGrant`/`AccessRequest` sem `$timestamps` ajustado ao schema (achado A7 do relatório de API).
- **Scopes que deveriam existir:** `Document` não tem um `scopePublished()`/`scopeVisible()` apesar de `where('status', DocumentStatus::PUBLISHED->value)` aparecer repetido em pelo menos 4 sítios (`DocumentController::index/search/myFavorites`, `QuizDocumentService::documentsOfQuiz`). Um `Document::published()` scope eliminaria essa repetição.
- **Métodos mortos:** não encontrados métodos de Model nunca chamados (todas as relações lidas são usadas por pelo menos um Controller/Service/Resource).
- **`DiscussionTopicMember`, `TopicReply`, `CommunityCategory`** — não lidos em detalhe nesta sessão (fora do orçamento de tempo desta auditoria); recomenda-se verificação pontual se forem alvo de refactor futuro.

---

## 11. Base de dados

- **Colunas mortas confirmadas:** `documents.unique_id`, `documents.physical_location`, `documents.record_type` (secção 2).
- **Nullable desnecessário:** `community_categories.access_level_id` — nullable desde a Sprint 13, mas agora **totalmente não utilizado** (após a correção aplicada nesta sessão) — candidato a remoção completa numa migration futura, não só a tornar nullable.
- **FKs sem cascade que deviam ter (ou tratamento explícito no código):** `user_access_requests.reviewed_by` e `user_access_grants.granted_by` referenciam `users.id` sem `cascadeOnDelete()` — já identificado como causa de erro 500 não tratado em `AdminController::deleteUser` (relatório anterior, achado A1). Do ponto de vista de schema, isto está correto (não queremos apagar em cascata o histórico de quem aprovou o quê só porque esse admin foi removido) — o problema é a ausência de tratamento de exceção no controller, não o schema em si.
- **Índices:** cobertura geralmente boa (índices em `status`, `access_level_id`, `category_id`, `created_by`, `published_at`, full-text em `title`+`summary`). Não foram encontrados índices em falta óbvios para os padrões de query observados.
- **Constraints ausentes:** nenhuma `CHECK` constraint na BD para nenhum enum (todos os enums são só validados em PHP) — isto é uma decisão de arquitetura consistente em todo o schema (nem sequer o ficheiro SQL antigo, que tinha um `CHECK` em `users.role`, refletia a realidade das migrations) — **não é uma inconsistência**, é apenas uma característica do design (validação só na aplicação).
- **`quiz_documents` com tipos `VARCHAR(255)`** em vez de `CHAR(36)` — já coberto.
- **O schema representa exatamente o domínio atual?** Globalmente sim, com as exceções já listadas (colunas mortas, `access_level_id` vestigial em `community_categories`, e o valor `'flagged'` usado pela aplicação mas nunca formalizado no schema/enum).

---

## 12. API — inconsistências

Ver `docs/API_AUDIT_2026-07.md` para o levantamento detalhado de inconsistências de resposta/código HTTP (achados M5, M6). Resumo aqui:

- Respostas JSON inconsistentes entre módulos (Resources formais em Documents/Quiz, arrays manuais remapeados em Admin/Badge, linhas SQL "achatadas" em Access).
- `PATCH` que exige todos os campos (`AdminController::updateUser`) em vez de atualização parcial verdadeira.
- Nomenclatura: a maioria dos endpoints segue `kebab-case` consistente nos paths (`/access-requests`, `/document-categories`) — nenhuma inconsistência de nomenclatura de rotas encontrada.
- Endpoints redundantes: não encontrados endpoints genuinamente duplicados (cada rota tem um propósito distinto), mas `GET /documents/{id}/quizzes` e `GET /quizzes/{id}/documents` chamam o mesmo `QuizDocumentService` com nomes de método diferentes (`availableQuizzesForDocument` é só um alias de `quizzesOfDocument`) — não é redundância de API, mas é uma pequena duplicação de nome de método sem necessidade.

---

## 13. Swagger

- As anotações OpenAPI (`@OA\...`) estão presentes e detalhadas na maioria dos métodos de `DocumentController`, `CommunityController`, `ReportController`, `LeaderboardController`, `AdminDocumentSubscriptionController`, `NotificationController`.
- **`QuizController` não tem nenhuma anotação `@OA\...`** em nenhum dos seus métodos (`index`, `store`, `show`, `update`, `destroy`, `questions`, `startAttempt`, etc.) — confirmado por leitura direta do ficheiro completo. Isto significa que **todo o domínio Quiz está ausente da documentação Swagger gerada**, apesar de ser um dos domínios mais maduros funcionalmente (100% implementado). Gap de documentação significativo.
- `AdminController`, `UserController`, `GamificationController` (`pointTransactions` tem anotação, mas está incorretamente marcado com `tags={"Profile"}` em vez de `tags={"Gamification"}`) têm cobertura parcial/inconsistente de tags.
- Não foi possível verificar nesta sessão se o Swagger gerado (`storage/api-docs`) está atualizado com o código atual (isso exigiria correr `php artisan l5-swagger:generate`, fora do escopo de uma auditoria só de leitura).

---

## 14. Testes — cobertura

**Ficheiros de teste existentes (29):** cobrem Access Control, Autenticação, Community (incluindo um `CommunityHardeningTest` dedicado), Acesso a Documentos, Favoritos, Gamificação de likes, Subscrições (4 ficheiros — admin, idempotência, state machine, geral), Gamificação, Leaderboard, Notificações, Perfil, Quiz (Access Gate, Questions, CRUD, Gamificação), Reports, Sprints 16/17.x, Diretório de Utilizadores.

**Services sem teste dedicado (nenhum ficheiro `tests/Unit/Services/*` correspondente):**
- `DocumentAccessService` — sem teste unitário dedicado (só coberto indiretamente por `DocumentAccessTest.php`, que é um Feature test, não Unit).
- `DocumentSubscriptionService` — idem, coberto por Feature tests (`DocumentSubscriptionStateMachineTest`, etc.), mas sem Unit test isolado da lógica de transição de estados.
- `QuizAttemptService`, `QuizDocumentService` — sem Unit test dedicado.
- `LeaderboardService` — sem nenhum teste encontrado (nem Feature nem Unit) apesar de `LeaderboardTest.php` existir — a verificar se cobre `national()`/`provincial()`/`provinceStats()` ou só os endpoints do controller.
- `ReportModerationService` — sem teste dedicado; **isto explica por que o bug do `warnUser()` no-op e do `status='actioned'` hardcoded (secção 16) nunca foi apanhado** — não há teste que verifique o efeito real de cada ação de moderação.
- `CommunityAuthorizationService` — sem Unit test dedicado (é o serviço mais crítico de autorização de Community; recomenda-se prioridade alta para um Unit test isolado, dado que já foi identificado um bug de chamada incorreta no controller que o rodeia).
- `DashboardService`, `CategoryStatisticsService`, `DocumentStatisticsService`, `SubscriptionStatisticsService` — sem teste.

**Controllers sem teste aparente:** `AdminController` (dashboard/users) — não há `AdminTest.php`/`AdminControllerTest.php` na lista; `BadgeController` — não há `BadgeTest.php`.

**Casos extremos não cobertos (identificados por esta auditoria, não confirmados como "sem teste" por leitura dos ficheiros de teste em si — apenas inferidos pela ausência de ficheiro dedicado):**
- Fluxo de moderação (`flagContent`/`deleteContent`/`warnUser`/`dismissReport`) — nenhum `ReportModerationTest`.
- Concorrência na criação de tags (`DocumentController::store`) — race condition já identificada no relatório anterior.
- Refresh do leaderboard nacional — como a funcionalidade está quebrada (secção 6), não é surpreendente que não haja teste a validá-la end-to-end (um teste que verificasse "depois de completar um quiz, o utilizador aparece no ranking nacional" teria apanhado o problema).

*(Nota: não foi feita leitura do conteúdo de cada ficheiro de teste — a análise acima é baseada na existência/ausência de ficheiros correspondentes por convenção de nome. Uma auditoria de cobertura linha a linha exigiria rodar a suite com `--coverage`, fora do escopo desta análise estática.)*

---

## 15. Performance

- **N+1 potencial:** não encontrado nos Controllers principais — `Document::with(['category','accessLevel','createdBy.profile'])` em `show()`/`update()` faz eager loading correto; `CommunityController` usa `with(['author.profile','category'])`/`with(['category','members.user.profile'])` consistentemente.
- **Queries repetidas:** o bloco de `SELECT`+`JOIN` de listagem de documentos está duplicado 3× (secção 3) — não é N+1, mas é WET (repetição desnecessária de SQL).
- **Contagem desnecessária:** `LeaderboardService::provincial()` faz `(clone $base)->count()` e depois `(clone $base)->...->get()` — duas queries separadas (count + select), padrão correto para paginação (não é um problema).
- **Lookup de sessão por request:** `AuthenticateApiSession` faz **uma query à BD em cada request autenticado** (`user_sessions` + implicitamente carrega o `User`) — não há cache de sessão (Redis/Memcached) mencionado. Para uma API com tráfego significativo, isto é uma query extra por request que poderia ser mitigada com cache de sessão de curta duração (ex.: 60s) sem comprometer a segurança de forma relevante.
- **Paginação:** presente na generalidade dos endpoints de listagem (`documents`, `quizzes`, `topics`, `document-subscriptions`, `quizzes/{id}/documents`). `myFavorites()` e `search()` em `DocumentController` usam `->limit(50)` fixo em vez de paginação real (`per_page`/`page`) — inconsistente com `index()`, que pagina corretamente.
- **Contadores desnormalizados** (`views_count`, `likes_count`, `replies_count`, etc.) — bem mantidos via `increment()`/`decrement()` na generalidade dos casos; exceção já identificada: `views_count` não deduplicado por utilizador (relatório anterior, M3).

---

## 16. Segurança

Ver `docs/API_AUDIT_2026-07.md` para a lista completa (achados C1–C4, A1–A8). Achados **novos** desta auditoria arquitetural:

- 🔴 **`ReportModerationService::warnUser()` não envia nenhum aviso real** — a ação de moderação "warn" (`POST /reports/{id}/action` com `action=warn`) atualiza o `content_reports.status` para `'actioned'` e regista `action_taken = "Action taken: warn..."`, mas **o utilizador denunciado nunca recebe nenhuma notificação, email ou registo de aviso**. Do ponto de vista de moderação de conteúdo, isto é uma falha de segurança/confiança operacional: os administradores acreditam (pela resposta 200 e pelo texto gravado) que um aviso foi emitido, quando na realidade nada aconteceu.
- 🟡 **`ReportController::action()` sempre grava `status='actioned'`** independentemente da ação escolhida, incluindo quando `action='dismiss'` — o valor `'dismissed'` (que existe e é válido em `update()`) nunca é atingido por este fluxo, dificultando auditoria/relatórios de moderação precisos.
- 🟡 **Mass assignment:** `Document::$fillable` inclui `views_count`, `likes_count`, `downloads_count` — contadores que só deveriam ser alterados via `increment()`/`decrement()` internos, nunca diretamente por input do utilizador. Não foi encontrado nenhum Request que aceite estes campos diretamente do cliente (`StoreDocumentRequest`/`UpdateDocumentRequest` não os incluem), portanto não há exploração possível hoje — mas mantê-los em `$fillable` é um risco latente: se um developer futuro usar `Document::create($request->all())` em vez do Form Request validado, estes contadores tornam-se manipuláveis pelo cliente.
- ✅ **Upload de avatar** (`ProfileController::updateAvatar`) — não auditado em detalhe nesta sessão (fora do orçamento de tempo); recomenda-se verificação futura de validação de tipo MIME/tamanho.
- ✅ **SQL Injection:** não encontrada nenhuma concatenação de input de utilizador diretamente em SQL — todas as queries usam bindings do Query Builder/Eloquent (`where()`, `whereRaw` não foi encontrado em uso com input não sanitizado).

---

## 17. Código morto

| Item | Tipo | Evidência |
|---|---|---|
| `DocumentPolicy` (classe inteira) | Classe registada mas nunca invocada | Registada em `AuthServiceProvider` (`Gate::policy(Document::class, DocumentPolicy::class)`), mas grep por `->authorize(`, `Gate::`, `@can(` em `app/Http/Controllers` não encontra nenhuma chamada que a invoque. `DocumentController` usa `DocumentAccessService` diretamente. |
| `DiscussionTopicPolicy` (classe inteira) | Idem | Registada em `AuthServiceProvider`, mas `CommunityController` chama `CommunityAuthorizationService` diretamente em todos os pontos — nunca `$this->authorize(...)`. |
| `AccessGateService::canAccessDocument()` | Método órfão | Só é chamado por `DocumentPolicy::view()`, que por sua vez nunca é invocada (ver acima) — cadeia de chamada completamente morta. |
| `AccessGateService::applyDocumentVisibilityFilter()` | Método órfão | Não referenciado por nenhum Controller/Service ativo (substituído por `DocumentAccessService::applyListingFilter()`). |
| `documents.unique_id`, `physical_location`, `record_type` | Colunas mortas | Ver secção 2/11. |
| `ReportModerationService::dismissReport()` | Método vazio (só comentário) | Existe só para "consistência futura" — atualmente um no-op puro. |
| Imports não utilizados | — | Não foi feita uma varredura exaustiva de imports mortos em todos os 16 controllers (fora do orçamento desta sessão); um `composer` ou IDE com "unused imports" deveria ser corrido para uma lista exaustiva. |
| Migrations obsoletas | Nenhuma encontrada | Todas as 23 migrations têm efeito no schema final; nenhuma migration "no-op" ou totalmente revertida por uma posterior foi encontrada. |

---

## 18. Consistência arquitetural — visão geral

**Onde o código implementa uma arquitetura diferente da documentada:**
1. `CommunityController::storeTopic()` implementava (até esta sessão) o modelo de autorização *anterior* à Sprint 13 (baseado em `access_level_id`), em contradição direta com o comentário da própria migration Sprint 13 e com `CommunityAuthorizationService`, que já tinham migrado para o modelo baseado em `visibility`. **Corrigido durante esta conversa.**
2. `LeaderboardService`/`LeaderboardCache` documentam (em comentário) uma automação via evento MySQL que foi deliberadamente desativada e nunca substituída — o comportamento documentado não corresponde ao comportamento real (tabela nunca atualizada).
3. Existe uma camada de `Policies` (Laravel-idiomática) totalmente construída e registada, mas **arquiteturalmente abandonada** em favor de chamada direta a Services — os dois padrões coexistem no código-fonte (Policies existem, Services fazem o trabalho real), o que confunde qualquer novo developer que procure "onde está a autorização" e encontre primeiro os Policies (que parecem ser a resposta certa, mas estão mortos).

**Decisões arquiteturais ainda não totalmente aplicadas:**
- A migração de "autorização por `access_level_id`" para "autorização por regra de domínio dedicada" (o padrão que Community já tem com `visibility` e Documents já tem parcialmente com `requires_subscription`) **não chegou a Quizzes** — `QuizController`/`QuizAttemptService` continuam 100% dependentes de `AccessGateService::canAccess($user, $quiz->access_level_id)`, o modelo mais antigo do sistema. Se a direção arquitetural for "cada domínio tem a sua própria regra de autorização", Quiz é o domínio que ficou para trás.
- A extração de Services de estatística (`DocumentStatisticsService`, `CategoryStatisticsService`, `SubscriptionStatisticsService`) foi aplicada a 3 dos 6 grupos de métricas do dashboard, mas não às restantes (users, community, moderation) — migração parcial dentro do próprio `DashboardService`.

**Domínio parcialmente migrado:** **Quizzes** é o caso mais claro — todo o resto do backend (Documents via subscrição, Community via visibility) já saiu do modelo genérico de `access_level_id`, mas Quiz nunca fez essa transição.

---

## Resumo — Problemas críticos, inconsistências, melhorias, código morto

### 1. Problemas críticos (podem causar bugs ou quebrar regras de negócio)
- Leaderboard nacional nunca é atualizado (`sp_refresh_leaderboard_nacional` órfã) — secção 6.
- `ReportModerationService::warnUser()` não faz nada — secção 16.
- `status='flagged'` usado em `documents`/`discussion_topics` sem existir no enum/lista de valores válidos — secções 2, 3, 7.
- `ReportController::action()` sempre grava `status='actioned'`, tornando `'dismissed'` inatingível por essa via — secção 16.
- (Já corrigido nesta sessão) `CommunityController::storeTopic()` usava `access_level_id` legado, causando `TypeError` em produção.
- Ver também C1–C4 do `docs/API_AUDIT_2026-07.md`.

### 2. Inconsistências arquiteturais (funciona, mas não segue a arquitetura definida)
- Policies (`DocumentPolicy`, `DiscussionTopicPolicy`) registadas mas nunca invocadas — duplicação morta da lógica de autorização real.
- `AccessGateService::canAccessDocument()`/`applyDocumentVisibilityFilter()` órfãos, substituídos por `DocumentAccessService` sem remoção do código antigo.
- Quiz ainda não migrado do modelo de autorização por `access_level_id` para um modelo de domínio dedicado (ao contrário de Documents/Community).
- `GamificationService` mistura responsabilidades de pontos/níveis/badges/scoring de quiz.
- Dashboard com migração parcial para Services de estatística (3 de 6 grupos).

### 3. Melhorias recomendadas (refatorações sem alterar comportamento)
- Extrair query base de listagem de documentos para um scope/método reutilizável (elimina triplicação em `DocumentController`).
- Extrair lógica de composição de perguntas/opções de `QuizController` para um `QuizCompositionService`.
- Extrair geração de citações e gestão de tags de `DocumentController` para services dedicados.
- Adicionar anotações Swagger a todo o `QuizController` (atualmente 0% documentado).
- Unificar `myFavorites()`/`search()` para paginação real em vez de `limit(50)`.
- Adicionar cache curto (ex.: 30–60s) à validação de sessão em `AuthenticateApiSession` para reduzir 1 query/request.

### 4. Código morto ou legado (remoção futura)
- `DocumentPolicy`, `DiscussionTopicPolicy` e o registo correspondente em `AuthServiceProvider` — ou remover, ou (melhor) migrar os Controllers para de facto usar `$this->authorize(...)`, tornando os Policies a única fonte de verdade e removendo a chamada direta aos Services de autorização a partir dos Controllers.
- `AccessGateService::canAccessDocument()`, `applyDocumentVisibilityFilter()`.
- Colunas `documents.unique_id`, `physical_location`, `record_type`.
- `community_categories.access_level_id` (agora 100% vestigial após a correção desta sessão).
- `pdf_url` (após confirmação de que nenhum frontend depende dele).

### 5. Estado geral do backend — maturidade arquitetural (0–10)

| Domínio | Nota | Justificação |
|---|---|---|
| **Documents** | 7/10 | Regra de subscrição bem isolada; perde pontos por duplicação de queries, colunas mortas, e coexistência de dois modelos de autorização (access_level vs. subscrição) sem uma regra de precedência explícita. |
| **Community** | 7.5/10 | Desacoplamento de categorias/autorização exemplar e bem documentado; perde pontos pelo modo `CATEGORY` (default) ser inatingível na prática e pelo bug agora corrigido. |
| **Subscriptions** | 9/10 | O domínio mais maduro do backend — state machine limpa, exceções de domínio, lock pessimista, admin controller rico em filtros. Referência de qualidade para os outros domínios. |
| **Quizzes** | 6/10 | Funcionalmente completo e com boa cobertura de testes, mas arquiteturalmente o mais atrasado (ainda preso ao modelo `access_level_id` legado, zero documentação Swagger, lógica de composição no controller). |
| **Gamificação** | 6.5/10 | Funciona corretamente e de forma transacional, mas o Service acumula responsabilidades demais e incorpora regras de negócio de Quiz que não lhe pertencem. |
| **Admin** | 6/10 | Subscrições (via `AdminDocumentSubscriptionController`) muito maduro; Dashboard com métricas incorretas (`reports_resolved`) e bug de possível colisão de coluna; ausência de CRUD de categorias além de criação. |
| **Fluxo de Aprendizagem** | 5/10 | Cinco dos seis elos da cadeia funcionam corretamente; o elo "Resultado → Leaderboard nacional" está completamente quebrado em produção sem qualquer sinal de erro — isto por si só justifica a nota mediana apesar da qualidade dos restantes elos. |

**Nota global aproximada do backend: 6.7/10** — uma base sólida, com decisões arquiteturais bem pensadas em vários domínios (Subscriptions, Community), mas com transições incompletas (Policies órfãos, Quiz não migrado, Gamificação sobrecarregada) e pelo menos um ponto de falha silenciosa em produção (Leaderboard nacional) que deveria ser a prioridade número um da próxima sprint.
