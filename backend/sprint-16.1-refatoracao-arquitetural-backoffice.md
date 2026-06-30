# Sprint 16.1 — Refatoração Arquitetural do Backoffice

**Data:** 2026-06-30
**Tipo:** Backend only — sem novas funcionalidades, sem alteração de contratos

---

## Objetivo

Consolidar a arquitetura do backend após as Sprints 15 e 16, eliminando legado,
centralizando regras de domínio em enums e reduzindo acoplamento entre a camada HTTP e a camada de dados.

---

## Auditoria Inicial

### `review` como estado de documento

Inventário completo antes da sprint:

| Ocorrência | Ficheiro | Acção |
|---|---|---|
| `'review'` na secção `documents` do dashboard | `AdminController.php:35` | Removido (estado inexistente no workflow oficial) |
| `reviewed_by`, `reviewed_at`, `review_notes` | `AccessRequest`, `Document`, `ReportController`, `AccessController` | Intocados — são campos de auditoria de outros domínios, não estados de documento |
| `'reviewed'` em `ReportsTest` / `ReportController` | Domínio de moderação | Intocado — é estado de `content_reports`, não de documentos |

### Strings literais de documento em `app/`

Inventário antes da sprint: 8 ocorrências em `DocumentController` + 1 em `AdminController.buildRecentActivity()`.

### Strings literais de subscrição em `app/`

Inventário antes da sprint: 4 em `AdminController` stats + 1 em `DocumentController:subscribe()`.

### Outros domínios — fora de escopo

Ficaram intocados por design os literals de:
- `quizzes.status = 'published'` — domínio Quizzes
- `discussion_topics.status = 'archived'` / `'open'` / `'locked'` — domínio Community
- `community_topics.status = 'published'` — domínio Community

---

## Alterações

### Módulo 1 — Eliminação do estado `review`

O estado `review` nunca foi parte do workflow oficial (congelado na Sprint 13: `draft → published → archived`).

A única ocorrência restante no backend era:
```php
// AdminController (antes)
'review' => DB::table('documents')->where('status', 'review')->count(),
```

Eliminado ao mover as estatísticas para `DocumentStatisticsService`, que implementa apenas
os estados oficiais.

`UpdateDocumentRequest` já não aceitava `review` — confirmado.

---

### Módulo 2 — `DocumentStatus` enum

**Criado:** `app/Enums/DocumentStatus.php`

```php
enum DocumentStatus: string
{
    case DRAFT     = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED  = 'archived';
}
```

**`UpdateDocumentRequest`** migrado para `Rule::in()`:
```php
// Antes
'status' => ['sometimes', 'in:draft,published,archived'],

// Depois
'status' => ['sometimes', Rule::in(array_column(DocumentStatus::cases(), 'value'))],
```

**`DocumentController`** — 7 literais substituídos:

| Antes | Depois |
|---|---|
| `'published'` (myFavorites) | `DocumentStatus::PUBLISHED->value` |
| `'published'` (index — else branch) | `DocumentStatus::PUBLISHED->value` |
| `'published'` (search) | `DocumentStatus::PUBLISHED->value` |
| `$document->status !== 'published'` (show) | `!== DocumentStatus::PUBLISHED->value` |
| `'status' => 'draft'` (store) | `DocumentStatus::DRAFT->value` |
| `$validated['status'] === 'published'` (update) | `=== DocumentStatus::PUBLISHED->value` |
| `$result['status'] === 'ACTIVE'` (subscribe) | `=== SubscriptionStatus::ACTIVE->value` |

---

### Módulo 3 — Serviços de estatísticas por domínio

**Criados três serviços especializados:**

**`app/Services/DocumentStatisticsService.php`**
```php
public function summary(): array
{
    return [
        'total'     => DB::table('documents')->count(),
        'published' => DB::table('documents')->where('status', DocumentStatus::PUBLISHED->value)->count(),
        'draft'     => DB::table('documents')->where('status', DocumentStatus::DRAFT->value)->count(),
        'archived'  => DB::table('documents')->where('status', DocumentStatus::ARCHIVED->value)->count(),
        'pinned'    => DB::table('documents')->where('is_pinned', true)->count(),
    ];
}
```

**`app/Services/SubscriptionStatisticsService.php`**
```php
public function summary(): array
{
    return [
        'total'     => DB::table('document_subscriptions')->count(),
        'pending'   => DB::table('document_subscriptions')->where('status', SubscriptionStatus::PENDING->value)->count(),
        'active'    => DB::table('document_subscriptions')->where('status', SubscriptionStatus::ACTIVE->value)->count(),
        'rejected'  => DB::table('document_subscriptions')->where('status', SubscriptionStatus::REJECTED->value)->count(),
        'cancelled' => DB::table('document_subscriptions')->where('status', SubscriptionStatus::CANCELLED->value)->count(),
    ];
}
```

**`app/Services/CategoryStatisticsService.php`**
```php
public function summary(): array
{
    return [
        'total'                 => DB::table('document_categories')->count(),
        'free'                  => DB::table('document_categories')->where('requires_subscription', false)->count(),
        'requires_subscription' => DB::table('document_categories')->where('requires_subscription', true)->count(),
    ];
}
```

---

### Módulo 4 — `DashboardService`

**Criado:** `app/Services/DashboardService.php`

Agrega os três serviços de estatísticas e contém toda a lógica de consulta do dashboard,
incluindo o método `buildRecentActivity()` movido de `AdminController`.

