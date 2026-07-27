# Plano de Implementação — EDA completa + Notificações + Tempo Real

> Continuação de [event-driven.md](./event-driven.md). O piloto (domínio
> **Documentos**) está concluído e testado. Este plano leva o mesmo padrão a
> **todos os domínios**, torna **todas as notificações event-driven** e prepara
> e liga o **tempo real (Reverb)**.

## Estado atual (verificado no código)

| Área | Estado |
|---|---|
| EDA — domínio Documentos (11 eventos, 5 listeners, subscriber, testes) | ✅ Completo |
| EDA — restantes domínios (Comunidade, Acesso, Moderação, Gamificação, Quizzes, Utilizadores, Config) | ❌ Serviços fazem infraestrutura diretamente |
| Notificações — CRUD, service, navegação por clique (web) | ✅ Funciona |
| Notificações — event-driven | ⚠️ Só Documentos; as outras são criadas diretamente |
| Tempo real (Reverb) | ❌ Não instalado (`BROADCAST_CONNECTION=log`, sem `config/reverb.php`) |

### Focos de infraestrutura a extrair (levantamento)

- **Notificações diretas:** `CommunityController` (convite/remoção/resposta), `DocumentSubscriptionService`, `GamificationService` (nível/badge), `ReportService`, `ReportModerationService`.
- **Cache direto nos services:** `CommunityCategoryService`, `DocumentCategoryService`, `InterestAreaService`, `LeaderboardService`, `LevelDefinitionService`, `ProvinceService`, `SettingsService`, `TagService`, `TopicService`, `UserAdminService`.
- **Gamificação direta:** `QuizAttemptService`, `CommunityController`, `QuizController`, `ProfileController`.

---

## Princípios (mantidos do piloto)

1. Um evento = facto no passado (`TopicReplied`, não `ReplyTopic`); herda de `AbstractDomainEvent`.
2. Um listener = uma responsabilidade (cache / auditoria / notificação / gamificação / estatística).
3. Um subscriber por domínio, registado em `AppServiceProvider::boot()`.
4. `ShouldDispatchAfterCommit` — reagir só após commit.
5. O service atualiza a BD e emite o evento; **não** conhece os consumidores.
6. Exceção deliberada (já existente): efeitos que a resposta HTTP precisa de
   devolver de imediato (ex.: `gamification.points_delta` no *like*/quiz) ficam
   síncronos; tudo o resto vira listener.

---

## Fase 0 — Fundação e limpeza (0,5 dia)

- [ ] Corrigir [event-driven.md](./event-driven.md): remover `DocumentDownloaded` da lista (downloads foram removidos da plataforma).
- [ ] Extrair um `NotificationListener` base reutilizável (assinatura comum: recebe evento → chama `NotificationService`), para os domínios não repetirem código.
- [ ] Confirmar que `AuditLogListener` é genérico (já é) e passa a subscrever os eventos de todos os domínios (registo incremental por subscriber).

**Aceitação:** doc atualizado; suite verde; nenhum comportamento alterado.

---

## Fase 1 — Notificações event-driven (2–3 dias) — MAIOR VALOR

Objetivo: retirar a criação de notificações dos controllers/services e passá-la
para listeners. Cada domínio ganha o seu 1.º evento + `…NotificationListener` +
subscriber. É o passo que dá mais valor visível e monta o esqueleto por domínio.

### 1.1 Comunidade — `app/Events/Domain/Community/`
| Evento | Emitido por | Listener(s) |
|---|---|---|
| `TopicReplied` | `TopicService`/`CommunityController::storeReply` | Notifica autor do tópico + auditoria |
| `ReplyAccepted` | `CommunityController::acceptReply` | Notifica autor da resposta |
| `TopicMemberInvited` | `storeTopicMember` | Notifica convidado |
| `TopicMemberRemoved` | `destroyTopicMember` | Notifica removido |

Subscriber: `CommunitySubscriber`. Remover os `notificationService->…` diretos do controller.

### 1.2 Acesso / Subscrições — `app/Events/Domain/Access/`
| Evento | Emitido por | Listener(s) |
|---|---|---|
| `SubscriptionRequested` | `DocumentSubscriptionService::request` | (futuro: notificar admins) + auditoria |
| `SubscriptionApproved` | `approveSubscription` | Notifica utilizador (acesso concedido) |
| `SubscriptionRejected` | `rejectSubscription` | Notifica utilizador |
| `SubscriptionCancelled` | `adminCancelSubscription` | Notifica utilizador |

Subscriber: `AccessSubscriber`.

### 1.3 Moderação / Reports — `app/Events/Domain/Moderation/`
| Evento | Emitido por | Listener(s) |
|---|---|---|
| `ReportSubmitted` | `ReportService::submit` | (futuro: notificar moderadores) + auditoria |
| `ReportResolved` | `ReportModerationService::review` | Notifica denunciante do desfecho |
| `ModerationActionTaken` | `ReportModerationService::executeAction` | Notifica autor do conteúdo (aviso/remoção) |

Subscriber: `ModerationSubscriber`.

### 1.4 Gamificação — `app/Events/Domain/Gamification/`
| Evento | Emitido por | Listener(s) |
|---|---|---|
| `LevelUp` | `GamificationService` | Notifica utilizador (subiu de nível) |
| `BadgeEarned` | `BadgeService`/`GamificationService` | Notifica utilizador (novo badge) |

Subscriber: `GamificationSubscriber`. (Os pontos em si continuam síncronos onde a resposta HTTP os devolve.)

