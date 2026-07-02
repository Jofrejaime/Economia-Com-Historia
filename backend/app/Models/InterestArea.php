<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class InterestArea extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'interest_areas';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_interest_areas', 'interest_area_id', 'user_id');
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class, 'document_interest_areas', 'interest_area_id', 'document_id');
    }

    public function topics(): BelongsToMany
    {
        return $this->belongsToMany(DiscussionTopic::class, 'topic_interest_areas', 'interest_area_id', 'topic_id');
    }
}
