<?php

namespace App\Events\Domain\Documents;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após document.downloaded (nome no passado — convenção da Sprint 18.9).
 * Dispatch: DocumentDownloaded::dispatch($documentId, $actorId, $payload).
 */
final class DocumentDownloaded extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'document.downloaded';
    }
}
