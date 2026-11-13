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
            'receiver_id' => [
                'required',
                'exists:users,id',
                function ($attr, $value, $fail) {
                    $me = $this->user();
                    if ((int) $value === $me->id) {
                        return $fail('Vous ne pouvez pas vous écrire à vous-même.');
                    }
                    $dest = \App\Models\User::find($value);
                    if ($dest && ! $me->isAdmin() && ! $dest->isAdmin() && $dest->role === $me->role) {
                        $fail('Ce destinataire n\'est pas joignable.');
                    }
                },
            ],
            'location_id' => [
                'nullable',
                'exists:locations,id',
                function ($attr, $value, $fail) {
                    $loc = \App\Models\Location::find($value);
                    $me = $this->user();
                    if ($loc && ! $me->isAdmin() && $loc->locataire_id !== $me->id && $loc->proprietaire_id !== $me->id) {
                        $fail('Location invalide.');
                    }
                },
            ],
            'contenu' => 'nullable|string|max:5000',
            'attachment' => 'nullable|file|max:5120',
        ];
    }
}