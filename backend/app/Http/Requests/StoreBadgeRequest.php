<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBadgeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:100', 'unique:badges,name'],
            'description'    => ['required', 'string'],
            'color_hex'      => ['nullable', 'string', 'max:7'],
            'category'       => ['nullable', 'string', 'max:50'],
            'criteria_type'  => ['required', 'string'],
            'criteria_value' => ['required'],
            'is_active'      => ['boolean'],
            'icon'           => ['nullable', 'image', 'max:4096'],
            'cover'          => ['nullable', 'image', 'max:4096'],
            'banner'         => ['nullable', 'image', 'max:4096'],
        ];
    }
}
