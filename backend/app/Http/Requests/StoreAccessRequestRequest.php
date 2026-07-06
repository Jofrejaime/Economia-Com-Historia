<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccessRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id'         => ['sometimes', 'uuid', 'exists:users,id'],
            'access_level_id' => ['sometimes', 'string', 'exists:access_levels,id'],
            'document_id'     => ['sometimes', 'uuid', 'exists:documents,id'],
            'justification'   => ['nullable', 'string', 'max:1000'],
        ];
    }
}
