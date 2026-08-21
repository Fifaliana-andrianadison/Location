<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCandidatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'annonce_id' => 'required|integer|exists:annonces,id',
            'message' => 'nullable|string|max:2000',
            'budget' => 'nullable|numeric|min:0',
            'documents' => 'nullable|array',
            'documents.*.type' => 'required_with:documents|in:cin,revenu,contrat,autre',
            'documents.*.file' => 'required_with:documents|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ];
    }
}