<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Representa uma linha da VIEW province_stats (MySQL).
 *
 * Esta view é read-only e não possui PK própria.
 * É gerada pela migration create_leaderboard_tables e actualizada
 * automaticamente pelo MySQL a cada consulta (view não materializada).
 *
 * Colunas:
 *   province        VARCHAR(50)
 *   total_users     INT
 *   total_points    BIGINT
 *   avg_points      INT (UNSIGNED)
 *   max_points      INT
 *   total_quizzes   BIGINT
 *   avg_level       DECIMAL(3,2)
 *
 * @property string $province
 * @property int    $total_users
 * @property int    $total_points
 * @property int    $avg_points
 * @property int    $max_points
 * @property int    $total_quizzes
 * @property float  $avg_level
 */
class ProvinceStat extends Model
{
    protected $table = 'province_stats';

    /** VIEW — sem PK gerível pelo ORM. */
    protected $primaryKey = 'province';
    protected $keyType    = 'string';
    public $incrementing  = false;

    /** VIEW — sem timestamps. */
    public $timestamps = false;

    protected $casts = [
        'total_users'   => 'integer',
        'total_points'  => 'integer',
        'avg_points'    => 'integer',
        'max_points'    => 'integer',
        'total_quizzes' => 'integer',
        'avg_level'     => 'decimal:2',
    ];
}
