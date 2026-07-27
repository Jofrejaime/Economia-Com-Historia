<?php

namespace App\Events\Domain\Moderation;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando uma denúncia é analisada (revisão/ação/arquivo).
 * Notifica o autor da denúncia do desfecho.
 * Dispatch: ReportResolved::dispatch($reportId, $moderatorId, $payload).
 *
 * Payload esperado: reporter_id, action_taken (bool)
 */
final class ReportResolved extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'moderation.report_resolved';
    }
}
