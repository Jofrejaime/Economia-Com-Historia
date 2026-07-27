<?php

namespace App\Events\Domain\Gamification;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando um utilizador sobe de nível.
 * Dispatch: LevelUp::dispatch($userId, $userId, $payload).
 *
 * Payload esperado: user_id, new_level, previous_level
 */
final class LevelUp extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'gamification.level_up';
    }
}
