# Auditoria Técnica — Domínio de Comunidade (Fase 18)

> Data: 2026-07-02 · Âmbito: backend Laravel, frontend Angular, mobile React Native, Swagger.
> Nenhuma alteração de código foi feita. Este documento mapeia a implementação **real**.

---

## 1. Arquitetura Geral

### Componentes existentes

| Tipo | Arquivo | Estado |
|---|---|---|
| Model | `backend/app/Models/DiscussionTopic.php` | ativo |
| Model | `backend/app/Models/CommunityCategory.php` | ativo |
| Model | `backend/app/Models/DiscussionTopicMember.php` | ativo |
| Model | `backend/app/Models/CategoryMember.php` | **semi-legado** (só usado por autorização CATEGORY, seeder e testes) |
| Model | `backend/app/Models/TopicReply.php`, `TopicLike.php`, `ReplyLike.php`, `TopicFollower.php` | ativos |
| Controller | `backend/app/Http/Controllers/Api/CommunityController.php` (1721 linhas, 27 métodos) | ativo — concentra ~90% do domínio, com lógica de negócio inline |
| Controller | `backend/app/Http/Controllers/Api/TopicAdminController.php` | ativo (admin) |
| Controller | `backend/app/Http/Controllers/Api/CommunityCategoryAdminController.php` | ativo (admin) |
| Service | `backend/app/Services/CommunityAuthorizationService.php` | ativo — coração da autorização |
| Service | `backend/app/Services/TopicService.php` | **parcialmente órfão** — só `update/delete/pin/unpin/lock/unlock/buildTopic` são usados (pelo admin); `create()`, `join()`, `leave()` nunca são chamados |
| Service | `backend/app/Services/ReplyService.php` | **100% órfão** — nenhum controller o usa |
| Service | `backend/app/Services/CommunitySearchService.php` | **100% órfão** — nenhum controller o usa |
| Service | `backend/app/Services/CommunityCategoryService.php` | ativo (admin) |
| Service | `backend/app/Services/CategoryStatisticsService.php` | ativo, mas **não é de Community** — consulta `document_categories` (nome enganador) |
| Resource | `TopicResource`, `ReplyResource`, `CommunityCategoryResource` | usados **apenas** nos controllers admin |
| Resource | `TopicSummaryResource` | **órfão** — importado em `TopicAdminController.php:7` mas nunca instanciado |
| Policy | `backend/app/Policies/DiscussionTopicPolicy.php` | **registada mas nunca invocada** — não existe nenhum `authorize()`, `Gate::allows()` ou `$user->can()` no domínio |
| Form Request | — | **não existem** para Community; toda a validação é inline nos controllers |
| Events / Jobs / Observers / Traits | — | **não existem** no domínio |
| Notifications | `NotificationService::sendTopicInvitation / sendTopicJoined / sendTopicRemoved / send` | ativos |

### Relações reais entre componentes

```
Rotas públicas/autenticadas (routes/api.php)
  → CommunityController  ── usa ──→ CommunityAuthorizationService ──→ DB (category_members, discussion_topic_members)
                          ── usa ──→ GamificationService, NotificationService
                          ── devolve models crus (sem Resources)

Rotas admin (prefix /admin, middleware role:admin)
  → TopicAdminController             ──→ TopicService             ──→ TopicResource
  → CommunityCategoryAdminController ──→ CommunityCategoryService ──→ CommunityCategoryResource
  (nenhuma passa pelo CommunityAuthorizationService — confiam no middleware)

DiscussionTopicPolicy → delega 100% no CommunityAuthorizationService, mas ninguém chama a Policy.
ReplyService / CommunitySearchService → não têm nenhum consumidor.
```

**Conclusão arquitetural:** existem **duas arquiteturas paralelas**: a "nova" (admin: Controller → Service → Resource) e a "antiga" (pública: Controller gigante com tudo inline). Os services `TopicService::create`, `ReplyService` e `CommunitySearchService` parecem ter sido criados para migrar o `CommunityController` para a nova arquitetura, mas a migração nunca foi ligada às rotas — ficaram como cópias divergentes.

---

## 2. Fluxo de Autorização

Toda a decisão acontece em `CommunityAuthorizationService`; o fluxo real é:

```
Route middleware (AuthenticateApiSession | OptionalAuthenticateApiSession | role:admin)
  ↓
CommunityController::resolveTopicForUserOrFail()  [CommunityController.php:705]
  ↓ canViewTopic() → 404 se não puder ver
CommunityAuthorizationService::can*()             [decisão]
  ↓ queries diretas: discussion_topic_members, category_members
Banco
```

