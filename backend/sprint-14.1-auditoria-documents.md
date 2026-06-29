# Sprint 14.1 — Auditoria do Domínio Documents

**Data:** 2026-06-29
**Tipo:** Auditoria (sem alterações de código)
**Estado:** CONCLUÍDO

---

## Objectivo

Mapear completamente o estado actual do domínio Documents no backend, frontend mobile e base de dados, antes de qualquer alteração arquitectural.

---

## 1. Contrato da Base de Dados

### Tabela `documents`

| Coluna | Tipo | Nullable | Default | Notas |
|---|---|---|---|---|
| `id` | UUID | N | UUID() | PK |
| `title` | VARCHAR(500) | N | — | |
| `slug` | VARCHAR(500) | Y | NULL | Unique |
| `author` | VARCHAR(255) | N | — | |
| `institution` | VARCHAR(255) | Y | NULL | |
| `category_id` | UUID FK | Y | NULL | → document_categories |
| `document_type` | VARCHAR(20) | N | — | `manuscript\|article\|report\|thesis\|archive` |
| `academic_level` | VARCHAR(20) | N | `'intro'` | `intro\|advanced\|doctorate` |
| `access_level_id` | VARCHAR(20) | N | `'public'` | `public\|jindungo\|restricted` |
| `publication_date` | DATE | Y | NULL | Data histórica do documento |
| `period_start` | INTEGER | Y | NULL | Início do período histórico |
| `period_end` | INTEGER | Y | NULL | Fim do período histórico |
| `summary` | TEXT | N | — | |
| `content` | LONGTEXT | Y | NULL | |
| `cover_image_url` | VARCHAR(500) | Y | NULL | |
| `pdf_url` | VARCHAR(500) | Y | NULL | |
| `unique_id` | VARCHAR(50) | Y | NULL | **MORTO** — nunca preenchido |
| `physical_location` | VARCHAR | Y | NULL | **MORTO** — nunca preenchido |
| `record_type` | VARCHAR(100) | Y | NULL | **MORTO** — nunca preenchido |
| `status` | VARCHAR(20) | N | `'draft'` | `draft\|published\|archived` |
| `created_by` | UUID FK | N | — | → users |
| `reviewed_by` | UUID FK | Y | NULL | → users |
| `published_at` | DATETIME | Y | NULL | |
| `views_count` | INTEGER | N | 0 | |
| `likes_count` | INTEGER | N | 0 | |
| `downloads_count` | INTEGER | N | 0 | |
| `created_at` | TIMESTAMP | N | current | |
| `updated_at` | TIMESTAMP | N | current | |

### Tabelas de suporte

| Tabela | Propósito |
|---|---|
| `document_categories` | Categorias (slug, name, icon, color_bg, color_text, sort_order) |
| `tags` | Tags globais (name, slug) |
| `document_tags` | Pivot document ↔ tag |
| `document_likes` | Registo de gostos por utilizador |
| `document_downloads` | Registo de downloads por utilizador |
| `document_views` | Registo de visualizações por utilizador |
| `user_favorites` | Favoritos do utilizador |
| `document_citations` | Citações geradas |
| `quiz_documents` | Pivot quiz ↔ document |

---

## 2. Contrato do Backend (API)

### 2.1 Endpoints

| Método | Path | Auth | Roles | Descrição |
|---|---|---|---|---|
| GET | `/document-categories` | Sim | Qualquer | Lista categorias |
| GET | `/documents` | Sim | Qualquer | Lista com filtros e paginação |
| GET | `/documents/search` | Sim | Qualquer | Pesquisa rápida (limite 50, sem paginação) |
| GET | `/documents/{id}` | Sim | Qualquer | Detalhe + regista view |
| POST | `/documents/{id}/like` | Sim | Qualquer | Regista like |
| DELETE | `/documents/{id}/like` | Sim | Qualquer | Remove like |
| POST | `/documents/{id}/download` | Sim | Qualquer | Regista download + retorna pdf_url |
| POST | `/documents/{id}/favorite` | Sim | Qualquer | Adiciona aos favoritos |
| DELETE | `/documents/{id}/favorite` | Sim | Qualquer | Remove dos favoritos |
| POST | `/documents/{id}/citations` | Sim | Qualquer | Gera citação (apa\|mla\|chicago\|abnt) |
| GET | `/me/favorites` | Sim | Qualquer | Favoritos do utilizador autenticado |
| POST | `/documents` | Sim | admin, professor | Cria documento em draft |
| PATCH | `/documents/{id}` | Sim | admin, professor | Actualiza documento |
| DELETE | `/documents/{id}` | Sim | admin, professor | Elimina documento |

### 2.2 Parâmetros de filtro aceites em GET `/documents`

