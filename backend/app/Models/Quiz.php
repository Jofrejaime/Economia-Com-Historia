<?php

namespace App\Models;

use App\Enums\QuizStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
            'status'            => QuizStatus::class,
            'is_featured'       => 'boolean',
            'base_points'       => 'integer',
            'time_limit_secs'   => 'integer',
            'attempts_count'    => 'integer',
            'completions_count' => 'integer',
            'avg_score'         => 'float',
            'published_at'      => 'datetime',
        ];
    }

    // ──────────────────────────────────────────────
    // Métodos de Domínio
    // ──────────────────────────────────────────────

    public function isPublished(): bool
    {
        return $this->status === QuizStatus::PUBLISHED;
    }

    public function isDraft(): bool
    {
        return $this->status === QuizStatus::DRAFT;
    }

    public function isReview(): bool
    {
        return $this->status === QuizStatus::REVIEW;
    }

    public function isArchived(): bool
    {
        return $this->status === QuizStatus::ARCHIVED;
    }

    public function hasDocuments(): bool
    {
        return $this->documents()->exists();
    }

    public function isStandalone(): bool
    {
        return !$this->hasDocuments();
    }

    public function hasAttempts(): bool
    {
        return $this->attempts()->exists();
    }

    public function hasPublishedDocuments(): bool
    {
        return $this->documents()->where('status', \App\Enums\DocumentStatus::PUBLISHED)->exists();
    }

    public function attemptCount(): int
    {
        return (int) ($this->attempts_count ?? $this->attempts()->count());
    }

    public function completedAttempts(): int
    {
        return (int) ($this->completions_count ?? $this->attempts()->completed()->count());
    }

    public function completionRate(): float
    {
        $attempts = $this->attemptCount();
        if ($attempts === 0) {
            return 0.0;
        }
        return round(($this->completedAttempts() / $attempts) * 100, 2);
    }

    // ──────────────────────────────────────────────
    // Query Scopes
    // ──────────────────────────────────────────────

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', QuizStatus::PUBLISHED);
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', QuizStatus::DRAFT);
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->where('status', QuizStatus::ARCHIVED);
    }

    public function scopeStandalone(Builder $query): Builder
    {
        return $query->whereDoesntHave('documents');
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    // ──────────────────────────────────────────────
    // Relações
    // ──────────────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'category_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class, 'quiz_id');
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class, 'quiz_documents', 'quiz_id', 'document_id')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }
}