A `DiscussionTopicPolicy` existe entre o Service e o mundo, mas **está fora do fluxo** (camada morta).

### Matriz de permissões (implementação real)

| Ação | Quem pode | Onde decide |
|---|---|---|
| **Ver tópico** | admin; autor; membro c/ role owner; PUBLIC → qualquer autenticado; CATEGORY → membro de `category_members`; INVITE_ONLY → qualquer linha em `discussion_topic_members` (mesmo convite pendente). **Visitante (null): nunca** | `canViewTopic` — `CommunityAuthorizationService.php:14` |
| **Responder** | igual a ver, mas INVITE_ONLY exige `accepted_at` preenchido; bloqueado se status ∈ {closed, locked, archived} | `canReply` (linha 34) |
| **Criar tópico** | **qualquer utilizador autenticado** — não há verificação de categoria nem de nível | `storeTopic` — `CommunityController.php:273` (não chama o AuthorizationService) |
| **Editar tópico** | admin, autor, ou membro com role `owner`; reabrir tópico `closed` só admin | `canUpdateTopic` (linha 80) + regra extra inline em `updateTopic` (`CommunityController.php:620`) |
| **Apagar tópico** | admin, autor, ou role `owner` | `canDeleteTopic` (linha 75) |
| **Convidar membros** | admin, owner, ou role `moderator` | `canInviteMembers` (linha 52) |
| **Remover membros** | admin, owner, moderator (owner não pode ser removido — regra inline no controller, linha 904) | `canRemoveMembers` (linha 61) |
| **Promover moderador** | admin ou owner apenas | `canPromoteMember` (linha 70) |
| **Fixar (pin)** | apenas admin, via `/admin/topics/{id}/pin` (middleware `role:admin`) | `TopicAdminController::pin` — sem policy |
| **Bloquear (lock)** | apenas admin via `/admin/topics/{id}/lock`; utilizador comum também consegue via `PATCH /topics/{id}` com `status=locked` se for autor/owner | `TopicAdminController::lock` + `CommunityController::updateTopic` |
| **Aceitar resposta** | mesmo critério de `canUpdateTopic` (admin/autor/owner) | `acceptReply` (`CommunityController.php:1672`) |

### Duas vias de decisão distintas

1. **Rotas públicas**: `CommunityController` → `CommunityAuthorizationService` (injetado diretamente).
2. **Rotas admin**: apenas middleware `role:admin` — o `TopicService` não faz nenhuma verificação.
3. **Policy**: terceira via declarada e nunca percorrida.

---

## 3. Sistema de Visibilidade

| Valor | Estado | Onde aparece |
|---|---|---|
| `PUBLIC` | **ativo** | código backend, validações, web, mobile |
| `CATEGORY` | **zumbi** — implementado e é o **default do backend**, mas nenhum cliente o cria deliberadamente e não existe forma de gerir membros de categoria | `CommunityAuthorizationService`, validações, default em `createTopic` (`CommunityController.php:395`) e na coluna (migration sprint13) |
| `INVITE_ONLY` | **ativo** | tudo |
| `RESTRICTED` | **legado** — antigo nome de CATEGORY | apenas migrations (`2026_06_26_000001` default original; renomeado em `2026_06_28_000001`) e no `normalizeVisibility` defensivo do Angular |
| `PRIVATE` | **legado** — antigo nome de INVITE_ONLY | apenas migration de rename e `normalizeVisibility` do Angular |

Evidências de que `CATEGORY` é zumbi:

- O comentário no topo do próprio service admite-o: *"ATT já não existe membros por categoria, o topico é apenas public ou only_member"* (`CommunityAuthorizationService.php:11`) — mas o código continua a implementá-lo.
- Não existe **nenhum endpoint** para adicionar/remover utilizadores de `category_members` — só o `CommunitySeeder` e os testes inserem linhas.
- O web só oferece PUBLIC/INVITE_ONLY na criação (`create-topic.html:77-88`); o mobile idem (`CreateTopicScreen.tsx:105`).
- **Armadilha**: quem chamar `POST /topics` sem `visibility` cria um tópico `CATEGORY` que ninguém (exceto autor/admin) consegue ver, porque não há membros de categoria em produção.
- Contradição na UI web: a edição do tópico (`discussion-thread.html:111-113`) **oferece o botão "Por Categoria"** — permite converter um tópico para um estado que a plataforma já não gere.

---

## 4. Categoria × Autorização

**Existe tabela `category_members`?** Sim — criada em `2026_05_28_000005_create_community_tables.php:120`, nunca dropada.

