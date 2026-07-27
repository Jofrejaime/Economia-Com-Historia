<?php

namespace App\Events\Domain\Moderation;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando uma ação de moderação afeta um conteúdo (aviso/remoção/
 * ocultação/restauro). Notifica o dono do conteúdo.
 * Dispatch: ModerationActionTaken::dispatch($reportId, $moderatorId, $payload).
 *
 * Payload esperado: owner_id, action (warn|delete|hide|restore),
 *                   content_type, reason (nullable)
 */
final class ModerationActionTaken extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'moderation.action_taken';
    }
}
