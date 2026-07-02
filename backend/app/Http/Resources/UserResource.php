<?php

namespace App\Http\Resources;

use App\Support\ProfilePresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'email_verified' => (bool) $this->email_verified,
            'is_active' => (bool) $this->is_active,
            'role' => $this->role,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'last_login_at' => $this->last_login_at,
            'display_name' => $this->display_name,
            'full_name' => $this->full_name,
            'institution' => $this->profile?->institution ?? null,
            'province' => $this->profile?->province ?? null,
            'avatar_url' => $this->profile ? ProfilePresenter::avatarPublicUrl($this->profile->avatar_url) : null,
            'bio' => $this->profile?->bio ?? null,
            'website_url' => $this->profile?->website_url ?? null,
            'research_areas' => $this->profile?->research_areas ?? null,
            'profile' => new UserProfileResource($this->whenLoaded('profile')),
        ];
    }
}
