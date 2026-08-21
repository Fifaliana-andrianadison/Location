<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SignContratRequest extends FormRequest
{
    public function authorize(): bool
    {
        $contrat = $this->route('contrat');
        $user = $this->user();

        return $contrat && (
            $contrat->proprietaire_id === $user?->id
            || $contrat->locataire_id === $user?->id
        );
    }

    public function rules(): array
    {
        return [
            'signature' => 'required|string',
        ];
    }
}