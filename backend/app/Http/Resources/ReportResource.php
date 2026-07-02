<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'reporter_id'  => $this->reporter_id,
            'content_type' => $this->content_type,
            'content_id'   => $this->content_id,
            'reason'       => $this->reason,
            'description'  => $this->description,
            'status'       => $this->status,
            'reviewed_by'  => $this->reviewed_by,
            'reviewed_at'  => $this->reviewed_at ? $this->reviewed_at->toIso8601String() : null,
            'action_taken' => $this->action_taken,
            'created_at'   => $this->created_at ? $this->created_at->toIso8601String() : null,
            'reporter'     => new UserResource($this->whenLoaded('reporter')),
            'reviewed_by_user' => new UserResource($this->whenLoaded('reviewedBy')),
        ];
    }
}