**Aceitação Fase 1:** nenhum controller/service cria notificações diretamente
(exceto o `NotificationController` de envio manual pelo admin); testes por
domínio a la `NotificationTest` (evento dispara + listener notifica) verdes.

---

## Fase 2 — EDA completa (cache, auditoria, estatísticas, gamificação) (3–4 dias)

Para cada domínio, replicar integralmente o padrão dos Documentos: mover cache,
auditoria, estatísticas e gamificação para listeners.

### 2.1 Comunidade
- `TopicCreated/Updated/Deleted`, `TopicPinned/Locked`, `ReplyCreated/Deleted`.
- Listeners: invalidação de cache (`TopicService` já usa `Cache::`), estatísticas (contadores de respostas/visualizações), gamificação (pontos por participação).

### 2.2 Quizzes / Aprendizagem
- `QuizAttemptStarted`, `QuizAttemptCompleted`.
- Listeners: gamificação (pontos/badges via `QuizAttemptService`), estatísticas, cache do leaderboard.
- Nota: manter síncrono o `points_delta` devolvido na submissão da resposta.

### 2.3 Utilizadores
- `UserRegistered`, `UserActivated/Deactivated`, `UserRoleChanged`.
- Listeners: cache (`UserAdminService`), auditoria, (futuro: email de boas-vindas).

### 2.4 Categorias / Config / Referência
- `CategoryCreated/Updated/Deleted` (documento e comunidade), `SettingsUpdated`, `TagCreated/Merged`, `Province/InterestArea/Level changed`.
- Listener único de invalidação de cache por agregado (substitui os `Cache::forget` espalhados).

### 2.5 Acesso / Moderação (completar)
- Auditoria + cache dos eventos já criados na Fase 1.

**Aceitação Fase 2:** grep a `Cache::` e a gamificação nos services fica limpo
(só nos listeners); cada domínio tem `DomainEventsTest`/`ListenersTest`; suite
completa verde; sem regressões.

---

## Fase 3 — Tempo real (Reverb / Sprint 19.0) (2–3 dias)

Pré-requisito: Fases 1–2 concluídas (as notificações já passam por eventos).

### 3.1 Backend
- [ ] `composer require laravel/reverb` + `php artisan reverb:install` (gera `config/reverb.php`, define `BROADCAST_CONNECTION=reverb`).
- [ ] Canal privado por utilizador: `PrivateChannel('App.Models.User.{id}')`; autorização em `routes/channels.php`.
- [ ] Broadcast de notificações: um `BroadcastNotificationListener` (ou os eventos de notificação implementam `ShouldBroadcast`) que emite para o canal do destinatário quando uma notificação é criada — **sem reescrever domínios** (liga-se aos eventos da Fase 1).
- [ ] (Opcional) Presence channels para "quem está no fórum".

### 3.2 Frontend Web (Angular)
- [ ] Instalar `laravel-echo` + `pusher-js` (protocolo Reverb).
- [ ] Serviço `RealtimeService`: autentica no canal privado do utilizador, ouve `notification.created`, faz *push* para o sino/contador e para a página de notificações (sem polling).
- [ ] Atualizar o contador de não-lidas em tempo real.

### 3.3 Frontend Mobile (Expo/React Native)
- [ ] `@ably-labs/react-hooks` **não** — usar `laravel-echo` + `pusher-js` compatível com RN, ou `@pusher/pusher-websocket-react-native` apontado ao Reverb.
- [ ] Mesmo canal privado; badge de notificações e ecrã de notificações em tempo real.
- [ ] (Futuro, fora deste plano) Push nativo via Expo Notifications para app fechada.

**Aceitação Fase 3:** criar uma notificação (ex.: aprovar subscrição) faz o sino
do destinatário atualizar **sem refresh**, em web e mobile; canal privado
autorizado (um utilizador não recebe notificações de outro).

---

## Sequência recomendada e esforço

| Fase | Conteúdo | Esforço | Depende de |
|---|---|---|---|
| 0 | Limpeza + base | 0,5 dia | — |
| 1 | Notificações event-driven (4 domínios) | 2–3 dias | 0 |
| 2 | EDA completa (cache/auditoria/stats/gamif.) | 3–4 dias | 1 |
| 3 | Reverb + Echo (web/mobile) | 2–3 dias | 1 (idealmente 2) |

Ordem: **0 → 1 → 3** entrega tempo real cedo (mais visível); **2** pode correr
em paralelo/depois, pois é sobretudo higiene arquitetural. Cada domínio é
independente — dá para fazer *merge* incremental sem *big bang*.

## Riscos e mitigação

- **`afterCommit` em testes:** sob `RefreshDatabase` os eventos não são
  entregues (a transação nunca faz commit) — manter o padrão de testar listeners
  por invocação direta (já usado no piloto).
- **Duplicação de notificações** ao migrar: remover a chamada direta no mesmo
  commit em que se adiciona o listener; cobrir com teste.
- **Reverb em produção (Vercel/host atual):** o Reverb precisa de um processo
  WebSocket a correr (não serverless). Decidir host (VPS/container) antes da
  Fase 3; até lá, notificações continuam a funcionar por carregamento normal.
- **Ordre dos listeners:** cache antes de notificação, para não servir dados
  velhos ao notificar.

## Definição de "completo"

- [ ] Nenhum service/controller envia notificações, limpa cache, escreve
  auditoria ou calcula gamificação diretamente (exceto exceções documentadas).
- [ ] Todos os domínios têm eventos + subscriber + testes.
- [ ] Reverb ligado; notificações em tempo real em web e mobile, com canais
  privados autorizados.
- [ ] `event-driven.md` atualizado a refletir o estado final.
