<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('user');

        return [
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $id],
            'role' => ['required', 'string', 'in:admin,professor,investigador,estudante'],
            'email_verified' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'display_name' => ['required', 'string', 'max:100'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:50'],
            'avatar_url' => ['nullable', 'string'],
            'bio' => ['nullable', 'string'],
            'website_url' => ['nullable', 'string', 'max:500'],
            'research_areas' => ['nullable', 'array'],
            'research_areas.*' => ['string', 'max:100'],
        ];
    }
}
