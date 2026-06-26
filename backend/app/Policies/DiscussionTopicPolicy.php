<?php

namespace App\Policies;

use App\Models\DiscussionTopic;
use App\Models\User;
use App\Services\CommunityAuthorizationService;

class DiscussionTopicPolicy
{
    public function __construct(private readonly CommunityAuthorizationService $authorizationService) {}

    public function view(User $user, DiscussionTopic $topic): bool
    {
        return $this->authorizationService->canViewTopic($user, $topic);
    }

    public function reply(User $user, DiscussionTopic $topic): bool
    {
        return $this->authorizationService->canReply($user, $topic);
    }

    public function update(User $user, DiscussionTopic $topic): bool
    {
        return $this->authorizationService->canUpdateTopic($user, $topic);
    }

    public function delete(User $user, DiscussionTopic $topic): bool
    {
        return $this->authorizationService->canDeleteTopic($user, $topic);
    }

    public function inviteMembers(User $user, DiscussionTopic $topic): bool
    {
        return $this->authorizationService->canInviteMembers($user, $topic);
    }

    public function removeMembers(User $user, DiscussionTopic $topic): bool
    {
        return $this->authorizationService->canRemoveMembers($user, $topic);
    }

    public function promoteMember(User $user, DiscussionTopic $topic): bool
    {
        return $this->authorizationService->canPromoteMember($user, $topic);
    }

    public function join(User $user, DiscussionTopic $topic): bool
    {
        return $this->authorizationService->canJoinTopic($user, $topic);
    }

    public function leave(User $user, DiscussionTopic $topic): bool
    {
        return $this->authorizationService->canLeaveTopic($user, $topic);
    }
}
