<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessGrant extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'user_access_grants';

    protected $fillable = [
        'id',
        'user_id',
        'access_level_id',
        'granted_by',
        'request_id',
        'granted_at',
        'expires_at',
        'revoked_at',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'granted_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    public function accessLevel(): BelongsTo
    {
        return $this->belongsTo(AccessLevel::class, 'access_level_id');
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(AccessRequest::class, 'request_id');
    }
}
