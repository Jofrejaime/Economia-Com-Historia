<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.unpinned (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentUnpinned::dispatch($documentId, $actorId, $payload).
 */
final class DocumentUnpinned extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.unpinned';
    }
}
