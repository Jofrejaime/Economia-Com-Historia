<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Regista snapshots diários do ranking para histórico.
 *
 * Scope pode ser 'nacional' ou 'provincial'.
 * Para snapshots provinciais, province não é null.
 *
 * @property string      $id
 * @property string      $user_id
 * @property \Illuminate\Support\Carbon $snapshot_date
 * @property string      $scope
 * @property string|null $province
 * @property int         $rank_position
 * @property int         $total_points
 * @property int         $quizzes_completed
 * @property float|null  $accuracy_pct
 * @property \Illuminate\Support\Carbon $created_at
 */
class LeaderboardSnapshot extends Model
{
    use HasUuids;

    protected $table = 'leaderboard_snapshots';

    /** Sem updated_at nesta tabela. */
    public $timestamps = false;

    protected $fillable = [
        'id',
        'user_id',
        'snapshot_date',
        'scope',
        'province',
        'rank_position',
        'total_points',
        'quizzes_completed',
        'accuracy_pct',
        'created_at',
    ];

    protected $casts = [
        'snapshot_date'     => 'date',
        'rank_position'     => 'integer',
        'total_points'      => 'integer',
        'quizzes_completed' => 'integer',
        'accuracy_pct'      => 'decimal:2',
        'created_at'        => 'datetime',
    ];

    // ──────────────────────────────────────────────
    // Scopes
    // ──────────────────────────────────────────────

    /** Filtra snapshots de âmbito nacional. */
    public function scopeNacional($query)
    {
        return $query->where('scope', 'nacional');
    }

    /** Filtra snapshots de âmbito provincial para uma dada província. */
    public function scopeProvincial($query, string $province)
    {
        return $query->where('scope', 'provincial')->where('province', $province);
    }

    // ──────────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
