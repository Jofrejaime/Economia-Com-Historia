<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.unfavorited (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentUnfavorited::dispatch($documentId, $actorId, $payload).
 */
final class DocumentUnfavorited extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.unfavorited';
    }
}
