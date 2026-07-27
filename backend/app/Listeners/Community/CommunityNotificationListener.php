<?php

namespace App\Listeners\Community;

use App\Events\Domain\Community\ReplyAccepted;
use App\Events\Domain\Community\TopicMemberInvited;
use App\Events\Domain\Community\TopicMemberRemoved;
use App\Events\Domain\Community\TopicReplied;
use App\Listeners\AbstractNotificationListener;

/**
 * Responsabilidade única: notificações do domínio Comunidade.
 * O CommunityController deixa de criar notificações diretamente.
 */
class CommunityNotificationListener extends AbstractNotificationListener
{
    /** Nova resposta → notifica o autor do tópico e, se aplicável, o autor da resposta-pai. */
    public function handleReplied(TopicReplied $event): void
    {
        $title = $event->payload['topic_title'] ?? 'tópico';
        $topicAuthorId = $event->payload['topic_author_id'] ?? null;
        $replyId = $event->payload['reply_id'] ?? null;
        $parentAuthorId = $event->payload['parent_author_id'] ?? null;

        $this->notifyUser(
            userId: $topicAuthorId,
            type: 'topic_reply',
            title: 'Nova resposta no seu tópico',
            message: "Alguém respondeu ao seu tópico: {$title}",
            referenceId: $replyId,
            referenceType: 'topic_reply',
            skipActorId: $event->actorId,
        );

        // Autor da resposta-pai — só se for outra pessoa que não o autor do
        // tópico (que já foi notificado) nem o próprio autor da nova resposta.
        if ($parentAuthorId !== null && $parentAuthorId !== $topicAuthorId) {
            $this->notifyUser(
                userId: $parentAuthorId,
                type: 'reply_reply',
                title: 'Nova resposta à sua mensagem',
                message: "Alguém respondeu à sua mensagem no tópico: {$title}",
                referenceId: $replyId,
                referenceType: 'topic_reply',
                skipActorId: $event->actorId,
            );
        }
    }

    /** Resposta aceite → notifica o autor da resposta. */
    public function handleReplyAccepted(ReplyAccepted $event): void
    {
        $title = $event->payload['topic_title'] ?? 'tópico';

        $this->notifyUser(
            userId: $event->payload['reply_author_id'] ?? null,
            type: 'reply_accepted',
            title: 'A sua resposta foi aceite',
            message: "A sua resposta foi marcada como aceite no tópico: {$title}",
            referenceId: $event->payload['reply_id'] ?? null,
            referenceType: 'topic_reply',
        );
    }

    /** Convite para tópico privado → notifica o convidado. */
    public function handleMemberInvited(TopicMemberInvited $event): void
    {
        $title = $event->payload['topic_title'] ?? 'tópico';
        $inviter = $event->payload['inviter_name'] ?? 'Alguém';

        $this->notifyUser(
            userId: $event->payload['invited_user_id'] ?? null,
            type: 'topic_invitation',
            title: 'Convite para fórum privado',
            message: "{$inviter} convidou-te para participar do fórum \"{$title}\"",
            referenceId: $event->aggregateId,
            referenceType: 'discussion_topic',
        );
    }

    /** Remoção de um membro → notifica o removido. */
    public function handleMemberRemoved(TopicMemberRemoved $event): void
    {
        $title = $event->payload['topic_title'] ?? 'tópico';

        $this->notifyUser(
            userId: $event->payload['removed_user_id'] ?? null,
            type: 'topic_removed',
            title: 'Removido de um fórum privado',
            message: "Perdeste o acesso ao fórum \"{$title}\".",
            referenceId: $event->aggregateId,
            referenceType: 'discussion_topic',
        );
    }
}
