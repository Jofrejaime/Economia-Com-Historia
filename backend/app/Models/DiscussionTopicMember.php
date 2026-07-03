<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Membro de um tópico de discussão (Sprint 18.5.1).
 *
 * Pertencer a esta tabela é ser membro — não existem papéis nem convites
 * pendentes. A autoridade máxima do tópico é sempre o autor (author_id).
 */
class DiscussionTopicMember extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'discussion_topic_members';

    protected $fillable = [
        'topic_id',
        'user_id',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(DiscussionTopic::class, 'topic_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
