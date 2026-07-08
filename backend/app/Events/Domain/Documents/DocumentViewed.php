<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.viewed (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentViewed::dispatch($documentId, $actorId, $payload).
 */
final class DocumentViewed extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.viewed';
    }
}
