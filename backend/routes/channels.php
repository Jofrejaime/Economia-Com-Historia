<?php

use Illuminate\Support\Facades\Broadcast;

/**
 * Canal privado de notificações por utilizador.
 *
 * Os IDs de utilizador são UUID (string) — comparar como string. Nunca usar
 * (int), porque (int) de um UUID é 0 e daria 0 === 0 = acesso a todos.
 *
 * A autorização é validada no endpoint POST /api/broadcasting/auth
 * (routes/api.php), protegido pelo middleware de token da plataforma
 * (AuthenticateApiSession) — o broadcasting não usa o guard `web`.
 */
Broadcast::channel('App.Models.User.{id}', function ($user, string $id) {
    return (string) $user->id === (string) $id;
});
