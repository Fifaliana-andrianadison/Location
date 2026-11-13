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
            'cible_user_id' => [
                'required',
                'exists:users,id',
                function ($attr, $value, $fail) {
                    if ((int) $value === $this->user()->id) {
                        $fail('Vous ne pouvez pas vous noter vous-même.');
                    }
                },
            ],
            'location_id' => [
                'required',
                'exists:locations,id',
                function ($attr, $value, $fail) {
                    $loc = \App\Models\Location::find($value);
                    $me = $this->user()->id;
                    $cible = (int) $this->input('cible_user_id');
                    $ok = $loc && (
                        ($loc->locataire_id === $me && $loc->proprietaire_id === $cible)
                        || ($loc->proprietaire_id === $me && $loc->locataire_id === $cible)
                    );
                    if (! $ok) {
                        $fail('Vous ne pouvez noter que votre cocontractant sur une location commune.');
                    }
                },
            ],
            'note' => 'required|integer|between:1,5',
            'commentaire' => 'nullable|string|max:2000',
        ];
    }
}