<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PointTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'user_id'        => $this->user_id,
            'user_name'      => $this->user?->profile?->display_name ?? 'N/A',
            'user_email'     => $this->user?->email ?? 'N/A',
            'points'         => (int) $this->points,
            'reason'         => $this->reason,
            'reference_id'   => $this->reference_id,
            'reference_type' => $this->reference_type,
            'description'    => $this->description,
            'created_at'     => $this->created_at,
        ];
    }
}
