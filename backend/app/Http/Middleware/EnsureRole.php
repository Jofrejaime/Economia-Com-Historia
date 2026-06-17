<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Allowed roles (e.g. 'admin', 'admin,professor')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Flatten comma-separated role lists (supports both `role:admin,professor` and `role:admin:professor`)
        $allowed = [];
        foreach ($roles as $role) {
            foreach (explode(',', $role) as $r) {
                $r = trim($r);
                if ($r !== '') {
                    $allowed[] = $r;
                }
            }
        }

        if (! in_array($user->role, $allowed, true)) {
            return response()->json([
                'message' => 'Forbidden. Insufficient role privileges.',
            ], 403);
        }

        return $next($request);
    }
}
