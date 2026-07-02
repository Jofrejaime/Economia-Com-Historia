<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModerationActionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'report_id'    => $this->id ?? $this->resource['report_id'] ?? null,
            'action'       => $this->action ?? $this->resource['action'] ?? null,
            'reason'       => $this->reason ?? $this->resource['reason'] ?? null,
            'moderator_id' => $this->reviewed_by ?? $this->resource['moderator_id'] ?? null,
            'timestamp'    => ($this->reviewed_at ? $this->reviewed_at->toIso8601String() : null) ?? $this->resource['timestamp'] ?? now()->toIso8601String(),
            'message'      => $this->action_taken ?? $this->resource['message'] ?? 'Action executed successfully.',
        ];
    }
}
