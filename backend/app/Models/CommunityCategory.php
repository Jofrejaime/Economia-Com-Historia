<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'members_count',
        'topics_count',
    ];

    public $timestamps = false; // The migration only has created_at, no updated_at. We can handle created_at manually or let Database handle it with useCurrent().

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'members_count' => 'integer',
            'topics_count' => 'integer',
        ];
    }

    public function topics(): HasMany
    {
        return $this->hasMany(DiscussionTopic::class, 'category_id');
    }

    public function membersRelation(): HasMany
    {
        return $this->hasMany(CategoryMember::class, 'category_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'category_members', 'category_id', 'user_id')
            ->withPivot('joined_at');
    }
}
