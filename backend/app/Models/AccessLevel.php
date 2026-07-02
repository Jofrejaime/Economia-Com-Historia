<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccessLevel extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'access_levels';

    public $timestamps = false;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'description',
        'icon',
        'color_bg',
        'color_text',
        'requires_approval',
        'auto_grant',
    ];

    protected $casts = [
        'requires_approval' => 'boolean',
        'auto_grant' => 'boolean',
    ];

    public function grants(): HasMany
    {
        return $this->hasMany(AccessGrant::class, 'access_level_id');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(AccessRequest::class, 'access_level_id');
    }
}
