# Auditoria Completa da API — Julho 2026

**Data:** 2026-07-01
**Escopo:** Backend Laravel completo — `routes/api.php`, todos os Controllers em `app/Http/Controllers/Api/`, Models, Services, Migrations.
**Metodologia:** Leitura direta de todas as migrations (23 ficheiros) para reconstruir o schema real da base de dados, leitura de `routes/api.php` (84+ endpoints), e revisão de código de cada controller/service cruzando com o schema real. Os achados abaixo foram todos confirmados lendo o código-fonte — nenhum é especulativo.

Este documento substitui os anteriores (`docs/API_AUDIT.md`, `docs/AUDITORIA-API-SPRINT6-2026-06-05.md`, `docs/AUDITORIA-API-LARAVEL.md`), que estão desatualizados (referem-se a um estado do projeto anterior às Sprints 13–17: comunidade com escrita, subscrições de documentos, badges, admin panel, etc., que entretanto foram implementados). Ficam mantidos apenas como histórico.

---

## Resumo executivo

| Severidade | Nº de achados |
|---|---|
| Crítico | 4 |
| Alto | 8 |
| Médio | 6 |
| Baixo | 5 |

Os dois problemas mais graves são de **lógica de negócio**, não de segurança pontual:

1. A visibilidade **padrão** de tópicos da comunidade (`CATEGORY`) depende de uma tabela (`category_members`) para a qual **não existe nenhum endpoint de adesão** — ou seja, qualquer tópico criado sem `visibility: "PUBLIC"` explícito fica invisível para todos exceto o autor e admins.
2. Uma chamada errada de `sendTopicInvitation()` na criação de tópicos privados envia notificações com o **UUID do tópico no lugar do nome de quem convidou**, e nunca associa a notificação ao tópico (perde-se o deep-link).

---

## 🔴 Crítico

### C1. Tópicos com visibilidade `CATEGORY` (o valor por omissão) ficam invisíveis para todos os utilizadores normais

- **Ficheiros:** `backend/app/Services/CommunityAuthorizationService.php:193-207` (`isCategoryMember`), `backend/app/Http/Controllers/Api/CommunityController.php:269` (`$visibility = $validated['visibility'] ?? 'CATEGORY';`)
- **Problema:** Quando um tópico tem `visibility = 'CATEGORY'` (o valor por omissão, tanto no controller como no default da coluna na migration `2026_06_28_000001_sprint13_rename_topic_visibility_values.php`), o acesso de leitura/resposta exige que o utilizador seja membro de `category_members` (`isCategoryMember()`). Uma pesquisa em todo o `app/` (`grep "CategoryMember::"`) confirma que **não existe nenhuma rota, controller ou serviço que insira linhas em `category_members`** — a tabela só é lida, nunca escrita pela aplicação.
- **Cenário de falha:** Um utilizador cria um tópico via `POST /topics` sem indicar `visibility` (o caso mais comum). O tópico fica com `visibility='CATEGORY'`. Qualquer outro utilizador que tente `GET /topics/{id}` recebe **404 "Topic not found"** (via `resolveTopicForUserOrFail`), mesmo estando autenticado e mesmo a categoria sendo pública — porque nunca poderá ser inserido em `category_members`. Na prática, o fórum de comunidade só funciona se todos os tópicos forem criados com `visibility: "PUBLIC"` explícito, o que provavelmente não é o comportamento pretendido pelo default do schema.
- **Correção sugerida:** ou (a) criar um endpoint `POST /community/categories/{id}/join` que insira em `category_members`, ou (b) mudar o default de `visibility` para `'PUBLIC'` se a intenção é que category seja apenas organizacional.

### C2. `sendTopicInvitation()` chamado com argumentos errados ao criar tópico privado

- **Ficheiro:** `backend/app/Http/Controllers/Api/CommunityController.php:355`
- **Assinatura real:** `NotificationService.php:45` — `sendTopicInvitation(User $user, string $topicTitle, string $inviterName, ?string $referenceId = null)`
- **Problema:** Em `storeTopic()`, a chamada é `$this->notificationService->sendTopicInvitation($member, $topic->title, $topic->id);` — o terceiro argumento (posicionalmente `$inviterName`, tipo `string`, obrigatório) recebe **`$topic->id`** (um UUID) em vez do nome de quem convidou, e o quarto argumento (`$referenceId`, usado para o deep-link da notificação) **nunca é passado**, ficando sempre `null`.
- **Contraste:** A chamada equivalente em `storeTopicMember()` (linha 673-678) está correta: `sendTopicInvitation($targetUser, $topic->title, $request->user()->display_name, $topic->id)`.
- **Cenário de falha:** Ao criar um tópico `INVITE_ONLY` já com membros convidados no payload inicial (`POST /topics` com `members`), os convidados recebem uma notificação com o texto **"\<uuid-do-tópico\> convidou-te para participar do fórum..."** em vez do nome real do autor, e a notificação fica sem `reference_id`, pelo que o frontend não consegue redirecionar para o tópico ao clicar nela.

