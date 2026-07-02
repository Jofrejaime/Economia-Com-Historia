<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LevelDefinition extends Model
{
    use HasFactory;

    protected $table = 'level_definitions';

    protected $primaryKey = 'level';

    public $incrementing = false;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'level',
        'name',
        'min_points',
        'max_points',
        'color_hex',
        'icon_url',
        'perks',
    ];

    protected $casts = [
        'level' => 'integer',
        'min_points' => 'integer',
        'max_points' => 'integer',
        'perks' => 'json',
    ];
}
