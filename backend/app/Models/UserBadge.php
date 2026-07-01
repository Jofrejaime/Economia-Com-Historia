<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UserBadge extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['user_id', 'badge_id', 'earned_at', 'reference_id'];

    protected $casts = [
        'earned_at' => 'datetime',
    ];

    public function badge()
    {
        return $this->belongsTo(Badge::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}