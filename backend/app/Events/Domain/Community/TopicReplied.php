<?php

namespace App\Events\Domain\Community;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido após alguém responder a um tópico (nome no passado).
 * Dispatch: TopicReplied::dispatch($topicId, $replyAuthorId, $payload).
 *
 * Payload esperado:
 *   topic_title, topic_author_id, reply_id, parent_reply_id, parent_author_id
 */
final class TopicReplied extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'community.topic_replied';
    }
}
