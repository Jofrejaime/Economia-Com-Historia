<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityCategory;
use App\Models\DiscussionTopic;
use App\Models\TopicReply;
use App\Models\TopicLike;
use App\Models\ReplyLike;
use App\Models\TopicFollower;
use App\Models\CategoryMember;
use App\Services\AccessGateService;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommunityController extends Controller
{
    public function __construct(
        private readonly AccessGateService $accessGate,
        private readonly GamificationService $gamification,
        private readonly NotificationService $notificationService,
    ) {}

    // ─── CATEGORIES ────────────────────────────────────────────────────────

    public function categories(): JsonResponse
    {
        $categories = CommunityCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => ['required', 'string', 'unique:community_categories', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'access_level_id' => ['nullable', 'string', 'exists:access_levels,id'],
            'color_bg' => ['nullable', 'string', 'regex:/^#[0-9A-F]{6}$/i'],
            'color_text' => ['nullable', 'string', 'regex:/^#[0-9A-F]{6}$/i'],
            'cover_image_url' => ['nullable', 'string', 'url', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $category = CommunityCategory::create([
            'id' => (string) Str::uuid(),
            'slug' => $validated['slug'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'access_level_id' => $validated['access_level_id'] ?? 'public',
            'color_bg' => $validated['color_bg'] ?? '#800020',
            'color_text' => $validated['color_text'] ?? '#FFFFFF',
            'cover_image_url' => $validated['cover_image_url'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => true,
            'members_count' => 0,
            'topics_count' => 0,
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => $category,
        ], 201);
    }

    // ─── TOPICS ────────────────────────────────────────────────────────────

    public function indexTopics(): JsonResponse
    {
        $topics = DiscussionTopic::with(['author', 'category'])
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return response()->json(['data' => $topics]);
    }

    public function storeTopic(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'uuid', 'exists:community_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:5000'],
        ]);

        $category = CommunityCategory::findOrFail($validated['category_id']);

        // Check access to category
        if (!$this->accessGate->canAccess($request->user(), $category->access_level_id)) {
            abort(403, 'Access denied to this category.');
        }

        $topic = DB::transaction(function () use ($validated, $request, $category) {
            $topic = DiscussionTopic::create([
                'id' => (string) Str::uuid(),
                'category_id' => $validated['category_id'],
                'author_id' => $request->user()->id,
                'title' => $validated['title'],
                'content' => $validated['content'],
                'status' => 'published',
                'is_pinned' => false,
                'is_featured' => false,
                'last_reply_at' => null,
                'replies_count' => 0,
                'views_count' => 0,
                'likes_count' => 0,
                'followers_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Increment category topics_count
            $category->increment('topics_count');

            // Award gamification points
            $this->gamification->awardPoints(
                $request->user(),
                20,
                'topic_created',
                $topic->id,
                'discussion_topic',
                "Created topic: {$topic->title}"
            );

            // Increment counter
            $this->gamification->incrementCounters($request->user(), ['topics_created' => 1]);

            return $topic->load(['author', 'category']);
        });

        return response()->json([
            'message' => 'Topic created successfully.',
            'data' => $topic,
        ], 201);
    }

    public function showTopic(string $id): JsonResponse
    {
        $topic = DiscussionTopic::with(['author', 'category'])->findOrFail($id);

        // Increment views
        $topic->increment('views_count');

        return response()->json(['data' => $topic]);
    }

    public function updateTopic(string $id, Request $request): JsonResponse
    {
        $topic = DiscussionTopic::findOrFail($id);

        // Check ownership or admin
        if ($topic->author_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:5000'],
            'status' => ['nullable', 'string', 'in:published,draft,archived'],
        ]);

        $topic->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => $validated['status'] ?? $topic->status,
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Topic updated successfully.',
            'data' => $topic->load(['author', 'category']),
        ]);
    }

    public function destroyTopic(string $id, Request $request): JsonResponse
    {
        $topic = DiscussionTopic::findOrFail($id);

        // Check ownership or admin
        if ($topic->author_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        DB::transaction(function () use ($topic) {
            // Decrement category topics_count
            $topic->category?->decrement('topics_count');

            // Delete all related data
            TopicLike::where('topic_id', $topic->id)->delete();
            TopicFollower::where('topic_id', $topic->id)->delete();
            ReplyLike::whereIn('reply_id', $topic->replies()->pluck('id'))->delete();
            TopicReply::where('topic_id', $topic->id)->delete();

            // Delete topic
            $topic->delete();
        });

        return response()->json(['message' => 'Topic deleted successfully.']);
    }

    // ─── TOPIC LIKES ────────────────────────────────────────────────────────

    public function likeTopic(string $id, Request $request): JsonResponse
    {
        $topic = DiscussionTopic::findOrFail($id);

        $existing = TopicLike::where('topic_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already liked.'], 409);
        }

        DB::transaction(function () use ($topic, $request, $id) {
            TopicLike::create([
                'id' => (string) Str::uuid(),
                'topic_id' => $id,
                'user_id' => $request->user()->id,
                'created_at' => now(),
            ]);

            $topic->increment('likes_count');
        });

        return response()->json(['message' => 'Topic liked.'], 201);
    }

    public function unlikeTopic(string $id, Request $request): JsonResponse
    {
        $topic = DiscussionTopic::findOrFail($id);

        $deleted = TopicLike::where('topic_id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if ($deleted > 0) {
            $topic->decrement('likes_count');
            return response()->json(['message' => 'Topic unliked.']);
        }

        return response()->json(['message' => 'Like not found.'], 404);
    }

    // ─── TOPIC FOLLOWERS ────────────────────────────────────────────────────

    public function followTopic(string $id, Request $request): JsonResponse
    {
        $topic = DiscussionTopic::findOrFail($id);

        $existing = TopicFollower::where('topic_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already following.'], 409);
        }

        DB::transaction(function () use ($topic, $request, $id) {
            TopicFollower::create([
                'id' => (string) Str::uuid(),
                'topic_id' => $id,
                'user_id' => $request->user()->id,
                'created_at' => now(),
            ]);

            $topic->increment('followers_count');
        });

        return response()->json(['message' => 'Topic followed.'], 201);
    }

    public function unfollowTopic(string $id, Request $request): JsonResponse
    {
        $topic = DiscussionTopic::findOrFail($id);

        $deleted = TopicFollower::where('topic_id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if ($deleted > 0) {
            $topic->decrement('followers_count');
            return response()->json(['message' => 'Topic unfollowed.']);
        }

        return response()->json(['message' => 'Follow not found.'], 404);
    }

    // ─── REPLIES ────────────────────────────────────────────────────────────

    public function topicReplies(string $id): JsonResponse
    {
        $topic = DiscussionTopic::findOrFail($id);

        $replies = TopicReply::where('topic_id', $id)
            ->with(['author'])
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $replies]);
    }

    public function storeReply(string $id, Request $request): JsonResponse
    {
        $topic = DiscussionTopic::findOrFail($id);

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:3000'],
            'parent_reply_id' => ['nullable', 'uuid', 'exists:topic_replies,id'],
        ]);

        $reply = DB::transaction(function () use ($topic, $validated, $request, $id) {
            $reply = TopicReply::create([
                'id' => (string) Str::uuid(),
                'topic_id' => $id,
                'author_id' => $request->user()->id,
                'parent_reply_id' => $validated['parent_reply_id'] ?? null,
                'content' => $validated['content'],
                'is_accepted' => false,
                'is_flagged' => false,
                'likes_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Increment topic replies_count
            $topic->increment('replies_count');
            $topic->update(['last_reply_at' => now()]);

            // Award gamification points
            $this->gamification->awardPoints(
                $request->user(),
                10,
                'reply_posted',
                $reply->id,
                'topic_reply',
                "Reply on topic: {$topic->title}"
            );

            // Increment counter
            $this->gamification->incrementCounters($request->user(), ['replies_posted' => 1]);

            // Send notification to topic author (if not the same user)
            if ($topic->author_id !== $request->user()->id) {
                $this->notificationService->send(
                    $topic->author,
                    'topic_reply',
                    'New reply on your topic',
                    "Someone replied to your topic: {$topic->title}",
                    $reply->id,
                    'topic_reply'
                );
            }

            return $reply->load(['author']);
        });

        return response()->json([
            'message' => 'Reply created successfully.',
            'data' => $reply,
        ], 201);
    }

    public function updateReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);

        // Check ownership or admin
        if ($reply->author_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:3000'],
        ]);

        $reply->update([
            'content' => $validated['content'],
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reply updated successfully.',
            'data' => $reply->load(['author']),
        ]);
    }

    public function destroyReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);

        // Check ownership or admin
        if ($reply->author_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        DB::transaction(function () use ($reply, $id) {
            // Get topic for counter decrement
            $topic = $reply->topic;

            // Delete child replies recursively
            $this->deleteReplyAndChildren($id);

            // Decrement topic replies_count
            if ($topic) {
                $topic->decrement('replies_count');
            }
        });

        return response()->json(['message' => 'Reply deleted successfully.']);
    }

    private function deleteReplyAndChildren(string $replyId): void
    {
        $childReplies = TopicReply::where('parent_reply_id', $replyId)->pluck('id');

        foreach ($childReplies as $childId) {
            $this->deleteReplyAndChildren($childId);
        }

        ReplyLike::where('reply_id', $replyId)->delete();
        TopicReply::where('id', $replyId)->delete();
    }

    // ─── REPLY LIKES ────────────────────────────────────────────────────────

    public function likeReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);

        $existing = ReplyLike::where('reply_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already liked.'], 409);
        }

        DB::transaction(function () use ($reply, $request, $id) {
            ReplyLike::create([
                'id' => (string) Str::uuid(),
                'reply_id' => $id,
                'user_id' => $request->user()->id,
                'created_at' => now(),
            ]);

            $reply->increment('likes_count');
        });

        return response()->json(['message' => 'Reply liked.'], 201);
    }

    public function unlikeReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);

        $deleted = ReplyLike::where('reply_id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if ($deleted > 0) {
            $reply->decrement('likes_count');
            return response()->json(['message' => 'Reply unliked.']);
        }

        return response()->json(['message' => 'Like not found.'], 404);
    }

    // ─── REPLY ACCEPTED ─────────────────────────────────────────────────────

    public function acceptReply(string $id, Request $request): JsonResponse
    {
        $reply = TopicReply::findOrFail($id);
        $topic = $reply->topic;

        // Only topic author or admin can accept reply
        if ($topic->author_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403, 'Only topic author can accept replies.');
        }

        if ($reply->is_accepted) {
            return response()->json(['message' => 'Reply already accepted.'], 409);
        }

        DB::transaction(function () use ($reply, $request, $topic) {
            // Unmark any previously accepted reply
            TopicReply::where('topic_id', $reply->topic_id)
                ->where('is_accepted', true)
                ->update(['is_accepted' => false]);

            // Mark this reply as accepted
            $reply->update(['is_accepted' => true]);

            // Award bonus points to reply author
            $this->gamification->awardPoints(
                $reply->author,
                50,
                'reply_accepted',
                $reply->id,
                'topic_reply',
                'Reply marked as accepted solution'
            );

            // Send notification to reply author
            $this->notificationService->send(
                $reply->author,
                'reply_accepted',
                'Your reply was accepted',
                "Your reply was marked as accepted on topic: {$topic->title}",
                $reply->id,
                'topic_reply'
            );
        });

        return response()->json([
            'message' => 'Reply marked as accepted.',
            'data' => $reply->load(['author']),
        ]);
    }
}