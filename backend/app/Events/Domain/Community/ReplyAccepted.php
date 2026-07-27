<?php

namespace App\Events\Domain\Community;

use App\Events\Domain\AbstractDomainEvent;

/**
 * Emitido quando uma resposta é marcada como aceite (nome no passado).
 * Dispatch: ReplyAccepted::dispatch($topicId, $accepterId, $payload).
 *
 * Payload esperado: topic_title, reply_id, reply_author_id
 */
final class ReplyAccepted extends AbstractDomainEvent
{
    public static function eventName(): string
    {
        return 'community.reply_accepted';
    }
}
