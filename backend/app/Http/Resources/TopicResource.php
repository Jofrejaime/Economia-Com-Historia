<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TopicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'document_id' => $this->document_id,
            'author_id' => $this->author_id,
            'title' => $this->title,
            'content' => $this->content,
            'visibility' => $this->visibility,
            'status' => $this->status,
            'is_pinned' => (bool) $this->is_pinned,
            'is_featured' => (bool) $this->is_featured,
            'pinned' => (bool) $this->pinned,
            'featured' => (bool) $this->featured,
            'locked' => (bool) $this->locked,
            'solved' => (bool) $this->solved,
            'closed_at' => $this->closed_at,
            'closed_by' => $this->closed_by,
            'last_reply_at' => $this->last_reply_at,
            'replies_count' => (int) $this->replies_count,
            'views_count' => (int) $this->views_count,
            'likes_count' => (int) $this->likes_count,
            'followers_count' => (int) $this->followers_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'author' => new UserResource($this->whenLoaded('author')),
            'category' => new CommunityCategoryResource($this->whenLoaded('category')),
            'replies' => ReplyResource::collection($this->whenLoaded('replies')),
        ];
    }
}
