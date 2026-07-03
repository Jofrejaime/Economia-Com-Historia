<?php

namespace App\Services;

use App\Models\DiscussionTopic;
use App\Models\DiscussionTopicMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

/**
 * Autoridade única de autorização do domínio Community (Sprint 18.5.1).
 *
 * A autorização depende exclusivamente da visibilidade do tópico:
 *
 *   PUBLIC      — qualquer utilizador autenticado pode ver e responder
 *   INVITE_ONLY — apenas autor, admin e membros do tópico
 *
 * Categorias organizam conteúdo; nunca participam na autorização.
 */
class CommunityAuthorizationService
{
    public function canViewTopic(?User $user, DiscussionTopic $topic): bool
    {
        if ($user === null) {
            return false;
        }

        if ($this->bypassesChecks($user) || $this->isAuthor($user, $topic)) {
            return true;
        }

        return match ($this->normalizedVisibility($topic->visibility ?? 'PUBLIC')) {
            'PUBLIC'      => true,
            'INVITE_ONLY' => $this->isMember($user, $topic),
            default       => false,
        };
    }

    public function canReply(User $user, DiscussionTopic $topic): bool
    {
        if (in_array(strtolower($topic->status ?? 'open'), ['closed', 'locked', 'archived'], true)) {
            return false;
        }

        return $this->canViewTopic($user, $topic);
    }

    public function canUpdateTopic(User $user, DiscussionTopic $topic): bool
    {
        return $this->bypassesChecks($user) || $this->isAuthor($user, $topic);
    }

    public function canDeleteTopic(User $user, DiscussionTopic $topic): bool
    {
        return $this->canUpdateTopic($user, $topic);
    }

    public function canManageMembers(User $user, DiscussionTopic $topic): bool
    {
        return $this->bypassesChecks($user) || $this->isAuthor($user, $topic);
    }

    public function canJoinTopic(User $user, DiscussionTopic $topic): bool
    {
        if ($this->isAuthor($user, $topic)) {
            return false;
        }

        return $this->normalizedVisibility($topic->visibility ?? 'PUBLIC') === 'INVITE_ONLY'
            && $this->isMember($user, $topic);
    }

    public function canLeaveTopic(User $user, DiscussionTopic $topic): bool
    {
        return ! $this->isAuthor($user, $topic) && $this->isMember($user, $topic);
    }

    /**
     * Aplica o filtro de visibilidade à query de tópicos.
     *
     * Exactamente três condições: público, autor ou membro.
     */
    public function applyVisibleTopicsFilter(Builder $query, ?User $user): void
    {
        if ($user !== null && $this->bypassesChecks($user)) {
            return;
        }

        $table = $query->getModel()->getTable();

        if ($user === null) {
            $query->whereRaw('1 = 0');
            return;
        }

        $query->where(function (Builder $builder) use ($user, $table): void {
            $builder->where("{$table}.visibility", 'PUBLIC')
                ->orWhere("{$table}.author_id", $user->id)
                ->orWhereExists(function ($memberQuery) use ($user, $table): void {
                    $memberQuery->selectRaw('1')
                        ->from('discussion_topic_members as dtm')
                        ->whereColumn('dtm.topic_id', "{$table}.id")
                        ->where('dtm.user_id', $user->id);
                });
        });
    }

    public function isMember(User $user, DiscussionTopic $topic): bool
    {
        return DiscussionTopicMember::query()
            ->where('topic_id', $topic->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    public function isAuthor(User $user, DiscussionTopic $topic): bool
    {
        return $topic->author_id === $user->id;
    }

    private function bypassesChecks(User $user): bool
    {
        return $user->role === 'admin';
    }

    private function normalizedVisibility(string $visibility): string
    {
        return strtoupper($visibility);
    }
}
