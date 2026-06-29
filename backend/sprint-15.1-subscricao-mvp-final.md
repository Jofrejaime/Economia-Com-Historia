# Sprint 15.1 — Domínio de Subscrições (MVP Final)

**Data:** 2026-06-29
**Tipo:** Backend only
**Estado:** CONCLUÍDO

---

## 1. Auditoria

### 1.1 Ficheiros encontrados (Sprint 15 — estado anterior)

| Ficheiro | Estado encontrado |
|---|---|
| `app/Services/DocumentAccessService.php` | `subscribe()` criava ACTIVE directamente — **ERRADO** |
| `app/Services/DocumentAccessService.php` | `cancel()` só cancelava ACTIVE — incompleto |
| `app/Services/DocumentAccessService.php` | `subscriptionStatus()` tinha lógica de auto-expiração para EXPIRED — **REMOVER** |
| `app/Http/Controllers/Api/DocumentController.php` | Mensagem "Subscription created." — **ERRADO** |
| `tests/Feature/DocumentSubscriptionTest.php` | 3 testes com mensagens ou status errados |
| — | Endpoints admin em falta |
| — | `DocumentSubscriptionController` em falta |
| — | Status `REJECTED` e `PENDING` sem suporte |

### 1.2 Inconsistências

| ID | Problema | Decisão |
|---|---|---|
| IC-1 | `subscribe()` criava ACTIVE sem aprovação | Corrigido: cria PENDING |
| IC-2 | Status `EXPIRED` na lógica de `subscriptionStatus()` | Removido: fora do MVP |
| IC-3 | `cancel()` não cancelava PENDING | Corrigido: cancela ACTIVE e PENDING |
| IC-4 | Não existiam endpoints admin | Implementado: approve/reject/cancel/list |
| IC-5 | Default da coluna `status` era 'ACTIVE' | Migração: default alterado para 'PENDING' |
| IC-6 | Status `REJECTED` nunca usado | Implementado: transição PENDING → REJECTED |

---

## 2. Implementação

### 2.1 Ficheiros criados

| Ficheiro | Descrição |
|---|---|
| `database/migrations/2026_06_29_000004_sprint15_1_update_subscription_status_default.php` | Default da coluna `status` de 'ACTIVE' para 'PENDING' |
| `app/Http/Controllers/Api/DocumentSubscriptionController.php` | Controller admin: index, approve, reject, cancel |
| `tests/Feature/DocumentSubscriptionAdminTest.php` | 16 testes admin + fluxo completo |

### 2.2 Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `app/Services/DocumentAccessService.php` | `subscribe()` reescrito — PENDING; `cancel()` também cancela PENDING; `subscriptionStatus()` sem auto-expire; adicionados `approve()`, `reject()`, `adminCancel()` |
| `app/Http/Controllers/Api/DocumentController.php` | Resposta do `subscribe()` com mensagens correctas por estado |
| `routes/api.php` | 4 rotas admin + import `DocumentSubscriptionController` |
| `tests/Feature/DocumentSubscriptionTest.php` | 3 testes corrigidos + 7 novos testes de estado |

---

## 3. Arquitectura Final

### 3.1 Estados oficiais

```
PENDING   — pedido feito pelo utilizador, aguarda aprovação
ACTIVE    — aprovado pelo admin, acesso permitido
REJECTED  — rejeitado pelo admin, sem acesso
CANCELLED — cancelado pelo utilizador ou admin, sem acesso
```

Estados **removidos**: `EXPIRED`, `PAUSED`, `SUSPENDED` — fora do MVP.

### 3.2 Máquina de estados

```
[Sem subscrição]
       │
       ▼ POST /documents/{id}/subscribe
    PENDING
    ├── PATCH /admin/.../approve ──► ACTIVE   (acesso concedido)
    ├── PATCH /admin/.../reject  ──► REJECTED (sem acesso, pode re-pedir)
    └── DELETE /documents/{id}/subscription ──► CANCELLED (pode re-pedir)

    ACTIVE
    └── PATCH /admin/.../cancel  ──► CANCELLED

    REJECTED → pode fazer novo PENDING
    CANCELLED → pode fazer novo PENDING
```

### 3.3 Endpoints — Utilizador

| Método | Path | Comportamento |
|---|---|---|
| `GET` | `/documents/{id}/subscription` | Estado da subscrição do utilizador |
| `POST` | `/documents/{id}/subscribe` | Cria PENDING (nunca ACTIVE) |
| `DELETE` | `/documents/{id}/subscription` | Cancela ACTIVE ou PENDING |

**Respostas do POST:**
- ACTIVE já existe → 200 "Already subscribed."
- PENDING já existe → 200 "Subscription request already pending."
- REJECTED ou CANCELLED → 201 "Subscription request created."
- Sem subscrição → 201 "Subscription request created."

### 3.4 Endpoints — Administrador

