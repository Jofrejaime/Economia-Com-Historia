<?php

namespace App\Services\Media;

use App\Models\Media;

/**
 * Contrato para geração de previews (ex.: primeira página de um PDF → PNG).
 *
 * A implementação atual é NullPreviewGenerator (sem biblioteca de rasterização
 * instalada). Quando existir suporte (Imagick/ghostscript/spatie-pdf-to-image),
 * basta criar uma nova implementação e trocar o binding no AppServiceProvider —
 * nenhum controller ou service de domínio precisa de ser alterado.
 */
interface PreviewGenerator
{
    /**
     * Gera o preview do ficheiro e devolve o caminho relativo no disco
     * público, ou null quando não é possível gerar.
     */
    public function generate(Media $media): ?string;
}
