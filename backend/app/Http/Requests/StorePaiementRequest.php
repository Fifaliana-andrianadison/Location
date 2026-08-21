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
            || $location->proprietaire_id === $this->user()->id
            || $this->user()->isAdmin()
        );
    }

    public function rules(): array
    {
        return [
            'mois' => 'required|date_format:Y-m',
            'montant' => 'required|numeric|min:0',
            'methode' => 'required|in:mvola,orange_money,airtel_money,especes,virement',
            'telephone' => 'required_if:methode,mvola,orange_money,airtel_money|string|max:20',
        ];
    }
}