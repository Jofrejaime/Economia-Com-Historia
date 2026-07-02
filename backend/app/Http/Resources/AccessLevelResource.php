<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccessLevelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'color_bg' => $this->color_bg,
            'color_text' => $this->color_text,
            'requires_approval' => (bool) $this->requires_approval,
            'auto_grant' => (bool) $this->auto_grant,
        ];
    }
}
