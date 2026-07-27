<?php

namespace App\Listeners\Community;

use App\Events\Domain\Community\ReplyAccepted;
use App\Events\Domain\Community\TopicCreated;
use App\Events\Domain\Community\TopicReplied;
use App\Models\User;
use App\Services\GamificationService;

/**
 * Responsabilidade única: gamificação do domínio Comunidade.
 * O CommunityController deixa de atribuir pontos diretamente.
 *
 * Nota: os contadores intrínsecos do agregado (topics_count/replies_count/
 * last_reply_at) permanecem síncronos no controller — são estado próprio,
 * esperado imediatamente consistente. Aqui tratamos só da gamificação
 * (pontos + contadores de gamificação), que é um efeito transversal.
 */
class CommunityGamificationListener
{
    public function __construct(private readonly GamificationService $gamification)
    {
    }

    /** Criar tópico → 20 pontos ao autor. */
    public function handleTopicCreated(TopicCreated $event): void
    {
        $author = $this->actor($event->actorId);
        if ($author === null) {
            return;
        }

        $title = $event->payload['topic_title'] ?? '';
        $this->gamification->awardPoints(
            $author,
            20,
            'topic_created',
            $event->aggregateId,
            'discussion_topic',
            "Created topic: {$title}",
        );
        $this->gamification->incrementCounters($author, ['topics_created' => 1]);
    }

    /** Responder a um tópico → 10 pontos ao autor da resposta. */
    public function handleReplied(TopicReplied $event): void
    {
        $author = $this->actor($event->actorId);
        if ($author === null) {
            return;
        }

        $title = $event->payload['topic_title'] ?? '';
        $this->gamification->awardPoints(
            $author,
            10,
            'reply_posted',
            $event->payload['reply_id'] ?? null,
            'topic_reply',
            "Reply on topic: {$title}",
        );
        $this->gamification->incrementCounters($author, ['replies_posted' => 1]);
    }

    /** Resposta aceite → 50 pontos ao autor da resposta. */
    public function handleReplyAccepted(ReplyAccepted $event): void
    {
        $author = $this->actor($event->payload['reply_author_id'] ?? null);
        if ($author === null) {
            return;
        }

        $this->gamification->awardPoints(
            $author,
            50,
            'reply_accepted',
            $event->payload['reply_id'] ?? null,
            'topic_reply',
            'Reply marked as accepted solution',
        );
    }

    private function actor(?string $userId): ?User
    {
        return $userId !== null ? User::find($userId) : null;
    }
}
