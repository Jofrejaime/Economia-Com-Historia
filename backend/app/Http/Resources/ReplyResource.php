<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'topic_id' => $this->topic_id,
            'author_id' => $this->author_id,
            'parent_reply_id' => $this->parent_reply_id,
            'content' => $this->content,
            'is_accepted' => (bool) $this->is_accepted,
            'is_flagged' => (bool) $this->is_flagged,
            'hidden' => (bool) $this->hidden,
            'best_answer' => (bool) $this->best_answer,
            'likes_count' => (int) $this->likes_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'edited_at' => $this->edited_at,
            'edited_by' => $this->edited_by,
            'author' => new UserResource($this->whenLoaded('author')),
        ];
    }
}
