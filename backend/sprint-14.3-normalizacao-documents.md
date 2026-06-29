# Sprint 14.3 — Normalização do Domínio Documents (Media e Conteúdos Fixados)

**Data:** 2026-06-29
**Tipo:** Evolução de backend
**Estado:** CONCLUÍDO

---

## 1. Auditoria Realizada

### 1.1 `document_type`

| Localização | Valores | Decisão |
|---|---|---|
| `documents` DB | `VARCHAR(20)` com CHECK `manuscript\|article\|report\|thesis\|archive` | **Mantido** — formato académico |
| DocumentController | Validação e filtro | **Mantido** |
| DocumentResource | Campo exposto | **Mantido** |
| Form Requests | Validação `in:manuscript,...` | **Mantido** |
| DocumentSeeder | 5 tipos usados | **Inalterado** |
| QuizController L801 | Selecciona `d.document_type` | **Inalterado** |
| SQL Dump | CHECK constraint existente | **Inalterado** |

**Conclusão:** `document_type` é o formato académico do conteúdo. Não é substituído por `media_type` — são conceitos diferentes.

### 1.2 `pdf_url`

| Localização | Estado | Decisão |
|---|---|---|
| `documents` DB | `VARCHAR(500) NULLABLE` | **Mantido** — legado |
| DocumentController `download()` | Retorna `pdf_url` na resposta | **Mantido** — backward compat |
| DocumentResource | Campo exposto | **Mantido com nota de deprecação** |
| Form Requests (store/update) | Campo aceite | **Mantido** |
| DocumentSeeder | `'pdf_url' => null` em todos | **Inalterado** |

**Conclusão:** `pdf_url` mantido para compatibilidade. Documentado como legado. Novos conteúdos devem usar `media_url` + `media_type=PDF`.

### 1.3 `thumbnail` / `preview` / `media_type` / `media_url`

Nenhum destes campos existia no schema anterior. São **novos campos** desta sprint.

### 1.4 `is_pinned` / `pinned` / `is_featured`

| Localização | Contexto | Decisão |
|---|---|---|
| `discussion_topics` | `is_pinned`, `is_featured` existentes | **Inalterado** (pertence ao Community domain) |
| `quizzes` | `is_featured` existente | **Inalterado** |
| `documents` | Ausente | **Adicionado** `is_pinned` nesta sprint |

**Conclusão:** `is_pinned` para documentos era inexistente. Implementado nesta sprint. `is_featured` não se aplica a documentos segundo a spec.

---

## 2. Contrato de Media Normalizado

### Tipos oficiais (congelados)

```
TEXT   — documento de texto puro (sem ficheiro media associado)
IMAGE  — imagem ou documento digitalizado
VIDEO  — conteúdo em vídeo
AUDIO  — conteúdo em áudio
PDF    — ficheiro PDF
```

### Campos de armazenamento

| Campo | Tipo DB | Nullable | Sprint | Descrição |
|---|---|---|---|---|
| `media_type` | `VARCHAR(20)` | Sim | 14.3 | Tipo de media (enumeração acima) |
| `media_url` | `VARCHAR(500)` | Sim | 14.3 | URL unificado para qualquer ficheiro |
| `pdf_url` | `VARCHAR(500)` | Sim | original | **LEGADO** — mantido por retrocompatibilidade |

**Distinção `document_type` vs `media_type`:**
- `document_type` = forma académica do conteúdo (artigo, tese, relatório…)
- `media_type` = formato do ficheiro (PDF, vídeo, áudio…)
- Um documento pode ser `document_type=thesis, media_type=PDF`.

---

## 3. Ficheiros Alterados

| Ficheiro | Alteração |
|---|---|
| `database/migrations/2026_06_29_000001_sprint14_3_normalize_documents.php` | **CRIADO** — adiciona `media_type`, `media_url`, `is_pinned` à tabela `documents` |
| `app/Models/Document.php` | Adicionado `media_type`, `media_url`, `pdf_url` (legado), `is_pinned` ao `$fillable` e cast `is_pinned => boolean` |
| `app/Http/Resources/DocumentResource.php` | Adicionado `media_type`, `media_url`, `is_pinned`; `pdf_url` marcado como legado em comentário |
| `app/Http/Requests/StoreDocumentRequest.php` | Adicionada validação de `media_type` e `media_url` |
| `app/Http/Requests/UpdateDocumentRequest.php` | Adicionada validação de `media_type` e `media_url` |
| `app/Policies/DocumentPolicy.php` | Adicionado gate `pin` (admin-only) |
| `app/Http/Controllers/Api/DocumentController.php` | SELECTs actualizados; filtros `media_type` e `pinned` adicionados ao `index()`; métodos `pin()` e `unpin()` adicionados com Swagger |
| `routes/api.php` | Rotas `POST/DELETE /documents/{id}/pin` adicionadas no grupo admin |
| `pendencia.md` | Adicionado Contrato de Media; actualizado estado do IC-2; adicionadas pendências 5–10 |

---

## 4. Contratos Normalizados

### Novos campos na API

Todos os endpoints de listagem, detalhe e pesquisa passam a incluir:

```json
{
  "media_type": "PDF",
  "media_url": "https://storage.example.com/doc.pdf",
  "pdf_url": null,
  "is_pinned": false
}
```

