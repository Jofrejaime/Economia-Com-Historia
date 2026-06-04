<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TopicReply extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'topic_replies';

    protected $fillable = [
        'topic_id',
        'author_id',
        'parent_reply_id',
        'content',
        'is_accepted',
        'is_flagged',
        'likes_count',
    ];

    protected function casts(): array
    {
        return [
            'is_accepted' => 'boolean',
            'is_flagged' => 'boolean',
            'likes_count' => 'integer',
        ];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(DiscussionTopic::class, 'topic_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function parentReply(): BelongsTo
    {
        return $this->belongsTo(TopicReply::class, 'parent_reply_id');
    }

    public function childReplies(): HasMany
    {
        return $this->hasMany(TopicReply::class, 'parent_reply_id');
    }

    public function replyLikes(): HasMany
    {
        return $this->hasMany(ReplyLike::class, 'reply_id');
    }

    public function likers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'reply_likes', 'reply_id', 'user_id');
    }
}