**Ainda é utilizada?** Sim, mas apenas na avaliação da visibilidade `CATEGORY`. Referências completas:

| Local | Linha | Uso |
|---|---|---|
| `backend/app/Services/CommunityAuthorizationService.php` | 132 | `whereExists` no filtro de listagem |
| `backend/app/Services/CommunityAuthorizationService.php` | 195 | `isCategoryMember()` (DB::table direto) |
| `backend/app/Models/CategoryMember.php` | — | model completo, sem consumidores fora dos testes |
| `backend/app/Models/CommunityCategory.php` | 47-56 | relações `membersRelation()` e `users()` — **nunca chamadas** |
| `backend/app/Http/Controllers/Api/CommunityController.php` | 13 | **import morto** (`use App\Models\CategoryMember;` sem uso no corpo) |
| `backend/database/seeders/CommunitySeeder.php` | 94 | insere membros de exemplo |
| `backend/tests/Feature/CommunityTest.php` | 29 | setup de testes |
| `backend/tests/Feature/CommunityHardeningTest.php` | 241 | teste de `CATEGORY` |
| `backend/tests/Feature/NotificationTest.php` | 295, 324, 351 | setup |
| `backend/tests/Feature/Sprint173Test.php` | 134, 154, 180 | setup |

**Código morto relacionado:** relações no model `CommunityCategory`, import no controller, e a coluna `community_categories.members_count` — **nunca é incrementada em lado nenhum** (fica 0 para sempre).

**`access_level_id`** em `community_categories`: deprecado formalmente na sprint 13 (nullable, sem efeito — migration `2026_06_28_000001`, comentário nas linhas 42-45). Nenhuma lógica de autorização o lê. A migration `2026_06_25_000001_add_private_community_category.php` ainda o preenche (`'restricted'`) ao semear a "Sala Privada".

---

## 5. Membros do Tópico (`discussion_topic_members`)

Schema: `topic_id`, `user_id`, `role` (owner/moderator/member), `invited_by`, `accepted_at`, unique (topic_id, user_id), FK cascade no delete do tópico.

| Operação | Quem executa | Onde |
|---|---|---|
| **Criar (owner)** | automático na criação do tópico, `role=owner`, `accepted_at=now()` | `CommunityController::createTopic` (linha 422) |
| **Criar (convite na criação)** | autor, apenas se `visibility=INVITE_ONLY`; `accepted_at=null` (pendente) + notificação | `createTopic` (linhas 451-489) |
| **Criar (convite posterior)** | owner/moderator/admin via `POST /topics/{id}/members`; **`accepted_at=now()` imediato** — o convidado entra sem aceitar | `storeTopicMember` (linha 799) |
| **Aceitar** | o próprio convidado, `POST /topics/{id}/join` (só INVITE_ONLY com convite pendente); notifica o autor | `joinTopic` (linha 934) |
| **Rejeitar** | **não existe** — um convite pendente só desaparece via `leaveTopic` ou remoção pelo owner | — |
| **Alterar role** | owner/admin via `PATCH /topics/{id}/members/{user}` (owner é imutável) | `updateTopicMember` (linha 846) |
| **Remover** | owner/moderator/admin via `DELETE .../members/{user}` (owner não removível) + notificação | `destroyTopicMember` (linha 893) |
| **Sair** | o próprio via `POST /topics/{id}/leave` (owner não pode sair) | `leaveTopic` (linha 979) |
| **Consultar** | qualquer um que possa ver o tópico, `GET /topics/{id}/members` | `topicMembers` (linha 736) |

**Inconsistência de semântica:** convite feito na criação fica *pendente* (`accepted_at=null`, exige join); convite feito depois é *auto-aceite* (`accepted_at=now()`). O mesmo conceito tem dois comportamentos.

**Duplicação órfã:** `TopicService::join()` e `TopicService::leave()` (linhas 230-262) reimplementam o mesmo sem autorização nenhuma — nunca são chamados.

**Redundância interna:** em `createTopic`, o check `$memberId === $request->user()->id` é feito duas vezes (linhas 457 e 463).

---

## 6. Fluxo de Criação de Tópicos

```
POST /topics  (ou POST /documents/{id}/topics)
  ↓
CommunityController::storeTopic / storeTopicForDocument
  ↓ validação inline partilhada: topicValidationRules()   [CommunityController.php:257]
  ↓ (não há verificação de autorização — qualquer autenticado cria)
CommunityController::createTopic()                          [CommunityController.php:392]
  ↓ DB::transaction
  ├─ DiscussionTopic::create (status='published', visibility default 'CATEGORY')
  ├─ DiscussionTopicMember::create (autor como owner aceite)
  ├─ se INVITE_ONLY: cria convites pendentes + NotificationService::sendTopicInvitation (dentro da transação)
  ├─ category->increment('topics_count')
  ├─ GamificationService::awardPoints (20 pts) + incrementCounters
  └─ return topic->load(author.profile, category, members.user.profile)
```

