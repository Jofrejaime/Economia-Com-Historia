<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class DocumentAccessService
{
    public function __construct(
        private readonly DocumentSubscriptionService $subscriptionService,
    ) {}

    /**
     * O acesso a um documento é decidido pela CATEGORIA: se a categoria for
     * restrita (requires_subscription), os seus documentos exigem subscrição —
     * e a subscrição é sempre por-documento (subscrever um documento não abre
     * os restantes da mesma categoria). Categorias públicas → acesso livre.
     */
    public function canReadDocument(?User $user, object $document): bool
    {
        if ($user !== null && $user->role === 'admin') {
            return true;
        }

        if ($user !== null && isset($document->created_by) && $document->created_by === $user->id) {
            return true;
        }

        if (!$this->isSubscriptionRequired($document)) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        return $this->subscriptionService->hasActiveSubscription($user->id, $document->id);
    }

    /**
     * Fonte de verdade única: a categoria do documento. Categoria restrita
     * (requires_subscription) → exige subscrição por-documento.
     */
    public function isSubscriptionRequired(object $document): bool
    {
        if ($document instanceof Document) {
            if (!$document->relationLoaded('category')) {
                $document->load('category');
            }

            return $document->category !== null && (bool) $document->category->requires_subscription;
        }

        if (isset($document->category_id) && $document->category_id !== null) {
            return (bool) DB::table('document_categories')
                ->where('id', $document->category_id)
                ->value('requires_subscription');
        }

        return false;
    }

    /**
     * Apply visibility filter to a document listing query.
     *
     * Todos os documentos publicados aparecem em listagens — o controlo de acesso
     * ao conteúdo é feito no endpoint de detalhe (canReadDocument).
     * Isto permite que utilizadores descubram conteúdo restrito e solicitem acesso.
     */
    public function applyListingFilter(Builder $query, ?User $user, string $tableAlias = 'd'): void
    {
        // Sem filtro de acesso na listagem — todos os documentos publicados são visíveis.
        // O acesso ao conteúdo completo é controlado em canReadDocument() / show().
    }
}