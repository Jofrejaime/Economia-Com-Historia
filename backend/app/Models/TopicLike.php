<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TopicLike extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'topic_likes';

    protected $fillable = [
        'topic_id',
        'user_id',
    ];

    public $timestamps = false; // Only created_at in schema, handled by default value useCurrent() or manually.

    public function topic(): BelongsTo
    {
        return $this->belongsTo(DiscussionTopic::class, 'topic_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
