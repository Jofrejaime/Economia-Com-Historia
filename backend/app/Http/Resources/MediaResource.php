<?php

namespace App\Http\Resources;

use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Forma pública padronizada de um ficheiro (contrato §5 da Sprint 18.4).
 *
 * Nunca expõe caminhos internos — todas as URLs são absolutas e produzidas
 * pelo MediaService.
 */
class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return app(MediaService::class)->payload($this->resource) ?? [];
    }
}