- **Upload**: não existe no fluxo real. O `TopicService::create` órfão suporta `files` via `MediaService` (linhas 122-131) — funcionalidade escrita e nunca ligada.
- **Eventos**: nenhum evento Laravel; notificações e gamificação são chamadas síncronas dentro da transação (uma falha no `NotificationService` faz rollback do tópico inteiro).
- **Lógica de negócio** vive toda no controller.
- `storeTopicForDocument` reutiliza corretamente `createTopic` (dedup da sprint 17.3) — mas o `TopicService::create` continua a ser uma **terceira cópia divergente** (aceita `status`, `is_pinned`, `is_featured`, `pinned`, `locked`, `solved`, files; default de status diferente).

---

## 7. Fluxo de Respostas

| Operação | Implementação ativa | Duplicado órfão |
|---|---|---|
| Criar | `CommunityController::storeReply` (linha 1310) — valida canReply, incrementa `replies_count`, `last_reply_at`, 10 pts, notifica autor | `ReplyService::createReply` (com uploads + campos `best_answer`/`hidden`) |
| Editar | `updateReply` (linha 1418) — autor ou admin; **não grava `edited_at`/`edited_by`** | `ReplyService::updateReply` — grava `edited_at`/`edited_by` |
| Apagar | `destroyReply` (linha 1478) — autor ou admin | `ReplyService::deleteReply` |
| Apagar árvore | `deleteReplyAndChildren` (linha 1503) — **recursivo, 2 queries por nó**; **decrementa `replies_count` apenas em 1**, mesmo apagando N respostas | `ReplyService::deleteReplyTree` — BFS por níveis e decrementa a contagem correta (ironia: a versão órfã é a correta) |
| Melhor resposta | `acceptReply` (linha 1672) — escreve **apenas `is_accepted`**; sem "des-aceitar" | `ReplyService::toggleBestAnswer` — sincroniza `best_answer` + `is_accepted` e permite untoggle |
| Ocultação | **não existe endpoint no domínio** — só o `ReportService` (moderação) seta `hidden=true` (`ReportService.php:374-386`) | `ReplyService::updateReply` aceita `hidden` |

**Bugs latentes decorrentes da duplicação:**
1. `is_accepted` vs `best_answer`: a migration de moderação (`2026_07_02_110000`, linha 37) sincronizou os dados uma vez, mas `acceptReply` só atualiza `is_accepted` → as colunas divergem a partir da primeira aceitação.
2. Respostas com `hidden=true` (escondidas pela moderação) **continuam a ser devolvidas** por `GET /topics/{id}/replies` — nenhuma query do domínio filtra `hidden`.
3. Tópico escondido pela moderação (`status='flagged'`, `hidden=true`) sai da listagem (o `whereIn` de status não inclui `flagged`), mas `GET /topics/{id}` continua a mostrá-lo a qualquer pessoa com acesso, porque `canViewTopic` ignora status/hidden.
4. `replies_count` fica errado após apagar uma resposta com filhos (ponto acima).
5. FK `topic_replies.parent_reply_id` não tem cascade; o bulk delete de `destroyTopic` (`TopicReply::where('topic_id')->delete()`) pode violar a FK auto-referente dependendo da ordem de remoção no MySQL.

---

## 8. Consultas de Listagem

Três implementações distintas de "listar tópicos" + uma variante:

| # | Onde | Filtros | Paginação | Eager loading | Observações |
|---|---|---|---|---|---|
| 1 | `CommunityController::indexTopics` (linha 162) | search (LIKE title/content), category_id, status, visibility + `whereIn status (open,locked,published,closed)` | `paginate` (meta manual) | `author.profile, category` | ordena `is_pinned` (coluna antiga) |
| 2 | `TopicAdminController::index` (linha 39) | search, category_id, locked, pinned, status | `paginate` (via Resource) | `author.profile, category` | ordena `pinned` (coluna nova) — **admin e público ordenam por colunas diferentes** |
| 3 | `CommunitySearchService::search` | q (inclui display_name via whereExists), category, author, pinned, locked, solved, status, visibility, 4 sorts | `paginate` + cache 30s | `author.profile, category` | **órfão** |
| 4 | `CommunityController::documentTopics` (linha 351) | document_id | **sem paginação** (`get()`) | `author.profile` | monta payload à mão (transformação duplicada) |

