<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'icon_url',
        'color_hex',
        'category',
        'criteria_type',
        'criteria_value',
        'is_active',
    ];

    protected $casts = [
        'criteria_value' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function userBadges()
    {
        return $this->hasMany(UserBadge::class);
    }
}