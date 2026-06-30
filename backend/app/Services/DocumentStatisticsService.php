<?php

namespace App\Services;

use App\Enums\DocumentStatus;
use Illuminate\Support\Facades\DB;

class DocumentStatisticsService
{
    public function summary(): array
    {
        return [
            'total'     => DB::table('documents')->count(),
            'published' => DB::table('documents')->where('status', DocumentStatus::PUBLISHED->value)->count(),
            'draft'     => DB::table('documents')->where('status', DocumentStatus::DRAFT->value)->count(),
            'archived'  => DB::table('documents')->where('status', DocumentStatus::ARCHIVED->value)->count(),
            'pinned'    => DB::table('documents')->where('is_pinned', true)->count(),
        ];
    }
}