`q`, `category_id`, `document_type`, `academic_level`, `access_level_id`, `status`, `sort`, `page`, `per_page`

### 2.3 Estrutura do backend

| Componente | Estado | Observação |
|---|---|---|
| Model Eloquent | ❌ Não existe | Todo o domínio usa `DB::table('documents')` raw |
| DocumentResource | ❌ Não existe | Controller expõe `d.*` directamente (inclui campos mortos) |
| DocumentPolicy | ❌ Não existe | Autorização via middleware de role + `AccessGateService` |
| Form Requests | ❌ Não existem | Validação inline nos métodos `store()` e `update()` |

---

## 3. Contrato do Frontend Mobile

### 3.1 Interface TypeScript (`src/types/api.ts`)

```typescript
export type DocumentType = 'article' | 'thesis' | 'report' | 'manuscript' | 'archive' | 'video' | 'audio';
export type AcademicLevel = 'intro' | 'advanced' | 'doctorate';
export type AccessLevelId = 'public' | 'jindungo' | 'restricted';

export interface Document {
  id: string;
  title: string;
  slug: string | null;
  author: string;
  institution: string | null;
  category_id: string | null;
  document_type: DocumentType;
  academic_level: AcademicLevel;
  access_level_id: AccessLevelId;
  publication_date: string | null;
  period_start: number | null;
  period_end: number | null;
  summary: string;
  content: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  status: 'draft' | 'published';        // ⚠️ falta 'archived'
  created_by: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  likes_count: number;
  downloads_count: number;
  comments_count: number;               // 🔴 não existe na BD
  category?: DocumentCategory;
  tags?: Tag[];
  is_liked?: boolean;
  is_favorited?: boolean;
}
```

### 3.2 documentService — métodos

| Método | Endpoint | Tipo retornado | Estado |
|---|---|---|---|
| `list(filters?)` | GET `/documents` | `PaginatedResponse<Document>` | ✅ |
| `search(query, page?)` | GET `/documents/search` | `PaginatedResponse<Document>` | ⚠️ Shape incorrecta |
| `categories()` | GET `/document-categories` | `DocumentCategory[]` | ✅ |
| `detail(id)` | GET `/documents/{id}` | `Document` | ✅ |
| `like(id)` | POST `/documents/{id}/like` | `void` | ✅ |
| `unlike(id)` | DELETE `/documents/{id}/like` | `void` | ✅ |
| `favorite(id)` | POST `/documents/{id}/favorite` | `void` | ✅ |
| `unfavorite(id)` | DELETE `/documents/{id}/favorite` | `void` | ✅ |
| `myFavorites()` | GET `/me/favorites` | `PaginatedResponse<Document>` | ⚠️ Shape incorrecta |
| `download(id)` | POST `/documents/{id}/download` | — | ❌ Não implementado |
| `citation(id, format)` | POST `/documents/{id}/citations` | — | ❌ Não implementado |

### 3.3 Screens — campos utilizados

**ArticleScreen:**
Exibe: `document_type`, `access_level_id`, `title`, `author`, `institution`, `publication_date`, `published_at`, `category.name`, `tags`, `summary`, `content`, `likes_count`, `views_count`, `period_start`, `period_end`, `is_liked`
Detecta mas não acciona: `pdf_url` (exibe apenas divisor visual)
Não exibe: `cover_image_url`, `downloads_count`, `comments_count`, `is_favorited`

**ContentScreen:**
Exibe: `title`, `summary`, `author`, `category.name`, `access_level_id`, `likes_count`, `comments_count` (⚠️ sempre vazio), `published_at`, `document_type`
Filtros: `document_type`, `access_level_id`, `sort`

---

## 4. Campos auditados

