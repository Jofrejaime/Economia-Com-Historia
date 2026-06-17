<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

final class ProfilePresenter
{
    public static function avatarPublicUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    /**
     * @param object|null $profile Row from user_profiles
     * @return object|null
     */
    public static function presentProfile(?object $profile): ?object
    {
        if ($profile === null) {
            return null;
        }

        $presented = clone $profile;

        if (property_exists($presented, 'avatar_url')) {
            $presented->avatar_url = self::avatarPublicUrl($presented->avatar_url);
        }

        if (property_exists($presented, 'research_areas') && is_string($presented->research_areas)) {
            $decoded = json_decode($presented->research_areas, true);
            $presented->research_areas = is_array($decoded) ? $decoded : $presented->research_areas;
        }

        return $presented;
    }
}
