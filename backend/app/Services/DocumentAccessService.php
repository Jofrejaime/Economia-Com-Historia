<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Query\Builder;

class DocumentAccessService
{
    public function __construct(
        private readonly AccessGateService $accessGate,
        private readonly DocumentSubscriptionService $subscriptionService,
    ) {}

    public function canReadDocument(?User $user, object $document): bool
    {
        if ($user !== null && $user->role === 'admin') {
            return true;
        }

        if ($user !== null && isset($document->created_by) && $document->created_by === $user->id) {
            return true;
        }

        if ($document instanceof Document && !$document->relationLoaded('category')) {
            $document->load('category');
        }

        $category = $document instanceof Document ? $document->category : null;

        if ($category !== null && $category->requires_subscription) {
            if ($user === null) {
                return false;
            }

            return $this->subscriptionService->hasActiveSubscription($user->id, $document->id);
        }

        $accessLevelId = $document->access_level_id ?? 'public';

        return $this->accessGate->canAccess($user, $accessLevelId);
    }

    public function isSubscriptionRequired(object $document): bool
    {
        if ($document instanceof Document) {
            if (!$document->relationLoaded('category')) {
                $document->load('category');
            }
            $category = $document->category;

            return $category !== null && (bool) $category->requires_subscription;
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