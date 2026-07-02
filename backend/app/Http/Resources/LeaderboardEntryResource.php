<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaderboardEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Support both arrays and objects (from DB query or Eloquent model)
        $data = is_array($this->resource) ? $this->resource : (array) $this->resource;

        return [
            'rank_position'     => (int) ($data['rank_position'] ?? 0),
            'user_id'           => $data['user_id'] ?? null,
            'display_name'      => $data['display_name'] ?? null,
            'province'          => $data['province'] ?? null,
            'institution'       => $data['institution'] ?? null,
            'avatar_url'        => $data['avatar_url'] ?? null,
            'total_points'      => (int) ($data['total_points'] ?? 0),
            'quizzes_completed' => (int) ($data['quizzes_completed'] ?? 0),
            'weekly_points'     => (int) ($data['weekly_points'] ?? 0),
            'current_level'     => (int) ($data['current_level'] ?? 1),
            'prev_rank'         => (int) ($data['prev_rank'] ?? 0),
        ];
    }
}
