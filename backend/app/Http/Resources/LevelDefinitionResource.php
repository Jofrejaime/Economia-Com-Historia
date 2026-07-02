<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LevelDefinitionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'level' => (int) $this->level,
            'name' => $this->name,
            'min_points' => (int) $this->min_points,
            'max_points' => $this->max_points !== null ? (int) $this->max_points : null,
            'color_hex' => $this->color_hex,
            'icon_url' => $this->icon_url,
            'perks' => $this->perks,
        ];
    }
}
