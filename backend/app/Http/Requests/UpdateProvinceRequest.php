<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProvinceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $provinceId = $this->route('id');

        return [
            'name' => [
                'sometimes', 'required', 'string', 'max:100',
                Rule::unique('provinces', 'name')->ignore($provinceId),
            ],
            'code' => [
                'sometimes', 'required', 'string', 'max:20',
                Rule::unique('provinces', 'code')->ignore($provinceId),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
