<?php

namespace App\Subscribers;

use App\Events\Domain\Gamification\BadgeEarned;
use App\Events\Domain\Gamification\LevelUp;
use App\Listeners\AuditLogListener;
use App\Listeners\Gamification\GamificationNotificationListener;

/**
 * Liga os eventos do domínio Gamificação aos seus listeners.
 * Registado em AppServiceProvider via Event::subscribe().
 *
 * @return array<class-string, list<string>>
 */
class GamificationSubscriber
{
    public function subscribe(): array
    {
        $audit = AuditLogListener::class . '@handle';
        $notify = GamificationNotificationListener::class;

        return [
            LevelUp::class => [$notify . '@handleLevelUp', $audit],
            BadgeEarned::class => [$notify . '@handleBadgeEarned', $audit],
        ];
    }
}
