<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class HealthController extends Controller
{
    public function __invoke()
    {
        return response()->json([
            'status' => 'ok',
            'service' => "economia-com-historia-api | Feito por Cristina Mazebo, Jofre Jaime, Abel Canas, Lucio Vitorino",
        ]);
    }
}