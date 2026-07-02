<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'settings';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'key',
        'value',
        'type',
        'group',
        'description',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Get setting value cast dynamically according to its type.
     */
    public function getValueAttribute($value)
    {
        return match ($this->type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float'   => (float) $value,
            'json'    => json_decode($value, true),
            default   => $value,
        };
    }

    /**
     * Set setting value cast dynamically.
     */
    public function setValueAttribute($value)
    {
        $this->attributes['value'] = match ($this->type) {
            'json'  => is_array($value) || is_object($value) ? json_encode($value) : $value,
            default => (string) $value,
        };
    }
}