| Campo | BD | Controller | Tipo TS | Screen | Estado |
|---|---|---|---|---|---|
| `document_type` | ✅ 5 valores | ✅ validado | ⚠️ 7 valores (inclui video/audio) | ✅ usado | 🔴 Inconsistente |
| `pdf_url` | ✅ | ✅ store/update | ✅ | ⚠️ sem acção | ⚠️ Parcial |
| `thumbnail` | ❌ | ❌ | ❌ | ❌ | N/A |
| `preview` | ❌ | ❌ | ❌ | ❌ | N/A |
| `comments_count` | ❌ | ❌ | ✅ declarado | ✅ exibido | 🔴 Inconsistente |
| `is_pinned` | ❌ (é de Topic) | ❌ | ❌ | ❌ | N/A |
| `is_featured` | ❌ (é de Quiz/Topic) | ❌ | ❌ | ❌ | N/A |
| `workflow` | ❌ | ❌ | ❌ | ❌ | N/A |
| `status` | ✅ 3 valores | ✅ validado | ⚠️ 2 valores (falta archived) | ❌ não usado | ⚠️ Parcial |
| `access_level_id` | ✅ | ✅ | ✅ | ✅ | ✅ Alinhado |
| `media` | ❌ | ❌ | ❌ | Label de UI apenas | N/A |
| `downloads_count` | ✅ | ✅ incrementado | ✅ | ❌ não exibido | ⚠️ Parcial |
| `views_count` | ✅ | ✅ incrementado | ✅ | ✅ exibido | ✅ Alinhado |
| `likes_count` | ✅ | ✅ | ✅ | ✅ | ✅ Alinhado |
| `academic_level` | ✅ | ✅ filtro | ✅ | ❌ sem UI de selecção | ⚠️ Parcial |
| `publication_date` | ✅ | ✅ | ✅ | ✅ | ✅ Alinhado |
| `period_start` | ✅ | ✅ | ✅ | ✅ | ✅ Alinhado |
| `period_end` | ✅ | ✅ | ✅ | ✅ | ✅ Alinhado |

---

## 5. Contratos duplicados

| Problema | Campos | Observação |
|---|---|---|
| Data de publicação duplicada | `publication_date` vs `published_at` | `publication_date` = data histórica do documento; `published_at` = data de publicação na plataforma. Semanticamente distintos mas frequentemente confundidos. `ArticleScreen` usa `publication_date ?? published_at` como data do autor — um documento histórico de 1975 publicado na plataforma em 2026 mostraria "1975". |

---

## 6. Código morto

| Item | Tipo | Localização |
|---|---|---|
| `unique_id` | Coluna BD | Nunca preenchida por nenhum endpoint ou seeder |
| `physical_location` | Coluna BD | Idem |
| `record_type` | Coluna BD | Idem |
| `downloads_count` | Campo BD + Tipo TS | Incrementado no backend, nunca exibido em nenhuma screen |
| `is_favorited` | Tipo TS + `show()` | Retornado pela API, nunca usado para estado inicial em nenhuma screen |
| `academic_level` | ContentParams | Aceite como filtro de navegação mas sem UI de selecção em ContentScreen |
| `documentService.search()` | Método | Definido mas não chamado por nenhuma screen activa |
| `API_ENDPOINTS.DOCUMENTS.DOWNLOAD` | Constante | Endpoint e constante existem mas método no service não existe |
| `API_ENDPOINTS.DOCUMENTS.CITATIONS` | Constante | Idem |
| `cover_image_url` em ArticleScreen | Campo | Retornado pela API e usado nos cards de lista, mas não exibido na screen de detalhe |

---

## 7. Incompatibilidades Backend × Frontend

### 🔴 IC-1 — `comments_count` (CRÍTICO)
- **Backend:** campo não existe na tabela `documents`
- **Frontend:** `Document.comments_count: number` em `api.ts:142`; `ContentScreen` renderiza o valor com ícone de chat
- **Runtime:** valor é sempre `undefined`; aparece vazio na UI

### 🔴 IC-2 — `document_type` video/audio (ALTO)
- **Backend:** aceita apenas `manuscript | article | report | thesis | archive`
- **Frontend:** `DocumentType` inclui `'video' | 'audio'`; Home e Dashboard têm botões que filtram por estes tipos
- **Runtime:** filtros por `video` ou `audio` retornam sempre 0 resultados

### ⚠️ IC-3 — Response shape de `myFavorites` incorrecta (MÉDIO)
- **Backend:** retorna `{ data: array }` sem `meta`
- **Frontend:** service tipa como `PaginatedResponse<Document>` (com `meta`)
- **Estado:** bug latente — nenhuma screen activa consome `response.meta`

### ⚠️ IC-4 — Response shape de `search` incorrecta (MÉDIO)
- **Backend:** retorna `{ data: array }` sem `meta`
- **Frontend:** service tipa como `PaginatedResponse<Document>`
- **Estado:** bug latente — `documentService.search()` não é chamado por nenhuma screen

### ⚠️ IC-5 — `status: 'archived'` em falta no tipo frontend (BAIXO)
- **Backend:** aceita `draft | published | archived`
- **Frontend:** `Document.status: 'draft' | 'published'`

### ⚠️ IC-6 — `pdf_url` sem botão de download (BAIXO)
- **Backend:** endpoint `POST /documents/{id}/download` implementado e funcional
- **Frontend:** `ArticleScreen` detecta `pdf_url` mas exibe apenas um divisor visual sem botão clicável; `documentService` não tem método `download()`

---

## 8. Endpoints afectados por campo

