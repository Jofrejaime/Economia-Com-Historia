<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccessRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'user_id'            => $this->user_id,
            'access_level_id'    => $this->access_level_id,
            'status'             => $this->status,
            'justification'      => $this->justification,
            'reviewed_by'        => $this->reviewed_by,
            'reviewed_at'        => $this->reviewed_at ? $this->reviewed_at->toIso8601String() : null,
            'review_notes'       => $this->review_notes,
            'expires_at'         => $this->expires_at ? $this->expires_at->toIso8601String() : null,
            'created_at'         => $this->created_at ? $this->created_at->toIso8601String() : null,
            'access_level_name'  => $this->access_level_name ?? ($this->accessLevel ? $this->accessLevel->name : null),
            'user_display_name'  => $this->user_display_name ?? ($this->user && $this->user->profile ? $this->user->profile->display_name : null),
            'user_institution'   => $this->user_institution ?? ($this->user && $this->user->profile ? $this->user->profile->institution : null),
            'user_email'         => $this->user_email ?? ($this->user ? $this->user->email : null),
            'user'               => new UserResource($this->whenLoaded('user')),
            'reviewed_by_user'   => new UserResource($this->whenLoaded('reviewedBy')),
        ];
    }
}
