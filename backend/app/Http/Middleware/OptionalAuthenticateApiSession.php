<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OptionalAuthenticateApiSession
{
    public function handle(Request $request, Closure $next)
    {
        $token = $this->extractToken($request);

        if ($token !== null) {
            $session = DB::table('user_sessions')
                ->where('refresh_token', $token)
                ->where('expires_at', '>', now())
                ->first();

            if ($session !== null) {
                $user = User::query()
                    ->where('id', $session->user_id)
                    ->where('is_active', true)
                    ->first();

                if ($user !== null) {
                    Auth::setUser($user);
                    $request->setUserResolver(fn () => $user);
                }
            }
        }

        // Nunca aborta — visitante sem token, com token inválido/expirado,
        // ou utilizador suspenso (is_active = false), segue sempre com
        // $request->user() === null. A decisão do que mostrar cabe ao controller/service.
        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $bearerToken = $request->bearerToken();

        if (is_string($bearerToken) && $bearerToken !== '') {
            return $bearerToken;
        }

        $headerToken = $request->header('X-Session-Token');

        if (is_string($headerToken) && $headerToken !== '') {
            return $headerToken;
        }

        return null;
    }
}