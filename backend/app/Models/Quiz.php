<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Quiz extends Model
{
    use HasUuids;

    protected $table = 'quizzes';

    protected $fillable = [
        'title', 'module', 'description', 'cover_image_url',
        'difficulty', 'base_points', 'time_limit_secs',
        'access_level_id', 'is_featured', 'status',
        'category_id', 'created_by', 'published_at',
        'attempts_count', 'completions_count', 'avg_score',
    ];

    protected function casts(): array
    {
        return [
            'is_featured'       => 'boolean',
            'base_points'       => 'integer',
            'time_limit_secs'   => 'integer',
            'attempts_count'    => 'integer',
            'completions_count' => 'integer',
            'avg_score'         => 'float',
            'published_at'      => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'category_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class, 'quiz_documents', 'quiz_id', 'document_id')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }
}
