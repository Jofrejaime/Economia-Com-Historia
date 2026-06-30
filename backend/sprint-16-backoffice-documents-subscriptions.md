# Sprint 16 — Backoffice Admin: Documentos e Subscrições

**Data:** 2026-06-30
**Tipo:** Backend only — listagem administrativa, ordenação, estatísticas de dashboard

---

## Objectivo

Fechar o backoffice administrativo para os domínios de Documentos e Subscrições:
filtros completos na listagem de subscrições, ordenação pinned-first nos documentos,
e estatísticas consolidadas no dashboard.

---

## Alterações

### Module 1 — Listagem administrativa de subscrições

**`app/Services/DocumentSubscriptionService.php` — `listSubscriptions()`**

Método reescrito com suporte a filtros adicionais e ordenação configurável.

Novo join:
```php
->leftJoin('document_categories as dc', 'd.category_id', '=', 'dc.id')
```

Campos adicionados ao SELECT:
- `dc.id as category_id`
- `dc.name as category_name`

Novos filtros implementados:

| Parâmetro | Lógica |
|---|---|
| `category_id` | `WHERE dc.id = ?` |
| `date_from` | `WHERE DATE(ds.created_at) >= ?` |
| `date_to` | `WHERE DATE(ds.created_at) <= ?` |
| `search` | LIKE em `u.email`, `up.display_name`, `d.title` |

Ordenação configurável via `resolveSubscriptionSortColumn()`:

| `sort_by` | Coluna |
|---|---|
| `status` | `ds.status` |
| `started_at` | `ds.started_at` |
| `updated_at` | `ds.updated_at` |
| *(default)* | `ds.created_at` |

`sort_direction` aceita `asc` ou `desc` (default: `desc`).

---

**`app/Http/Controllers/Api/AdminDocumentSubscriptionController.php` — `index()`**

Novos parâmetros extraídos do request e passados a `listSubscriptions()`:

```php
$filters = array_filter([
    'status'         => $request->input('status'),
    'document_id'    => $request->input('document_id'),
    'user_id'        => $request->input('user_id'),
    'category_id'    => $request->input('category_id'),   // novo
    'date_from'      => $request->input('date_from'),     // novo
    'date_to'        => $request->input('date_to'),       // novo
    'search'         => $request->input('search'),        // novo
    'sort_by'        => $request->input('sort_by'),       // novo
    'sort_direction' => $request->input('sort_direction'),// novo
]);
```

Swagger actualizado com todos os novos parâmetros `@OA\Parameter` e com
`category_id`/`category_name` no schema da resposta.

---

### Module 2 — Ordenação pinned-first

**`app/Http/Controllers/Api/DocumentController.php` — `index()`**

Linha adicionada antes do bloco de ordenação existente:

```php
$query->orderByDesc('d.is_pinned');
```

Resultado: documentos fixados aparecem sempre no topo, independentemente do
critério de ordenação secundária (`popular` ou `created_at`). Comportamento
idêntico ao de plataformas de conteúdo onde documentos em destaque têm prioridade
visual garantida.

---

### Module 3 — Estatísticas do dashboard admin

**`app/Http/Controllers/Api/AdminController.php` — `summary()`**

Secção `documents` expandida:

```php
'documents' => [
    'total'     => DB::table('documents')->count(),          // novo
    'published' => DB::table('documents')->where('status', 'published')->count(),
    'draft'     => DB::table('documents')->where('status', 'draft')->count(),
    'review'    => DB::table('documents')->where('status', 'review')->count(),
    'archived'  => DB::table('documents')->where('status', 'archived')->count(), // novo
    'pinned'    => DB::table('documents')->where('is_pinned', true)->count(),    // novo
],
```

Nova secção `categories`:

```php
'categories' => [
    'total'                 => DB::table('document_categories')->count(),
    'free'                  => DB::table('document_categories')->where('requires_subscription', false)->count(),
    'requires_subscription' => DB::table('document_categories')->where('requires_subscription', true)->count(),
],
```

Nova secção `subscriptions`:

```php
'subscriptions' => [
    'total'     => DB::table('document_subscriptions')->count(),
    'pending'   => DB::table('document_subscriptions')->where('status', 'PENDING')->count(),
    'active'    => DB::table('document_subscriptions')->where('status', 'ACTIVE')->count(),
    'rejected'  => DB::table('document_subscriptions')->where('status', 'REJECTED')->count(),
    'cancelled' => DB::table('document_subscriptions')->where('status', 'CANCELLED')->count(),
],
```

Campos `published`, `draft`, `review` mantidos sem alteração por compatibilidade
com o frontend existente.

---

### Module 4 — Testes

**`tests/Feature/Sprint16Test.php`** — 11 novos testes:

**Pinned-first (2):**
- `test_pinned_documents_appear_first_in_listing` — ordenação default
- `test_pinned_documents_appear_first_when_sorted_by_popular` — garante que `is_pinned` tem prioridade sobre qualquer sort secundário

**Filtros de listagem (5):**
- `test_subscription_listing_filter_by_category_id`
- `test_subscription_listing_filter_by_date_from`
- `test_subscription_listing_filter_by_date_to`
- `test_subscription_listing_search_by_user_email`
- `test_subscription_listing_search_by_document_title`

**Ordenação (1):**
- `test_subscription_listing_sort_ascending_by_created_at`

**Dashboard (3):**
- `test_admin_summary_includes_document_stats` — verifica `total`, `archived`, `pinned`
- `test_admin_summary_includes_category_stats` — verifica `total`, `free`, `requires_subscription` e soma
- `test_admin_summary_includes_subscription_stats` — verifica `total`, `pending`, `active`, `rejected`, `cancelled`

---

## Validação

```
php artisan test --filter Sprint16Test  → 11/11 passed
php artisan test                        → 239/245 passed
                                          (3 falhas pré-existentes em AuthenticationTest:
                                           SSL cert no Windows + verification_token ausente —
                                           não relacionadas com este sprint)
php artisan l5-swagger:generate         → OK
php artisan optimize:clear              → OK
```

---

## Critérios de conclusão — verificação

| Critério | Estado |
|---|---|
| Listagem de subscrições filtra por `category_id` | ✅ |
| Listagem de subscrições filtra por `date_from` e `date_to` | ✅ |
| Listagem de subscrições suporta pesquisa em email, nome e título | ✅ |
| Listagem de subscrições suporta ordenação e direcção configuráveis | ✅ |
| Resposta da listagem inclui `category_id` e `category_name` | ✅ |
| Documentos fixados aparecem primeiro em qualquer ordenação | ✅ |
| `GET /admin/dashboard/summary` inclui `total`, `archived`, `pinned` em documents | ✅ |
| `GET /admin/dashboard/summary` inclui nova secção `categories` | ✅ |
| `GET /admin/dashboard/summary` inclui nova secção `subscriptions` | ✅ |
| Campos existentes do summary mantidos sem alteração | ✅ |
| Swagger actualizado | ✅ |
| Nenhum contrato do frontend alterado | ✅ |
