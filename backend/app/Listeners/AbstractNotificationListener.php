<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\NotificationService;

/**
 * Base reutilizável para os listeners de notificação de cada domínio
 * (Documentos, Comunidade, Acesso, Moderação, Gamificação…).
 *
 * Centraliza as guardas comuns a todas as notificações de domínio, para que
 * os listeners concretos só declarem "quem notificar e com que mensagem":
 *
 *   - `userId` nulo                → não notifica;
 *   - utilizador inexistente       → não notifica;
 *   - destinatário === ator        → não notifica (ninguém se auto-notifica).
 *
 * Mantém a regra de ouro da EDA: a criação de notificações vive em listeners,
 * nunca nos services/controllers.
 */
abstract class AbstractNotificationListener
{
    public function __construct(
        protected readonly NotificationService $notifications,
    ) {}

    /**
     * Notifica um utilizador aplicando as guardas comuns.
     *
     * @param  array<string, mixed>  $data  Payload extra (ex.: ids para redirect)
     * @return bool  true se a notificação foi criada
     */
    protected function notifyUser(
        ?string $userId,
        string $type,
        string $title,
        ?string $message = null,
        ?string $referenceId = null,
        ?string $referenceType = null,
        ?string $skipActorId = null,
        array $data = [],
    ): bool {
        if ($userId === null) {
            return false;
        }

        if ($skipActorId !== null && $userId === $skipActorId) {
            return false;
        }

        $user = User::find($userId);
        if ($user === null) {
            return false;
        }

        $this->notifications->send(
            $user,
            $type,
            $title,
            $message,
            $referenceId,
            $referenceType,
            [],
            $data,
        );

        return true;
    }
}
