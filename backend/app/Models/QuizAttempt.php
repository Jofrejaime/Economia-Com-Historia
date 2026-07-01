<?php

namespace App\Models;

use App\Enums\QuizAttemptStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    use HasUuids;

    protected $table = 'quiz_attempts';

    public $timestamps = false;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'status',
        'score',
        'correct_answers',
        'total_questions',
        'time_spent_secs',
        'points_earned',
        'bonus_points',
        'performance_rating',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status'             => QuizAttemptStatus::class,
            'started_at'         => 'datetime',
            'completed_at'       => 'datetime',
            'score'              => 'integer',
            'correct_answers'    => 'integer',
            'total_questions'    => 'integer',
            'time_spent_secs'    => 'integer',
            'points_earned'      => 'integer',
            'bonus_points'       => 'integer',
        ];
    }

    public function isCompleted(): bool
    {
        return $this->status === QuizAttemptStatus::COMPLETED;
    }

    public function isInProgress(): bool
    {
        return $this->status === QuizAttemptStatus::IN_PROGRESS;
    }

    public function percentage(): int
    {
        return (int) ($this->score ?? 0);
    }

    public function passed(): bool
    {
        return $this->percentage() >= 50;
    }

    public function failed(): bool
    {
        return !$this->passed();
    }

    // ──────────────────────────────────────────────
    // Query Scopes
    // ──────────────────────────────────────────────

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', QuizAttemptStatus::COMPLETED);
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', QuizAttemptStatus::IN_PROGRESS);
    }

    // ──────────────────────────────────────────────
    // Relações
    // ──────────────────────────────────────────────

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
