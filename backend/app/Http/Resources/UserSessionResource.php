<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
            'is_expired' => now()->greaterThan($this->expires_at),
        ];
    }
}
