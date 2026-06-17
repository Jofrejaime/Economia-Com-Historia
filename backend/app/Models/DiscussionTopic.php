<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiscussionTopic extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'discussion_topics';

    protected $fillable = [
        'category_id',
        'author_id',
        'title',
        'content',
        'status',
        'is_pinned',
        'is_featured',
        'last_reply_at',
        'replies_count',
        'views_count',
        'likes_count',
        'followers_count',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_featured' => 'boolean',
            'last_reply_at' => 'datetime',
            'replies_count' => 'integer',
            'views_count' => 'integer',
            'likes_count' => 'integer',
            'followers_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CommunityCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TopicReply::class, 'topic_id');
    }

    public function topicLikes(): HasMany
    {
        return $this->hasMany(TopicLike::class, 'topic_id');
    }

    public function likers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'topic_likes', 'topic_id', 'user_id');
    }

    public function topicFollowers(): HasMany
    {
        return $this->hasMany(TopicFollower::class, 'topic_id');
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'topic_followers', 'topic_id', 'user_id');
    }
}
