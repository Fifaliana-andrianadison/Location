<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContratRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'annonce_id' => 'required|exists:annonces,id',
            'locataire_id' => 'required|exists:users,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'loyer_mensuel' => 'required|numeric|min:0',
            'caution' => 'nullable|numeric|min:0',
            'conditions' => 'nullable|string|max:5000',
        ];
    }
}