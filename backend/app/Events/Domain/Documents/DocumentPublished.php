<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.published (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentPublished::dispatch($documentId, $actorId, $payload).
 */
final class DocumentPublished extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.published';
    }
}
