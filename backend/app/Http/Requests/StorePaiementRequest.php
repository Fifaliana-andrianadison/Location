<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaiementRequest extends FormRequest
{
    public function authorize(): bool
    {
        $location = $this->route('location');

        return $this->user() !== null && $location !== null && (
            $location->locataire_id === $this->user()->id
            || $this->user()->isAdmin()
        );
    }

    public function rules(): array
    {
        return [
            'mois' => [
                'required',
                'date_format:Y-m',
                function ($attr, $value, $fail) {
                    $loc = $this->route('location');
                    if ($loc && $loc->paiements()->whereDate('mois', $value.'-01')
                        ->whereIn('statut', ['en_attente', 'confirme'])->exists()) {
                        $fail('Un paiement existe déjà pour ce mois.');
                    }
                },
            ],
            'montant' => [
                'required',
                'numeric',
                'gt:0',
                function ($attr, $value, $fail) {
                    $loc = $this->route('location');
                    if ($loc && (float) $value < (float) $loc->montant_loyer) {
                        $fail('Le montant doit être au moins égal au loyer ('.$loc->montant_loyer.' Ar).');
                    }
                },
            ],
            'methode' => 'required|in:mvola,orange_money,airtel_money,especes,virement',
            'telephone' => 'required_if:methode,mvola,orange_money,airtel_money|string|max:20',
        ];
    }
}