### C3. `GET /reports/{id}` não tem nenhum controlo de autorização (IDOR)

- **Ficheiro:** `backend/app/Http/Controllers/Api/ReportController.php:208-217`
- **Problema:** O método `show()` faz apenas `DB::table('content_reports')->where('id', $id)->first()` e devolve o resultado — sem comparar `reporter_id` com o utilizador autenticado nem exigir role `admin`. Confirmado em `routes/api.php`: a rota `GET /reports/{id}` está no bloco genérico "Autenticado (Qualquer)", **fora** do `Route::middleware('role:admin')` que protege `PATCH /reports/{id}` e `POST /reports/{id}/action`.
- **Cenário de falha:** Qualquer utilizador autenticado que descubra/enumere um UUID de denúncia (ex.: sequência previsível em logs, ou força bruta lenta) consegue ler os detalhes de **qualquer denúncia de qualquer pessoa**, incluindo denúncias sobre si próprio (`content_type = 'user'`), o motivo, a descrição e (após revisão) `action_taken`. Fuga de dados de moderação.
- **Correção sugerida:** restringir a `reporter_id === $request->user()->id || $request->user()->role === 'admin'`, devolvendo 404 (não 403, para não confirmar a existência do registo) nos restantes casos.

### C4. Escrita direta de `user_access_grants.is_active`, contornando o contrato dos triggers da BD

- **Ficheiro:** `backend/app/Http/Controllers/Api/AccessController.php:375-385` (`reviewRequest`), `:517-530` (`revokeGrant`)
- **Problema:** `is_active` é gerido pelos triggers MySQL `trg_access_grants_before_insert`/`trg_access_grants_before_update` (migration `2026_05_28_000002_create_access_and_gamification_tables.php:70-96`), que recalculam o valor a partir de `revoked_at`/`expires_at`. O controller escreve `is_active` diretamente nestas duas rotas. Hoje o valor coincide com o que o trigger recalcularia, mas o padrão é frágil: se a lógica do trigger mudar, o comportamento diverge silenciosamente, e `revokeGrant` não é idempotente (revogar duas vezes reescreve `revoked_at` sem aviso, mascarando quando a revogação "real" aconteceu) nem envia notificação ao utilizador afetado (inconsistente com `reviewRequest`, que notifica sempre).
- **Correção sugerida:** parar de escrever `is_active` explicitamente (deixar o trigger decidir), verificar se o grant já está revogado antes de reescrever, e notificar o utilizador em `revokeGrant`.

---

## 🟠 Alto

### A1. `DELETE /admin/users/{id}` pode devolver 500 não tratado por violação de FK

- **Ficheiro:** `backend/app/Http/Controllers/Api/AdminController.php:159-174`
- **Problema:** `user_access_requests.reviewed_by` e `user_access_grants.granted_by` têm `->constrained('users')` **sem** `cascadeOnDelete()` (migration `2026_05_28_000002...`). Se o utilizador a apagar já reviu pedidos de acesso de outros ou concedeu grants, o `DELETE` falha com `SQLSTATE[23000]: Integrity constraint violation`, que sobe como exceção 500 não tratada em vez de um 409/422 com mensagem clara.
- **Cenário de falha:** Um admin que já aprovou pedidos de acesso de estudantes é, mais tarde, apagado por outro admin — a operação falha com um erro genérico do servidor.

### A2. `PATCH /admin/users/{id}` permite auto-despromoção/desativação sem proteção

- **Ficheiro:** `backend/app/Http/Controllers/Api/AdminController.php:102-124`
- **Problema:** `deleteUser` bloqueia explicitamente `$request->user()->id === $id`; `updateUser` não tem a mesma proteção. Um admin pode alterar o seu próprio `role` para `estudante` ou `is_active=false` via este endpoint.
- **Cenário de falha:** `PATCH /admin/users/{próprio_id}` com `{"role":"estudante","is_active":false}` — sucesso imediato, podendo bloquear toda a administração se for o único admin ativo.

### A3. Quizzes em rascunho (`status='draft'`) são acessíveis via ID direto

