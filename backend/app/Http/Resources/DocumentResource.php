<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Defines the public shape of a Document in all API responses.
 *
 * This Resource is designed to work with two source types:
 *   1. A Document Eloquent model (with eagerly loaded relations).
 *   2. A stdClass from a JOIN query (flat joined fields).
 *
 * For joined fields (category_name, access_level_name, etc.), the fallback
 * pattern `$this->field ?? $this->relation?->field` handles both cases:
 *   - stdClass: the flat field is present.
 *   - Eloquent model: the flat field is null, so it falls back to the relation.
 *
 * Dead fields (unique_id, physical_location, record_type, reviewed_by) are
 * intentionally excluded.
 *
 * Media fields:
 *   - media_type: TEXT | IMAGE | VIDEO | AUDIO | PDF (Sprint 14.3 contract)
 *   - media_url:  unified URL for any media file (Sprint 14.3 contract)
 *   - pdf_url:    LEGACY — kept for backward compatibility only
 */
class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isModel = $this->resource instanceof \App\Models\Document;

        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'slug'             => $this->slug,
            'author'           => $this->author,
            'institution'      => $this->institution,
            'category_id'      => $this->category_id,
            'document_type'    => $this->document_type,
            'academic_level'   => $this->academic_level,
            'access_level_id'  => $this->access_level_id,
            'publication_date' => $this->publication_date,
            'period_start'     => $this->period_start,
            'period_end'       => $this->period_end,
            'summary'          => $this->summary,
            'content'          => $this->content,
            'cover_image_url'  => $this->cover_image_url,
            'media_type'       => $this->media_type,
            'media_url'        => $this->media_url,
            'pdf_url'          => $this->pdf_url,  // legacy — use media_url for new content
            'status'           => $this->status,
            'is_pinned'        => (bool) $this->is_pinned,
            'created_by'       => $this->created_by,
            'published_at'     => $this->published_at,
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
            'views_count'      => (int) $this->views_count,
            'likes_count'      => (int) $this->likes_count,
            'downloads_count'  => (int) $this->downloads_count,
            'topics_count'     => (int) ($this->topics_count ?? 0),
            'quizzes_count'    => (int) ($this->quizzes_count ?? 0),

            'topics_preview'   => $isModel ? $this->whenLoaded('topics', function () {
                return $this->resource->topics->map(fn($t) => [
                    'id'            => $t->id,
                    'title'         => $t->title,
                    'author'        => [
                        'id'           => $t->author?->id,
                        'display_name' => $t->author?->profile?->display_name,
                        'avatar_url'   => $t->author?->profile?->avatar_url,
                    ],
                    'replies_count' => (int) $t->replies_count,
                    'created_at'    => $t->created_at,
                ]);
            }) : null,

            'quizzes'          => $isModel ? $this->whenLoaded('quizzes', function () {
                return $this->resource->quizzes->map(fn($q) => [
                    'id'                => $q->id,
                    'title'             => $q->title,
                    'description'       => $q->description,
                    'difficulty'        => $q->difficulty,
                    'base_points'       => (int) ($q->base_points ?? 0),
                    'questions_count'   => (int) $q->questions_count,
                    'estimated_time'    => (int) ($q->time_limit_secs ? ceil($q->time_limit_secs / 60) : 0),
                    'estimated_minutes' => (int) ($q->time_limit_secs ? ceil($q->time_limit_secs / 60) : 0),
                    'attempts_count'    => (int) $q->attempts_count,
                    'avg_score'         => (float) $q->avg_score,
                    'status'            => $q->status,
                ]);
            }) : null,

            'learning'         => $isModel ? $this->whenLoaded('category', function () {
                if (!$this->resource->relationLoaded('topics') || !$this->resource->relationLoaded('quizzes')) {
                    return null;
                }
                return [
                    'documents_in_category' => (int) ($this->resource->category->documents_count ?? 0),
                    'related_quizzes'       => (int) ($this->quizzes_count ?? 0),
                    'related_topics'        => (int) ($this->topics_count ?? 0),
                ];
            }) : null,

            // Category joined fields (flat — kept for backwards compatibility)
            'category_name'       => $isModel ? optional($this->resource->category)->name       : ($this->resource->category_name ?? null),
            'category_slug'       => $isModel ? optional($this->resource->category)->slug       : ($this->resource->category_slug ?? null),
            'category_color_bg'   => $isModel ? optional($this->resource->category)->color_bg   : ($this->resource->category_color_bg ?? null),
            'category_color_text' => $isModel ? optional($this->resource->category)->color_text : ($this->resource->category_color_text ?? null),
            'category_icon'       => $isModel ? optional($this->resource->category)->icon       : ($this->resource->category_icon ?? null),

            // Category nested object — consumed by the mobile frontend
            'category' => $isModel
                ? (optional($this->resource->category)->id ? [
                    'id'         => $this->resource->category->id,
                    'name'       => $this->resource->category->name,
                    'slug'       => $this->resource->category->slug,
                    'color_bg'   => $this->resource->category->color_bg,
                    'color_text' => $this->resource->category->color_text,
                    'icon'       => $this->resource->category->icon,
                ] : null)
                : ($this->resource->category_name ? [
                    'id'         => $this->resource->category_id,
                    'name'       => $this->resource->category_name,
                    'slug'       => $this->resource->category_slug ?? null,
                    'color_bg'   => $this->resource->category_color_bg ?? null,
                    'color_text' => $this->resource->category_color_text ?? null,
                    'icon'       => $this->resource->category_icon ?? null,
                ] : null),

            // Access level joined fields
            'access_level_name'      => $isModel ? optional($this->resource->accessLevel)->name      : ($this->resource->access_level_name ?? null),
            'access_level_icon'      => $isModel ? optional($this->resource->accessLevel)->icon      : ($this->resource->access_level_icon ?? null),
            'access_level_color_bg'  => $isModel ? optional($this->resource->accessLevel)->color_bg  : ($this->resource->access_level_color_bg ?? null),
            'access_level_color_text' => $isModel ? optional($this->resource->accessLevel)->color_text : ($this->resource->access_level_color_text ?? null),

            // Creator joined fields
            'author_display_name' => $isModel ? optional($this->resource->createdBy?->profile)->display_name : ($this->resource->author_display_name ?? null),
            'author_avatar_url'   => $isModel ? optional($this->resource->createdBy?->profile)->avatar_url   : ($this->resource->author_avatar_url ?? null),
            'author_institution'  => $isModel ? optional($this->resource->createdBy?->profile)->institution   : ($this->resource->author_institution ?? null),
        ];
    }
}
