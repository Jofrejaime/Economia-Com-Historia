<?php

namespace App\Services;

use App\Models\DiscussionTopic;
use App\Models\TopicReply;
use App\Models\User;
use App\Services\GamificationService;
use App\Services\NotificationService;
use App\Services\MediaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ReplyService
{
    public function __construct(
        private readonly GamificationService $gamification,
        private readonly NotificationService $notificationService,
        private readonly MediaService $mediaService,
    ) {}

    public function createReply(array $data, User $user): TopicReply
    {
        $topic = DiscussionTopic::findOrFail($data['topic_id']);

        return DB::transaction(function () use ($data, $user, $topic) {
            $reply = TopicReply::create([
                'id' => (string) Str::uuid(),
                'topic_id' => $topic->id,
                'author_id' => $user->id,
                'parent_reply_id' => $data['parent_reply_id'] ?? null,
                'content' => $data['content'],
                'is_accepted' => false,
                'is_flagged' => false,
                'best_answer' => false,
                'hidden' => false,
                'likes_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Handle uploads if files are passed
            if (!empty($data['files']) && is_array($data['files'])) {
                foreach ($data['files'] as $file) {
                    $this->mediaService->upload($file, 'community/replies', [
                        'model_type' => 'topic_reply',
                        'model_id' => $reply->id,
                        'collection' => 'attachments',
                        'created_by' => $user->id,
                    ]);
                }
            }

            // Increment topic replies_count
            $topic->increment('replies_count');
            $topic->update(['last_reply_at' => now()]);

            // Award gamification points
            $this->gamification->awardPoints(
                $user,
                10,
                'reply_posted',
                $reply->id,
                'topic_reply',
                "Reply on topic: {$topic->title}"
            );

            $this->gamification->incrementCounters($user, ['replies_posted' => 1]);

            // Send notification to topic author (if not the same user)
            if ($topic->author_id !== $user->id) {
                $this->notificationService->send(
                    $topic->author,
                    'topic_reply',
                    'New reply on your topic',
                    "Someone replied to your topic: {$topic->title}",
                    $reply->id,
                    'topic_reply'
                );
            }

            // Audit
            Log::info('Reply created', [
                'admin_id' => $user->id,
                'reply_id' => $reply->id,
                'topic_id' => $topic->id,
            ]);

            return $reply->load(['author.profile']);
        });
    }

    public function updateReply(string $id, array $data, User $user): TopicReply
    {
        $reply = TopicReply::findOrFail($id);
        $oldValues = $reply->only(['content', 'best_answer', 'hidden']);

        if (isset($data['is_accepted'])) {
            $data['best_answer'] = $data['is_accepted'];
        }
        if (isset($data['best_answer'])) {
            $data['is_accepted'] = $data['best_answer'];
        }

        $data['edited_at'] = now();
        $data['edited_by'] = $user->id;

        $reply->update($data);

        // Audit
        Log::info('Reply updated', [
            'admin_id' => $user->id,
            'reply_id' => $reply->id,
            'old_values' => $oldValues,
            'new_values' => $reply->only(['content', 'best_answer', 'hidden']),
        ]);

        return $reply->load(['author.profile']);
    }

    public function deleteReply(string $id, User $user): void
    {
        $reply = TopicReply::findOrFail($id);
        $this->deleteReplyTree($id, $user);
    }

    public function deleteReplyTree(string $id, User $user): void
    {
        $reply = TopicReply::findOrFail($id);
        $topic = DiscussionTopic::findOrFail($reply->topic_id);

        DB::transaction(function () use ($reply, $topic, $user) {
            $idsToDelete = [$reply->id];
            $currentLevelIds = [$reply->id];

            while (count($currentLevelIds) > 0) {
                $childIds = TopicReply::whereIn('parent_reply_id', $currentLevelIds)
                    ->pluck('id')
                    ->toArray();
                if (count($childIds) > 0) {
                    $idsToDelete = array_merge($idsToDelete, $childIds);
                }
                $currentLevelIds = $childIds;
            }

            $countDeleted = count($idsToDelete);

            // Invalidate files and media
            foreach ($idsToDelete as $idToDelete) {
                $this->mediaService->deleteFor('topic_reply', $idToDelete);
            }

            // Delete replies
            TopicReply::whereIn('id', $idsToDelete)->delete();

            // Decrement replies_count
            $topic->decrement('replies_count', $countDeleted);

            // Audit
            Log::info('Reply tree deleted', [
                'admin_id' => $user->id,
                'reply_id' => $reply->id,
                'deleted_count' => $countDeleted,
            ]);
        });
    }

    public function toggleBestAnswer(string $id, User $user): TopicReply
    {
        $reply = TopicReply::findOrFail($id);
        $topic = DiscussionTopic::findOrFail($reply->topic_id);

        return DB::transaction(function () use ($reply, $topic, $user) {
            if ($reply->best_answer) {
                // Untoggle
                $reply->update([
                    'best_answer' => false,
                    'is_accepted' => false,
                ]);
            } else {
                // Untoggle others
                TopicReply::where('topic_id', $reply->topic_id)
                    ->where('best_answer', true)
                    ->update([
                        'best_answer' => false,
                        'is_accepted' => false,
                    ]);

                $reply->update([
                    'best_answer' => true,
                    'is_accepted' => true,
                ]);

                // Award points
                $this->gamification->awardPoints(
                    $reply->author,
                    50,
                    'reply_accepted',
                    $reply->id,
                    'topic_reply',
                    'Reply marked as accepted solution'
                );

                // Send notification
                $this->notificationService->send(
                    $reply->author,
                    'reply_accepted',
                    'Your reply was accepted',
                    "Your reply was marked as accepted on topic: {$topic->title}",
                    $reply->id,
                    'topic_reply'
                );
            }

            return $reply->load(['author.profile']);
        });
    }

    public function listReplies(string $topicId)
    {
        return TopicReply::where('topic_id', $topicId)
            ->with(['author.profile'])
            ->orderBy('created_at')
            ->get();
    }
}
