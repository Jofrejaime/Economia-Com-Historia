<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationService
{
    /**
     * @param  list<string>  $allowedTypes  Notification types permitted for this call
     * @param  array<string, mixed>  $data  Extra payload stored as JSON (e.g. document_id for redirects)
     */
    public function send(
        User $user,
        string $type,
        string $title,
        ?string $message = null,
        ?string $referenceId = null,
        ?string $referenceType = null,
        array $allowedTypes = [],
        array $data = [],
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
            'data' => $data !== [] ? json_encode($data) : null,
            'is_read' => false,
            'read_at' => null,
            'created_at' => now(),
        ];

        DB::table('notifications')->insert($notification);

        return $notification;
    }

    public function sendTopicInvitation(User $user, string $topicTitle, string $inviterName, ?string $referenceId = null): array
    {
        return $this->send(
            $user,
            'topic_invitation',
            'Convite para fórum privado',
            "{$inviterName} convidou-te para participar do fórum \"{$topicTitle}\"",
            $referenceId,
            'discussion_topic',
            ['topic_invitation']
        );
    }

    public function sendTopicRemoved(User $user, string $topicTitle, ?string $referenceId = null): array
    {
        return $this->send(
            $user,
            'topic_removed',
            'Removido de um fórum privado',
            "Perdeste o acesso ao fórum \"{$topicTitle}\".",
            $referenceId,
            'discussion_topic',
            ['topic_removed']
        );
    }
}
