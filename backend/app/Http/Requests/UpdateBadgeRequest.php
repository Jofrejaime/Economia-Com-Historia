<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBadgeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'name'           => ['sometimes', 'required', 'string', 'max:100', 'unique:badges,name,' . $id],
            'description'    => ['sometimes', 'required', 'string'],
            'color_hex'      => ['nullable', 'string', 'max:7'],
            'category'       => ['nullable', 'string', 'max:50'],
            'criteria_type'  => ['sometimes', 'required', 'string'],
            'criteria_value' => ['sometimes', 'required'],
            'is_active'      => ['boolean'],
            'icon'           => ['nullable', 'image', 'max:4096'],
            'cover'          => ['nullable', 'image', 'max:4096'],
            'banner'         => ['nullable', 'image', 'max:4096'],
        ];
    }
}
