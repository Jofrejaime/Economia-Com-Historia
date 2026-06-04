# Fase 1 — Backend: Corrigir Fundação e Preparar Integração

Fase 1 do plano de integração Angular + Laravel. Foco exclusivo no **backend** — corrigir bugs críticos, enriquecer endpoints existentes, adicionar middleware de segurança e popular a BD com dados de conteúdo.

## User Review Required

> [!IMPORTANT]
> **Middleware de role**: Vou criar um middleware `EnsureRole` que recebe roles permitidas como parâmetros. Será aplicado nas rotas que precisam de restrição (ex: `reviewRequest`, `POST /documents`, `notifications/send`). A convenção proposta é `admin` para rotas exclusivas de administrador e `admin,professor` para rotas de gestão de conteúdo. Confirma se esta granularidade está correta.

> [!WARNING]
> **Seeders de conteúdo**: Os seeders `DocumentSeeder`, `QuizSeeder` e `CommunitySeeder` referidos no `DatabaseSeeder` não existem. Vou criá-los com dados de exemplo sobre história económica de Angola (temas como Caminho de Ferro de Benguela, comércio atlântico, etc.). Confirma se este tema está correto.

## Open Questions

> [!IMPORTANT]
> **`password_confirmation` no registo**: O backend exige `'confirmed'` (requer campo `password_confirmation`). Vou manter este comportamento no backend — a correção principal será no frontend (Fase 1 frontend). Concordas, ou preferes relaxar a validação no backend?

> [!IMPORTANT]
> **Quantidade de dados seed**: Quanto conteúdo de exemplo queres nos seeders?
> - Proposta: 6 categorias de documentos, 10 documentos, 3 quizzes (com ~5 perguntas cada), 4 categorias de comunidade, 8 tópicos e 15 respostas
> - Isto é suficiente para demonstrar a integração, ou preferes mais/menos?

---

## Proposed Changes

### 1. Enriquecer `GET /api/me` com `user_levels` e `badges`

#### [MODIFY] [AuthController.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/AuthController.php)

O método `me()` (L144–170) atualmente devolve `user`, `profile` e `access_grants`. Falta `user_levels` que o frontend precisa para stats do perfil.

**Alterações**:
- Adicionar query a `user_levels` com JOIN a `level_definitions` para incluir nome e cor do nível
- Adicionar query a `user_badges` com JOIN a `badges` para listar conquistas do utilizador
- Devolver tudo numa resposta estruturada:

```php
return response()->json([
    'user' => $user,
    'profile' => $profile,
    'access_grants' => $accessGrants,
    'user_level' => $userLevel,       // NEW
    'level_definition' => $levelDef,  // NEW
    'badges' => $badges,              // NEW
]);
```

---

### 2. Middleware de Role (`EnsureRole`)

#### [NEW] [EnsureRole.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Middleware/EnsureRole.php)

Middleware que valida `$request->user()->role` contra uma lista de roles permitidas:

```php
// Uso nas rotas:
Route::middleware([AuthenticateApiSession::class, 'role:admin'])->group(...)
Route::middleware([AuthenticateApiSession::class, 'role:admin,professor'])->group(...)
```

- Se o role do utilizador não estiver na lista, devolve `403 Forbidden`
- Requer que `AuthenticateApiSession` tenha corrido antes

#### [MODIFY] [bootstrap/app.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/bootstrap/app.php)

Registar o middleware alias `role` apontando para `EnsureRole::class`.

#### [MODIFY] [api.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/routes/api.php)

Reorganizar as rotas protegidas em 3 grupos:

1. **Rotas autenticadas** (qualquer utilizador logado) — perfil, documentos (leitura), quizzes (leitura), comunidade (leitura), notificações (próprias), access requests (próprios)
2. **Rotas de admin** (`role:admin`) — `reviewRequest`, `POST /community/categories`, `storeCategory`, `notifications/send`, `reports/action`, gestão de utilizadores
3. **Rotas de criação** (`role:admin,professor`) — `POST /documents`, `POST /quizzes`

---

### 3. Seeders de Conteúdo

#### [NEW] [DocumentSeeder.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/database/seeders/DocumentSeeder.php)

- 6 categorias de documentos (ex: "Economia Colonial", "Comércio Atlântico", "Industrialização", "Política Económica Pós-Independência", "Agricultura e Recursos Naturais", "História Monetária")
- 10 documentos distribuídos pelas categorias, com tipos variados (manuscript, article, report, thesis, archive)
- Tags relacionadas
- Alguns documentos com access_level `jindungo` e `restricted` para testar níveis de acesso

#### [NEW] [QuizSeeder.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/database/seeders/QuizSeeder.php)

- 3 quizzes com 5 perguntas cada
- Cada pergunta com 4 opções (A-D), uma correta, com explicações
- Dificuldades: Básico, Intermédio, Avançado
- Temas: "Caminho de Ferro de Benguela", "Comércio de Escravos no Atlântico", "Economia Pós-Independência"

