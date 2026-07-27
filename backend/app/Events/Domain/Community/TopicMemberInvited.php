<?php

namespace App\Events\Domain\Community;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando um utilizador é convidado para um tópico privado (INVITE_ONLY).
 * Dispatch: TopicMemberInvited::dispatch($topicId, $inviterId, $payload).
 *
 * Payload esperado: topic_title, invited_user_id, inviter_name
 */
final class TopicMemberInvited extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'community.topic_member_invited';
    }
}
