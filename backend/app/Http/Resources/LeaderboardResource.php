<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaderboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'scope'       => $this->resource['scope'] ?? 'national',
            'province'    => $this->resource['province'] ?? null,
            'institution' => $this->resource['institution'] ?? null,
            'data'        => LeaderboardEntryResource::collection($this->resource['data']),
            'pagination'  => $this->resource['pagination'] ?? null,
        ];
    }
}
