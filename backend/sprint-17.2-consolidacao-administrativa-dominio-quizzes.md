# Sprint 17.2 — Consolidação Administrativa do Domínio de Quizzes

**Data:** 2026-07-01
**Tipo:** Backend only — Restrição de autorização (sem novas funcionalidades)

---

## Objectivo

Restringir todas as operações de escrita sobre Quizzes a `role:admin` exclusivamente:
- Mover rotas de gestão de quizzes de `role:admin,professor` para `role:admin`
- Confirmar que leitura permanece disponível a qualquer utilizador autenticado
- Garantir que o filtro `published-only` se aplica nos endpoints públicos
- Actualizar Swagger para reflectir "apenas Admin"
- Criar suite de testes de autorização cobrindo todos os perfis

---

## Alterações

### Módulo 1 — `routes/api.php`

**Alterado:** As 5 rotas de gestão de quizzes foram movidas do bloco `role:admin,professor` para o bloco `role:admin`.

**Antes:**
```php
Route::middleware('role:admin,professor')->group(function (): void {
    Route::post('/documents', ...);
    Route::patch('/documents/{id}', ...);
    Route::delete('/documents/{id}', ...);
    Route::post('/quizzes', ...);            // ← estava aqui
    Route::patch('/quizzes/{id}', ...);      // ← estava aqui
    Route::delete('/quizzes/{id}', ...);     // ← estava aqui
    Route::post('/quizzes/{id}/documents', ...);    // ← estava aqui
    Route::delete('/quizzes/{id}/documents/{documentId}', ...); // ← estava aqui
});
```

**Depois:**
```php
Route::middleware('role:admin,professor')->group(function (): void {
    Route::post('/documents', ...);
    Route::patch('/documents/{id}', ...);
    Route::delete('/documents/{id}', ...);
});

Route::middleware('role:admin')->group(function (): void {
    // ... rotas admin pré-existentes ...

    // Quizzes — management (admin only)
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::patch('/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    Route::post('/quizzes/{id}/documents', [QuizController::class, 'syncDocuments']);
    Route::delete('/quizzes/{id}/documents/{documentId}', [QuizController::class, 'detachDocument']);
});
```

**Rotas de leitura inalteradas** (qualquer utilizador autenticado):
```
GET  /quizzes
GET  /quizzes/{id}
GET  /quizzes/{id}/questions
GET  /quizzes/{id}/documents
GET  /documents/{id}/quizzes
```

---

### Módulo 2 — Swagger annotations (`QuizController`)

Actualizados os 5 endpoints de gestão:

| Endpoint | summary antes | summary depois |
|---|---|---|
| `POST /quizzes` | "...Admin/Professor" | "...apenas Admin" |
| `PATCH /quizzes/{id}` | "...Admin/Professor" | "...apenas Admin" |
| `DELETE /quizzes/{id}` | "...Admin/Professor" | "...apenas Admin" |
| `POST /quizzes/{id}/documents` | "...Admin/Professor" | "...apenas Admin" |
| `DELETE /quizzes/{id}/documents/{documentId}` | "...Admin/Professor" | "...apenas Admin" |

Resposta 403 em todos actualizada: "Requer admin ou professor" → "apenas Admin".

---

### Módulo 3 — Testes de autorização (`Sprint172Test`)

**Criado:** `tests/Feature/Sprint172Test.php` com 26 testes.

**Cobertura:**

| Cenário | Admin | Professor | Student | Unauthenticated |
|---|---|---|---|---|
| `POST /quizzes` | ✅ 201 | ✅ 403 | ✅ 403 | ✅ 401 |
| `PATCH /quizzes/{id}` | ✅ 200 | ✅ 403 | ✅ 403 | — |
| `DELETE /quizzes/{id}` | ✅ 200 | ✅ 403 | ✅ 403 | ✅ 401 |
| `POST /quizzes/{id}/documents` | ✅ 200 | ✅ 403 | ✅ 403 | ✅ 401 |
| `DELETE /quizzes/{id}/documents/{docId}` | ✅ 200 | ✅ 403 | — | — |
| `GET /quizzes` | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 401 |
| `GET /quizzes/{id}` | — | — | ✅ 200 | ✅ 401 |
| `GET /quizzes/{id}/documents` | — | — | ✅ 200 | — |
| `GET /documents/{id}/quizzes` | — | — | ✅ 200 | — |
| Filtro published-only em `GET /quizzes` | — | — | ✅ | — |
| Filtro published-only em `GET /documents/{id}/quizzes` | — | — | ✅ | — |

---

### Módulo 4 — Actualização de testes existentes

Os testes anteriores que usavam `professor` para operações de escrita em quizzes foram actualizados para usar `admin`:

| Ficheiro | Teste | Alteração |
|---|---|---|
| `Sprint17Test` | `test_create_quiz_with_documents_syncs_quiz_documents` | `professor` → `admin` |
| `Sprint17Test` | `test_create_quiz_without_documents_creates_no_associations` | `professor` → `admin` |
| `Sprint17Test` | `test_update_quiz_replaces_document_associations` | `professor` → `admin` |
| `Sprint17Test` | `test_update_quiz_without_documents_key_preserves_associations` | `professor` → `admin` |
| `Sprint17Test` | `test_professor_can_also_sync_documents` | Renomeado para `test_professor_cannot_sync_documents_returns_403`; comportamento invertido (403 esperado) |
| `Sprint17Test` | `test_deleting_quiz_also_removes_quiz_documents` | `professor` → `admin` |
| `Sprint171Test` | `test_quiz_documents_cleanup_on_quiz_delete` | `professor` → `admin` |
| `QuizCrudTest` | `test_admin_or_professor_can_create_quiz_with_nested_questions_and_options` | `professor` → `admin` |

---

## Ficheiros criados

| Ficheiro | Tipo |
|---|---|
| `tests/Feature/Sprint172Test.php` | Suite de testes |
| `sprint-17.2-consolidacao-administrativa-dominio-quizzes.md` | Relatório |

## Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `routes/api.php` | Quiz write routes movidas de `role:admin,professor` para `role:admin` |
| `app/Http/Controllers/Api/QuizController.php` | Swagger: 5 endpoints actualizados para "apenas Admin" |
| `tests/Feature/Sprint17Test.php` | 6 testes actualizados |
| `tests/Feature/Sprint171Test.php` | 1 teste actualizado |
| `tests/Feature/QuizCrudTest.php` | 1 teste actualizado |

---

## Validação

```
php artisan test --filter Sprint172Test   → 26/26 passed
php artisan test --filter Sprint17Test    → 23/23 passed (sem regressões)
php artisan test --filter Sprint171Test   → 26/26 passed (sem regressões)
php artisan test                          → 314/320 passed
                                            (3 falhas pré-existentes:
                                              AuthenticationTest SSL cert + verification_token,
                                              CommunityTest AccessGateService TypeError;
                                             3 erros pré-existentes: ProfileTest GD extension)
php artisan l5-swagger:generate           → OK
php artisan optimize:clear                → OK
```

---

## Critérios de conclusão — verificação

| Critério | Estado |
|---|---|
| Quiz write routes em `role:admin` exclusivamente | ✅ |
| Leitura de quizzes disponível a qualquer autenticado | ✅ |
| Filtro published-only em endpoints públicos | ✅ |
| Swagger actualizado: "apenas Admin" em todos os write endpoints | ✅ |
| Testes de autorização: admin OK, professor 403, student 403, unauthenticated 401 | ✅ |
| Testes existentes sem novas regressões | ✅ |
| Swagger regenerado | ✅ |
| Contratos do frontend inalterados | ✅ |
