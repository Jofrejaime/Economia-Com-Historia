# Pendências e Decisões Arquitecturais

## Arquitectura Oficial (congelada em Sprint 13.1)

### Community

```
Categoria
  └── Organização (nome, descrição, ordem, ícone, cor)
  └── NÃO controla acesso

Topic
  └── Visibility (controla acesso)
        ├── PUBLIC       — qualquer utilizador autenticado pode ver e responder
        ├── CATEGORY     — utilizadores com acesso à categoria podem ver e responder
        └── INVITE_ONLY  — apenas membros explicitamente convidados podem interagir
```

### Documents

```
Categoria
  └── Organização (nunca autorização)

Documento
  └── Subscription (controla acesso)
        ├── public
        ├── restricted
        └── jindungo
```

### Access Control

Access Levels representam apenas permissões da plataforma e funcionalidades administrativas.
Nunca controlam acesso a documentos, tópicos ou categorias.

---

## Pendências Técnicas

### 1. Migração de valores legados na base de dados (PRIORIDADE ALTA)

A migração `2026_06_28_000001_sprint13_rename_topic_visibility_values.php` foi criada
e renomeia os valores legados na tabela `discussion_topics`:

| Valor Legado | Valor Oficial |
|---|---|
| `RESTRICTED` | `CATEGORY` |
| `PRIVATE` | `INVITE_ONLY` |

**Acção necessária**: Executar `php artisan migrate` em produção durante uma janela de manutenção.

Até a migração ser executada, dados existentes na BD têm os valores legados.
O `CommunityAuthorizationService` já usa os valores oficiais — por isso tópicos
antigos com `PRIVATE`/`RESTRICTED` não serão reconhecidos correctamente.

### 2. community_categories.access_level_id (LEGADO)

A coluna `community_categories.access_level_id` é legada.
Não deve ser utilizada para autorização de acesso a tópicos (essa responsabilidade
pertence ao `Topic.visibility`).

Manter a coluna por compatibilidade até que uma sprint dedicada confirme que não
existe nenhuma dependência residual em módulos externos (ex: relatórios, admin panel).

### 3. Visibilidade CATEGORY — definição oficial

Um tópico com `visibility = 'CATEGORY'` é visível para utilizadores que tenham
acesso à categoria a que o tópico pertence. O acesso à categoria é determinado
pelo `AccessGateService` com base nas permissões do utilizador na plataforma.

Quem pode ver: utilizadores com grant para o `access_level_id` da categoria.
Quem pode responder: idem.
Quem pode criar: qualquer utilizador autenticado com acesso à categoria.

### 4. DiscussionTopic model — comentário legado

`app/Models/DiscussionTopic.php` linha 12 contém um comentário informal
com terminologia antiga. Actualizar para reflectir a arquitectura oficial.

---

## Contrato de Media (congelado em Sprint 14.3)

### Tipos de media oficiais

```
TEXT   — documento de texto puro
IMAGE  — imagem ou documento digitalizado
VIDEO  — conteúdo em vídeo
AUDIO  — conteúdo em áudio
PDF    — ficheiro PDF
```

### Campos de armazenamento de media

| Campo | Estado | Descrição |
|---|---|---|
| `media_type` | ✅ Activo | Tipo de media (enumeração acima) |
| `media_url` | ✅ Activo | URL unificado para qualquer ficheiro de media |
| `pdf_url` | ⚠️ Legado | Mantido por retrocompatibilidade. Novos conteúdos devem usar `media_url` com `media_type=PDF`. Remoção futura. |

### Conteúdo fixado (Pinned)

- Campo `is_pinned BOOLEAN` na tabela `documents` (Sprint 14.3)
- Endpoints admin-only: `POST /documents/{id}/pin` e `DELETE /documents/{id}/pin`
- Filtro disponível em `GET /documents?pinned=true`

---

## Domínio de Subscrições de Documentos (actualizado em Sprint 16)

### Arquitectura oficial (separação de responsabilidades)

```
DocumentAccessService      — autorização (canReadDocument, isSubscriptionRequired, applyListingFilter)
DocumentSubscriptionService — ciclo de vida (requestSubscription, approveSubscription, cancelSubscription, …)
AdminDocumentSubscriptionController — endpoints admin de gestão de pedidos
```

### Fluxo de estados

```
PENDING → ACTIVE     (admin: approveSubscription)
PENDING → REJECTED   (admin: rejectSubscription)
PENDING → CANCELLED  (admin ou utilizador: cancelSubscription)
ACTIVE  → CANCELLED  (admin ou utilizador: cancelSubscription)
```

### Regra de ouro

O `DocumentController` nunca consulta `AccessGateService` directamente.
Toda a autorização de documentos passa pelo `DocumentAccessService`.
O `DocumentController` usa `DocumentSubscriptionService` apenas para operações de ciclo de vida.

### Endpoints de subscrição (utilizador)

| Método   | Path                             | Descrição                                             |
|----------|----------------------------------|-------------------------------------------------------|
| `GET`    | `/documents/{id}/subscription`   | Estado da subscrição (inclui `reason`)                |
| `POST`   | `/documents/{id}/subscribe`      | Criar pedido PENDING (admin: body user_id)            |
| `DELETE` | `/documents/{id}/subscription`   | Cancelar subscrição ACTIVE ou PENDING                 |

### Endpoints admin

