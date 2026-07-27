<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast de uma notificação recém-criada para o canal privado do
 * destinatário. Emitido pelo NotificationService::send() — o único ponto por
 * onde todas as notificações passam. Sem isto, o cliente só via a notificação
 * ao recarregar; agora o sino/contador atualizam em tempo real (Reverb).
 *
 * O contrato do payload no canal ('notification.created') é igual ao que a API
 * REST devolve para uma notificação, para o cliente reutilizar o mesmo modelo.
 */
class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /** @param array<string, mixed> $notification */
    public function __construct(public array $notification)
    {
    }

    /**
     * Canal privado do destinatário: só ele (autorizado em routes/channels.php)
     * recebe as suas notificações.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('App.Models.User.' . $this->notification['user_id'])];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    /**
     * Payload enviado no evento — datas em ISO8601 (coerente com a API REST).
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $n = $this->notification;

        return [
            'id'             => $n['id'] ?? null,
            'type'           => $n['type'] ?? null,
            'title'          => $n['title'] ?? null,
            'message'        => $n['message'] ?? null,
            'reference_id'   => $n['reference_id'] ?? null,
            'reference_type' => $n['reference_type'] ?? null,
            'data'           => isset($n['data']) && $n['data'] !== null ? json_decode($n['data'], true) : null,
            'is_read'        => false,
            'read_at'        => null,
            'created_at'     => isset($n['created_at'])
                ? \Illuminate\Support\Carbon::parse($n['created_at'])->toISOString()
                : null,
        ];
    }
}
