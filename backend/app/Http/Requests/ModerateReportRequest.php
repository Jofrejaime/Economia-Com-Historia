<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ModerateReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', 'string', 'in:warn,delete,hide,restore,dismiss,flag'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }
}
