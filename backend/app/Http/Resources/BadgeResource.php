<?php

namespace App\Http\Resources;

use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BadgeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $mediaService = app(MediaService::class);
        $media = $mediaService->payloadsFor('badge', $this->id);

        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'description'    => $this->description,
            'icon_url'       => $this->icon_url,
            'color_hex'      => $this->color_hex,
            'category'       => $this->category,
            'criteria_type'  => $this->criteria_type,
            'criteria_value' => $this->criteria_value,
            'is_active'      => (bool) $this->is_active,
            'created_at'     => $this->created_at,
            'earned_count'   => $this->user_badges_count ?? 0,
            'icon'           => $media['icon'] ?? null,
            'cover'          => $media['cover'] ?? null,
            'banner'         => $media['banner'] ?? null,
        ];
    }
}
