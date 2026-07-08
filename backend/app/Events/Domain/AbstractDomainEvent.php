<?php

namespace App\Events\Domain;

use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Str;

/**
 * Base de todos os eventos de domínio da plataforma (Sprint 18.9).
 *
 * Contrato único e estável, independente de infraestrutura. Nenhum evento
 * conhece cache, notificações, WebSockets ou Reverb — esses são tratados
 * exclusivamente por Listeners.
 *
 * Implementa ShouldDispatchAfterCommit: quando disparado dentro de uma
 * transação, o evento só é entregue aos listeners APÓS o commit. Fora de
 * transação, é entregue de imediato. Isto garante que nunca reagimos a
 * estados que possam sofrer rollback.
 *
 * Convenção: nomes SEMPRE no passado (DocumentPublished, nunca PublishDocument).
 */
abstract class AbstractDomainEvent implements ShouldDispatchAfterCommit
{
    use Dispatchable;

    public readonly string $eventId;
    public readonly string $eventName;
    public readonly string $occurredAt;
    public readonly ?string $actorId;
    public readonly string $correlationId;
    public readonly ?string $aggregateId;
    public readonly int $version;

    /** @var array<string, mixed> */
    public readonly array $payload;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        ?string $aggregateId = null,
        ?string $actorId = null,
        array $payload = [],
        ?string $correlationId = null,
        int $version = 1,
    ) {
        $this->eventId = (string) Str::uuid();
        $this->eventName = static::eventName();
        $this->occurredAt = now()->toIso8601String();
        $this->actorId = $actorId;
        $this->correlationId = $correlationId ?? (string) Str::uuid();
        $this->aggregateId = $aggregateId;
        $this->version = $version;
        $this->payload = $payload;
    }

    /**
     * Nome canónico do evento, no passado e em kebab/dot-case.
     * Ex.: "document.published".
     */
    abstract public static function eventName(): string;

    /**
     * Envelope padronizado — a mesma forma para logs, auditoria e (futuro)
     * broadcasting via Reverb, sem que o produtor do evento saiba disso.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'event_id'       => $this->eventId,
            'event_name'     => $this->eventName,
            'occurred_at'    => $this->occurredAt,
            'actor_id'       => $this->actorId,
            'correlation_id' => $this->correlationId,
            'aggregate_id'   => $this->aggregateId,
            'version'        => $this->version,
            'payload'        => $this->payload,
        ];
    }
}
