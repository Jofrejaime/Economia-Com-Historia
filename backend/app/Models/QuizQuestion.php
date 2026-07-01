<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizQuestion extends Model
{
    use HasUuids;

    protected $table = 'quiz_questions';

    public $timestamps = false;

    protected $fillable = [
        'quiz_id', 'question_order', 'title', 'subtitle',
        'module_label', 'question_type', 'points', 'hint_title',
        'hint_quote', 'expert_name', 'expert_role',
        'reading_title', 'reading_text',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuizOption::class, 'question_id');
    }
}
