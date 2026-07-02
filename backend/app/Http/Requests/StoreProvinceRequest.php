<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProvinceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'unique:provinces,name', 'max:100'],
            'code' => ['required', 'string', 'unique:provinces,code', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
