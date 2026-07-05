<?php

namespace App\Services;

use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use App\Models\User;
use App\Services\MediaService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Operações administrativas sobre tópicos (TopicAdminController).
 *
 * A criação/participação de tópicos vive no CommunityController; a autorização
 * é exclusiva do CommunityAuthorizationService (Sprint 18.5.1).
 */
class TopicService
{
    public function __construct(
        private readonly MediaService $mediaService,
    ) {}

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
