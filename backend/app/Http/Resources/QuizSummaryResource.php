<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shape pública de um Quiz quando devolvido como item relacionado a um Documento.
 * Usado em GET /documents/{id}/quizzes e qualquer endpoint que liste quizzes associados.
 */
class QuizSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'title'             => $this->title,
            'module'            => $this->module,
            'description'       => $this->description,
            'cover_image_url'   => $this->cover_image_url,
            'difficulty'        => $this->difficulty,
            'base_points'       => (int) ($this->base_points ?? 0),
            'time_limit_secs'   => $this->time_limit_secs,
            'access_level_id'   => $this->access_level_id,
            'is_featured'       => (bool) $this->is_featured,
            'category_id'       => $this->category_id,
            'attempts_count'    => (int) ($this->attempts_count ?? 0),
            'completions_count' => (int) ($this->completions_count ?? 0),
            'avg_score'         => $this->avg_score,
            'published_at'      => $this->published_at,
            'created_at'        => $this->created_at,
            'sort_order'        => $this->pivot?->sort_order ?? 0,
        ];
    }
}
