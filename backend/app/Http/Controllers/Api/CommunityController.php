<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json(['data' => DB::table('community_categories')->orderBy('sort_order')->get()]);
    }

    public function storeCategory(): JsonResponse { return response()->json(['message' => 'Endpoint ready.'], 501); }
    public function indexTopics(): JsonResponse { return response()->json(['data' => DB::table('discussion_topics')->orderByDesc('created_at')->limit(20)->get()]); }
    public function storeTopic(): JsonResponse { return response()->json(['message' => 'Endpoint ready.'], 501); }
    public function showTopic(string $id): JsonResponse { return response()->json(['data' => DB::table('discussion_topics')->where('id', $id)->first()]); }
    public function updateTopic(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function destroyTopic(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function likeTopic(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function unlikeTopic(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function followTopic(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function unfollowTopic(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function topicReplies(string $id): JsonResponse { return response()->json(['data' => DB::table('topic_replies')->where('topic_id', $id)->orderBy('created_at')->get()]); }
    public function storeReply(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'topic_id' => $id], 501); }
    public function updateReply(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function destroyReply(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function likeReply(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function unlikeReply(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
    public function acceptReply(string $id): JsonResponse { return response()->json(['message' => 'Endpoint ready.', 'id' => $id], 501); }
}