#### [NEW] [CommunitySeeder.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/database/seeders/CommunitySeeder.php)

- 4 categorias de comunidade (ex: "Discussão Geral", "Pesquisa Académica", "Fontes Primárias", "Metodologia")
- 8 tópicos distribuídos pelas categorias, criados pelos utilizadores seed
- 15 respostas nos tópicos
- Alguns tópicos com likes e seguidores

#### [MODIFY] [DatabaseSeeder.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/database/seeders/DatabaseSeeder.php)

Descomentar os 3 seeders de conteúdo:
```diff
-        // $this->call([
-        //     DocumentSeeder::class,
-        //     QuizSeeder::class,
-        //     CommunitySeeder::class,
-        // ]);
+        $this->call([
+            DocumentSeeder::class,
+            QuizSeeder::class,
+            CommunitySeeder::class,
+        ]);
```

---

### 4. Registo: Assegurar `user_levels` na criação

#### [MODIFY] [AuthController.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/AuthController.php)

O método `register()` cria `user` e `user_profiles` mas **não cria** um registo em `user_levels`. Isto faz com que `GET /api/me` nunca devolva level data para utilizadores novos.

**Alteração**: Adicionar insert em `user_levels` dentro da transação do `register()`, tal como o `UserSeeder` já faz (L131-143).

```php
DB::table('user_levels')->insert([
    'id' => (string) Str::uuid(),
    'user_id' => $user->id,
    'current_level' => 1,
    'total_points' => 0,
    'weekly_points' => 0,
    'monthly_points' => 0,
    'quizzes_completed' => 0,
    'documents_read' => 0,
    'topics_created' => 0,
    'replies_posted' => 0,
    'updated_at' => now(),
]);
```

---

### 5. Corrigir `me()` no login para incluir dados completos

#### [MODIFY] [AuthController.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/AuthController.php)

O `login()` actualmente devolve apenas `user` (objecto base). Para consistência com o frontend que usa a response do login para popular o state, incluir também `profile` e `role` no response do login:

```php
return response()->json([
    'message' => 'Login successful.',
    'token' => $token,
    'user' => $user,
    'profile' => DB::table('user_profiles')->where('user_id', $user->id)->first(),
]);
```

---

### 6. Implementar stubs 501 prioritários no `DocumentController`

#### [MODIFY] [DocumentController.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/DocumentController.php)

Implementar os seguintes métodos que atualmente retornam 501:

| Método | O que implementar |
|--------|-------------------|
| `update()` | Validar campos, atualizar documento via DB::table |
| `like()` | Insert em `document_likes` + incrementar `likes_count` |
| `unlike()` | Delete de `document_likes` + decrementar `likes_count` |
| `download()` | Insert em `document_downloads` + incrementar `downloads_count` |
| `favorite()` | Insert em `user_favorites` |
| `unfavorite()` | Delete de `user_favorites` |
| `createCitation()` | Insert em `document_citations` com formato (apa/mla/chicago) |

Também enriquecer `index()` e `show()` com JOINs para incluir:
- Nome da categoria
- Nome do access_level
- Contagem de tags
- Info do autor (display_name do criador)

---

### 7. Populações de `leaderboard_nacional_cache` no seeder

#### [MODIFY] [UserSeeder.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/database/seeders/UserSeeder.php)

Após criar todos os utilizadores, inserir dados no `leaderboard_nacional_cache` para que `GET /api/leaderboard/national` não devolva lista vazia.

---

## Resumo de Ficheiros Afetados

| Ficheiro | Ação | Prioridade |
|----------|------|------------|
| `AuthController.php` | Enriquecer `me()`, `login()`, `register()` | Crítica |
| `EnsureRole.php` | Novo middleware | Crítica |
| `bootstrap/app.php` | Registar middleware | Crítica |
| `api.php` | Reorganizar rotas com middleware de role | Crítica |
| `DocumentController.php` | Implementar stubs 501 | Alta |
| `DocumentSeeder.php` | Criar seeder | Alta |
| `QuizSeeder.php` | Criar seeder | Alta |
| `CommunitySeeder.php` | Criar seeder | Alta |
| `DatabaseSeeder.php` | Descomentar seeders | Alta |
| `UserSeeder.php` | Adicionar leaderboard cache | Média |

---

## Verification Plan

### Automated Tests
- Correr os testes existentes (`php artisan test`) para garantir que as alterações não quebram nada
- Criar novos testes:
  - `RoleMiddlewareTest` — verificar 403 para roles não autorizados
  - `MeEndpointTest` — verificar que `/api/me` devolve `user_level`, `badges`
  - `DocumentCrudTest` — verificar like/unlike/favorite/unfavorite

### Manual Verification
- `php artisan migrate:fresh --seed` — verificar que os seeders correm sem erros
- `php artisan route:list` — confirmar middleware aplicado nas rotas admin
- Verificar via Postman/curl que `GET /api/me` devolve dados completos com level info
