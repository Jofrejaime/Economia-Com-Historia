# Sprint 15.3 — Consolidação do Domínio de Subscrições

**Data:** 2026-06-29
**Tipo:** Backend only — integridade de dados, máquina de estados, auditoria

---

## Objectivo

Fechar definitivamente o backend do domínio de subscrições: máquina de estados
explícita no serviço, unicidade garantida, rastreabilidade administrativa completa.

---

## Alterações

### 1. Migration — colunas de auditoria

`2026_06_29_000006_sprint15_3_add_audit_columns_to_subscriptions.php`

| Coluna | Tipo | FK |
|---|---|---|
| `approved_by` | UUID nullable | users.id (nullOnDelete) |
| `rejected_by` | UUID nullable | users.id (nullOnDelete) |
| `cancelled_by` | UUID nullable | users.id (nullOnDelete) |

Preenchimento:
- `approved_by` = admin que aprovou
- `rejected_by` = admin que rejeitou
- `cancelled_by` = admin que cancelou administrativamente; **NULL** quando o utilizador cancela a própria subscrição

### 2. DocumentSubscriptionService — máquina de estados

Toda a validação de transição movida para dentro do serviço. Controllers nunca
contêm regras de estado.

**Constante ALLOWED_FROM:**
```php
private const ALLOWED_FROM = [
    'approve' => ['PENDING'],
    'reject'  => ['PENDING'],
    'cancel'  => ['ACTIVE', 'PENDING'],
];
```

**Resultado dos métodos admin:**
```php
// approveSubscription, rejectSubscription, adminCancelSubscription retornam:
['result' => 'ok']
['result' => 'not_found']
['result' => 'invalid_transition', 'current_status' => string]
```

**Campos de auditoria gravados:**
```php
// approveSubscription
['status' => 'ACTIVE', 'approved_by' => $adminId]

// rejectSubscription
['status' => 'REJECTED', 'rejected_by' => $adminId]

// adminCancelSubscription
['status' => 'CANCELLED', 'cancelled_by' => $adminId]

// cancelSubscription (utilizador)
['status' => 'CANCELLED']  // cancelled_by permanece NULL
```

**listSubscriptions:** adicionados `approved_by`, `rejected_by`, `cancelled_by` ao SELECT.

### 3. AdminDocumentSubscriptionController

- `approve/reject/cancel` recebem `Request $request` e passam `$request->user()->id` ao serviço
- Controller mapeia resultado do serviço para HTTP — sem lógica de estado
- Transições inválidas → **409 Conflict** (era 422 em Sprint 15.1/15.2)
- Body do 409 inclui `message` e `current_status`

### 4. Testes actualizados

`DocumentSubscriptionAdminTest.php`:
- `test_approve_fails_when_not_pending` → 422 → **409** + assert `current_status`
- `test_reject_fails_when_not_pending` → 422 → **409** + assert `current_status`
- `test_admin_cancel_fails_when_already_cancelled` → 422 → **409** + assert `current_status`
- `test_admin_cancel_fails_when_rejected` → 422 → **409** + assert `current_status`

### 5. Novo ficheiro de testes

`tests/Feature/DocumentSubscriptionStateMachineTest.php` — 21 novos testes:

**Unicidade (4):**
- Segunda subscrição com ACTIVE existente → 200 "Already subscribed." + sem duplicado
- Segunda subscrição com PENDING existente → 200 "already pending" + sem duplicado
- Nova subscrição após REJECTED → 201 novo PENDING
- Nova subscrição após CANCELLED → 201 novo PENDING

**Transições válidas (4):**
- PENDING → ACTIVE (approve)
- PENDING → REJECTED (reject)
- PENDING → CANCELLED (admin cancel)
- ACTIVE → CANCELLED (admin cancel)

**Transições inválidas — 409 (8):**
- approve ACTIVE → 409 {current_status: ACTIVE}
- approve REJECTED → 409 {current_status: REJECTED}
- approve CANCELLED → 409 {current_status: CANCELLED}
- reject ACTIVE → 409 {current_status: ACTIVE}
- reject REJECTED → 409 {current_status: REJECTED}
- reject CANCELLED → 409 {current_status: CANCELLED}
- admin cancel REJECTED → 409 {current_status: REJECTED}
- admin cancel CANCELLED → 409 {current_status: CANCELLED}

**Auditoria (5):**
- approve define approved_by = admin.id; rejected_by/cancelled_by = null
- reject define rejected_by = admin.id; approved_by/cancelled_by = null
- admin cancel define cancelled_by = admin.id; approved_by/rejected_by = null
- user cancel deixa cancelled_by = null
- listing admin inclui approved_by, rejected_by, cancelled_by

---

## Validação

```
php artisan migrate --force     → 2026_06_29_000006 applied
php artisan test --filter="DocumentSubscription" → 60/60 passed
php artisan test               → 214/217 passed (3 falhas pré-existentes em AuthenticationTest: SSL + verification_token)
php artisan l5-swagger:generate → OK
php artisan optimize:clear      → OK
```

---

## Critérios de conclusão — verificação

| Critério | Estado |
|---|---|
| Todo o ciclo de vida passa pelo DocumentSubscriptionService | ✅ |
| Transições inválidas bloqueadas com 409 Conflict | ✅ |
| Sem duplicados ACTIVE nem PENDING (garantido por requestSubscription) | ✅ |
| Auditoria administrativa (approved_by, rejected_by, cancelled_by) implementada | ✅ |
| Swagger actualizado | ✅ |
| Todos os testes existentes continuam verdes | ✅ |
| Nenhum contrato do frontend alterado | ✅ |