| Método   | Path                                          | Descrição                   |
|----------|-----------------------------------------------|-----------------------------|
| `GET`    | `/admin/document-subscriptions`               | Listar pedidos (filtros)    |
| `PATCH`  | `/admin/document-subscriptions/{id}/approve`  | PENDING → ACTIVE            |
| `PATCH`  | `/admin/document-subscriptions/{id}/reject`   | PENDING → REJECTED          |
| `PATCH`  | `/admin/document-subscriptions/{id}/cancel`   | ACTIVE/PENDING → CANCELLED  |

### Campo `reason` no subscriptionStatus

| Estado      | Reason                    |
|-------------|---------------------------|
| `PENDING`   | `WAITING_ADMIN_APPROVAL`  |
| `ACTIVE`    | `ACCESS_GRANTED`          |
| `REJECTED`  | `REQUEST_REJECTED`        |
| `CANCELLED` | `SUBSCRIPTION_CANCELLED`  |

### Compatibilidade legada

Documentos sem `category.requires_subscription=true` continuam a ser controlados
pelo `access_level_id` (modelo antigo com `AccessGrant`). Isto mantém todos os
testes de `DocumentAccessTest` verdes sem alterações.

### Listagem administrativa (Sprint 16)

`GET /admin/document-subscriptions` suporta os seguintes parâmetros:

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `status` | string | PENDING / ACTIVE / REJECTED / CANCELLED |
| `document_id` | uuid | Filtro por documento |
| `user_id` | uuid | Filtro por utilizador |
| `category_id` | uuid | Filtro pela categoria do documento |
| `date_from` | date | Data de início (YYYY-MM-DD) |
| `date_to` | date | Data de fim (YYYY-MM-DD) |
| `search` | string | LIKE em email, display_name e título |
| `sort_by` | string | created_at / started_at / updated_at / status |
| `sort_direction` | string | asc / desc (default: desc) |
| `per_page` | integer | Máx. 100 (default: 20) |

A resposta inclui `category_id` e `category_name` por subscrição.

### Dashboard admin — secções (Sprint 16)

`GET /admin/dashboard/summary` inclui:
- `documents`: total, published, draft, review, archived, pinned
- `categories`: total, free, requires_subscription
- `subscriptions`: total, pending, active, rejected, cancelled

### Ordenação pinned-first (Sprint 16)

`GET /documents` garante que documentos com `is_pinned = true` aparecem sempre
no topo, independentemente do parâmetro `sort` (popular ou created_at).

### Campos de auditoria (Sprint 15.3)

| Campo | Preenchido quando |
|---|---|
| `approved_by` | Admin aprova (PENDING → ACTIVE) |
| `rejected_by` | Admin rejeita (PENDING → REJECTED) |
| `cancelled_by` | Admin cancela (ACTIVE/PENDING → CANCELLED); NULL quando o utilizador cancela |

### Máquina de estados (Sprint 15.3)

Toda validação de transição vive em `DocumentSubscriptionService`. Os controllers nunca tocam em `status`, `approved_by`, `rejected_by` ou `cancelled_by` directamente.

Transições inválidas retornam **409 Conflict** com `current_status` no body.

### Campos removidos

`expires_at` foi removido da tabela `document_subscriptions` em Sprint 15.2.
Subscrições no MVP não têm prazo de validade. Re-adicionar quando subscriptions pagas/temporárias forem implementadas.

---

## Pendências Documents (Sprint 14.1 → actualizado em Sprint 14.3)

### 5. comments_count — campo inexistente na BD (PRIORIDADE ALTA)
Tipo TS declara `comments_count: number`. ContentScreen exibe com ícone de chat.
O campo não existe na tabela `documents`.
Decisão: implementar sistema de comentários com coluna, ou remover do tipo e da UI.

### 6. document_type video/audio — RESOLVIDO em Sprint 14.3
Frontend declarava 'video' e 'audio' como DocumentType. Backend não aceitava.
Solução: novo campo `media_type` (TEXT|IMAGE|VIDEO|AUDIO|PDF) resolve o filtro correcto.
`document_type` mantém valores académicos (manuscript|article|report|thesis|archive).

### 7. Campos mortos na tabela documents (PRIORIDADE BAIXA)
Três colunas nunca preenchidas: `unique_id`, `physical_location`, `record_type`.
Excluídas da Resource e do Model fillable em Sprint 14.2.
Remoção física da BD fica para sprint dedicada.

### 8. Response shape de myFavorites e search incorrecto (PRIORIDADE MÉDIA)
GET /me/favorites e GET /documents/search retornam `{ data: array }` sem `meta`.
documentService tipa ambos como `Promise<PaginatedResponse<Document>>`.
Corrigir tipos no service ou implementar paginação real nos endpoints.

### 9. Endpoints download e citation não implementados no frontend (PRIORIDADE BAIXA)
POST /documents/{id}/download e POST /documents/{id}/citations existem no backend.
documentService não tem métodos download() e citation().
ArticleScreen não expõe botão de download mesmo quando pdf_url/media_url existe.

### 10. pdf_url — campo legado (PRIORIDADE BAIXA)
Substituído semanticamente por media_url + media_type=PDF em Sprint 14.3.
Ainda retornado pela API para compatibilidade. Remover quando frontend migrar para media_url.

---

## Valores Oficiais de Visibilidade

```php
// Aceites pela API (CommunityController validation):
'PUBLIC'      // público
'CATEGORY'    // visível por membros da categoria
'INVITE_ONLY' // apenas membros convidados

// LEGADOS — não usar em código novo:
// 'PRIVATE'     → usar INVITE_ONLY
// 'RESTRICTED'  → usar CATEGORY
```