- **Ficheiro:** `backend/app/Http/Controllers/Api/QuizController.php:507-520` (`checkQuizAccess`), usado em `show()` (:162-170) e `questions()` (:309-315)
- **Problema:** `index()` filtra `where('status', 'published')`, mas `checkQuizAccess()` só valida `access_level_id` — nunca `status`. Ao contrário de `DocumentController::show()`, que explicitamente bloqueia documentos não publicados para não-autores/não-admins.
- **Cenário de falha:** Um professor cria um quiz em rascunho (ainda incompleto/não revisto); qualquer utilizador que descubra o UUID (ex.: via `Referer` header, cache do browser, ou simplesmente sequência de testes) consegue ver o quiz e as perguntas (as respostas corretas continuam ocultas para não-admins, mas o conteúdo do quiz em si vaza antes da publicação).

### A4. Perguntas de quiz podem ser guardadas sem nenhuma opção correta

- **Ficheiros:** `backend/app/Http/Controllers/Api/QuizController.php:64-160` (`store`), `:172-283` (`update`)
- **Problema:** A validação de `questions.*.options.*.is_correct` exige apenas `boolean`; não há nenhuma regra a garantir que pelo menos uma opção por pergunta tenha `is_correct = true`.
- **Cenário de falha:** Um admin submete uma pergunta com todas as opções `is_correct: false` (erro humano de digitação) — a pergunta é guardada sem erro, tornando-se impossível de responder corretamente, o que distorce `quiz_attempts.score`/`avg_score` para todos os utilizadores que a respondem.

### A5. `quizzes.published_at` nunca é definido — coluna sempre `NULL`

- **Ficheiros:** `backend/app/Http/Controllers/Api/QuizController.php:104-111` (`store`), `:215-219` (`update`)
- **Problema:** Ao contrário de `DocumentController::update()` (linha 533-536), que define `published_at`/`reviewed_by` quando o status muda para `published`, o `QuizController` nunca atribui `published_at` em nenhum dos dois métodos, apesar de a coluna existir e ter um índice dedicado (nenhum) e ser referenciada na documentação OpenAPI de `relatedQuizzes` (`sort_by=published_at`).
- **Cenário de falha:** Ordenar quizzes relacionados por `published_at` (`GET /documents/{id}/quizzes?sort_by=published_at`) não produz nenhuma ordenação útil, porque todos os valores são `NULL`.

### A6. `DocumentController::destroy()` não remove ficheiros associados

- **Ficheiro:** `backend/app/Http/Controllers/Api/DocumentController.php:565-576`
- **Problema:** Apaga apenas a linha da BD (`$document->delete()`); `cover_image_url`, `pdf_url` e `media_url` apontam para ficheiros em storage que nunca são removidos.
- **Cenário de falha:** Eliminar repetidamente documentos com PDFs/imagens grandes acumula ficheiros órfãos indefinidamente no storage, sem forma de limpeza automática.

### A7. Modelos `AccessGrant` e `AccessRequest` sem `$timestamps` ajustado — bug latente

- **Ficheiros:** `backend/app/Models/AccessGrant.php`, `backend/app/Models/AccessRequest.php`
- **Problema:** `user_access_grants` não tem colunas `created_at`/`updated_at` (só `granted_at`/`expires_at`/`revoked_at`); `user_access_requests` só tem `created_at`, sem `updated_at`. Nenhum dos dois models declara `public $timestamps = false;` nem ajusta `const UPDATED_AT`. Como ambos estendem `Model` (default `$timestamps = true`), qualquer `AccessGrant::create()`/`->save()` ou `AccessRequest::create()`/`->save()` tentaria escrever `updated_at` (e `created_at`, no caso de `AccessGrant`) em colunas inexistentes, resultando em `SQLSTATE[42S22]: Column not found`.
- **Por que ainda não rebentou:** confirmado por grep (`AccessGrant::`, `AccessRequest::`) que hoje **nenhum controller usa estes models para escrever** — `AccessController` usa exclusivamente `DB::table(...)` (query builder puro), que não tem este problema. Mas ambos usam `HasFactory`, pelo que testes/seeders que chamem `AccessGrant::factory()->create()` ou `AccessRequest::factory()->create()` vão falhar.
- **Correção sugerida:** adicionar `public $timestamps = false;` a `AccessGrant`, e em `AccessRequest` desativar apenas `UPDATED_AT` (`const UPDATED_AT = null;`) mantendo `CREATED_AT`.

### A8. `ProfileController::updateAvatar` tem condição de corrida na substituição de ficheiro

