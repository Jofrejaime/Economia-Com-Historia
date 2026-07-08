<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.created (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentCreated::dispatch($documentId, $actorId, $payload).
 */
final class DocumentCreated extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.created';
    }
}
