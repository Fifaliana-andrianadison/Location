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
            // Seuls le propriétaire du bien et l'admin peuvent changer le statut.
            'statut' => [
                'sometimes',
                'in:en_attente,acceptee,refusee',
                function ($attr, $value, $fail) {
                    $user = $this->user();
                    $c = $this->route('candidature');
                    $estProprio = $c?->annonce?->propriete?->user_id === $user?->id;
                    if (! $user?->isAdmin() && ! $estProprio) {
                        $fail('Seul le propriétaire peut modifier le statut.');
                    }
                },
            ],
        ];
    }
}