- **Ficheiro:** `backend/app/Http/Controllers/Api/ProfileController.php:182-218`
- **Problema:** Duas requisições concorrentes de upload de avatar do mesmo utilizador leem o mesmo `avatar_url` antigo, ambas apagam o mesmo ficheiro e a gravação final em `user_profiles.avatar_url` fica indeterminada (não há lock nem `DB::transaction`).
- **Cenário de falha:** Upload duplo acidental (duplo-clique, dois separadores) pode deixar o utilizador sem avatar ou com uma referência inconsistente.

---

## 🟡 Médio

### M1. Criação de tags tem condição de corrida (check-then-insert)

- **Ficheiro:** `backend/app/Http/Controllers/Api/DocumentController.php:459-478` (`store`)
- **Problema:** Para cada tag nova, verifica se já existe por `slug` e, se não, insere — sem lock nem `firstOrCreate` atómico. `tags.name`/`tags.slug` têm `UNIQUE`.
- **Cenário de falha:** Dois documentos criados quase simultaneamente com uma tag nova igual (ex.: "Angola") disparam dois `INSERT` concorrentes; o segundo falha com `Duplicate entry` (IntegrityConstraintViolation), não tratada → 500 em vez de reaproveitar a tag existente.

### M2. `DocumentController::update()` não valida ownership entre professores

- **Ficheiro:** `backend/app/Http/Controllers/Api/DocumentController.php:513-546`
- **Problema:** A rota exige role `admin,professor`, mas o método não verifica se o documento pertence ao professor autenticado — qualquer professor pode editar/publicar documentos criados por outro professor, incluindo auto-atribuir-se como `reviewed_by` ao publicar (linha 533-536).
- **Impacto:** Pode ser intencional (professores como equipa editorial confiável), mas quebra a separação "quem revê não é quem escreveu" implícita na existência do campo `reviewed_by`.

### M3. `document_views` não é deduplicado — `views_count` inflaciona-se com reloads

- **Ficheiro:** `backend/app/Http/Controllers/Api/DocumentController.php:341-393` (`show`)
- **Problema:** Cada chamada a `GET /documents/{id}` insere uma linha em `document_views` e incrementa `views_count`, sem verificar se o mesmo utilizador já visualizou recentemente — ao contrário de `like`/`favorite`, que verificam duplicados.
- **Impacto:** `views_count` não reflete visualizações únicas, distorcendo qualquer ranking/ordenação por popularidade (`sort=popular`).

### M4. `quiz_documents` usa `VARCHAR(255)` em vez do padrão `CHAR(36)` do resto do schema

- **Ficheiro:** `backend/database/migrations/2026_06_26_000003_create_quiz_documents_table.php:11-12`
- **Problema:** `quiz_id`/`document_id` foram declaradas com `$table->string(...)` em vez de `foreignUuid(...)`, ao contrário de todas as outras FKs do schema (que usam `CHAR(36)`). As FKs foram adicionadas só numa migration posterior (sprint17). Funciona porque `VARCHAR(255)` e `CHAR(36)` são tipos de string compatíveis no MySQL, mas é uma inconsistência de estilo que aumenta o footprint dos índices sem necessidade.
- **Nota:** replicado com comentário explicativo no novo `Economia_Com_Historia_MySQL.sql` gerado nesta auditoria.

### M5. Respostas JSON inconsistentes entre controllers

- **Ficheiros:** `AccessController.php` (`requests()`, `grants()`) devolve linhas SQL "achatadas" com prefixos (`access_level_name`, `user_display_name`), enquanto `AuthController::me()` devolve objetos aninhados (`profile`, `access_grants`, `badges`), e `AdminController`/`BadgeController` remapeiam manualmente para arrays. Não existe um padrão de serialização (Resource/Presenter) consistente entre módulos.
- **Impacto:** Aumenta o risco de o frontend ter de lidar com formatos diferentes por endpoint, e dificulta mudanças futuras no schema sem quebrar contratos implícitos.

### M6. `AdminController::updateUser` exige todos os campos mesmo sendo `PATCH`

- **Ficheiro:** `backend/app/Http/Controllers/Api/AdminController.php:110-124`
- **Problema:** `email`, `role`, `email_verified`, `is_active`, `display_name` são todos `required` na validação de um endpoint `PATCH` (semântica de atualização parcial).
- **Cenário de falha:** Um admin que só quer mudar o `role` de um utilizador (`PATCH {"role":"professor"}`) recebe 422 por faltarem os restantes campos.

---

## 🟢 Baixo

### B1. `AccessController::storeRequest` tem lógica condicional morta

