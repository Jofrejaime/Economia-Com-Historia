<?php

namespace App\Support;

final class FrontendUrl
{
    public static function build(string $path, array $query = []): string
    {
        $base = rtrim((string) config('app.frontend_url'), '/');
        $path = '/'.ltrim($path, '/');
        $url = $base.$path;

        if ($query !== []) {
            $url .= '?'.http_build_query($query);
        }

        return $url;
    }
}
