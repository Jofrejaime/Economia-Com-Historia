<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content_type' => ['required', 'string', 'in:document,topic,reply,user'],
            'content_id'   => ['required', 'string', 'uuid'],
            'reason'       => ['required', 'string', 'in:spam,inappropriate,misinformation,copyright,off_topic,other'],
            'description'  => ['nullable', 'string', 'max:1000'],
        ];
    }
}
