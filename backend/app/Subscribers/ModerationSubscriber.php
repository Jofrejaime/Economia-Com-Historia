<?php

namespace App\Subscribers;

use App\Events\Domain\Moderation\ModerationActionTaken;
use App\Events\Domain\Moderation\ReportResolved;
use App\Listeners\AuditLogListener;
use App\Listeners\Moderation\ModerationNotificationListener;

/**
 * Liga os eventos do domínio Moderação aos seus listeners.
 * Registado em AppServiceProvider via Event::subscribe().
 *
 * @return array<class-string, list<string>>
 */
class ModerationSubscriber
{
    public function subscribe(): array
    {
        $audit = AuditLogListener::class . '@handle';
        $notify = ModerationNotificationListener::class;

        return [
            ReportResolved::class => [$notify . '@handleReportResolved', $audit],
            ModerationActionTaken::class => [$notify . '@handleActionTaken', $audit],
        ];
    }
}
