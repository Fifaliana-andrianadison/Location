<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'receiver_id' => 'required|exists:users,id|different:sender_id',
            'location_id' => 'nullable|exists:locations,id',
            'contenu' => 'nullable|string|max:5000',
            'attachment' => 'nullable|file|max:5120',
        ];
    }
}