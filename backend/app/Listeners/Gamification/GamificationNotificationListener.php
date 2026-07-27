<?php

namespace App\Listeners\Gamification;

use App\Events\Domain\Gamification\BadgeEarned;
use App\Events\Domain\Gamification\LevelUp;
use App\Listeners\AbstractNotificationListener;

/**
 * Responsabilidade única: notificações do domínio Gamificação.
 * O GamificationService deixa de criar notificações diretamente.
 *
 * (As mensagens passam para português, alinhado com o resto da plataforma —
 * antes estavam em inglês.)
 */
class GamificationNotificationListener extends AbstractNotificationListener
{
    public function handleLevelUp(LevelUp $event): void
    {
        $newLevel = $event->payload['new_level'] ?? null;

        $this->notifyUser(
            userId: $event->payload['user_id'] ?? null,
            type: 'level_up',
            title: 'Subiu de nível!',
            message: "Parabéns! Alcançou o nível {$newLevel}. Continue assim!",
            referenceId: $newLevel !== null ? (string) $newLevel : null,
            referenceType: 'level',
        );
    }

    public function handleBadgeEarned(BadgeEarned $event): void
    {
        $badgeName = $event->payload['badge_name'] ?? 'novo crachá';

        $this->notifyUser(
            userId: $event->payload['user_id'] ?? null,
            type: 'badge_earned',
            title: 'Novo crachá conquistado!',
            message: "Conquistou o crachá: {$badgeName}",
            referenceId: $event->payload['badge_id'] ?? null,
            referenceType: 'badge',
        );
    }
}
