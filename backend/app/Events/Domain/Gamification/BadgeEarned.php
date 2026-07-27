<?php

namespace App\Events\Domain\Gamification;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando um utilizador conquista um novo crachá.
 * Dispatch: BadgeEarned::dispatch($userId, $userId, $payload).
 *
 * Payload esperado: user_id, badge_id, badge_name
 */
final class BadgeEarned extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'gamification.badge_earned';
    }
}
