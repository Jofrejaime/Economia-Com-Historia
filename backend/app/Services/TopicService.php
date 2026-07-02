<?php

namespace App\Services;

use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use App\Models\DiscussionTopicMember;
use App\Models\User;
use App\Services\GamificationService;
use App\Services\NotificationService;
use App\Services\MediaService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class TopicService
{
    public function __construct(
        private readonly GamificationService $gamification,
        private readonly NotificationService $notificationService,
        private readonly MediaService $mediaService,
    ) {}

    public function create(array $data, User $user): DiscussionTopic
    {
        $category = CommunityCategory::findOrFail($data['category_id']);
        $visibility = $data['visibility'] ?? 'CATEGORY';

        return DB::transaction(function () use ($data, $user, $category, $visibility) {
            $topic = DiscussionTopic::create([
                'id' => (string) Str::uuid(),
                'category_id' => $data['category_id'],
                'document_id' => $data['document_id'] ?? null,
                'author_id' => $user->id,
                'title' => $data['title'],
                'content' => $data['content'],
                'visibility' => $visibility,
                'status' => $data['status'] ?? 'published',
                'is_pinned' => $data['is_pinned'] ?? false,
                'is_featured' => $data['is_featured'] ?? false,
                'pinned' => $data['is_pinned'] ?? false,
                'featured' => $data['is_featured'] ?? false,
                'locked' => false,
                'solved' => false,
                'last_reply_at' => null,
                'replies_count' => 0,
                'views_count' => 0,
                'likes_count' => 0,
                'followers_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DiscussionTopicMember::create([
                'id' => (string) Str::uuid(),
                'topic_id' => $topic->id,
                'user_id' => $user->id,
                'role' => 'owner',
                'invited_by' => $user->id,
                'accepted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $invitedMembers = [];

            if (!empty($data['members'])) {
                foreach ($data['members'] as $memberData) {
                    $invitedMembers[] = [
                        'user_id' => $memberData['user_id'],
                        'role' => $memberData['role'] ?? 'member',
                    ];
                }
            } elseif (!empty($data['member_ids'])) {
                foreach ($data['member_ids'] as $memberId) {
                    $invitedMembers[] = [
                        'user_id' => $memberId,
                        'role' => 'member',
                    ];
                }
            }

            if ($visibility === 'INVITE_ONLY' && $invitedMembers !== []) {
                $seenMemberIds = [];

                foreach ($invitedMembers as $memberData) {
                    $memberId = $memberData['user_id'];

                    if ($memberId === $user->id || in_array($memberId, $seenMemberIds, true)) {
                        continue;
                    }

                    $seenMemberIds[] = $memberId;

                    DiscussionTopicMember::create([
                        'id' => (string) Str::uuid(),
                        'topic_id' => $topic->id,
                        'user_id' => $memberId,
                        'role' => $memberData['role'] ?? 'member',
                        'invited_by' => $user->id,
                        'accepted_at' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $member = User::find($memberId);

                    if ($member) {
                        $this->notificationService->sendTopicInvitation(
                            $member,
                            $topic->title,
                            $user->display_name ?? $user->email,
                            $topic->id
                        );
                    }
                }
            }

            // Handle uploads if files are passed
            if (!empty($data['files']) && is_array($data['files'])) {
                foreach ($data['files'] as $file) {
                    $this->mediaService->upload($file, 'community/attachments', [
                        'model_type' => 'discussion_topic',
                        'model_id' => $topic->id,
                        'collection' => 'attachments',
                        'created_by' => $user->id,
                    ]);
                }
            }

            // Increment category topics_count
            $category->increment('topics_count');

            // Award gamification points
            $this->gamification->awardPoints(
                $user,
                20,
                'topic_created',
                $topic->id,
                'discussion_topic',
                "Created topic: {$topic->title}"
            );

            // Increment counter
            $this->gamification->incrementCounters($user, ['topics_created' => 1]);

            // Audit
            Log::info('Topic created', [
                'admin_id' => $user->id,
                'topic_id' => $topic->id,
                'new_values' => $topic->only(['title', 'category_id', 'visibility']),
            ]);

            $this->clearCache($topic->id);

            return $topic->load(['author.profile', 'category', 'members.user.profile']);
        });
    }

    public function update(string $id, array $data, User $user): DiscussionTopic
    {
        $topic = DiscussionTopic::findOrFail($id);

        $oldValues = $topic->only(['title', 'content', 'category_id', 'visibility', 'pinned', 'featured', 'locked']);

        // Sincronizar campos legados
        if (isset($data['is_pinned'])) {
            $data['pinned'] = $data['is_pinned'];
        }
        if (isset($data['pinned'])) {
            $data['is_pinned'] = $data['pinned'];
        }
        if (isset($data['is_featured'])) {
            $data['featured'] = $data['is_featured'];
        }
        if (isset($data['featured'])) {
            $data['is_featured'] = $data['featured'];
        }
        if (isset($data['locked'])) {
            $data['status'] = $data['locked'] ? 'locked' : 'published';
        }
        if (isset($data['status'])) {
            $data['locked'] = $data['status'] === 'locked';
        }

        $topic->update($data);

        // Audit
        Log::info('Topic updated', [
            'admin_id' => $user->id,
            'topic_id' => $topic->id,
            'old_values' => $oldValues,
            'new_values' => $topic->only(['title', 'content', 'category_id', 'visibility', 'pinned', 'featured', 'locked']),
        ]);

        $this->clearCache($topic->id);

        return $topic->load(['author.profile', 'category']);
    }

    public function delete(string $id, User $user): void
    {
        $topic = DiscussionTopic::findOrFail($id);
        $oldValues = $topic->only(['title', 'category_id']);

        DB::transaction(function () use ($topic, $id, $user, $oldValues) {
            $category = CommunityCategory::find($topic->category_id);
            if ($category) {
                $category->decrement('topics_count');
            }

            // Cleanup uploads
            $this->mediaService->deleteFor('discussion_topic', $id);

            $topic->delete();

            // Audit
            Log::info('Topic deleted', [
                'admin_id' => $user->id,
                'topic_id' => $id,
                'old_values' => $oldValues,
            ]);

            $this->clearCache($id);
        });
    }

    public function join(string $id, User $user): void
    {
        $topic = DiscussionTopic::findOrFail($id);

        $member = DiscussionTopicMember::where('topic_id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $member->update(['accepted_at' => now()]);

        Log::info('User joined topic', [
            'user_id' => $user->id,
            'topic_id' => $id,
        ]);

        $this->clearCache($id);
    }

    public function leave(string $id, User $user): void
    {
        $topic = DiscussionTopic::findOrFail($id);

        DiscussionTopicMember::where('topic_id', $id)
            ->where('user_id', $user->id)
            ->delete();

        Log::info('User left topic', [
            'user_id' => $user->id,
            'topic_id' => $id,
        ]);

        $this->clearCache($id);
    }

    public function pin(string $id, User $user): DiscussionTopic
    {
        return $this->update($id, ['pinned' => true, 'is_pinned' => true], $user);
    }

    public function unpin(string $id, User $user): DiscussionTopic
    {
        return $this->update($id, ['pinned' => false, 'is_pinned' => false], $user);
    }

    public function lock(string $id, User $user): DiscussionTopic
    {
        return $this->update($id, [
            'locked' => true,
            'status' => 'locked',
            'closed_at' => now(),
            'closed_by' => $user->id,
        ], $user);
    }

    public function unlock(string $id, User $user): DiscussionTopic
    {
        return $this->update($id, [
            'locked' => false,
            'status' => 'published',
            'closed_at' => null,
            'closed_by' => null,
        ], $user);
    }

    public function buildTopic(string $id): DiscussionTopic
    {
        return DiscussionTopic::with(['author.profile', 'category', 'replies.author.profile'])
            ->findOrFail($id);
    }

    public function clearCache(string $id): void
    {
        Cache::forget("topic-summary:{$id}");
        Cache::forget("community-popular");
    }
}