| Campo / Problema | Endpoints afectados |
|---|---|
| `comments_count` (IC-1) | GET `/documents`, GET `/documents/{id}`, GET `/me/favorites` |
| `video/audio` (IC-2) | GET `/documents` (filtro), GET `/documents/search` (filtro) |
| `myFavorites` shape (IC-3) | GET `/me/favorites` |
| `search` shape (IC-4) | GET `/documents/search` |
| `status: archived` (IC-5) | PATCH `/documents/{id}`, GET `/documents` |
| `pdf_url` sem acção (IC-6) | POST `/documents/{id}/download` — nunca chamado |

---

## 9. Sugestões de Refatoração

| # | Problema | Solução proposta | Risco |
|---|---|---|---|
| 1 | `comments_count` não existe na BD | Remover do tipo TS e da UI, ou criar coluna + sistema de comentários | Baixo |
| 2 | `video/audio` sem suporte no backend | Adicionar ao backend, ou esconder os botões de UI até feature estar pronta | Médio |
| 3 | Response shape de `myFavorites` e `search` | Corrigir tipos no service para `{ data: Document[] }` ou implementar paginação real | Baixo |
| 4 | `pdf_url` sem botão de download | Adicionar método `download()` ao service e botão em `ArticleScreen` | Baixo |
| 5 | `status: 'archived'` em falta | Adicionar ao tipo TS: `'draft' \| 'published' \| 'archived'` | Muito baixo |
| 6 | Campos mortos na BD (`unique_id`, `physical_location`, `record_type`) | Migration de remoção ou mover para tabela `document_archive_metadata` | Baixo |
| 7 | Sem Model Eloquent `Document` | Criar `app/Models/Document.php` com fillable, casts e relações | Médio |
| 8 | Sem `DocumentResource` | Criar Resource que controle os campos expostos e elimine campos mortos da resposta | Médio |
| 9 | `download()` e `citation()` não implementados no service | Adicionar métodos ao `documentService.ts` | Baixo |
| 10 | `cover_image_url` ausente em ArticleScreen | Adicionar imagem de capa no topo do scroll da screen de detalhe | Baixo |

---

## 10. Pendências identificadas para `pendencia.md`

```
### 5. comments_count — campo inexistente na BD (PRIORIDADE ALTA)
Tipo TS declara comments_count: number. ContentScreen exibe com ícone de chat.
O campo não existe na tabela documents.
Decisão: implementar sistema de comentários com coluna, ou remover do tipo e da UI.

### 6. document_type video/audio — sem suporte backend (PRIORIDADE MÉDIA)
Frontend declara 'video' e 'audio' como DocumentType válidos.
Home, Dashboard e MediaFormatCards têm botões que filtram por estes tipos.
Backend aceita apenas: manuscript, article, report, thesis, archive.
Filtros por video/audio retornam sempre 0 resultados.
Decisão: implementar no backend ou remover da UI até feature estar pronta.

### 7. Campos mortos na tabela documents (PRIORIDADE BAIXA)
Três colunas existem na migration mas nunca são preenchidas:
- unique_id (VARCHAR 50)
- physical_location (string)
- record_type (VARCHAR 100)
São retornadas em todas as respostas via d.*.
Decisão: migration de remoção ou tabela separada de metadados de arquivo físico.

### 8. Response shape de myFavorites e search incorrecta (PRIORIDADE MÉDIA)
GET /me/favorites e GET /documents/search retornam { data: array } sem meta.
documentService tipa ambos como Promise<PaginatedResponse<Document>>.
Corrigir tipos no service ou implementar paginação real nos endpoints.

### 9. Endpoints download e citation não implementados no frontend (PRIORIDADE BAIXA)
POST /documents/{id}/download e POST /documents/{id}/citations existem no backend
e em API_ENDPOINTS, mas documentService não tem métodos download() e citation().
ArticleScreen não expõe botão de download mesmo quando pdf_url existe.
```

---

## Resumo Executivo

| Categoria | Contagem |
|---|---|
| Campos ✅ Alinhados | 6 |
| Campos ⚠️ Parciais | 5 |
| Campos 🔴 Inconsistentes | 2 |
| Campos N/A (não pertencem ao domínio) | 6 |
| Incompatibilidades críticas (IC) | 6 |
| Itens de código morto | 10 |
| Sugestões de refatoração | 10 |

O domínio Documents tem um alinhamento razoável nos campos principais, mas carece de estrutura arquitectural (sem Model, Resource, Policy ou Form Requests). As duas inconsistências com maior impacto imediato no utilizador são **IC-1** (`comments_count` exibido na UI mas inexistente na BD) e **IC-2** (`video/audio` declarados no frontend mas não suportados pelo backend).

---

*Gerado em Sprint 14.1 — Nenhum código foi alterado nesta sprint.*
