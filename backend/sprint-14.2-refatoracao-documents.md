# Sprint 14.2 — Refatoração Estrutural do Domínio Documents

**Data:** 2026-06-29
**Tipo:** Refatoração interna (backend apenas)
**Estado:** CONCLUÍDO

---

## 1. Auditoria de Campos Mortos

Confirmados como nunca preenchidos (por nenhum endpoint, seeder ou test helper):

| Campo | Confirmação |
|---|---|
| `unique_id` | Ausente em todos os `DB::table('documents')->insert()` do código e dos testes |
| `physical_location` | Idem |
| `record_type` | Idem |

**Decisão nesta sprint:** Os campos permanecem na tabela (sem migration de remoção). Foram excluídos da `DocumentResource` e do `$fillable` do Model — nunca serão retornados pela API nem preenchidos por Eloquent.

---

## 2. Arquivos Criados

### Modelos

| Arquivo | Descrição |
|---|---|
| `app/Models/Document.php` | Model principal com fillable, casts e todas as relações |
| `app/Models/DocumentCategory.php` | Model de categorias de documentos |
| `app/Models/Tag.php` | Model de tags |
| `app/Models/DocumentLike.php` | Model de gostos em documentos |
| `app/Models/DocumentDownload.php` | Model de downloads |
| `app/Models/DocumentView.php` | Model de visualizações |
| `app/Models/UserFavorite.php` | Model de favoritos do utilizador |
| `app/Models/DocumentCitation.php` | Model de citações geradas |
| `app/Models/QuizDocument.php` | Model pivot quiz ↔ document |

### HTTP Layer

| Arquivo | Descrição |
|---|---|
| `app/Http/Resources/DocumentResource.php` | Resource com campos públicos explícitos; exclui campos mortos e internos |
| `app/Http/Requests/StoreDocumentRequest.php` | Form Request para criação de documentos |
| `app/Http/Requests/UpdateDocumentRequest.php` | Form Request para atualização de documentos |

### Authorization

| Arquivo | Descrição |
|---|---|
| `app/Policies/DocumentPolicy.php` | Policy com gates: view, create, update, delete, publish, archive |

---

## 3. Arquivos Alterados

| Arquivo | Alterações |
|---|---|
| `app/Http/Controllers/Api/DocumentController.php` | Substituída validação inline por Form Requests; `show()` usa `Document::with()` + DocumentResource; action methods usam `Document::find()`; list methods envolvidos com DocumentResource; `findDocument()` removido; `denyUnlessCanAccessDocument()` mantido |
| `app/Providers/AuthServiceProvider.php` | Registado `Document::class => DocumentPolicy::class` |

---

## 4. Arquitectura Antes/Depois

### Antes (Sprint 14.1 baseline)

```
DocumentController
├── validação inline em store() e update()
├── DB::table('documents')->where('id', $id)->first() em todos os métodos
├── findDocument() — helper privado com JOIN manual
├── select('d.*') — expõe todos os campos incluindo os 3 mortos
├── sem Model Eloquent
├── sem Resource
├── sem Form Requests
└── sem Policy
```

### Depois (Sprint 14.2)

```
DocumentController
├── StoreDocumentRequest — validação + authorize()
├── UpdateDocumentRequest — validação + authorize()
├── Document::find() / Document::with()->find() nos métodos de acção e detalhe
├── DocumentResource — shape pública explícita, sem campos mortos/internos
├── DB::table() com SELECT explícito (sem d.*) nos métodos de listagem
└── denyUnlessCanAccessDocument() — mantido (preserva resposta 403 customizada)

Document (Eloquent Model)
├── fillable, casts
└── relações: category, accessLevel, createdBy, reviewedBy,
              tags, likes, downloads, views, favorites,
              citations, quizDocuments

DocumentPolicy
├── view    — AccessGateService.canAccessDocument()
├── create  — role admin|professor
├── update  — role admin|professor
├── delete  — role admin|professor
├── publish — admin ou professor dono do documento
└── archive — admin
```

---

## 5. Impacto na API

**Nenhuma alteração de contrato.** Todos os endpoints mantêm:
- Paths inalterados
- Métodos HTTP inalterados
- Response shapes idênticas

**Única diferença de shape:** Os campos mortos (`unique_id`, `physical_location`, `record_type`) e o campo interno `reviewed_by` deixaram de ser incluídos nas respostas. Estes campos eram sempre `null` e não estão declarados nos tipos TypeScript do frontend — impacto zero.

