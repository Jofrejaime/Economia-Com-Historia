<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthenticateApiSession
{
    public function handle(Request $request, Closure $next)
    {
        $token = $this->extractToken($request);

        if ($token === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $session = DB::table('user_sessions')
            ->where('refresh_token', $token)
            ->where('expires_at', '>', now())
            ->first();

        if ($session === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = User::query()->where('id', $session->user_id)->where('is_active', true)->first();

        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

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