<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccessGrantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'user_id'            => $this->user_id,
            'access_level_id'    => $this->access_level_id,
            'granted_by'         => $this->granted_by,
            'request_id'         => $this->request_id,
            'granted_at'         => $this->granted_at ? $this->granted_at->toIso8601String() : null,
            'expires_at'         => $this->expires_at ? $this->expires_at->toIso8601String() : null,
            'revoked_at'         => $this->revoked_at ? $this->revoked_at->toIso8601String() : null,
            'is_active'          => (bool) $this->is_active,
            'access_level_name'  => $this->access_level_name ?? ($this->accessLevel ? $this->accessLevel->name : null),
            'user_display_name'  => $this->user_display_name ?? ($this->user && $this->user->profile ? $this->user->profile->display_name : null),
            'user_email'         => $this->user_email ?? ($this->user ? $this->user->email : null),
            'user'               => new UserResource($this->whenLoaded('user')),
            'access_level'       => new AccessLevelResource($this->whenLoaded('accessLevel')),
        ];
    }
}
