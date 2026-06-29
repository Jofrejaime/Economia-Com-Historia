# Sprint 15 — Domínio de Subscrição de Documentos

**Data:** 2026-06-29
**Tipo:** Backend only
**Estado:** CONCLUÍDO

---

## 1. Objectivo

Preparar o sistema para o seguinte fluxo:

> Administrador → Cria subscrição → Utilizador acede ao documento

A sprint não implementa pagamentos. "Subscrição" = autorização de acesso a um documento, criada manualmente por admin ou futuramente por um serviço de pagamento.

---

## 2. Arquitectura Implementada

```
DocumentCategory.requires_subscription
  └── false → acesso livre (+ verificação legada access_level_id)
  └── true  → DocumentSubscription(status=ACTIVE)? → permitir | 403 SUBSCRIPTION_REQUIRED
```

### Fluxo de autorização (DocumentAccessService.canReadDocument)

1. Admin → sempre autorizado
2. Criador do documento → sempre autorizado
3. Categoria com `requires_subscription=true` → verifica `DocumentSubscription(ACTIVE, não expirada)`
4. Outros documentos (legado) → verifica `access_level_id` via `AccessGateService`

---

## 3. Ficheiros Criados

| Ficheiro | Descrição |
|---|---|
| `database/migrations/2026_06_29_000002_sprint15_add_requires_subscription_to_categories.php` | Adiciona `requires_subscription BOOLEAN DEFAULT FALSE` à tabela `document_categories` |
| `database/migrations/2026_06_29_000003_sprint15_create_document_subscriptions.php` | Cria tabela `document_subscriptions` |
| `app/Models/DocumentSubscription.php` | Modelo Eloquent com HasUuids, cast de datas, relações user/document |
| `app/Services/DocumentAccessService.php` | Serviço autoritativo de acesso a documentos |
| `tests/Feature/DocumentSubscriptionTest.php` | 18 testes cobrindo todos os cenários |

## 4. Ficheiros Modificados

| Ficheiro | Alteração |
|---|---|
| `app/Models/DocumentCategory.php` | Adicionado `requires_subscription` ao `$fillable` e cast `boolean` |
| `app/Http/Controllers/Api/DocumentController.php` | Substituído `AccessGateService` por `DocumentAccessService`; removido `denyUnlessCanAccessDocument()`; adicionados `subscriptionStatus()`, `subscribe()`, `cancelSubscription()` |
| `routes/api.php` | Adicionadas 3 rotas de subscrição |
| `pendencia.md` | Adicionada secção "Domínio de Subscrições de Documentos" |

---

## 5. Tabela `document_subscriptions`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Identificador |
| `user_id` | UUID FK users | Utilizador subscrito |
| `document_id` | UUID FK documents | Documento subscrito |
| `status` | VARCHAR(20) | `ACTIVE` \| `EXPIRED` \| `CANCELLED` |
| `started_at` | DATETIME | Início da subscrição |
| `expires_at` | DATETIME NULL | Expiração (NULL = permanente) |
| `created_at` | TIMESTAMP | — |
| `updated_at` | TIMESTAMP | — |

Índices: `idx_doc_subs_status`, `idx_doc_subs_user_doc`.

---

## 6. API — Novos Endpoints

### `GET /documents/{id}/subscription`

Retorna o estado de subscrição do utilizador autenticado para o documento.

```json
{ "required": true, "status": "ACTIVE", "started_at": "...", "expires_at": null }
```

### `POST /documents/{id}/subscribe`

Cria uma subscrição para o utilizador autenticado. Admin pode passar `user_id` para criar para outro utilizador. Se já existir uma subscrição ACTIVE, retorna 200; caso contrário 201.

```json
// Request (admin, opcional):
{ "user_id": "uuid", "expires_at": "2027-01-01T00:00:00Z" }

// Response 201:
{ "message": "Subscription created.", "id": "uuid" }
```

### `DELETE /documents/{id}/subscription`

Cancela a subscrição ACTIVE do utilizador autenticado.

```json
{ "message": "Subscription cancelled." }
```

### 403 atualizado