### Novos filtros em `GET /documents`

| Parâmetro | Tipo | Exemplo |
|---|---|---|
| `media_type` | string enum | `?media_type=PDF` |
| `pinned` | boolean | `?pinned=true` |

### Novos endpoints (admin-only)

| Método | Path | Descrição |
|---|---|---|
| `POST` | `/documents/{id}/pin` | Fixa o documento (`is_pinned = true`) |
| `DELETE` | `/documents/{id}/pin` | Remove fixação (`is_pinned = false`) |

---

## 5. Código Legado Removido

Nenhum código foi removido nesta sprint. Toda a lógica existente foi preservada por retrocompatibilidade.

---

## 6. Código Legado Mantido

| Item | Motivo |
|---|---|
| `pdf_url` (campo DB + API) | Retrocompatibilidade com registos existentes e frontend que usa `pdf_url` |
| `document_type` (manuscript, article, etc.) | Formato académico — conceito diferente de `media_type` |
| `download()` retorna `pdf_url` | Não quebrar comportamento existente |

---

## 7. Impacto na API

| Endpoint | Impacto |
|---|---|
| `GET /documents` | Campos novos na resposta; novos filtros disponíveis — **não quebra** |
| `GET /documents/search` | Campos novos na resposta — **não quebra** |
| `GET /documents/{id}` | Campos novos na resposta — **não quebra** |
| `GET /me/favorites` | Campos novos na resposta — **não quebra** |
| `POST /documents` | Aceita `media_type`, `media_url` opcionais — **não quebra** |
| `PATCH /documents/{id}` | Aceita `media_type`, `media_url` opcionais — **não quebra** |
| `POST /documents/{id}/pin` | **NOVO** — admin only |
| `DELETE /documents/{id}/pin` | **NOVO** — admin only |

---

## 8. Impacto na Base de Dados

### Migração executada

```
2026_06_29_000001_sprint14_3_normalize_documents → DONE (926ms)
```

### Colunas adicionadas à tabela `documents`

| Coluna | Tipo | Default | Índice |
|---|---|---|---|
| `media_type` | `VARCHAR(20) NULL` | NULL | `idx_documents_media_type` |
| `media_url` | `VARCHAR(500) NULL` | NULL | — |
| `is_pinned` | `BOOLEAN NOT NULL` | `FALSE` | `idx_documents_pinned` |

Registos existentes: `media_type = NULL`, `media_url = NULL`, `is_pinned = FALSE`.

---

## 9. Swagger

- `php artisan l5-swagger:generate` executado sem erros.
- Novos endpoints `pin`/`unpin` documentados com `@OA\Post`/`@OA\Delete`.
- Parâmetros `media_type` e `pinned` documentados em `GET /documents`.
- Campo `media_type` com enum `TEXT|IMAGE|VIDEO|AUDIO|PDF` em `POST /documents`.
- Campo `pdf_url` marcado como `DEPRECATED — use media_url`.

---

## 10. Testes Executados

```
php artisan test --filter="DocumentAccessTest|DocumentFavoritesTest|DocumentLikeGamificationTest"
  → 12/12 passam ✅

php artisan test (suite completa)
  → 160 testes
  → 154 passaram ✅
  → 3 falharam ⚠️ (pré-existentes, AuthenticationTest — SSL/pwnedpasswords)

php artisan l5-swagger:generate → ✅
php artisan optimize:clear → ✅
```

---

## 11. Limitações Encontradas

### 11.1 `media_type` sem CHECK constraint no DB

A migração não inclui um CHECK constraint MySQL para os valores `TEXT|IMAGE|VIDEO|AUDIO|PDF` porque:
- O MySQL 5.7 não aplica CHECK constraints
- A validação é feita na camada de aplicação (Form Request)
- Para MySQL 8.0.16+ ou PostgreSQL, adicionar a constraint é trivial numa futura migração

### 11.2 `download()` devolve `pdf_url` em vez de `media_url`

O endpoint `POST /documents/{id}/download` devolve:
```json
{ "message": "Download recorded.", "pdf_url": "..." }
```
Seria mais correcto devolver `media_url`. Mantido como-está para não quebrar o frontend quando este implementar o download. Documentado como pendência.

---

## 12. Resultado Final

**CONCLUÍDO**

| Requisito | Estado |
|---|---|
| Auditoria completa (`document_type`, `pdf_url`, `thumbnail`, `media_type`, `is_pinned`, `is_featured`) | ✅ |
| Contrato de media: `TEXT\|IMAGE\|VIDEO\|AUDIO\|PDF` | ✅ |
| Campos `media_type` e `media_url` adicionados | ✅ |
| `pdf_url` mantido com nota de deprecação | ✅ |
| `is_pinned` adicionado para documentos | ✅ |
| Endpoints `pin`/`unpin` (admin-only) | ✅ |
| Filtros `media_type` e `pinned` em `GET /documents` | ✅ |
| DocumentResource actualizado | ✅ |
| Form Requests actualizados | ✅ |
| DocumentPolicy — gate `pin` | ✅ |
| `pendencia.md` actualizado | ✅ |
| Swagger regenerado sem erros | ✅ |
| Testes de documentos: 12/12 passam | ✅ |
| Sem alterações no frontend | ✅ |
| Contratos existentes preservados | ✅ |