- **Ficheiro:** `backend/app/Http/Controllers/Api/AccessController.php:208` (aprox.)
- **Problema:** `'reviewed_by' => $status === 'approved' ? null : null` — ambos os ramos do ternário são `null`, sugerindo uma lógica pretendida (mas não implementada) que nunca teve efeito.

### B2. `Badge::create()` grava `created_at` manualmente sem efeito

- **Ficheiro:** `backend/app/Http/Controllers/Api/BadgeController.php` (`store`)
- **Problema:** `created_at` é passado explicitamente, mas não está em `$fillable` do model `Badge` — é descartado silenciosamente por proteção de mass-assignment, confiando (por acidente, não por design) no `useCurrent()` da coluna na BD.

### B3. Promoção a `admin` sem registo de auditoria dedicado

- **Ficheiro:** `backend/app/Http/Controllers/Api/AdminController.php:14`
- **Problema:** `USER_ROLES` inclui `'admin'` como valor atribuível via `updateUser`, sem nenhum log de "quem promoveu quem", ao contrário de `user_access_grants` que regista `granted_by`.

### B4. `ReportController::action()` interpola campo nullable na mensagem

- **Ficheiro:** `backend/app/Http/Controllers/Api/ReportController.php:381`
- **Problema:** `"Action taken: {$validated['action']}. Reason: {$validated['reason']}"` — `reason` é `nullable`; se omitido, a mensagem grava literalmente a string vazia interpolada de `null` (PHP 8.1+ emite deprecation notice para interpolação de `null` em contexto de string).

### B5. Documentos de auditoria antigos desatualizados ainda no repositório

- **Ficheiros:** `docs/API_AUDIT.md`, `docs/AUDITORIA-API-SPRINT6-2026-06-05.md`, `docs/AUDITORIA-API-LARAVEL.md`
- **Problema:** Descrevem um estado do projeto anterior às Sprints 13–17 (comunidade sem escrita, sem subscrições, sem badges/admin panel) — mantidos apenas como histórico; qualquer leitura futura destes ficheiros sem esta ressalva pode induzir em erro sobre o estado real da API.

---

## Script MySQL

Foi gerado `backend/database/Economia_Com_Historia_MySQL.sql`, um dump DDL fiel ao estado atual de **todas** as migrations (`0001_01_01_000000_create_users_table.php` até `2026_06_30_000001_sprint17_add_fk_to_quiz_documents.php`), incluindo:

- Todas as 38 tabelas de domínio + 5 tabelas de infraestrutura Laravel (`cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`).
- Os 2 triggers de `user_access_grants` (`trg_access_grants_before_insert/update`).
- A view `province_stats` e a stored procedure `sp_refresh_leaderboard_nacional`.
- Os dados seed embutidos nas próprias migrations (`access_levels`, categoria "Sala Privada").
- Comentários inline documentando os valores de enum válidos (aplicados só em PHP, sem CHECK constraints — fiel à realidade do schema) e as duas inconsistências conhecidas (`quiz_documents` tipado como `VARCHAR` e `community_categories.access_level_id` ignorado desde a Sprint 13).

**Principais diferenças face ao ficheiro anterior** (que era uma conversão conceptual de PostgreSQL, desatualizada):
- Adicionadas as tabelas `document_subscriptions`, `quiz_documents`, `discussion_topic_members` (inexistentes no ficheiro antigo).
- Adicionadas as colunas `documents.media_type`, `documents.media_url`, `documents.is_pinned`, `document_categories.requires_subscription`, `discussion_topics.visibility`.
- Removido o `CHECK (role IN (...))` em `users` que nunca existiu nas migrations reais (a validação de `role` é feita exclusivamente em PHP — `AuthController`/`AdminController`).
- `community_categories.access_level_id` passa a `NULL`able (reflete a Sprint 13 — coluna mantida só por compatibilidade histórica).

---

## Recomendações prioritárias

1. Resolver **C1** primeiro — sem isto, a funcionalidade de comunidade está efetivamente quebrada para o fluxo padrão.
2. Corrigir **C2** (argumentos trocados) — fix de uma linha, alto impacto na experiência de convite.
3. Adicionar o controlo de autorização em falta em **C3** (`ReportController::show`).
4. Rever **C4** e parar de escrever `is_active` manualmente, confiando nos triggers.
5. Tratar **A1** (FK sem cascade em `reviewed_by`/`granted_by`) com um handler de exceção dedicado ou `try/catch` explícito no `AdminController::deleteUser`.
6. Adicionar auto-proteção em **A2**, análoga à já existente em `deleteUser`.
