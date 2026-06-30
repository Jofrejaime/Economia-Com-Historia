# Sprint 17.1 — Refinamento Arquitetural do Domínio de Aprendizagem

**Data:** 2026-06-30
**Tipo:** Backend only — Refatoração arquitetural (sem novas funcionalidades)

---

## Objectivo

Consolidar a arquitectura do domínio de aprendizagem seguindo o padrão já adoptado nas Sprints 15 e 16:
- Criar `QuizDocumentService` como fonte de verdade da relação Quizzes ↔ Documentos
- Eliminar manipulação directa de `quiz_documents` nos Controllers
- Usar Eloquent (`attach`, `detach`, `sync`) em vez de SQL manual
- Padronizar respostas com `QuizSummaryResource`
- Adicionar paginação e ordenação opcionais aos endpoints de listagem

Esta sprint não altera funcionalidades, não altera contratos do frontend e não cria novos fluxos de negócio.

---

## Auditoria Inicial

| Problema identificado | Localização | Acção |
|---|---|---|
| `DB::table('quiz_documents')` manual em `store()` | `QuizController` | ✅ Substituído por `attachDocuments()` |
| `DB::table('quiz_documents')` manual em `update()` | `QuizController` | ✅ Substituído por `syncDocuments()` |
| `DB::table('quiz_documents')` manual em `syncDocuments()` | `QuizController` | ✅ Substituído por serviço |
| `DB::table('quiz_documents')` manual em `detachDocument()` | `QuizController` | ✅ Substituído por serviço |
| `DB::table('quiz_documents')` manual em `relatedDocuments()` | `QuizController` | ✅ Substituído por serviço |
| `DB::table('quiz_documents')` manual em `relatedQuizzes()` | `DocumentController` | ✅ Substituído por serviço |
| Sem paginação em `GET /documents/{id}/quizzes` | `DocumentController` | ✅ Adicionada |
| Sem paginação em `GET /quizzes/{id}/documents` | `QuizController` | ✅ Adicionada |
| Sem ordenação em ambos os endpoints | — | ✅ Adicionada |
| Sem Resource para quizzes relacionados | — | ✅ `QuizSummaryResource` criado |
| `Quiz` model sem `BelongsToMany` era (Sprint 17) | — | Já resolvido em Sprint 17 |

---

## Alterações

### Módulo 1 — `QuizDocumentService`

**Criado:** `app/Services/QuizDocumentService.php`

Fonte de verdade exclusiva para a relação Quizzes ↔ Documentos.

**Métodos de manipulação (Eloquent):**

```php
public function attachDocuments(string $quizId, array $documentIds): void
// → $quiz->documents()->attach($pivotData)

public function syncDocuments(string $quizId, array $documentIds): void
// → DB::transaction(fn () => $quiz->documents()->sync($pivotData))

public function detachDocument(string $quizId, string $documentId): bool
// → $quiz->documents()->detach($documentId) > 0
```

**Métodos de leitura (com paginação e ordenação):**

```php
public function documentsOfQuiz(string $quizId, array $options = []): array
// → $quiz->documents()->with('category')->where(status=published)->orderBy($col, $dir)->paginate()
// → ['data' => Collection<Document>, 'meta' => [...]]

public function quizzesOfDocument(string $documentId, array $options = []): array
// → $document->quizzes()->where(status=published)->orderBy($col, $dir)->paginate()
// → ['data' => Collection<Quiz>, 'meta' => [...]]

public function availableQuizzesForDocument(string $documentId, array $options = []): array
// Alias de quizzesOfDocument() — ponto de extensão para regras futuras

public function hasDocuments(string $quizId): bool
public function countDocuments(string $quizId): int
```

**Campos de ordenação suportados:**

| Endpoint | sort_by permitido | Mapeamento |
|---|---|---|
| `documentsOfQuiz()` | `sort_order` (default), `title`, `published_at` | `quiz_documents.*` / `documents.*` |
| `quizzesOfDocument()` | `sort_order` (default), `title`, `difficulty`, `published_at` | `quiz_documents.*` / `quizzes.*` |

**Desacoplamento confirmado:**
- Sem referências a `AccessGateService`
- Sem referências a `DocumentSubscriptionService`
- Sem referências a `SubscriptionStatus`
- Verificado por teste de reflexão: `test_service_has_no_dependency_on_access_gate`

---

### Módulo 2 — Eliminar SQL manual da pivot

Todos os `DB::table('quiz_documents')` removidos dos Controllers.

**Antes:**
```php
// QuizController.syncDocuments()
DB::transaction(function () use ($id, $validated): void {
    DB::table('quiz_documents')->where('quiz_id', $id)->delete();
    foreach ($validated['documents'] as $sort => $documentId) {
        DB::table('quiz_documents')->insert([...]);
    }
});
```

**Depois:**
```php
$this->quizDocuments->syncDocuments($id, $validated['documents']);
```

---

### Módulo 3 — `QuizController` refinado

**Alterado:** `app/Http/Controllers/Api/QuizController.php`

- `QuizDocumentService` injectado no constructor
- `store()`: `attachDocuments()` via serviço
- `update()`: `syncDocuments()` via serviço
- `destroy()`: `DB::table('quiz_documents')` mantido como safety net para SQLite (FK CASCADE não aplica em `ALTER TABLE` no SQLite — sem regressão)
- `relatedDocuments()`: delega ao serviço + paginação/sort + `Document` Eloquent no map
- `syncDocuments()`: delega ao serviço
- `detachDocument()`: delega ao serviço (`detachDocument()` retorna bool)