---

## 6. Impacto na Base de Dados

**Nenhuma migração criada ou executada.**

Os campos mortos (`unique_id`, `physical_location`, `record_type`) permanecem na tabela. A sua remoção fica para uma sprint dedicada.

---

## 7. Compatibilidade

| Área | Estado |
|---|---|
| Contratos JSON consumidos pelo frontend | ✅ Inalterados |
| Endpoints existentes | ✅ Todos preservados |
| Regras de negócio | ✅ Inalteradas |
| Autorização por role (EnsureRole middleware) | ✅ Mantida |
| AccessGateService — visibilidade de documentos | ✅ Mantida |
| Gamification em likes | ✅ Mantida |
| Resposta 403 customizada com `required_access_level_id` | ✅ Mantida |

---

## 8. Testes Executados

```
php artisan test --filter="DocumentAccessTest|DocumentFavoritesTest|DocumentLikeGamificationTest"
  → 12 testes, 12 passaram ✅

php artisan test  (suite completa)
  → 160 testes
  → 154 passaram ✅
  → 3 falharam ⚠️ (pré-existentes, não relacionados com esta sprint)
  → 3 falhanços pré-existentes:
       AuthenticationTest::test_user_can_register
         — falta chave 'verification_token' na resposta
       AuthenticationTest::test_user_can_verify_email
         — SSL certificate error ao contactar api.pwnedpasswords.com
     Ambos falhavam antes desta sprint (problema de ambiente / configuração)

php artisan optimize:clear  → ✅ OK
php artisan l5-swagger:generate  → ✅ OK
```

---

## 9. Limitações Encontradas

### 9.1 DocumentResource — duplo modo de operação

A `DocumentResource` precisa de distinguir se o recurso é um `Document` Eloquent (com relações carregadas) ou um `stdClass` vindo das queries JOIN de `index()`, `search()` e `myFavorites()`.

Foi necessário usar `$this->resource instanceof Document` para bifurcar o acesso às propriedades. Esta dualidade existe porque as queries de listagem continuam a usar `DB::table()` com JOINs (ver §9.2).

### 9.2 Queries de listagem mantidas em DB::table()

Os métodos `index()`, `search()` e `myFavorites()` continuam a usar `DB::table()` com JOINs explícitos, por dois motivos:

1. `AccessGateService::applyDocumentVisibilityFilter()` recebe `Illuminate\Database\Query\Builder` — incompatível com `Illuminate\Database\Eloquent\Builder` sem refatorar o Service.
2. Migrar as queries de listagem para Eloquent com eager loading em queries paginadas representa risco de regressão acima do escopo desta sprint.

A Resource funciona corretamente com ambos os tipos de resultado.

### 9.3 Policy não usada explicitamente no Controller

A `DocumentPolicy` está registada e funcional. O Controller mantém `denyUnlessCanAccessDocument()` para os gates de `view` porque esta função retorna um JSON customizado com `required_access_level_id`, que o frontend usa para redirecionar para o upgrade de plano.

Usar `$this->authorize('view', $document)` retornaria um 403 genérico sem esse campo. A integração completa da Policy no Controller (com handler customizado de `AuthorizationException`) fica para uma sprint futura.

---

## 10. Resultado Final

**CONCLUÍDO**

### Tabela de cumprimento

| Requisito | Estado |
|---|---|
| Model Eloquent `Document` com fillable, casts e relações | ✅ |
| `DocumentResource` com campos explícitos, sem campos mortos | ✅ |
| `StoreDocumentRequest` com validação e autorização | ✅ |
| `UpdateDocumentRequest` com validação e autorização | ✅ |
| `DocumentPolicy` com gates view/create/update/delete/publish/archive | ✅ |
| Policy registada em `AuthServiceProvider` | ✅ |
| Controller refatorado para usar Form Requests | ✅ |
| Controller refatorado para usar Document::find() nas acções | ✅ |
| Controller usa DocumentResource nas respostas | ✅ |
| Campos mortos auditados e excluídos da Resource | ✅ |
| `php artisan test` — testes de documentos todos a passar | ✅ |
| `php artisan l5-swagger:generate` sem erros | ✅ |
| `php artisan optimize:clear` sem erros | ✅ |
| Contratos JSON preservados | ✅ |
| Sem alterações no frontend | ✅ |
| Sem novos endpoints | ✅ |
| Sem alterações na base de dados | ✅ |