Para documentos com `requires_subscription=true`:

```json
{
  "message": "You do not have access to this content.",
  "subscription_required": true,
  "required_access_level_id": null
}
```

Para documentos com `access_level_id` restrito (legado):

```json
{
  "message": "You do not have access to this content.",
  "subscription_required": false,
  "required_access_level_id": "jindungo"
}
```

---

## 7. DocumentAccessService — Métodos Públicos

| Método | Descrição |
|---|---|
| `canReadDocument(User, Document)` | Verificação autoritativa de acesso |
| `isSubscriptionRequired(Document)` | Verifica se a categoria exige subscrição |
| `hasActiveSubscription(userId, documentId)` | Verifica subscrição ACTIVE não expirada |
| `subscriptionStatus(userId, documentId)` | Retorna estado completo (auto-expira se necessário) |
| `subscribe(userId, documentId, expiresAt?)` | Cria ou confirma subscrição |
| `cancel(userId, documentId)` | Cancela subscrição ACTIVE |
| `applyListingFilter(Builder, User, alias)` | Filtro de listagem (substitui applyDocumentVisibilityFilter) |

---

## 8. Compatibilidade com Testes Existentes

A `DocumentAccessService::canReadDocument()` inclui uma camada de compatibilidade:

- Documentos sem categoria com `requires_subscription` → caminho legado (`access_level_id` + `AccessGateService`)
- Todos os 12 testes de `DocumentAccessTest` continuam a passar sem modificações

---

## 9. Testes Executados

```
php artisan test --filter="DocumentSubscriptionTest"
  → 18/18 passam ✅

php artisan test --filter="DocumentAccessTest|DocumentFavoritesTest|DocumentLikeGamificationTest"
  → 12/12 passam ✅

php artisan test (suite completa)
  → 178 testes
  → 172 passaram ✅
  → 3 falharam ⚠️ (pré-existentes, AuthenticationTest — SSL/pwnedpasswords)

php artisan l5-swagger:generate → ✅
php artisan optimize:clear → ✅
```

---

## 10. Cenários Testados

| # | Cenário | Resultado |
|---|---|---|
| 1 | Documento em categoria free → acessível sem subscrição | ✅ |
| 2 | Documento em categoria premium → 403 sem subscrição | ✅ |
| 3 | Documento em categoria premium → 200 com subscrição ACTIVE | ✅ |
| 4 | Documento em categoria premium → 403 com subscrição EXPIRADA | ✅ |
| 5 | Documento em categoria premium → 403 com subscrição CANCELLED | ✅ |
| 6 | Admin acede sempre a documento premium | ✅ |
| 7 | Utilizador subscreve documento (POST /subscribe → 201) | ✅ |
| 8 | Subscrição dupla → 200 "already active" | ✅ |
| 9 | Admin cria subscrição para outro utilizador | ✅ |
| 10 | Utilizador cancela subscrição (DELETE /subscription → 200) | ✅ |
| 11 | Cancel sem subscrição → 404 | ✅ |
| 12 | Status endpoint: categoria free → required=false | ✅ |
| 13 | Status endpoint: categoria premium sem sub → required=true, status=null | ✅ |
| 14 | Status endpoint: categoria premium com sub → required=true, status=ACTIVE | ✅ |
| 15 | Listagem: documentos free aparecem | ✅ |
| 16 | Listagem: documentos premium ocultados sem sub | ✅ |
| 17 | Listagem: documentos premium visíveis com sub | ✅ |
| 18 | Listagem: admin vê todos os documentos | ✅ |

---

## 11. Limitações / Próximas Sprints

- `POST /subscribe` cria subscrição para o próprio utilizador — qualquer autenticado pode usar. Quando integrado com pagamentos, adicionar verificação de pagamento concluído antes de criar a subscrição.
- Expiração automática na base de dados: ocorre apenas quando `subscriptionStatus()` é chamado. Para expiração batch, criar um comando Artisan (`artisan subscriptions:expire`) a correr em cron.
- Não existe endpoint de admin para listar subscrições de um utilizador — implementar em sprint dedicada.
