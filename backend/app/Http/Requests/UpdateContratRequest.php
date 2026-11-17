<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContratRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'locataire_id' => 'sometimes|exists:users,id',
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|required|date|after:date_debut',
            'loyer_mensuel' => 'sometimes|required|numeric|min:0',
            'caution' => 'nullable|numeric|min:0',
            'conditions' => 'nullable|string|max:5000',
        ];
    }

    public function messages(): array
    {
        return [
            'date_fin.after' => 'La date de fin doit être postérieure à la date de début.',
        ];
    }
}
