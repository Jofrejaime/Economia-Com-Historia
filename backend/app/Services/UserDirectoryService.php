<?php

namespace App\Services;

use App\Models\User;
use App\Support\ProfilePresenter;
use Illuminate\Support\Collection;

class UserDirectoryService
{
    /**
     * Search active users by profile data.
     *
     * @return Collection<int, array{id:string,display_name:string,full_name:string|null,avatar_url:string|null,institution:string|null}>
     */
    public function search(string $query, int $limit = 10): Collection
    {
        $search = trim($query);
        $limit = max(1, min($limit, 20));
        $emailVerificationRequired = (bool) config('auth.api.require_email_verification', false);

        $results = User::query()
            ->from('users as u')
            ->join('user_profiles as up', 'up.user_id', '=', 'u.id')
            ->where('u.is_active', true)
            ->when($emailVerificationRequired, fn ($builder) => $builder->where('u.email_verified', true))
            ->where(function ($builder) use ($search): void {
                $builder->where('up.display_name', 'like', '%'.$search.'%')
                    ->orWhere('up.full_name', 'like', '%'.$search.'%');
            })
            ->orderBy('up.display_name')
            ->limit($limit)
            ->get([
                'u.id',
                'up.display_name',
                'up.full_name',
                'up.avatar_url',
                'up.institution',
            ]);

        return $results->map(function (object $user): array {
            return [
                'id' => $user->id,
                'display_name' => $user->display_name,
                'full_name' => $user->full_name,
                'avatar_url' => ProfilePresenter::avatarPublicUrl($user->avatar_url),
                'institution' => $user->institution,
            ];
        });
    }
}
