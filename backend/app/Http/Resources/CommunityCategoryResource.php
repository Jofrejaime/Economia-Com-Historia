<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'color_bg' => $this->color_bg,
            'color_text' => $this->color_text,
            'cover_image_url' => $this->cover_image_url,
            'sort_order' => (int) $this->sort_order,
            'is_active' => (bool) $this->is_active,
            'topics_count' => (int) $this->topics_count,
            'created_at' => $this->created_at,
        ];
    }
}
