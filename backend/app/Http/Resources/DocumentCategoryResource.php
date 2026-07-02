<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentCategoryResource extends JsonResource
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
            'icon' => $this->icon,
            'parent_id' => $this->parent_id,
            'sort_order' => (int) $this->sort_order,
            'requires_subscription' => (bool) $this->requires_subscription,
            'documents_count' => $this->whenCounted('documents'),
        ];
    }
}
