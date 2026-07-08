<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.liked (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentLiked::dispatch($documentId, $actorId, $payload).
 */
final class DocumentLiked extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.liked';
    }
}