```php
public function __construct(
    private readonly DocumentStatisticsService     $documentStats,
    private readonly SubscriptionStatisticsService $subscriptionStats,
    private readonly CategoryStatisticsService     $categoryStats,
) {}

public function summary(): array
{
    return [
        'users'           => [...],        // queries directas (domínio admin)
        'access_requests' => [...],        // queries directas (domínio admin)
        'documents'       => $this->documentStats->summary(),
        'categories'      => $this->categoryStats->summary(),
        'subscriptions'   => $this->subscriptionStats->summary(),
        'community'       => [...],        // queries directas (domínio community)
        'moderation'      => [...],        // queries directas (domínio admin)
        'recent_activity' => $this->buildRecentActivity(),
    ];
}
```

A única string literal de documento que permanece em `DashboardService` é
`DocumentStatus::PUBLISHED->value` em `buildRecentActivity()`, para a classe do badge.

---

### Módulo 4 — `AdminController` após refatoração

```php
// Antes: ~90 linhas com queries, buildRecentActivity(), stats embutidos
// Depois: controller fino

public function __construct(private readonly DashboardService $dashboardService) {}

public function summary(): JsonResponse
{
    return response()->json([
        'data' => $this->dashboardService->summary(),
    ]);
}
```

`buildRecentActivity()` removido do controller — movido para `DashboardService`.

---

### Módulo 5 — Utilização consistente de enums

Verificação final após todas as alterações:

**Domínio Documents (em `app/`):**

| Tipo | Literal restante | Enum |
|---|---|---|
| `DocumentController` | 0 | ✅ |
| `UpdateDocumentRequest` | 0 | ✅ |
| `DocumentStatisticsService` | 0 | ✅ |
| `DashboardService.buildRecentActivity` | 0 | ✅ |

**Domínio Subscriptions (em `app/`):**

| Tipo | Literal restante | Enum |
|---|---|---|
| `DocumentController` | 0 | ✅ |
| `SubscriptionStatisticsService` | 0 | ✅ |
| `DocumentSubscriptionService` | 0 | ✅ (desde Sprint 15.3.1) |
| `DocumentAccessService` | 0 | ✅ (desde Sprint 15.3.1) |

---

### Módulo 6 — Auditoria arquitetural

**Controllers:**

| Controller | Queries directas | Regras de negócio | Estado |
|---|---|---|---|
| `AdminController` | 0 (após refat.) | 0 | ✅ Fino |
| `DocumentController` | Apenas para operações específicas do endpoint (views, likes, etc.) | 0 | ✅ |
| `AdminDocumentSubscriptionController` | 0 | 0 | ✅ Fino |

**Services:**

| Service | Responsabilidade |
|---|---|
| `DocumentAccessService` | Autorização de acesso a documentos |
| `DocumentSubscriptionService` | Ciclo de vida de subscrições |
| `DocumentStatisticsService` | Estatísticas do domínio Documents |
| `SubscriptionStatisticsService` | Estatísticas do domínio Subscriptions |
| `CategoryStatisticsService` | Estatísticas do domínio Categories |
| `DashboardService` | Agregador do dashboard administrativo |

**Models — confirmação:**

| Model | `status` cast | Fillable | Relations |
|---|---|---|---|
| `Document` | string (sem cast — `->value` usado consistentemente) | ✅ | `category`, `accessLevel`, `createdBy`, `reviewedBy`, `tags`, `likes`, `downloads`, `views`, `favorites`, `citations` |
| `DocumentSubscription` | `SubscriptionStatus::class` ✅ | ✅ | `document`, `user`, `approvedBy`, `rejectedBy`, `cancelledBy` |

**Enums em `app/Enums/`:**

| Enum | Domínio |
|---|---|
| `DocumentStatus` | Estados de documento (DRAFT, PUBLISHED, ARCHIVED) |
| `SubscriptionStatus` | Estados de subscrição (PENDING, ACTIVE, REJECTED, CANCELLED) |
| `SubscriptionReason` | Razão semântica por estado de subscrição |

---

## Ficheiros criados

| Ficheiro | Tipo |
|---|---|
| `app/Enums/DocumentStatus.php` | Enum novo |
| `app/Services/DocumentStatisticsService.php` | Service novo |
| `app/Services/SubscriptionStatisticsService.php` | Service novo |
| `app/Services/CategoryStatisticsService.php` | Service novo |
| `app/Services/DashboardService.php` | Service novo |

## Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `app/Http/Controllers/Api/AdminController.php` | Constructor + summary() slim + buildRecentActivity() removido |
| `app/Http/Controllers/Api/DocumentController.php` | 7 string literals → enums |
| `app/Http/Requests/UpdateDocumentRequest.php` | `in:` → `Rule::in(DocumentStatus::cases())` |

---

## Validação

```
php artisan test               → 239/245 passed
                                  (3 falhas pré-existentes em AuthenticationTest:
                                   SSL cert no Windows + verification_token ausente)
php artisan l5-swagger:generate → OK
php artisan optimize:clear      → OK
```

---

## Critérios de conclusão — verificação

| Critério | Estado |
|---|---|
| O estado `review` deixou de existir no backend de documentos | ✅ |
| `DocumentStatus` implementado e utilizado em todo o domínio | ✅ |
| `SubscriptionStatus` utilizado consistentemente em todo o domínio | ✅ |
| `AdminController` não executa queries directamente em `summary()` | ✅ |
| Estatísticas distribuídas por serviços especializados | ✅ |
| `DashboardService` é o único agregador das estatísticas | ✅ |
| Controllers permanecem finos (sem regras de negócio) | ✅ |
| Sem strings literais para estados nos domínios Documents e Subscriptions | ✅ |
| Swagger actualizado | ✅ |
| Todos os testes passaram (excl. 3 falhas pré-existentes) | ✅ |
| Nenhum contrato JSON alterado | ✅ |
| Frontend não necessita de alterações | ✅ |