- Filtro de visibilidade: `applyVisibleTopicsFilter` (whereExists sobre `category_members` e `discussion_topic_members`) — sem N+1, correto para SQL.
- **N+1 real**: apenas em `deleteReplyAndChildren` (secção 7).
- Pesquisa `LIKE '%…%'` sem índice full-text — aceitável no volume atual, degradará com crescimento (Médio).
- `TopicResource` inclui `replies` completas quando carregadas — `TopicAdminController::show` via `buildTopic` carrega **todas** as respostas de uma vez, sem paginação (Baixo/Médio).
- Filtros `search`/`category_id`/`status` copiados em 3 sítios (duplicação).

---

## 9. Código Legado — Inventário

| Arquivo | Linha | Motivo | Impacto |
|---|---|---|---|
| `app/Services/ReplyService.php` | 1-227 | service órfão, cópia divergente da lógica de respostas | Confusão; a versão órfã contém correções (contagem, edited_at) que a versão ativa não tem |
| `app/Services/CommunitySearchService.php` | 1-94 | service órfão | Peso morto |
| `app/Services/TopicService.php` | 26-160, 230-262 | `create()`, `join()`, `leave()` sem chamadores | Terceira implementação de criação de tópico |
| `app/Services/TopicService.php` | 300-304 | `clearCache` esvazia chaves (`topic-summary:*`, `community-popular`) que **nada escreve** | Cache fantasma |
| `app/Http/Resources/TopicSummaryResource.php` | — | resource nunca instanciado | Peso morto |
| `app/Http/Controllers/Api/TopicAdminController.php` | 7 | import de `TopicSummaryResource` sem uso | Cosmético |
| `app/Http/Controllers/Api/CommunityController.php` | 13 | import de `CategoryMember` sem uso | Cosmético |
| `app/Policies/DiscussionTopicPolicy.php` | 1-57 | registada em `AuthServiceProvider` mas nunca invocada | Camada de autorização ilusória |
| `app/Models/CommunityCategory.php` | 47-56 | relações `membersRelation()`/`users()` nunca chamadas | Peso morto |
| `app/Models/CategoryMember.php` | — | model quase sem uso real (a autorização usa `DB::table` direto) | Peso morto parcial |
| `community_categories.access_level_id` | migration `2026_06_28_000001` | coluna deprecada de propósito (sprint 13), ainda semeada em `2026_06_25_000001:17` | Histórico; sem efeito |
| `community_categories.members_count` | schema | contador nunca atualizado | Dado sempre 0, exposto na API |
| Visibilidades `RESTRICTED`/`PRIVATE` | migrations + `normalizeVisibility` (Angular ×2) | nomes antigos pré-sprint 13 | Defensivo; remover só depois de confirmar dados |
| `CommunityController::storeCategory` | 106-137 | rota admin duplicada de `CommunityCategoryAdminController::store`, com validações **diferentes** (regex de cor vs max:7; url validado vs livre) | Dois contratos para a mesma operação |
| Colunas duplicadas `is_pinned`/`pinned`, `is_featured`/`featured`, `is_accepted`/`best_answer`, `locked`+`status` | migration `2026_07_02_110000` | migração de moderação criou colunas novas sem remover as antigas; sincronização manual espalhada (`TopicService::update` linhas 168-186) | Alta — fonte de divergência de dados (já divergem em `acceptReply`) |
| `DiscussionTopic::interestAreas()` | model, linha 112 | relação para `topic_interest_areas` sem uso no domínio | Verificar; provável resto de planeamento |

---

## 10. Duplicação

1. **Criação de tópico** — `CommunityController::createTopic` vs `TopicService::create` (divergem em defaults, uploads, auditoria).
2. **Todo o fluxo de respostas** — `CommunityController` vs `ReplyService` (divergem em correções importantes).
3. **Join/Leave** — `CommunityController` vs `TopicService`.
4. **Listagem de tópicos** — 3 implementações + `documentTopics` com transformação manual.
5. **Criação de categoria** — `CommunityController::storeCategory` vs `CommunityCategoryAdminController::store` com **validações incompatíveis**.
6. **Montagem de payload** — endpoints públicos serializam models crus (`toArray`) enquanto o admin usa Resources; `documentTopics` monta um terceiro formato à mão.
7. **Frontend Angular** — `community.models.ts` vs `community-admin.models.ts` (tipos duplicados) e `normalizeVisibility()` copiado em `community.service.ts:273` e `community-admin.service.ts:241`.
8. **Autorização admin** — regra "admin pode tudo" existe no middleware `role:admin` **e** em `bypassesChecks()` **e** em checks inline (`$request->user()->role !== 'admin'` em `updateReply`/`destroyReply`, linhas 1423/1483, que ignoram o service).

