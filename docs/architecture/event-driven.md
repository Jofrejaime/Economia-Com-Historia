# Arquitetura Orientada a Eventos (Event-Driven)

> Sprint 18.9 — Preparação para tempo real. **O Laravel Reverb NÃO faz parte
> desta sprint.** O objetivo é desacoplar as regras de negócio da
> infraestrutura, para que a Sprint 19.0 apenas ligue eventos ao Reverb sem
> reescrever domínios.

## Porquê

Antes, os Services executavam diretamente ações de infraestrutura:

```
Controller → Service → BD → limpa cache → envia notificação → gamificação → log
```

O Service conhecia todos os consumidores. Agora:

```
Controller → Service → BD (transação) → Domain Event → Listeners → Infraestrutura
                                                          ├── Cache
                                                          ├── Notificações
                                                          ├── Auditoria
                                                          ├── Gamificação
                                                          ├── Estatísticas
                                                          └── (Reverb na 19.0)
```

O Service **atualiza a BD e emite um evento**. Não sabe quem o consome.

Regra de ouro — nenhum Service deve:
- enviar notificações;
- limpar cache diretamente;
- escrever logs de auditoria;
- conhecer WebSockets / Reverb;
- calcular gamificação diretamente.

## Peças

### Domain Event

Todos herdam de [`App\Events\Domain\AbstractDomainEvent`](../../backend/app/Events/Domain/AbstractDomainEvent.php).

Envelope padronizado e estável (independente de infraestrutura):

| Campo | Descrição |
|---|---|
| `event_id` | UUID único do evento |
| `event_name` | Nome canónico no passado, ex.: `document.published` |
| `occurred_at` | ISO-8601 |
| `actor_id` | Quem provocou o evento (nullable p/ convidados/sistema) |
| `correlation_id` | Liga eventos da mesma operação |
| `aggregate_id` | ID do agregado afetado (ex.: id do documento) |
| `version` | Versão do contrato do evento |
| `payload` | Dados específicos do evento (array) |

**Convenção:** nomes **sempre no passado** — `DocumentPublished`, nunca
`PublishDocument`. Organizados por domínio em `app/Events/Domain/<Dominio>/`.

### Listener

Uma classe = **uma responsabilidade**. Ex. (domínio Documentos):

- `InvalidateDocumentCacheListener` — invalida o cache.
- `AuditLogListener` — regista o envelope do evento (genérico, todos os domínios).
- `Documents\DocumentNotificationListener` — notifica o autor na publicação.
- `Documents\DocumentGamificationListener` — pontos de upload/leitura.
- `Documents\DocumentStatisticsListener` — contador de visualizações.

Nenhum listener acumula duas responsabilidades diferentes.

### Subscriber

Um por domínio. Liga eventos → listeners e é o **único** ponto que conhece o
mapeamento. Ex.: [`App\Subscribers\DocumentSubscriber`](../../backend/app/Subscribers/DocumentSubscriber.php).

Registado em [`AppServiceProvider::boot()`](../../backend/app/Providers/AppServiceProvider.php)
via `Event::subscribe(DocumentSubscriber::class)`.

## Transações — disparar só após o commit

`AbstractDomainEvent` implementa `ShouldDispatchAfterCommit`. Quando um evento é
emitido dentro de uma transação, **só é entregue aos listeners após o commit**;
se houver rollback, é descartado. Nunca reagimos a estados que possam reverter.

Fora de transação, o evento é entregue de imediato.

```php
DB::transaction(function () use (...) {
    // ... escreve na BD
});

DocumentCreated::dispatch($id, $actorId, ['title' => $title, 'created_by' => $id]);
```

## Fluxo completo (exemplo: publicar documento)

1. `DocumentController::update` → `DocumentAdminService::update`.
2. O service grava na BD (transação) e emite `DocumentUpdated` e, na primeira
   publicação, `DocumentPublished`.
3. Após o commit, o `DocumentSubscriber` encaminha:
   - `DocumentUpdated` → cache + auditoria;
   - `DocumentPublished` → cache + auditoria + notificação ao autor.
4. O service não sabe nada disto.

## Eventos do domínio Documentos (piloto desta sprint)

`DocumentCreated`, `DocumentUpdated`, `DocumentDeleted`, `DocumentPublished`,
`DocumentPinned`, `DocumentUnpinned`, `DocumentViewed`,
`DocumentFavorited`, `DocumentUnfavorited`, `DocumentLiked`, `DocumentUnliked`.

Os eventos de interação (viewed/liked/…) são emitidos mesmo quando ainda não têm
listener — o contrato fica pronto para a Sprint 19.0.

> **Exceção deliberada:** os pontos de gamificação do *like* permanecem
> síncronos no controller, porque a resposta HTTP devolve `gamification.points_delta`
> de imediato — não pode ser diferido para afterCommit. Todos os outros efeitos
> (upload, leitura, notificações, cache, auditoria, estatísticas) são listeners.

## Testar eventos e listeners

- **Eventos disparam** — `Event::fake([...])` + `Event::assertDispatched(...)`
  (ver `tests/Feature/DomainEventsTest.php`). Funciona sob `RefreshDatabase`.
- **Listeners executam / responsabilidade única / payload** — invocar o `handle`
  do listener diretamente e verificar o efeito (ver `tests/Feature/ListenersTest.php`).
