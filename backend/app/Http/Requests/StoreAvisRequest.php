<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAvisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'cible_user_id' => 'required|exists:users,id|different:auteur_id',
            'location_id' => 'nullable|exists:locations,id',
            'note' => 'required|integer|between:1,5',
            'commentaire' => 'nullable|string|max:2000',
        ];
    }
}