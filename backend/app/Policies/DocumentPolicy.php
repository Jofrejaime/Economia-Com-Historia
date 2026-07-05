<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use App\Services\DocumentAccessService;

class DocumentPolicy
{
    public function __construct(private readonly DocumentAccessService $documentAccess) {}

    /**
     * Any authenticated user with the required access grant may view the document.
     * Admins and document authors always have access. Delegates to
     * DocumentAccessService so this policy honours category-based subscription
     * gating, not just access_level_id (it was previously wired to
     * AccessGateService directly, which knows nothing about subscriptions).
     */
    public function view(User $user, Document $document): bool
    {
        return $this->documentAccess->canReadDocument($user, $document);
    }

    /**
     * Only admin and professor roles may create documents.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'professor'], true);
    }

    /**
     * Only admin and professor roles may update any document.
     */
    public function update(User $user, Document $document): bool
    {
        return in_array($user->role, ['admin', 'professor'], true);
    }

    /**
     * Only admin and professor roles may delete documents.
     */
    public function delete(User $user, Document $document): bool
    {
        return in_array($user->role, ['admin', 'professor'], true);
    }

    /**
     * Admins and the document's author (if professor) may publish.
     */
    public function publish(User $user, Document $document): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'professor' && $document->created_by === $user->id;
    }

    /**
     * Only admins may archive documents.
     */
    public function archive(User $user, Document $document): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Only admins may pin or unpin documents.
     */
    public function pin(User $user, Document $document): bool
    {
        return $user->role === 'admin';
    }
}
