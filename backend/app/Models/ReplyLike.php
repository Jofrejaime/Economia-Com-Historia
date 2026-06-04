<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReplyLike extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'reply_likes';

    protected $fillable = [
        'reply_id',
        'user_id',
    ];

    public $timestamps = false; // Only created_at in schema, handled by default value useCurrent() or manually.

    public function reply(): BelongsTo
    {
        return $this->belongsTo(TopicReply::class, 'reply_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
