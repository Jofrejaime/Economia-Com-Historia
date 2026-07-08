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
`DocumentPinned`, `DocumentUnpinned`, `DocumentViewed`, `DocumentDownloaded`,
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

## Próximos domínios (fases seguintes)

Replicar o mesmo padrão (eventos → listeners → subscriber, refatorar o service
para emitir): Utilizadores, Comunidade, Moderação, Acesso, Gamificação, Reports,
Configurações. Ver a lista completa de eventos na spec da Sprint 18.9.

## Sprint 19.0 — Reverb

Bastará: alguns eventos passarem a implementar `ShouldBroadcast` (ou criar
listeners de broadcast), ligar o Reverb e definir canais. **Sem reescrever
domínios** — a arquitetura já está pronta.
