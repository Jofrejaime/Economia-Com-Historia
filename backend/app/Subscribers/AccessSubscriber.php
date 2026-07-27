<?php

namespace App\Subscribers;

use App\Events\Domain\Access\SubscriptionApproved;
use App\Events\Domain\Access\SubscriptionCancelled;
use App\Events\Domain\Access\SubscriptionRejected;
use App\Listeners\Access\AccessNotificationListener;
use App\Listeners\AuditLogListener;

/**
 * Liga os eventos do domínio Acesso (subscrições) aos seus listeners.
 * Registado em AppServiceProvider via Event::subscribe().
 *
 * @return array<class-string, list<string>>
 */
class AccessSubscriber
{
    public function subscribe(): array
    {
        $audit = AuditLogListener::class . '@handle';
        $notify = AccessNotificationListener::class;

        return [
            SubscriptionApproved::class => [$notify . '@handleApproved', $audit],
            SubscriptionRejected::class => [$notify . '@handleRejected', $audit],
            SubscriptionCancelled::class => [$notify . '@handleCancelled', $audit],
        ];
    }
}
