# Sprint 2 — Access + AccessGate + Documents

**Data de conclusão:** 4 de junho de 2026  
**Âmbito:** backend Laravel (`backend/`)

---

## Objetivo

Fechar o controlo de acesso por níveis (`public`, `jindungo`, `restricted`) e aplicar regras de visibilidade nos documentos através de um serviço centralizado, evitando lógica duplicada nos controladores.

---

## Entregas

| Área | Ficheiro / componente | Estado |
|------|------------------------|--------|
| Serviço de gate | `app/Services/AccessGateService.php` | ✅ |
| Middleware de papel | `app/Http/Middleware/EnsureRole.php` | ✅ |
| Pedidos e grants | `app/Http/Controllers/Api/AccessController.php` | ✅ |
| Documentos com gate | `app/Http/Controllers/Api/DocumentController.php` | ✅ |
| Categorias | `GET /api/document-categories` | ✅ |
| Testes | `AccessGateServiceTest`, `AccessControlTest`, `DocumentAccessTest` | ✅ |

**Não incluído nesta sprint:** notificações por e-mail em aprovação/revogação, gate em Quiz/Community (previsto nas sprints seguintes).

---

## AccessGateService

Serviço registado como singleton em `AppServiceProvider`.

| Método | Descrição |
|--------|-----------|
| `canAccess(User, accessLevelId)` | `true` se admin, se nível `public`, ou se existe grant activo para o nível |
| `canAccessDocument(User, document)` | Autor do documento, admin, ou `canAccess` ao `access_level_id` do documento |
| `applyDocumentVisibilityFilter(Builder, User, alias?)` | Filtra listagens: `public` OU `created_by` = utilizador OU grants activos |
| `activeGrantLevelIds(User)` | Lista de `access_level_id` com grant activo (não revogado, não expirado) |
| `hasActiveGrant(User, accessLevelId)` | Para `public` devolve sempre `true`; para outros verifica grants |

**Regra importante — pedido de nível `public`:** o conteúdo `public` é sempre visível logicamente (`canAccess`), mas o utilizador ainda pode **solicitar** o nível `public` para obter um registo em `user_access_grants` (fluxo de pedido). A verificação de duplicados em `storeRequest` usa `activeGrantLevelIds()`, não `hasActiveGrant()`, para não bloquear o primeiro pedido com 409 incorrecto.

**Admin:** `role === 'admin'` ignora todas as verificações de gate.

---

## AccessController — comportamento actual

### Listagens com `scope`

- `GET /access-requests?scope=mine` (predefinição) — pedidos do utilizador autenticado
- `GET /access-requests?scope=all` — todos os pedidos (**apenas admin**)
- `GET /access-requests?status=pending|approved|rejected|revoked` — filtro opcional
- `GET /access-grants?scope=mine|all` — mesma regra de admin para `all`

Resposta: `{ "data": [ ... ] }` (máx. 100 pedidos na listagem).

### Criar pedido

`POST /access-requests`

```json
{
  "access_level_id": "jindungo",
  "justification": "Motivo opcional"
}
```

- Se `access_levels.auto_grant === true` (`public`): pedido criado com `status: approved` e grant criado na mesma transacção.
- Caso contrário: `status: pending` até review admin.
- **409** se já tem grant activo para o nível ou pedido `pending`/`approved` duplicado.

### Detalhe do pedido

`GET /access-requests/{id}` — dono do pedido ou admin; caso contrário **403**.

### Revisão (admin)

`PATCH /access-requests/{id}` — middleware `role:admin`

```json
{
  "status": "approved",
  "review_notes": "Opcional"
}
```

- Apenas pedidos `pending`; já revisto → **409**.
- Aprovação cria ou reactiva `user_access_grants`.

### Revogar grant (admin)

`POST /access-grants/{id}/revoke` — define `revoked_at` e `is_active: false`.

---

## Documents — integração AccessGate

Endpoints protegidos que aplicam gate:

| Método | Endpoint | Gate |
|--------|----------|------|
| GET | `/documents` | Filtro na query (`applyDocumentVisibilityFilter`) |
| GET | `/documents/search` | Idem |
| GET | `/documents/{id}` | `canAccessDocument` → 403 |
| POST | `/documents/{id}/download` | Idem |
| POST/DELETE | `/documents/{id}/like` | Idem |
| POST/DELETE | `/documents/{id}/favorite` | Idem |
| POST | `/documents/{id}/citations` | Idem |

Resposta **403** típica:

```json
{
  "message": "You do not have access to this content.",
  "required_access_level_id": "jindungo"
}
```

Listagens para utilizadores não-admin limitam `status` a `published` salvo filtro explícito.

Documentação de API detalhada: [`docs/api/documents.md`](../api/documents.md) e [`docs/api/access-control.md`](../api/access-control.md).

---

## Testes

```bash
cd backend
php artisan test --filter=Access
php artisan test --filter=DocumentAccess
```

Cobertura relevante: grants automáticos, 403 sem grant, filtro de listagem, ownership em `showRequest`, duplicados 409.

---

## Referências

- Plano geral: [`docs/PLANO-ORDEM-API.md`](../PLANO-ORDEM-API.md) — Sprint 2
- Auditoria: [`docs/AUDITORIA-API-LARAVEL.md`](../AUDITORIA-API-LARAVEL.md)
