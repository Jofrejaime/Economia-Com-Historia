<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInterestAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $areaId = $this->route('id');

        return [
            'name' => [
                'sometimes', 'required', 'string', 'max:100',
                Rule::unique('interest_areas', 'name')->ignore($areaId),
            ],
            'slug' => [
                'sometimes', 'required', 'string', 'max:100',
                Rule::unique('interest_areas', 'slug')->ignore($areaId),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
