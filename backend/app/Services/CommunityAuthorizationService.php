<?php

namespace App\Services;

use App\Models\DiscussionTopic;
use App\Models\DiscussionTopicMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

/**
 * CommunityAuthorizationService
 *
 * Sprint 13 — Domain Simplification (Categories ≠ Authorization)
 *
 * PRINCÍPIO ARQUITETURAL:
 * A autorização dos tópicos baseia-se exclusivamente na propriedade
 * `visibility` do próprio tópico. As categorias são apenas organização.
 *
 * Valores oficiais de visibility:
 *   PUBLIC      — qualquer utilizador autenticado pode ver e responder
 *   CATEGORY    — apenas membros da categoria (category_members) podem ver e responder
 *   INVITE_ONLY — apenas owner, moderadores e membros convidados (discussion_topic_members)
 */
class CommunityAuthorizationService
{
    public function canViewTopic(?User $user, DiscussionTopic $topic): bool
{
    if ($user !== null && ($this->bypassesChecks($user) || $this->isOwner($user, $topic))) {
        return true;
    }

    $visibility = $this->normalizedVisibility($topic->visibility ?? 'CATEGORY');

    // CATEGORY = visível a qualquer pessoa, incluindo visitantes (RF57)
    if ($visibility === 'CATEGORY') {
        return true;
    }

    if ($user === null) {
        return false;
    }

    return match ($visibility) {
        'INVITE_ONLY' => $this->hasAnyMembership($user, $topic),
        default       => false,
    };
}

    public function canReply(User $user, DiscussionTopic $topic): bool
    {
        if ($this->bypassesChecks($user) || $this->isOwner($user, $topic)) {
            return true;
        }

        return match ($this->normalizedVisibility($topic->visibility ?? 'CATEGORY')) {
            'PUBLIC'      => true,
            'CATEGORY'    => $this->isCategoryMember($user, $topic),
            'INVITE_ONLY' => $this->hasAcceptedMembership($user, $topic),
            default       => false,
        };
    }

    public function canInviteMembers(User $user, DiscussionTopic $topic): bool
    {
        if ($this->bypassesChecks($user) || $this->isOwner($user, $topic)) {
            return true;
        }

        return $this->isModerator($user, $topic);
    }

    public function canRemoveMembers(User $user, DiscussionTopic $topic): bool
    {
        if ($this->bypassesChecks($user) || $this->isOwner($user, $topic)) {
            return true;
        }

        return $this->isModerator($user, $topic);
    }

    public function canPromoteMember(User $user, DiscussionTopic $topic): bool
    {
        return $this->bypassesChecks($user) || $this->isOwner($user, $topic);
    }

    public function canDeleteTopic(User $user, DiscussionTopic $topic): bool
    {
        return $this->bypassesChecks($user) || $this->isOwner($user, $topic);
    }

    public function canUpdateTopic(User $user, DiscussionTopic $topic): bool
    {
        return $this->canDeleteTopic($user, $topic);
    }

    public function canJoinTopic(User $user, DiscussionTopic $topic): bool
    {
        if ($this->bypassesChecks($user) || $this->isOwner($user, $topic)) {
            return false;
        }

        return $this->normalizedVisibility($topic->visibility ?? 'CATEGORY') === 'INVITE_ONLY'
            && $this->hasAnyMembership($user, $topic);
    }

    public function canLeaveTopic(User $user, DiscussionTopic $topic): bool
    {
        if ($this->bypassesChecks($user) || $this->isOwner($user, $topic)) {
            return false;
        }

        return $this->hasAnyMembership($user, $topic);
    }

    /**
     * Aplica filtro de visibilidade à query de tópicos.
     *
     * Regras:
     *   PUBLIC      — sempre visível
     *   CATEGORY    — visível se o utilizador for membro da categoria
     *   INVITE_ONLY — visível apenas se o utilizador for membro do tópico
     */
    public function applyVisibleTopicsFilter(Builder $query, ?User $user): void
{
    if ($user !== null && $this->bypassesChecks($user)) {
        return;
    }

    $table = $query->getModel()->getTable();

    $query->where(function (Builder $builder) use ($user, $table): void {
        // CATEGORY = visível a qualquer pessoa, incluindo visitantes
        $builder->where("{$table}.visibility", 'CATEGORY');

        if ($user !== null) {
            $builder->orWhere("{$table}.author_id", $user->id);

            $builder->orWhere(function (Builder $invite) use ($user, $table): void {
                $invite->where("{$table}.visibility", 'INVITE_ONLY')
                    ->whereExists(function ($memberQuery) use ($user, $table): void {
                        $memberQuery->selectRaw('1')
                            ->from('discussion_topic_members as dtm')
                            ->whereColumn('dtm.topic_id', "{$table}.id")
                            ->where('dtm.user_id', $user->id);
                    });
            });
        }
    });
}

    public function memberRole(User $user, DiscussionTopic $topic): ?string
    {
        return DiscussionTopicMember::query()
            ->where('topic_id', $topic->id)
            ->where('user_id', $user->id)
            ->value('role');
    }

    public function hasAcceptedMembership(User $user, DiscussionTopic $topic): bool
    {
        return DiscussionTopicMember::query()
            ->where('topic_id', $topic->id)
            ->where('user_id', $user->id)
            ->whereNotNull('accepted_at')
            ->exists();
    }

    public function hasAnyMembership(User $user, DiscussionTopic $topic): bool
    {
        return DiscussionTopicMember::query()
            ->where('topic_id', $topic->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    public function isOwner(User $user, DiscussionTopic $topic): bool
    {
        return $topic->author_id === $user->id || $this->memberRole($user, $topic) === 'owner';
    }

    public function isModerator(User $user, DiscussionTopic $topic): bool
    {
        return in_array($this->memberRole($user, $topic), ['owner', 'moderator'], true);
    }

    /**
     * Verifica se o utilizador é membro da categoria do tópico.
     * Usado para tópicos com visibility = CATEGORY.
     * Não consulta access_level_id — apenas a tabela category_members.
     */
    private function isCategoryMember(User $user, DiscussionTopic $topic): bool
    {
        $topic->loadMissing('category');

        $category = $topic->category;

        if ($category === null) {
            return false;
        }

        return \Illuminate\Support\Facades\DB::table('category_members')
            ->where('category_id', $category->id)
            ->where('user_id', $user->id)
            ->exists();
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
