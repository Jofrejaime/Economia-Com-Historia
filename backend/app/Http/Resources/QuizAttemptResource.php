<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'quiz_id'            => $this->quiz_id,
            'quiz_title'         => $this->quiz?->title ?? 'N/A',
            'user_id'            => $this->user_id,
            'user_name'          => $this->user?->profile?->display_name ?? 'N/A',
            'user_email'         => $this->user?->email ?? 'N/A',
            'status'             => $this->status,
            'score'              => (int) $this->score,
            'correct_answers'    => (int) $this->correct_answers,
            'total_questions'    => (int) $this->total_questions,
            'time_spent_secs'    => (int) $this->time_spent_secs,
            'points_earned'      => (int) $this->points_earned,
            'bonus_points'       => (int) $this->bonus_points,
            'performance_rating' => $this->performance_rating,
            'started_at'         => $this->started_at,
            'completed_at'       => $this->completed_at,
            'answers'            => $this->answers ?? [],
        ];
    }
}
