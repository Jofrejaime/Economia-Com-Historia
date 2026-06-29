# Sprint 15.2 — Refactoração Arquitectural do Domínio de Subscrições

**Data:** 2026-06-29
**Tipo:** Backend only — refactoração, sem novas funcionalidades

---

## Objectivo

Separar responsabilidades no domínio de subscrições de documentos, criando
uma fronteira clara entre autorização (`DocumentAccessService`) e ciclo de vida
de subscrições (`DocumentSubscriptionService`).

---

## Arquitectura Resultante

### Antes (Sprint 15.1)

```
DocumentAccessService
  ├── canReadDocument()
  ├── isSubscriptionRequired()
  ├── applyListingFilter()
  ├── subscribe()           ← negócio misturado
  ├── cancel()              ← negócio misturado
  ├── subscriptionStatus()  ← negócio misturado
  └── (sem reason, sem estados admin)

DocumentSubscriptionController  ← nome impreciso para endpoints admin
```

### Depois (Sprint 15.2)

```
DocumentAccessService           — autorização exclusivamente
  ├── canReadDocument()
  ├── isSubscriptionRequired()
  └── applyListingFilter()

DocumentSubscriptionService     — ciclo de vida exclusivamente
  ├── findById() / findActive() / findPending() / findLatest()
  ├── hasActiveSubscription()
  ├── requestSubscription()     — cria PENDING (nunca ACTIVE)
  ├── cancelSubscription()      — utilizador cancela ACTIVE/PENDING
  ├── approveSubscription()     — admin: PENDING → ACTIVE
  ├── rejectSubscription()      — admin: PENDING → REJECTED
  ├── adminCancelSubscription() — admin: ACTIVE/PENDING → CANCELLED
  ├── subscriptionStatus()      — retorna status + reason + started_at
  └── listSubscriptions()       — listagem admin paginada

AdminDocumentSubscriptionController  ← nome correcto
  ├── index()    GET  /admin/document-subscriptions
  ├── approve()  PATCH /admin/document-subscriptions/{id}/approve
  ├── reject()   PATCH /admin/document-subscriptions/{id}/reject
  └── cancel()   PATCH /admin/document-subscriptions/{id}/cancel
```

---

## Alterações

### Ficheiros criados

| Ficheiro | Descrição |
|---|---|
| `app/Services/DocumentSubscriptionService.php` | Novo serviço de ciclo de vida |
| `app/Http/Controllers/Api/AdminDocumentSubscriptionController.php` | Controller admin renomeado |
| `database/migrations/2026_06_29_000005_sprint15_2_drop_expires_at_from_subscriptions.php` | Remove `expires_at` da tabela |

### Ficheiros modificados

| Ficheiro | Alteração |
|---|---|
| `app/Services/DocumentAccessService.php` | Reescrito — apenas autorização; delega lifecycle ao `DocumentSubscriptionService` |
| `app/Models/DocumentSubscription.php` | Removido `expires_at` de `$fillable`, casts e método `isActive()` |
| `app/Http/Controllers/Api/DocumentController.php` | `subscriptionStatus()` e `subscribe()` delegam ao `$subscriptionService`; removido `expires_at` de request/response; adicionado campo `reason` na resposta do status |
| `routes/api.php` | Import trocado para `AdminDocumentSubscriptionController` |
| `tests/Feature/DocumentSubscriptionTest.php` | Removido `seedExpiredSubscription()`, removido `test_premium_category_document_denied_with_expired_subscription()`, removido `expires_at` de todos os INSERTs e helpers |
| `tests/Feature/DocumentSubscriptionAdminTest.php` | Removido `expires_at` do helper `seedSubscription()` |

### Ficheiros eliminados

| Ficheiro | Motivo |
|---|---|
| `app/Http/Controllers/Api/DocumentSubscriptionController.php` | Substituído por `AdminDocumentSubscriptionController` no mesmo sprint |

---

## Campo `reason` em subscriptionStatus

Novo campo na resposta de `GET /documents/{id}/subscription`:

| `status`    | `reason`                  |
|-------------|---------------------------|
| `null`      | `null`                    |
| `PENDING`   | `WAITING_ADMIN_APPROVAL`  |
| `ACTIVE`    | `ACCESS_GRANTED`          |
| `REJECTED`  | `REQUEST_REJECTED`        |
| `CANCELLED` | `SUBSCRIPTION_CANCELLED`  |

---

## Campo `expires_at` — removido

`expires_at` era dead code desde Sprint 15: utilizadores nunca podiam definir,
admins também não. Removido da tabela, modelo, tests e Swagger.
Re-adicionar quando subscriptions pagas/temporárias forem implementadas.

---

## Validação

```
php artisan test              → 193/196 passed (3 falhas pré-existentes em AuthenticationTest: SSL + verification_token)
php artisan l5-swagger:generate → OK
php artisan optimize:clear    → OK
php artisan migrate --force   → 2026_06_29_000005 applied
```

### Testes de subscrição

```
DocumentSubscriptionTest      → 22/22 passed
DocumentSubscriptionAdminTest → 17/17 passed
Total subscription tests      → 39/39 passed
```

---

## Compatibilidade

- `DocumentAccessTest` (12 testes) — inalterado, verde
- Documentos sem `category.requires_subscription` continuam a usar `access_level_id` / `AccessGateService`
- Swagger actualizado: `reason` adicionado, `expires_at` removido, estados actualizados para PENDING/ACTIVE/REJECTED/CANCELLED
