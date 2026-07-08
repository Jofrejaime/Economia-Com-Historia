<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.favorited (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentFavorited::dispatch($documentId, $actorId, $payload).
 */
final class DocumentFavorited extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.favorited';
    }
}
