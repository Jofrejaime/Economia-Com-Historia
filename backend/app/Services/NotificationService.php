<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationService
{
    /**
     * @param  list<string>  $allowedTypes  Notification types permitted for this call
     */
    public function send(
        User $user,
        string $type,
        string $title,
        ?string $message = null,
        ?string $referenceId = null,
        ?string $referenceType = null,
        array $allowedTypes = [],
    ): array {
        if ($allowedTypes !== [] && ! in_array($type, $allowedTypes, true)) {
            throw new \InvalidArgumentException("Notification type [{$type}] is not allowed.");
        }

        $notification = [
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'reference_id' => $referenceId,
            'reference_type' => $referenceType,
            'is_read' => false,
            'read_at' => null,
            'created_at' => now(),
        ];

        DB::table('notifications')->insert($notification);

        return $notification;
    }
}
