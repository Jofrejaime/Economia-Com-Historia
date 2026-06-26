<?php

namespace App\Services;

use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use App\Models\DiscussionTopicMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class CommunityAuthorizationService
{
    public function __construct(private readonly AccessGateService $accessGate) {}

    public function canViewTopic(User $user, DiscussionTopic $topic): bool
    {
        if ($this->bypassesChecks($user) || $this->isOwner($user, $topic)) {
            return true;
        }

        return match ($this->normalizedVisibility($topic->visibility ?? 'RESTRICTED')) {
            'PUBLIC' => true,
            'RESTRICTED' => $this->canAccessCategory($user, $topic),
            'PRIVATE' => $this->hasAnyMembership($user, $topic),
            default => false,
        };
    }

    public function canReply(User $user, DiscussionTopic $topic): bool
    {
        if ($this->bypassesChecks($user) || $this->isOwner($user, $topic)) {
            return true;
        }

        return match ($this->normalizedVisibility($topic->visibility ?? 'RESTRICTED')) {
            'PUBLIC' => true,
            'RESTRICTED' => $this->canAccessCategory($user, $topic),
            'PRIVATE' => $this->hasAcceptedMembership($user, $topic),
            default => false,
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

        return $this->normalizedVisibility($topic->visibility ?? 'RESTRICTED') === 'PRIVATE'
            && $this->hasAnyMembership($user, $topic);
    }

    public function canLeaveTopic(User $user, DiscussionTopic $topic): bool
    {
        if ($this->bypassesChecks($user) || $this->isOwner($user, $topic)) {
            return false;
        }

        return $this->hasAnyMembership($user, $topic);
    }

    public function applyVisibleTopicsFilter(Builder $query, User $user): void
    {
        if ($this->bypassesChecks($user)) {
            return;
        }

        $grantLevels = $this->accessGate->activeGrantLevelIds($user);
        $table = $query->getModel()->getTable();

        $query->where(function (Builder $builder) use ($user, $grantLevels, $table): void {
            $builder->where("{$table}.author_id", $user->id)
                ->orWhere("{$table}.visibility", 'PUBLIC')
                ->orWhere(function (Builder $restricted) use ($grantLevels, $table): void {
                    $restricted->where("{$table}.visibility", 'RESTRICTED')
                        ->whereHas('category', function (Builder $categoryQuery) use ($grantLevels): void {
                            $categoryQuery->where('access_level_id', 'public');

                            if ($grantLevels !== []) {
                                $categoryQuery->orWhereIn('access_level_id', $grantLevels);
                            }
                        });
                })
                ->orWhere(function (Builder $private) use ($user, $table): void {
                    $private->where("{$table}.visibility", 'PRIVATE')
                        ->whereExists(function ($memberQuery) use ($user, $table): void {
                            $memberQuery->selectRaw('1')
                                ->from('discussion_topic_members as dtm')
                                ->whereColumn('dtm.topic_id', "{$table}.id")
                                ->where('dtm.user_id', $user->id);
                        });
                });
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

    private function canAccessCategory(User $user, DiscussionTopic $topic): bool
    {
        $topic->loadMissing('category');

        $category = $topic->category;

        if ($category === null) {
            return false;
        }

        return $this->accessGate->canAccess($user, $category->access_level_id);
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
