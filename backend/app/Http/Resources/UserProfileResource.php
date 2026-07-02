<?php

namespace App\Http\Resources;

use App\Support\ProfilePresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'display_name' => $this->display_name,
            'full_name' => $this->full_name,
            'institution' => $this->institution,
            'province' => $this->province,
            'avatar_url' => ProfilePresenter::avatarPublicUrl($this->avatar_url),
            'bio' => $this->bio,
            'website_url' => $this->website_url,
            'research_areas' => is_string($this->research_areas) 
                ? (json_decode($this->research_areas, true) ?: null) 
                : $this->research_areas,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
