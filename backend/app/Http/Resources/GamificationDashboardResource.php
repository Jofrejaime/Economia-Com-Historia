<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GamificationDashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'total_users'          => (int) ($this->resource['total_users'] ?? 0),
            'total_badges'         => (int) ($this->resource['total_badges'] ?? 0),
            'total_points'         => (int) ($this->resource['total_points'] ?? 0),
            'recent_earned_badges' => $this->resource['recent_earned_badges'] ?? [],
            'top_users'            => LeaderboardEntryResource::collection($this->resource['top_users'] ?? []),
            'leaderboard'          => LeaderboardEntryResource::collection($this->resource['leaderboard'] ?? []),
            'quizzes_count'        => (int) ($this->resource['quizzes_count'] ?? 0),
            'total_attempts'       => (int) ($this->resource['total_attempts'] ?? 0),
            'snapshots'            => $this->resource['snapshots'] ?? [],
        ];
    }
}
