<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'display_name',
        'full_name',
        'institution',
        'province',
        'avatar_url',
        'bio',
        'website_url',
        'research_areas',
    ];

    protected $casts = [
        'research_areas' => 'json',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
