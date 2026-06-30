<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class CategoryStatisticsService
{
    public function summary(): array
    {
        return [
            'total'                 => DB::table('document_categories')->count(),
            'free'                  => DB::table('document_categories')->where('requires_subscription', false)->count(),
            'requires_subscription' => DB::table('document_categories')->where('requires_subscription', true)->count(),
        ];
    }
}
