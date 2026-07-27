<?php

namespace App\Events\Domain\Community;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando um membro é removido de um tópico privado (nome no passado).
 * Dispatch: TopicMemberRemoved::dispatch($topicId, $removerId, $payload).
 *
 * Payload esperado: topic_title, removed_user_id
 */
final class TopicMemberRemoved extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'community.topic_member_removed';
    }
}
