<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryMember extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'category_members';

    protected $fillable = [
        'category_id',
        'user_id',
    ];

    public $timestamps = false; // Only joined_at in schema, which we can cast to datetime.

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CommunityCategory::class, 'category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