---

## 11. Performance

| Item | Classificação | Detalhe |
|---|---|---|
| `deleteReplyAndChildren` recursivo | **Médio** | 2 queries por nó da árvore; em tópicos grandes, dezenas de queries numa transação |
| Pesquisa LIKE `%…%` em title/content (longText) | **Médio** | full scan; sem índice full-text |
| `TopicResource` com `replies` completas no admin show | **Baixo/Médio** | sem paginação de respostas |
| `topicReplies` sem paginação (`get()`) | **Baixo/Médio** | devolve todas as respostas do tópico |
| `documentTopics` sem paginação | **Baixo** | volume por documento tende a ser pequeno |
| `resolveTopicForUserOrFail` carrega `members.user.profile` em ações que não precisam (like/follow) | **Baixo** | eager loading a mais, não a menos |
| `isOwner` → `memberRole` e `isModerator` → `memberRole` repetem a mesma query por verificação | **Baixo** | sem memoização por request |
| N+1 clássico em listagens | — | **não encontrado** — eager loading correto nos 3 index |

---

## 12. Testes

**Com cobertura:**

| Alvo | Suite | Nº testes |
|---|---|---|
| `CommunityController` (CRUD tópicos, likes, follows, replies, accept, closed) | `CommunityTest` | 24 |
| Matriz de visibilidade (PUBLIC/CATEGORY/INVITE_ONLY, convites, promoção) | `CommunityHardeningTest` | 5 |
| `TopicAdminController` + `CommunityCategoryAdminController` + join/leave | `CommunityAdminTest` | 15 |
| Tópicos por documento (17.3) | `Sprint173Test` | 6 |
| Notificações de convite/join/remoção | `NotificationTest` | 3 |

**Sem cobertura:**
- Comportamento de **visitante** (rotas `OptionalAuthenticateApiSession`) — nenhum teste garante o que um guest vê em `/topics`.
- Default `visibility=CATEGORY` na criação sem parâmetro (a armadilha da secção 3).
- `updateTopicMember` caminho feliz (PATCH role).
- Conteúdo `hidden`/`flagged` a vazar em `showTopic`/`topicReplies`.
- `storeCategory` (rota legacy `POST /community/categories`).
- `unpin` admin.
- Services do domínio: zero testes unitários (`tests/Unit/Services` não tem nenhum de Community).
- Divergência `is_accepted`/`best_answer` e contagem errada em `destroyReply`.

---

## 13. Frontend Angular

**Páginas públicas:** `pages/forum/community` (lista), `create-topic`, `discussion-thread` (678 linhas), `category-view`, `category-detail`.
**Admin:** `pages/admin/dashboard-admin/pages/community-page` (512 linhas) via `community-admin.service.ts` (endpoints `/admin/*` corretos).

Restos da arquitetura antiga / problemas:

1. `normalizeVisibility` em ambos os services ainda converte `RESTRICTED`→`CATEGORY` e `PRIVATE`→`INVITE_ONLY` — proteção contra dados pré-sprint-13 (manter até migrar dados; depois remover).
2. **Modelos duplicados** (`community.models.ts` / `community-admin.models.ts`).
3. `create-topic` só permite PUBLIC/INVITE_ONLY, mas a **edição** em `discussion-thread` oferece "Por Categoria" — permite pôr um tópico num estado sem gestão possível.
4. `category-detail`/`category-view` tratam categorias como organização pura (sem UI de membros de categoria) — coerente com a sprint 13; não há UI órfã de `category_members`.
5. O admin service não expõe `unpin` (só `pin`, `lock`, `unlock`) apesar de o backend ter `PATCH /admin/topics/{id}/unpin` — verificar como a página alterna o estado de pin.

---

## 14. Mobile (React Native)

Endpoints consumidos (`src/services/api/communityService.ts` + `src/constants/api.ts:61-79`):

```
GET  /community/categories          GET/POST /topics
GET/PATCH/DELETE /topics/{id}       POST/DELETE /topics/{id}/like
POST/DELETE /topics/{id}/follow     GET/POST /topics/{id}/replies
GET/POST /topics/{id}/members       PATCH/DELETE /topics/{id}/members/{user}
POST /topics/{id}/join              POST /topics/{id}/leave
POST/DELETE /replies/{id}/like      (constantes p/ /replies/{id} UPDATE/DELETE/ACCEPT existem mas não são usadas)
```

