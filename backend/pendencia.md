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
