<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.updated (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentUpdated::dispatch($documentId, $actorId, $payload).
 */
final class DocumentUpdated extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.updated';
    }
}
