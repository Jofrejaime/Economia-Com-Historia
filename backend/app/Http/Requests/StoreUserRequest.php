<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:admin,professor,investigador,estudante'],
            'display_name' => ['required', 'string', 'max:100'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:50'],
            'avatar_url' => ['nullable', 'string'], // Avatar can be base64 string
            'bio' => ['nullable', 'string'],
            'website_url' => ['nullable', 'string', 'max:500'],
            'research_areas' => ['nullable', 'array'],
            'research_areas.*' => ['string', 'max:100'],
        ];
    }
}
