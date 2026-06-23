<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Representa uma linha do cache do ranking nacional.
 *
 * A tabela leaderboard_nacional_cache é actualizada pelo evento MySQL
 * evt_refresh_leaderboard (a cada hora) via sp_refresh_leaderboard_nacional().
 *
 * @property string  $user_id
 * @property int     $rank_position
 * @property string  $display_name
 * @property string|null $province
 * @property string|null $avatar_url
 * @property int     $total_points
 * @property int     $quizzes_completed
 * @property int     $weekly_points
 * @property int     $current_level
 * @property int     $prev_rank
 * @property \Illuminate\Support\Carbon $refreshed_at
 */
class LeaderboardCache extends Model
{
    protected $table      = 'leaderboard_nacional_cache';
    protected $primaryKey = 'user_id';
    protected $keyType    = 'string';

    /** A tabela não usa created_at / updated_at — usa refreshed_at. */
    public $timestamps = false;

    public $incrementing = false;

    protected $fillable = [
        'rank_position',
        'user_id',
        'display_name',
        'province',
        'avatar_url',
        'total_points',
        'quizzes_completed',
        'weekly_points',
        'current_level',
        'prev_rank',
        'refreshed_at',
    ];

    protected $casts = [
        'rank_position'     => 'integer',
        'total_points'      => 'integer',
        'quizzes_completed' => 'integer',
        'weekly_points'     => 'integer',
        'current_level'     => 'integer',
        'prev_rank'         => 'integer',
        'refreshed_at'      => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
