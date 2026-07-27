<?php

namespace App\Events\Domain\Community;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando um tópico é criado. Usado para gamificação (pontos ao autor).
 * Dispatch: TopicCreated::dispatch($topicId, $authorId, $payload).
 *
 * Payload esperado: topic_title
 */
final class TopicCreated extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'community.topic_created';
    }
}