Riscos de compatibilidade a respeitar numa refatoração:

1. **`GET /topics/{id}/replies`**: o mobile tipa a resposta como `PaginatedResponse` e envia `?page=`, mas o backend devolve `{data: [...]}` sem meta e sem paginação. Funciona por acaso (`data.data ?? data`). Se o backend paginar de verdade, o **web** (que espera array completo) é quem quebra — mudar os dois em conjunto.
2. O mobile envia `visibility` sempre (`PUBLIC`/`INVITE_ONLY`, decidido por `accessLevel === "restricted"` — nomenclatura legada na UI) — mudar o **default** do backend não o afeta.
3. O mobile lê `data.data ?? data` em quase tudo — manter envelope `{data: ...}`.
4. Campos consumidos vêm do model cru (`replies_count`, `is_pinned`, `status`, `visibility`, `members`...) — introduzir Resources públicos exige manter estes nomes (atenção: o model cru expõe `is_pinned` **e** `pinned`; um Resource que só exponha um deles pode quebrar clientes).
5. Filtro `sort` enviado pelo mobile **não é suportado** por `indexTopics` (ignorado silenciosamente hoje; implementá-lo é aditivo).

---

## 15. Swagger

- **Regenerado em 2026-07-02** (`storage/api-docs/api-docs.json`); todos os 37 endpoints de Community têm anotação e operationId — sem endpoints ausentes.
- Inconsistências:
  1. Quase todos os schemas de resposta são `type: object` genérico — não documentam o payload real.
  2. `GET /community/categories`, `GET /topics`, `GET /topics/{id}`, `GET /topics/{id}/replies` documentados com `security` + 401, mas as rotas são agora de **autenticação opcional** (grupo visitante em `routes/api.php:51`). O contrato documentado não reflete o middleware.
  3. `POST /community/categories` (legacy) e `POST /admin/community/categories` documentam a mesma operação com corpos diferentes.
  4. `PATCH /topics/{id}` documenta `status enum {published, draft, archived}` mas a validação real aceita `open,closed,locked,archived,published,draft` (`CommunityController.php:615`).
  5. `indexTopics` não documenta os parameters `search/category_id/status/visibility/per_page`.

---

## 16. Resultado

### Estado Atual (resumo)

O domínio funciona como um fórum com 3 visibilidades por tópico, membros por tópico com roles (owner/moderator/member), likes, follows, respostas em árvore com "resposta aceite", gamificação e notificações síncronas. A autorização real está centralizada em `CommunityAuthorizationService`, chamada diretamente pelo `CommunityController` (rotas públicas) e ausente das rotas admin (que confiam no middleware `role:admin`). A camada admin já segue Controller→Service→Resource; a camada pública é um controller de 1721 linhas com tudo inline.

### Inconsistências críticas (implementação vs. intenção)

1. **Visitantes não veem nada**: as rotas GET de comunidade foram abertas a visitantes (`OptionalAuthenticateApiSession`, commit "Rotas para visitantes"), mas `canViewTopic` devolve `false` para `user=null` e `applyVisibleTopicsFilter` aplica `whereRaw('1=0')` — um visitante recebe lista vazia e 404 até em tópicos `PUBLIC`. (Nota: se um dia `canViewTopic` permitir guests, `showTopic` rebenta em `$request->user()->id` na linha 550.)
2. **CATEGORY é o default mas está abandonado**: default do backend + coluna, sem UI, sem endpoint de gestão de `category_members`, e o próprio service tem um comentário a dizer que já não existe.
3. **Moderação vaza**: conteúdo escondido por reports (`hidden=true` / `status='flagged'`) continua acessível via `showTopic`/`topicReplies`.
4. **Colunas gémeas divergem**: `is_accepted` vs `best_answer` já divergem no fluxo ativo; `pinned` vs `is_pinned` dependem de sincronização manual num service que o fluxo público não usa.
5. **Policy fantasma**: `DiscussionTopicPolicy` registada dá a ilusão de uma camada de autorização que não está no caminho de execução.
6. **Contador errado**: `destroyReply` decrementa 1 ao apagar árvores inteiras.
7. **Convites com duas semânticas** (pendente na criação, auto-aceite no convite posterior).

### Dívida técnica priorizada

