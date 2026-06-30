# Sprint 17 — Consolidação do Domínio de Aprendizagem

**Data:** 2026-06-30
**Tipo:** Backend only — sem novas funcionalidades de produto; estabelecer relação N:N correcta entre Quizzes e Documentos

---

## Objectivo

Consolidar o domínio de aprendizagem:
- Eliminar qualquer dependência de `document_id` em `quizzes` (já não existia — confirmado por auditoria)
- Formalizar a relação N:N entre Documentos e Quizzes via tabela pivot `quiz_documents`
- Adicionar FK constraints à tabela pivot existente
- Expor dois endpoints novos: `GET /documents/{id}/quizzes` e endpoints admin para gestão de associações
- Suportar dois fluxos de aprendizagem:
  - **Fluxo A:** Categoria → Documento → (Quizzes) → Tentativa → Resultado
  - **Fluxo B:** Categoria → Quiz standalone → Tentativa → Resultado

---

## Auditoria Inicial

| Item | Resultado |
|---|---|
| `quizzes.document_id` | **Não existe.** Nunca existiu. Sem remoção necessária. |
| `quiz_documents` table | **Já existia** (migration `2026_06_26_000003`). Sem PK UUID proper, FK constraints em falta. |
| `GET /quizzes/{id}/documents` | **Já existia** — `relatedDocuments()` em `QuizController`. Faltava apenas anotação Swagger. |
| `QuizAttemptService` | Sem dependência em `document_id`. |
| `LeaderboardService` | Sem dependência em documentos. |
| `GamificationService` | Sem dependência em documentos. |
| Modelo `Quiz` | **Não existia** como classe Eloquent. |
| `Document.quizDocuments()` | Existia como HasMany para QuizDocument pivot. |

---

## Alterações

### Módulo 1 — Migration: FK constraints em `quiz_documents`

**Criado:** `database/migrations/2026_06_30_000001_sprint17_add_fk_to_quiz_documents.php`

Adiciona FK constraints à tabela existente:
```php
$table->foreign('quiz_id')->references('id')->on('quizzes')->cascadeOnDelete();
$table->foreign('document_id')->references('id')->on('documents')->cascadeOnDelete();
```

O `cascadeOnDelete` garante que ao eliminar um quiz ou documento, as linhas em `quiz_documents` são automaticamente removidas.

---

### Módulo 2 — `Quiz` Eloquent Model

**Criado:** `app/Models/Quiz.php`

```php
class Quiz extends Model {
    use HasUuids;

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class, 'quiz_documents', 'quiz_id', 'document_id')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function category(): BelongsTo { ... }
    public function createdBy(): BelongsTo { ... }
}
```

---

### Módulo 3 — `Document` model: `quizzes()` BelongsToMany

**Alterado:** `app/Models/Document.php`

Adicionada relação BelongsToMany em complemento à `quizDocuments()` HasMany existente (mantida):

```php
public function quizzes(): BelongsToMany
{
    return $this->belongsToMany(Quiz::class, 'quiz_documents', 'document_id', 'quiz_id')
        ->withPivot('sort_order')
        ->withTimestamps();
}
```

---

### Módulo 4 — `QuizController`: suporte a `documents` em store/update + destroy cleanup

**Alterado:** `app/Http/Controllers/Api/QuizController.php`

#### `store()`:
- Validação: `documents` array nullable de UUIDs existentes em `documents`
- `$quizData = collect($validated)->except(['questions', 'documents'])->all()`
- Dentro da transação: insere linhas em `quiz_documents` (índice do array = `sort_order`)

#### `update()`:
- Mesma validação de `documents`
- Se a chave `documents` está presente no payload (mesmo como null): substitui todas as associações existentes (sync)
- Se a chave `documents` não está no payload: associações preservadas (sem alteração)

#### `destroy()`:
- Adicionado `DB::table('quiz_documents')->where('quiz_id', $id)->delete()` antes de eliminar o quiz

#### `relatedDocuments()`:
- Adicionada anotação `@OA\Get(path="/quizzes/{id}/documents", ...)` (existia sem Swagger)

---

### Módulo 5 — `QuizController`: endpoints admin para gestão N:N

**Adicionados dois métodos:**

#### `syncDocuments(string $id, Request $request)` — `POST /quizzes/{id}/documents`

Substitui completamente todas as associações do quiz. Enviar array vazio remove todos os documentos.

```php
// Validação
'documents'   => ['present', 'array'],
'documents.*' => ['uuid', 'exists:documents,id'],

// Lógica
DB::table('quiz_documents')->where('quiz_id', $id)->delete();
foreach ($validated['documents'] as $sort => $documentId) {
    DB::table('quiz_documents')->insert([...]);
}
```

