<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.deleted (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentDeleted::dispatch($documentId, $actorId, $payload).
 */
final class DocumentDeleted extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.deleted';
    }
}
