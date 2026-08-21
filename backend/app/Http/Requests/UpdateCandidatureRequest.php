<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCandidatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        $candidature = $this->route('candidature');
        $user = $this->user();

        return $user?->isAdmin()
            || $candidature?->locataire_id === $user?->id
            || $candidature?->annonce?->propriete?->user_id === $user?->id;
    }

    public function rules(): array
    {
        return [
            'message' => 'nullable|string|max:2000',
            'budget' => 'nullable|numeric|min:0',
            'statut' => 'sometimes|in:en_attente,acceptee,refusee',
        ];
    }
}