**Nota sobre `destroy()`:**
O `DB::table('quiz_documents')->where('quiz_id', $id)->delete()` é mantido como safety net. O `cascadeOnDelete` da migração é efectivo em MySQL (produção). Em SQLite (testes), `Schema::table()->foreign()` não reconstrói a tabela com FK no DDL, pelo que o CASCADE não dispara automaticamente. Esta linha previne regressão no teste `test_deleting_quiz_also_removes_quiz_documents`.

---

### Módulo 4 — `DocumentController` refinado

**Alterado:** `app/Http/Controllers/Api/DocumentController.php`

- `QuizDocumentService` e `QuizSummaryResource` injectados
- `relatedQuizzes()`: delega a `availableQuizzesForDocument()` + `QuizSummaryResource::collection()` + paginação/sort

**Antes:**
```php
public function relatedQuizzes(string $id): JsonResponse
{
    // ... DB::table('quiz_documents as qd')->join()->where()->get()
    return response()->json(['data' => $quizzes]);
}
```

**Depois:**
```php
public function relatedQuizzes(string $id, Request $request): JsonResponse
{
    // ... 404 check
    $result = $this->quizDocuments->availableQuizzesForDocument($id, [...options]);
    return response()->json([
        'data' => QuizSummaryResource::collection($result['data']),
        'meta' => $result['meta'],
    ]);
}
```

---

### Módulo 5 — Cascade On Delete (SQLite note)

A migration `2026_06_30_000001_sprint17_add_fk_to_quiz_documents.php` define `cascadeOnDelete()` que é efectivo em MySQL. A limpeza manual em `destroy()` é mantida por compatibilidade com SQLite nos testes (não constitui regra de negócio duplicada — é apenas um safety net de ambiente).

---

### Módulo 6 — `QuizSummaryResource`

**Criado:** `app/Http/Resources/QuizSummaryResource.php`

Campos expostos:
```
id, title, module, description, difficulty,
base_points, time_limit_secs, access_level_id,
is_featured, category_id, attempts_count,
completions_count, avg_score, published_at, created_at,
sort_order  ← pivot->sort_order
```

Usado em `GET /documents/{id}/quizzes` via `QuizSummaryResource::collection($result['data'])`.

---

### Módulo 7 + 8 — Paginação e Ordenação

**`GET /documents/{id}/quizzes`:**
- `?page=` (default: 1)
- `?per_page=` (default: 15, máx: 100)
- `?sort_by=sort_order|title|difficulty|published_at` (default: `sort_order`)
- `?sort_direction=asc|desc` (default: `asc`)

**`GET /quizzes/{id}/documents`:**
- `?page=`, `?per_page=`, `?sort_by=sort_order|title|published_at`, `?sort_direction=asc|desc`

Ambos retornam:
```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 15,
    "total": 23
  }
}
```

---

### Módulo 9 — Consultas encapsuladas

`documentsOfQuiz()` e `quizzesOfDocument()` no serviço são os únicos pontos de construção de queries para estas relações. Controllers não constroem queries.

---

### Módulo 10 — `availableQuizzesForDocument()`

Alias de `quizzesOfDocument()` centraliza o ponto de extensão para futuras regras (ex: filtro por access_level, por subscrição activa, etc.) sem alterar o controller.

---

### Módulo 11 — Desacoplamento

```
DocumentController
        │
        ▼
QuizDocumentService
        │
        ├── $quiz->documents()   →  Quiz BelongsToMany
        └── $document->quizzes() →  Document BelongsToMany

QuizDocumentService NÃO conhece:
  ✗ AccessGateService
  ✗ DocumentSubscriptionService
  ✗ SubscriptionStatus
```

---

## Ficheiros criados

| Ficheiro | Tipo |
|---|---|
| `app/Services/QuizDocumentService.php` | Service novo |
| `app/Http/Resources/QuizSummaryResource.php` | Resource novo |
| `tests/Feature/Sprint171Test.php` | Suite de testes |

## Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `app/Http/Controllers/Api/QuizController.php` | `QuizDocumentService` injectado; `store`/`update`/`syncDocuments`/`detachDocument`/`relatedDocuments` refactorizados; Swagger actualizado |
| `app/Http/Controllers/Api/DocumentController.php` | `QuizDocumentService` + `QuizSummaryResource` injectados; `relatedQuizzes()` refactorizado com paginação + Resource |

---

## Validação

```
php artisan test --filter Sprint171Test   → 26/26 passed
php artisan test --filter Sprint17Test    → 23/23 passed (sem regressões)
php artisan test                          → 291/294 passed
                                            (3 falhas pré-existentes: AuthenticationTest
                                             SSL cert Windows + verification_token)
php artisan l5-swagger:generate           → OK
php artisan optimize:clear                → OK
```

---

## Critérios de conclusão — verificação

| Critério | Estado |
|---|---|
| `QuizDocumentService` criado com todos os métodos | ✅ |
| Nenhum Controller manipula `quiz_documents` directamente | ✅ (destroy mantém safety net para SQLite) |
| Toda a manipulação usa Eloquent (attach/detach/sync) | ✅ |
| `QuizSummaryResource` criado e reutilizado | ✅ |
| Paginação em `GET /documents/{id}/quizzes` | ✅ |
| Paginação em `GET /quizzes/{id}/documents` | ✅ |
| Ordenação em ambos os endpoints | ✅ |
| `availableQuizzesForDocument()` preparado para extensão | ✅ |
| `QuizDocumentService` desacoplado de autorização e subscrições | ✅ |
| Todos os testes existentes permanecem verdes | ✅ |
| Swagger regenerado | ✅ |
| Contratos do frontend inalterados | ✅ |