- **afterCommit** — sob `RefreshDatabase` os eventos `ShouldDispatchAfterCommit`
  **não** são entregues (a transação de teste nunca faz commit). Por isso os
  listeners são testados por invocação direta, e o comportamento afterCommit é
  validado no rollback (o listener não corre) e pelo `instanceof ShouldDispatchAfterCommit`.

## Fase 1 — Notificações event-driven (concluída)

Além dos Documentos, as **notificações** dos seguintes domínios já são criadas
por listeners (os services/controllers deixaram de as criar diretamente). Base
comum: [`AbstractNotificationListener`](../../backend/app/Listeners/AbstractNotificationListener.php).

| Domínio | Eventos | Listener / Subscriber |
|---|---|---|
| Comunidade | `TopicReplied`, `ReplyAccepted`, `TopicMemberInvited`, `TopicMemberRemoved` | `CommunityNotificationListener` / `CommunitySubscriber` |
| Acesso | `SubscriptionApproved`, `SubscriptionRejected`, `SubscriptionCancelled` | `AccessNotificationListener` / `AccessSubscriber` |
| Moderação | `ReportResolved`, `ModerationActionTaken` | `ModerationNotificationListener` / `ModerationSubscriber` |
| Gamificação | `LevelUp`, `BadgeEarned` | `GamificationNotificationListener` / `GamificationSubscriber` |

Testes: um `<Dominio>ListenersTest` por domínio (invocação direta do listener) +
assert de dispatch nos testes de endpoint. Ver
[plano de rollout](./eda-notifications-rollout-plan.md).

## Fase 2 — Gamificação de ciclo de vida em listeners (parcial)

A gamificação da **Comunidade** deixou de viver no controller:
- Eventos: `TopicCreated`, `TopicReplied`, `ReplyAccepted` (os dois últimos
  reutilizados da Fase 1).
- [`CommunityGamificationListener`](../../backend/app/Listeners/Community/CommunityGamificationListener.php):
  criar tópico (20 pts), responder (10 pts), resposta aceite (50 pts).
- O `CommunityController` já **não injeta** `GamificationService`.

### Decisões de âmbito (deliberadas)

- **Gamificação de Quizzes mantém-se síncrona.** A resposta HTTP da submissão
  devolve `gamification.points_delta` de imediato — não pode ser diferida para
  afterCommit. É a exceção já documentada nesta arquitetura.
- **Contadores intrínsecos** (`topics_count`, `replies_count`, `last_reply_at`)
  **mantêm-se síncronos** na transação — são estado do próprio agregado,
  esperado imediatamente consistente (há testes que o assertam). A EDA extrai
  efeitos *transversais* (notificações, gamificação, cache, auditoria), não os
  contadores intrínsecos.
- **Invalidação de cache nos services** (categorias, tags, províncias, settings…)
  fica onde está: invalidar o próprio cache logo após a escrita é uma
  responsabilidade aceitável do service e de baixo valor a extrair. Pode ser
  movida para listeners no futuro se necessário, mas não é uma violação EDA
  relevante como eram as notificações/gamificação.

## Sprint 19.0 — Reverb (tempo real) — CONCLUÍDA

## Sprint 19.0 — Reverb (tempo real) — CONCLUÍDA

As notificações são entregues em **tempo real** via [Laravel Reverb](https://reverb.laravel.com), sem reescrever domínios.

**Backend**
- `laravel/reverb` instalado; `BROADCAST_CONNECTION=reverb` (vars `REVERB_*` no `.env`).
- Canal privado por utilizador `App.Models.User.{id}` — [routes/channels.php](../../backend/routes/channels.php). IDs são **UUID**: a autorização compara como string (nunca `(int)`).
- Auth dos canais pela **auth de token** da plataforma: `POST /api/broadcasting/auth` protegido por `AuthenticateApiSession` (não usa o guard `web`).
- [`App\Events\NotificationCreated`](../../backend/app/Events/NotificationCreated.php) (`ShouldBroadcast`) emitido pelo `NotificationService::send()` — o **funil único** por onde todas as notificações passam. Evento no canal: `notification.created`.

**Frontend** (web e mobile)
- `laravel-echo` + `pusher-js` (protocolo Reverb). Web: `RealtimeService`; mobile: `services/realtime/echo.ts`.
- Ligam ao canal privado do utilizador (Bearer token no `authEndpoint`) e atualizam o **contador/sino** e a lista de notificações sem recarregar.
- Tolerante a falhas: se o Reverb estiver em baixo, a app funciona na mesma (notificações aparecem ao recarregar).

**Como correr (local)**
1. Backend: `php artisan reverb:start` (servidor WebSocket em `127.0.0.1:8080`) + `php artisan serve`.
2. `.env` do backend com `BROADCAST_CONNECTION=reverb` e `REVERB_*`; frontend com as mesmas `key/host/port/scheme` (ver `environment.ts` / `EXPO_PUBLIC_REVERB_*`).

**Produção:** o Reverb é um processo WebSocket persistente — **não** corre em serverless (ex.: Vercel). Precisa de um host próprio (VPS/container) a correr `reverb:start` (idealmente sob supervisor). Até isso estar definido, as notificações continuam a funcionar por carregamento normal.
