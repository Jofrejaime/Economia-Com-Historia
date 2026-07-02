<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Registo de um ficheiro gerido pela infraestrutura global de media.
 *
 * Nunca aceder ao Storage diretamente a partir de controllers — todas as
 * operações sobre ficheiros passam pelo MediaService.
 */
class Media extends Model
{
    use HasUuids;

    protected $table = 'media';

    protected $fillable = [
        'model_type',
        'model_id',
        'collection',
        'disk',
        'path',
        'thumbnail_path',
        'preview_path',
        'filename',
        'mime_type',
        'extension',
        'size',
        'width',
        'height',
        'sort_order',
        'created_by',
    ];

    protected $casts = [
        'size'       => 'integer',
        'width'      => 'integer',
        'height'     => 'integer',
        'sort_order' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
