<?php

namespace App\Services\Media;

use App\Models\Media;

/**
 * Implementação por omissão: nenhum preview é gerado.
 *
 * Mantém a arquitetura pronta para previews de PDF sem introduzir
 * dependências que ainda não existem no ambiente.
 */
class NullPreviewGenerator implements PreviewGenerator
{
    public function generate(Media $media): ?string
    {
        return null;
    }
}