| Método | Path | Transição |
|---|---|---|
| `GET` | `/admin/document-subscriptions` | Lista com filtros status/document_id/user_id |
| `PATCH` | `/admin/document-subscriptions/{id}/approve` | PENDING → ACTIVE |
| `PATCH` | `/admin/document-subscriptions/{id}/reject` | PENDING → REJECTED |
| `PATCH` | `/admin/document-subscriptions/{id}/cancel` | ACTIVE ou PENDING → CANCELLED |

### 3.5 Regras de autorização

```
DocumentAccessService.canReadDocument():
  1. Admin                          → sempre AUTORIZADO
  2. Criador do documento           → sempre AUTORIZADO
  3. Categoria.requires_subscription=true
     └── subscription.status=ACTIVE (e expires_at válido) → AUTORIZADO
     └── PENDING / REJECTED / CANCELLED                    → 403
  4. (Legacy) access_level_id check via AccessGateService  → compatibilidade
```

### 3.6 Regra de segurança

> O utilizador **nunca** consegue colocar uma subscrição no estado ACTIVE.
> Apenas o administrador, através de `PATCH /admin/document-subscriptions/{id}/approve`, consegue fazer a transição PENDING → ACTIVE.

---

## 4. Testes

### 4.1 Executados

```
php artisan test --filter="DocumentSubscriptionTest|DocumentSubscriptionAdminTest"
  → 40/40 passam ✅

php artisan test --filter="DocumentAccessTest|DocumentFavoritesTest|DocumentLikeGamificationTest"
  → 12/12 passam ✅

php artisan test (suite completa)
  → 200 testes
  → 194 passaram ✅
  → 3 falharam ⚠️ (pré-existentes, AuthenticationTest — SSL/pwnedpasswords Windows)

php artisan l5-swagger:generate → ✅
php artisan optimize:clear → ✅
```

### 4.2 Cenários testados

| # | Cenário | Estado |
|---|---|---|
| 1 | POST /subscribe → cria PENDING (não ACTIVE) | ✅ |
| 2 | POST /subscribe com ACTIVE existente → 200 "Already subscribed." | ✅ |
| 3 | POST /subscribe com PENDING existente → 200 "Subscription request already pending." | ✅ |
| 4 | POST /subscribe com REJECTED → cria novo PENDING | ✅ |
| 5 | POST /subscribe com CANCELLED → cria novo PENDING | ✅ |
| 6 | PENDING não concede acesso ao documento | ✅ |
| 7 | REJECTED não concede acesso ao documento | ✅ |
| 8 | DELETE /subscription cancela ACTIVE | ✅ |
| 9 | DELETE /subscription cancela PENDING | ✅ |
| 10 | GET /subscription mostra status PENDING | ✅ |
| 11 | Admin lista subscrições | ✅ |
| 12 | Admin filtra por status | ✅ |
| 13 | Non-admin não acede ao endpoint admin | ✅ |
| 14 | Admin aprova PENDING → ACTIVE | ✅ |
| 15 | Aprovação concede acesso ao documento | ✅ |
| 16 | Approve falha se não for PENDING | ✅ |
| 17 | Approve retorna 404 para ID desconhecido | ✅ |
| 18 | Admin rejeita PENDING → REJECTED | ✅ |
| 19 | Rejeição nega acesso ao documento | ✅ |
| 20 | Reject falha se não for PENDING | ✅ |
| 21 | Admin cancela ACTIVE → CANCELLED | ✅ |
| 22 | Admin cancela PENDING → CANCELLED | ✅ |
| 23 | Admin cancel falha se já CANCELLED | ✅ |
| 24 | Admin cancel falha se REJECTED | ✅ |
| 25 | Fluxo completo: PENDING → ACTIVE → CANCELLED | ✅ |

---

## 5. Compatibilidade

- Todos os 12 testes de `DocumentAccessTest` (Sistema legado `access_level_id`) continuam a passar sem alterações.
- `DocumentAccessService.canReadDocument()` mantém a camada de compatibilidade para documentos sem categoria de subscrição.
- A API existente não foi quebrada — apenas mensagens de resposta do endpoint `/subscribe` foram actualizadas.

---

## 6. Limitações (MVP)

| Item | Decisão |
|---|---|
| Expiração automática (`expires_at`) | O campo existe mas não há cron/scheduler. A `hasActiveSubscription()` verifica a data correctamente. |
| Histórico de transições | Não registado. Apenas o estado actual é guardado. |
| Notificação ao utilizador após aprovação/rejeição | Não implementado nesta sprint. |
| Endpoint para o admin ver subscrições de um utilizador específico | Disponível via filtro `?user_id=uuid` em `GET /admin/document-subscriptions`. |
| Renovação automática | Fora do MVP. |

---

## 7. Resultado

**CONCLUÍDO**

O backend está preparado para o fluxo:

> Utilizador solicita acesso → PENDING → Admin aprova → ACTIVE → Utilizador acede ao documento