| Prioridade | Item |
|---|---|
| 🔴 | Visitantes vs. autorização (decidir: PUBLIC visível a guest ou fechar as rotas) |
| 🔴 | Destino da visibilidade CATEGORY + default de `visibility` |
| 🔴 | Vazamento de conteúdo `hidden`/`flagged` |
| 🔴 | Remoção dos services/resources órfãos (ReplyService, CommunitySearchService, TopicService::create/join/leave, TopicSummaryResource) |
| 🟡 | Unificação `is_accepted`/`best_answer`, `pinned`/`is_pinned`, `featured`/`is_featured`, `locked`/`status` |
| 🟡 | Contador `replies_count` no delete em árvore; `members_count` sempre 0 |
| 🟡 | Extrair a lógica do CommunityController para services reais (ou assumir o controller e apagar os services) |
| 🟡 | Rota dupla de criação de categoria com validações divergentes |
| 🟢 | Resources nos endpoints públicos (com contrato idêntico ao model cru) |
| 🟢 | Schemas Swagger reais; documentar auth opcional |
| 🟢 | Unificar modelos/normalizeVisibility no Angular |

### Recomendações (sem implementar)

1. **Decidir a matriz de visibilidade final primeiro** — tudo o resto depende disto. A julgar pelo comentário no service e pelas UIs, a intenção atual é `PUBLIC` + `INVITE_ONLY`. Isso permitiria: migrar dados `CATEGORY`→`PUBLIC` (ou `INVITE_ONLY` caso a caso), mudar o default, apagar `isCategoryMember`, o branch CATEGORY do filtro, o model `CategoryMember` e, numa fase posterior, a tabela.
2. **Escolher uma única casa para a lógica**: ou o CommunityController delega nos services (aproveitando `ReplyService`, que já tem as versões corrigidas), ou os services órfãos morrem. Não manter as duas cópias.
3. **Pôr a Policy no caminho ou removê-la**: `$this->authorize('view', $topic)` no controller, ou apagar a Policy e assumir o service como única autoridade.
4. **Tratar convites como máquina de estados única** (pendente → aceite) nos dois pontos de entrada.
5. **Congelar o contrato**: antes de introduzir Resources públicos, snapshot dos payloads atuais consumidos por web e mobile (incluindo os campos duplicados) e testes de contrato.

### Plano de refatoração faseado (sem quebra)

Cada etapa é independente, pequena e testável:

- **Etapa 0 — rede de segurança**: testes de contrato para os payloads de `GET /topics`, `GET /topics/{id}`, `GET /topics/{id}/replies`, `GET /topics/{id}/members` como web/mobile os consomem hoje; teste do comportamento de visitante.
- **Etapa 1 — limpeza sem risco** (zero mudança de comportamento): apagar `ReplyService`*, `CommunitySearchService`, `TopicService::create/join/leave`, `TopicSummaryResource`, imports mortos, relações mortas de `CommunityCategory`, cache fantasma. (*antes de apagar, portar para o fluxo ativo as correções que só existem lá: decremento correto e `edited_at`/`edited_by`.)
- **Etapa 2 — correções de dados**: `destroyReply` decrementa a contagem real; `acceptReply` escreve `is_accepted` **e** `best_answer`; filtrar `hidden` em `topicReplies` e `flagged/hidden` em `showTopic` (admin continua a ver).
- **Etapa 3 — visitantes**: `canViewTopic(null, topic)` devolve true para `PUBLIC`; `applyVisibleTopicsFilter` para guest = `visibility='PUBLIC'`; proteger `showTopic`/`topicReplies` contra `user null` nos checks de like. Swagger atualizado. (Aditivo — nenhum cliente autenticado muda.)
- **Etapa 4 — default de visibilidade**: mudar default de `'CATEGORY'` para `'PUBLIC'` na criação (e da coluna). Aditivo e elimina a armadilha.
- **Etapa 5 — migração CATEGORY**: migration de dados (`CATEGORY`→decisão do produto), remover branch CATEGORY do service/filtro, remover `CATEGORY` das validações **mantendo-o aceite** temporariamente (mapear para PUBLIC) para não quebrar clientes antigos; remover botão "Por Categoria" da edição no Angular.
- **Etapa 6 — colunas gémeas**: passar a escrever sempre os dois lados (compat), migrar leituras para um lado só, e numa release posterior dropar as colunas antigas (Resources continuam a expor os dois nomes até web/mobile atualizarem).
- **Etapa 7 — consolidação de estrutura**: extrair `TopicService`/`ReplyService` reais chamados pelo controller; unificar convites; remover `POST /community/categories` legacy (após confirmar que nenhum cliente o usa — o Angular usa o `/admin/...`).
- **Etapa 8 — contrato e documentação**: Resources públicos byte-compatíveis, schemas Swagger reais, unificação dos modelos Angular, remoção de `category_members` e `access_level_id` (última, irreversível, só após etapas 5-7 estarem em produção).
