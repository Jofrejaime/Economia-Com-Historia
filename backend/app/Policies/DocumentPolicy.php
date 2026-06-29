<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use App\Services\AccessGateService;

class DocumentPolicy
{
    public function __construct(private readonly AccessGateService $accessGate) {}

    /**
     * Any authenticated user with the required access grant may view the document.
     * Admins and document authors always have access.
     */
    public function view(User $user, Document $document): bool
    {
        return $this->accessGate->canAccessDocument($user, $document);
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
}
