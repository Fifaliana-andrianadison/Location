<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLitigeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'location_id' => 'nullable|exists:locations,id',
            'motif' => 'required|string|max:255',
            'description' => 'nullable|string|max:3000',
        ];
    }
}