<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Categoria de comunidade — organiza tópicos; nunca controla autorização
 * (Sprint 18.5.1). O acesso é decidido por discussion_topics.visibility.
 */
class CommunityCategory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'community_categories';

    protected $fillable = [
        'slug',
        'name',
        'description',
        'color_bg',
        'color_text',
        'cover_image_url',
        'sort_order',
        'is_active',
        'topics_count',
    ];

    public $timestamps = false; // The migration only has created_at, no updated_at. We can handle created_at manually or let Database handle it with useCurrent().

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'topics_count' => 'integer',
        ];
    }

    public function topics(): HasMany
    {
        return $this->hasMany(DiscussionTopic::class, 'category_id');
    }
}
