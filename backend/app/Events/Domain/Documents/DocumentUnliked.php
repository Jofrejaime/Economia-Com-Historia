<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.unliked (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentUnliked::dispatch($documentId, $actorId, $payload).
 */
final class DocumentUnliked extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.unliked';
    }
}
