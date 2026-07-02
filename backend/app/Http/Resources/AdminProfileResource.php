<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => new UserResource($this->resource['user']),
            'profile' => new UserProfileResource($this->resource['profile']),
            'user_level' => $this->resource['user_level'],
            'level_definition' => $this->resource['level_definition'],
            'badges' => $this->resource['badges'],
            'access_grants' => $this->resource['access_grants'],
            'access_requests' => $this->resource['access_requests'],
            'statistics' => $this->resource['statistics'],
        ];
    }
}
