<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.pinned (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentPinned::dispatch($documentId, $actorId, $payload).
 */
final class DocumentPinned extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.pinned';
    }
}