Retorna: `{ message: "Documents synced successfully.", count: N }`

#### `detachDocument(string $id, string $documentId)` — `DELETE /quizzes/{id}/documents/{documentId}`

Remove uma associação específica documento-quiz. Retorna 404 se a associação não existir.

---

### Módulo 6 — `DocumentController`: `GET /documents/{id}/quizzes`

**Alterado:** `app/Http/Controllers/Api/DocumentController.php`

```php
public function relatedQuizzes(string $id): JsonResponse
{
    // 404 se documento não existe
    // Query quiz_documents → quizzes WHERE status = 'published'
    // ORDER BY sort_order
    // SELECT: id, title, module, description, difficulty, base_points,
    //         time_limit_secs, access_level_id, is_featured, category_id,
    //         attempts_count, completions_count, avg_score, published_at,
    //         created_at, sort_order
}
```

---

### Módulo 7 — Rotas

**Alterado:** `routes/api.php`

| Rota | Controller | Auth |
|---|---|---|
| `GET /documents/{id}/quizzes` | `DocumentController@relatedQuizzes` | Qualquer autenticado |
| `POST /quizzes/{id}/documents` | `QuizController@syncDocuments` | admin, professor |
| `DELETE /quizzes/{id}/documents/{documentId}` | `QuizController@detachDocument` | admin, professor |

---

### Módulo 8 — `QuizSeeder`: exemplos N:N

**Alterado:** `database/seeders/QuizSeeder.php`

Após o loop principal de quizzes, insere associações demonstrativas em `quiz_documents`:

| Quiz | Documentos | Padrão |
|---|---|---|
| Caminho de Ferro de Benguela | Até 2 docs de `industrializacao` | Multi-document quiz |
| Comércio de Escravos no Atlântico | 1 doc de `comercio-atlantico` | Single-document quiz |
| Angola Pós-Independência | 0 | Standalone quiz (Fluxo B) |

As inserções são guardadas com `insertOrIgnore` para idempotência e só correm se os documentos existirem.

---

## Ficheiros criados

| Ficheiro | Tipo |
|---|---|
| `database/migrations/2026_06_30_000001_sprint17_add_fk_to_quiz_documents.php` | Migration nova |
| `app/Models/Quiz.php` | Eloquent model novo |
| `tests/Feature/Sprint17Test.php` | Suite de testes |

## Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `app/Models/Document.php` | Adicionado `quizzes(): BelongsToMany`; mantido `quizDocuments(): HasMany` |
| `app/Http/Controllers/Api/QuizController.php` | Swagger em `relatedDocuments()`; `documents` em `store()`/`update()`; cleanup em `destroy()`; `syncDocuments()`; `detachDocument()` |
| `app/Http/Controllers/Api/DocumentController.php` | Adicionado `relatedQuizzes()` |
| `routes/api.php` | 3 rotas novas |
| `database/seeders/QuizSeeder.php` | Exemplos N:N em `quiz_documents` |

---

## Validação

```
php artisan test --filter Sprint17Test   → 23/23 passed
php artisan test                         → 262/265 passed
                                           (3 falhas pré-existentes em AuthenticationTest:
                                            SSL cert no Windows + verification_token ausente)
php artisan l5-swagger:generate          → OK
php artisan optimize:clear               → OK
```

---

## Critérios de conclusão — verificação

| Critério | Estado |
|---|---|
| Relação N:N `quiz_documents` formalizada com FK constraints | ✅ |
| `Quiz` Eloquent model com `documents(): BelongsToMany` | ✅ |
| `Document` model com `quizzes(): BelongsToMany` | ✅ |
| `GET /documents/{id}/quizzes` endpoint criado | ✅ |
| `GET /quizzes/{id}/documents` endpoint documentado com Swagger | ✅ |
| `POST /quizzes` aceita `documents` array | ✅ |
| `PATCH /quizzes/{id}` sincroniza `documents` quando presente no payload | ✅ |
| `DELETE /quizzes/{id}` limpa `quiz_documents` | ✅ |
| `POST /quizzes/{id}/documents` (admin sync) implementado | ✅ |
| `DELETE /quizzes/{id}/documents/{documentId}` (admin detach) implementado | ✅ |
| QuizSeeder actualizado com exemplos N:N | ✅ |
| Fluxo B (quiz sem documentos) funcional | ✅ |
| Sem regressões (base 262/265 mantida) | ✅ |
| Swagger regenerado | ✅ |
| Compatibilidade total da API — contratos existentes inalterados | ✅ |
